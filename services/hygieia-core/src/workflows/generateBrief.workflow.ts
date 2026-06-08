// workflows/generateBrief.workflow.ts

import { AgentContext } from "@hygieiashield/zod-contracts";
import { generateDoctorBrief } from "../agents/doctor-brief-generator/index.js";
import { DoctorBriefInput } from "../agents/doctor-brief-generator/schemas/input.schema.js";

export async function runGenerateBriefWorkflow(
  input: DoctorBriefInput,
  ctx: AgentContext
) {
  return await generateDoctorBrief(input, ctx);
}
