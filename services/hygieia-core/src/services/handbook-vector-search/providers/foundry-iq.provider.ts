import { HandbookRetriever, RetrievalContext } from "../retriever.interface.js";
import { SearchClient, AzureKeyCredential } from "@azure/search-documents";
import { Ollama } from "ollama";

import { AzureOpenAI, OpenAI } from "openai";

function defineSearchQuery(context: RetrievalContext) {
  const observables = (context.observables ?? []).join(", ");
  const unknown = (context.unknownMentions ?? []).join(", ");
  const vitalsText = context.vitals
    ? Object.entries(context.vitals)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ")
    : "";

  // Keep it stripped down to raw medical tokens for the BM25 text match engine
  return `${observables} ${unknown} ${vitalsText} ESI level classification clinical triage`.trim();
}

export class FoundryIQProvider implements HandbookRetriever {
  private client: any;
  private openaiClient: any;
  private indexName: string;

  constructor(indexName?: string) {
    const endpoint = process.env.AZURE_SEARCH_ENDPOINT;
    const key = process.env.AZURE_SEARCH_QUERY_KEY;

    if (!endpoint || !key) {
      throw new Error(
        "AZURE_SEARCH_ENDPOINT and AZURE_SEARCH_QUERY_KEY are required"
      );
    }

    this.indexName =
      indexName ??
      process.env.HANDBOOK_SEARCH_INDEX ??
      "hygieia-handbook-index";
  }

  private async initialize() {
    if (!this.client || !this.openaiClient) {
      const searchEndpoint = process.env.AZURE_SEARCH_ENDPOINT!;
      const searchKey = process.env.AZURE_SEARCH_QUERY_KEY!;

      this.client = new SearchClient(
        searchEndpoint,
        this.indexName,
        new AzureKeyCredential(searchKey)
      );
    }
  }

  async retrieve(context: RetrievalContext, limit = 5): Promise<string[]> {
    await this.initialize();

    // ----------------------------
    // 1. Build structured query
    // ----------------------------
    const searchQuery = defineSearchQuery(context);

    try {
      // ----------------------------
      // 2. Generate embedding
      // ----------------------------
      const embeddingResponse = await new Ollama({
        host: process.env.OLLAMA_BASE_URL
      }).embed({
        model: "nomic-embed-text",
        input: searchQuery
      });

      const queryVector = embeddingResponse.embeddings[0];
      console.log("Calculated appropriate queryVector");
      // ----------------------------
      // 3. Hybrid vector search
      // ----------------------------
      const results = await this.client.search(searchQuery, {
        vectorQueries: [
          {
            kind: "vector",
            vector: queryVector,
            fields: ["snippet_vector"],
            kNearestNeighborsCount: limit
          }
        ],
        queryType: "semantic",
        semanticConfigurationName: "default-semantic-config",
        top: limit
      });

      // ----------------------------
      // 4. Extract raw chunks
      // ----------------------------
      const documents: string[] = [];

      for await (const result of results.results) {
        if (result.document?.snippet) {
          documents.push(result.document.snippet);
        }
      }

      return documents;
    } catch (error) {
      console.error("FoundryIQProvider retrieval error:", error);
      throw error;
    }
  }
}
