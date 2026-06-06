import { ZodSchema } from "zod";

export interface GenerateOptions<TInput, TOutput> {
  systemPrompt: string;

  userPrompt: TInput;

  schema: ZodSchema<TOutput>;
  model?: string;
}
