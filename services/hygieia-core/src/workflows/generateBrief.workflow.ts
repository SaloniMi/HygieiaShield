// workflows/generateBrief.workflow.ts

import { generateDoctorBrief } from "../agents/doctor-brief-generator/index.js";
import { DoctorBriefInput } from "../agents/doctor-brief-generator/schemas/input.schema.js";

export async function runGenerateBriefWorkflow(input: DoctorBriefInput) {
  return await generateDoctorBrief(input);
}
