import { Ollama } from "ollama";
import { GenerateOptions } from "../llm.types.js";

const client = new Ollama({
  host: process.env.OLLAMA_BASE_URL
});

export class OllamaProvider {
  async generateStructuredOutput<TInput, TOutput>({
    systemPrompt,
    userPrompt,
    model
  }: GenerateOptions<TInput, TOutput>): Promise<TOutput> {
    const stream = await client.chat({
      model: model ?? process.env.OLLAMA_MODEL!,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: JSON.stringify(userPrompt)
        }
      ],
      stream: true,
      options: {
        // Optional: Reduce temperature to make JSON generation faster and more deterministic
        temperature: 0.1
      },
      think: false
    });
    let raw = "";
    for await (const chunk of stream) {
      raw += chunk.message.content;
    }

    const clean = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  }
}
