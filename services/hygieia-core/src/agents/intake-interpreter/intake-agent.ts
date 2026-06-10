// intake-agent.ts
import { createLLM } from "../../services/llm/llm.services.js";
import { intakeOutputSchema, IntakeOutput } from "./schemas/output.schema.js";
import { buildIntakeInterpreterPrompt } from "./intake.prompt.js";
import { IntakeInput, intakeInputSchema } from "./schemas/input.schema.js";
import { AgentContext, observableSchema } from "@hygieiashield/zod-contracts";
import { AgentEventLogger } from "../../realtime/agent-event.logger.js";

export async function extractObservables(input: IntakeInput) {
  // TODO: Azure OpenAI structured output
  const systemPrompt = buildIntakeInterpreterPrompt(input.ageGroup);
  const llm = createLLM();
  const result = await llm.generateStructuredOutput({
    systemPrompt,
    userPrompt: {
      transcript: input.transcript,
      selectedSymptoms: input.selectedSymptoms ?? []
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

export async function runIntakeInterpreter(
  rawInput: unknown,
  ctx: AgentContext
): Promise<IntakeOutput> {
  const input = intakeInputSchema.parse(rawInput);

  const start = Date.now();

  // Extracts observables using LLM extraction technique
  const extracted = await extractObservables(input);

  const parsedOutput = intakeOutputSchema.parse({
    observables: extracted.observables ?? [],
    unknownMentions: extracted.unknownMentions
  });

  // TODO: Change the agent trace
  const event = AgentEventLogger.intakeCompleted({
    trace: ctx.trace,
    observables: extracted.observables ?? [],
    unknownMentions: extracted.unknownMentions,
    input,
    latencyMs: Date.now() - start
  });

  await ctx.eventBus.publish(event);

  return parsedOutput;
}
