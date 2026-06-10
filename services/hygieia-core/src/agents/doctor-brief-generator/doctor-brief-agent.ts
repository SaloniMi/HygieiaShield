import { createLLM } from "../../services/llm/llm.services.js";
import { doctorBriefInputSchema } from "./schemas/input.schema.js";
import {
  DoctorBriefOutput,
  doctorBriefOutputSchema
} from "./schemas/output.schema.js";
import { buildDoctorBriefPrompt } from "./doctor-brief.prompt.js";
import { AgentEventLogger } from "../../realtime/agent-event.logger.js";
import { AgentContext } from "@hygieiashield/zod-contracts";

export async function generateDoctorBrief(
  rawInput: unknown,
  ctx: AgentContext
): Promise<DoctorBriefOutput> {
  const start = Date.now();

  const input = doctorBriefInputSchema.parse(rawInput);

  const llm = createLLM();

  const result = await llm.generateStructuredOutput({
    systemPrompt: buildDoctorBriefPrompt(input.vitalFlags),
    userPrompt: {
      ageGroup: input.ageGroup,
      esiLevel: input.esiLevel,
      unknownMentions: input.unknownMentions,
      observables: input.observables,
      vitals: input.vitals
    },
    schema: doctorBriefOutputSchema,
    model: "medgemma:4b"
  });

  const parsedResult = doctorBriefOutputSchema.parse(result);
  const event = AgentEventLogger.doctorBriefGenerated({
    trace: ctx.trace,
    input,
    unknownMentions: input.unknownMentions ?? [],
    ...parsedResult,
    latencyMs: Date.now() - start
  });

  await ctx.eventBus.publish(event);

  return parsedResult;
}
