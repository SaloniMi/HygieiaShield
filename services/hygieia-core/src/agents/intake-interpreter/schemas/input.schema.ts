import { z } from "zod";
import { ageGroupSchema } from "@hygieiashield/zod-contracts";

export const intakeInputSchema = z.object({
  transcript: z.string().optional(),
  selectedSymptoms: z.array(z.string()).default([]),
  ageGroup: ageGroupSchema
});

export type IntakeInput = z.infer<typeof intakeInputSchema>;
