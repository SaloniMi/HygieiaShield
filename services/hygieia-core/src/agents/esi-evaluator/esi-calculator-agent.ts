import { createLLM } from "../../services/llm/llm.services.js";
import { buildESILevelCalculatorPrompt } from "./esi.prompt.js";
import { ESIInputSchema } from "./schemas/input.schema.js";
import { ESIOutputSchema, ESIAnalysisSchema } from "./schemas/output.schema.js";
import { buildESIResult } from "@hygieiashield/clinical-protocols";
import { retrieveESIContext } from "./context.grounder.js";
import { AgentContext } from "@hygieiashield/zod-contracts";
import { AgentEventLogger } from "../../realtime/agent-event.logger.js";

export async function runESIEvaluator(rawInput: unknown, ctx: AgentContext) {
  const input = ESIInputSchema.parse(rawInput);
  console.log("STARTING ESI CALCULATOR:", input);
  const start = performance.now();

  const handbookSections = await retrieveESIContext(
    input.observables ?? [],
    input.unknownMentions ?? [],
    input.vitals
  );

  console.log("Found relevant sections");

  const systemPrompt = buildESILevelCalculatorPrompt(
    handbookSections.join("\n\n"),
    input.ageGroup
  );

  // TODO: Azure OpenAI structured output
  // Step 1 - Retrieve information from the ESI handbook and structure the
  // analysis in a structured format.
  const llm = createLLM(process.env.ESI_CALCULATOR_MODEL);
  const result = await llm.generateStructuredOutput({
    systemPrompt,
    userPrompt: input,
    schema: ESIAnalysisSchema
  });

  // Step 2 - Build the ESI grounding retrieval result to calculate the final ESI level
  const ESIResults = buildESIResult(result);
  const parsedResults = ESIOutputSchema.parse(ESIResults);

  const end = performance.now();
  console.log(
    "ESI CALCULATOR:",
    parsedResults,
    `Execution time: ${end - start} ms`
  );

  const event = AgentEventLogger.esiClassified({
    trace: ctx.trace,
    observables: input.observables ?? [],
    unknownMentions: input.unknownMentions ?? [],
    ...parsedResults,
    ageGroup: input.ageGroup,
    latencyMs: end - start
  });

  await ctx.eventBus.publish(event);

  return parsedResults;
}
