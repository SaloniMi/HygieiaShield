import { loadHandbook } from "./handbook.loader.js";

import { chunkHandbook } from "./handbook.chunker.js";

import { LocalVectorRetriever } from "./local-vector-retriever.js";

let retriever: LocalVectorRetriever | undefined;

export async function getRetriever() {
  if (retriever) {
    return retriever;
  }

  const handbook = loadHandbook();

  const chunks = chunkHandbook(handbook);

  retriever = await LocalVectorRetriever.create(chunks);

  return retriever;
}
