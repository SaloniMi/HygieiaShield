import { OllamaProvider } from "./providers/ollama.provider.js";

function createLLM() {
  console.log(process.env.LLM_PROVIDER);
  switch (process.env.LLM_PROVIDER) {
    case "ollama":
      return new OllamaProvider();

    default:
      throw new Error("Unsupported provider");
  }
}

export const llm = createLLM();
