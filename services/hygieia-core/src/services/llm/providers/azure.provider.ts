import { AIProjectClient } from "@azure/ai-projects";
import { DefaultAzureCredential } from "@azure/identity";
import { GenerateOptions } from "../llm.types.js";

export class AzureFoundryProvider {
  private client: AIProjectClient | undefined;
  private deploymentName: string;

  constructor(model?: string) {
    this.deploymentName = model ?? process.env.AZURE_GPT41_MINI_DEPLOYMENT!;
  }

  async generateStructuredOutput<TInput, TOutput>({
    systemPrompt,
    userPrompt
  }: GenerateOptions<TInput, TOutput>): Promise<TOutput> {
    console.log(this.deploymentName);
    // Create project and openai clients to call Foundry API
    const project = new AIProjectClient(
      "https://hygieia-core-resource.services.ai.azure.com/api/projects/hygieia-core",
      new DefaultAzureCredential()
    );
    const openai = project.getOpenAIClient();

    // Run a responses API call
    const response = await openai.chat.completions.create({
      model: this.deploymentName,
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
      response_format: { type: "json_object" }
    });
    const raw = response.choices[0]?.message?.content ?? "{}";
    const clean = raw.replace(/json|/g, "").trim();
    return JSON.parse(clean) as TOutput;
  }
}
