import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { OllamaEmbeddings } from "@langchain/ollama";
import { Document } from "@langchain/core/documents";
import { HandbookRetriever, RetrievalContext } from "../retriever.interface.js";
import { HandbookChunk } from "../handbook.chunker.js";

export class LocalProvider implements HandbookRetriever {
  private vectorStore: MemoryVectorStore;

  constructor(vectorStore: MemoryVectorStore) {
    this.vectorStore = vectorStore;
  }

  static async create(chunks: HandbookChunk[]) {
    const embeddings = new OllamaEmbeddings({
      model: "nomic-embed-text"
    });

    const store = await MemoryVectorStore.fromDocuments(
      chunks.map(
        (chunk) =>
          new Document({
            pageContent: chunk.content,
            metadata: {
              title: chunk.title
            }
          })
      ),
      embeddings
    );

    return new LocalProvider(store);
  }

  async retrieve(context: RetrievalContext, limit = 5): Promise<string[]> {
    console.log(context);
    const query = [...context.observables, ...context.unknownMentions].join(
      " "
    );

    const vitalsText = context.vitals
      ? Object.entries(context.vitals)
          .map(([key, value]) => `${key}: ${value}`)
          .join(", ")
      : "";

    const searchQuery = `${query}. Vitals: ${vitalsText}`;

    const docs = await this.vectorStore.similaritySearch(searchQuery, limit);
    return docs.map((doc) => doc.pageContent);
  }
}
