// intake-agent.ts

import { intakeOutputSchema } from "./schemas/output.schema.js";
import { llm } from "../../services/llm/llm.services.js";
import { buildIntakeInterpreterPrompt } from "./intake.prompt.js";
import { InputSchema, intakeInputSchema } from "./schemas/input.schema.js";
import { observableSchema } from "../../../../../packages/zod-contracts/dist/observables.schema.js";

export function mergeObservables(selected: string[], extracted: string[]) {
  return [...new Set([...selected, ...extracted])];
}

export async function extractObservables(input: InputSchema) {
  // TODO: Azure OpenAI structured output
  const systemPrompt = buildIntakeInterpreterPrompt(input.ageGroup);
  const result = await llm.generateStructuredOutput({
    systemPrompt,
    userPrompt: {
      transcript: input.transcript
    },
    schema: intakeOutputSchema
  });

  const allowed = new Set(observableSchema.options);

  const observables = (result.observables ?? []).filter((o) => allowed.has(o));

  const unknownMentions = [
    ...(result.unknownMentions ?? []),
    ...(result.observables ?? []).filter((o) => !allowed.has(o))
  ];
  return intakeOutputSchema.parse({
    unknownMentions,
    observables
  });
}

export async function runIntakeInterpreter(rawInput: unknown) {
  const input = intakeInputSchema.parse(rawInput);

  const hasTranscript = input.transcript && input.transcript.trim().length > 0;

  // Fast path: tap inputs only
  if (!hasTranscript) {
    return intakeOutputSchema.parse({
      observables: input.selectedObservables,
      confidence: 1,
      unknownMentions: []
    });
  }

  // Extracts observables using LLM extraction technique
  const extracted = await extractObservables(input);

  const observables = mergeObservables(
    input.selectedObservables,
    extracted.observables
  );

  return intakeOutputSchema.parse({
    observables,
    unknownMentions: extracted.unknownMentions
  });
}
