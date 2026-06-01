import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { OllamaEmbeddings } from "@langchain/ollama";
import { Document } from "@langchain/core/documents";
import { HandbookRetriever } from "./retriever.interface.js";
import { HandbookChunk } from "./handbook.chunker.js";

export class LocalVectorRetriever implements HandbookRetriever {
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

    return new LocalVectorRetriever(store);
  }

  async retrieve(
    context: {
      observables: string[];
      unknownMentions: string[];
    },
    limit = 5
  ) {
    const query = [...context.observables, ...context.unknownMentions].join(
      " "
    );

    const docs = await this.vectorStore.similaritySearch(query, limit);
    console.log(docs);
    return docs.map((doc) => doc.pageContent);
  }
}
