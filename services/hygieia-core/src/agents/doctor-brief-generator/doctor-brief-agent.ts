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
  const input = doctorBriefInputSchema.parse(rawInput);
  console.log("STARTING DOCTOR BRIEF:", input);

  const start = performance.now();

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
    schema: doctorBriefOutputSchema
  });

  const parsedResult = doctorBriefOutputSchema.parse(result);

  const end = performance.now();
  console.log(
    "DOCTOR BRIEF:",
    parsedResult,
    `Execution time: ${end - start} ms`
  );

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
