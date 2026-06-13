import { Ollama } from "ollama";
import { GenerateOptions } from "../llm.types.js";

export class OllamaProvider {
  private client: Ollama;
  private model: string;

  constructor(model?: string) {
    this.client = new Ollama({
      host: process.env.OLLAMA_BASE_URL
    });

    this.model = process.env.OLLAMA_MODEL!;
  }

  async generateStructuredOutput<TInput, TOutput>({
    systemPrompt,
    userPrompt
  }: GenerateOptions<TInput, TOutput>): Promise<TOutput> {
    console.log(this.model);
    const stream = await this.client.chat({
      model: this.model,
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
        temperature: 0.1
      },
      think: false
    });

    let raw = "";

    for await (const chunk of stream) {
      raw += chunk.message.content;
    }

    const clean = raw.replace(/```json|```/g, "").trim();

    return JSON.parse(clean) as TOutput;
  }
}
