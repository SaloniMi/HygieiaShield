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
  console.log("STARTING INTAKE INTERPRETER:", input);
  const start = performance.now();

  // Extracts observables using LLM extraction technique
  const extracted = await extractObservables(input); // await extractObservables(input); // { observables: [], unknownMentions: [] };

  const parsedOutput = intakeOutputSchema.parse({
    observables: extracted.observables ?? [],
    unknownMentions: extracted.unknownMentions
  });

  const end = performance.now();
  console.log(
    "INTAKE INTERPRETER:",
    parsedOutput,
    `Execution time: ${end - start} ms`
  );

  // TODO: Change the agent trace
  const event = AgentEventLogger.intakeCompleted({
    trace: ctx.trace,
    observables: extracted.observables ?? [],
    unknownMentions: extracted.unknownMentions,
    input,
    latencyMs: end - start
  });

  await ctx.eventBus.publish(event);

  return parsedOutput;
}
