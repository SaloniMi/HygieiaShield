import { OllamaProvider } from "./providers/ollama.provider.js";
import { AzureFoundryProvider } from "./providers/azure.provider.js";

export function createLLM(model?: string) {
  switch (process.env.LLM_PROVIDER) {
    case "ollama":
      return new OllamaProvider(model);

    case "azure":
      return new AzureFoundryProvider(model);

    default:
      throw new Error("Unsupported provider");
  }
}
