import { createLLM } from "../../services/llm/llm.services.js";
import { doctorBriefInputSchema } from "./schemas/input.schema.js";
import {
  DoctorBriefOutput,
  doctorBriefOutputSchema
} from "./schemas/output.schema.js";
import { buildDoctorBriefPrompt } from "./doctor-brief.prompt.js";

export async function generateDoctorBrief(
  rawInput: unknown
): Promise<DoctorBriefOutput> {
  const input = doctorBriefInputSchema.parse(rawInput);

  const llm = createLLM();

  const result = await llm.generateStructuredOutput({
    systemPrompt: buildDoctorBriefPrompt(),
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

  return doctorBriefOutputSchema.parse(result);
}
