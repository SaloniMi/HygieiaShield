import { llm } from "../../services/llm/llm.services.js";
import { buildESILevelCalculatorPrompt } from "./clinical.prompt.js";
import { ESIInputSchema } from "./schemas/input.schema.js";
import { ESIOutputSchema } from "./schemas/output.schema.js";
import { buildESIResult } from "../../protocols/ESI/decision-maker/decision.maker.js";
import { retrieveESIContext } from "./context.grounder.js";

export async function runESIEvaluator(rawInput: unknown) {
  const input = ESIInputSchema.parse(rawInput);
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
  const result = await llm.generateStructuredOutput({
    systemPrompt,
    userPrompt: input,
    schema: ESIOutputSchema
  });

  // Step 2 - Build the ESI grounding retrieval result to calculate the final ESI level
  const ESIResults = buildESIResult(result);
  return ESIResults.esiLevel;
}
