import { loadHandbook } from "./handbook.loader.js";
import { chunkHandbook } from "./handbook.chunker.js";
import { LocalProvider } from "./providers/local.provider.js";
import { FoundryIQProvider } from "./providers/foundry-iq.provider.js";
import { HandbookRetriever } from "./retriever.interface.js";

let retriever: HandbookRetriever | undefined;

export async function getRetriever(): Promise<HandbookRetriever> {
  if (retriever) {
    return retriever;
  }

  const provider = process.env.HANDBOOK_RETRIEVER_PROVIDER ?? "local";

  switch (provider) {
    case "local":
      retriever = await initializeLocalProvider();
      break;

    case "foundry-iq":
      retriever = new FoundryIQProvider();
      break;

    default:
      throw new Error(
        `Unsupported handbook retriever provider: ${provider}. Supported providers: local, foundry-iq`
      );
  }

  return retriever;
}

async function initializeLocalProvider(): Promise<LocalProvider> {
  const handbook = loadHandbook();
  const chunks = chunkHandbook(handbook);
  return LocalProvider.create(chunks);
}
