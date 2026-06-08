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
  const start = Date.now();

  // const handbook = loadHandbook();
  // const systemPrompt = buildESILevelCalculatorPrompt(handbook);

  const handbookSections = await retrieveESIContext(
    input.observables ?? [],
    input.unknownMentions ?? []
  );

  const systemPrompt = buildESILevelCalculatorPrompt(
    handbookSections.join("\n\n"),
    input.ageGroup
  );

  // TODO: Azure OpenAI structured output
  // Step 1 - Retrieve information from the ESI handbook and structure the
  // analysis in a structured format.
  const llm = createLLM();
  const result = await llm.generateStructuredOutput({
    systemPrompt,
    userPrompt: input,
    schema: ESIAnalysisSchema
  });

  // Step 2 - Build the ESI grounding retrieval result to calculate the final ESI level
  const ESIResults = buildESIResult(result);
  const parsedResults = ESIOutputSchema.parse(ESIResults);

  const event = AgentEventLogger.esiClassified({
    trace: ctx.trace,
    observables: input.observables ?? [],
    unknownMentions: input.unknownMentions ?? [],
    ...parsedResults,
    ageGroup: input.ageGroup,
    latencyMs: Date.now() - start
  });

  await ctx.eventBus.publish(event);

  return parsedResults;
}
