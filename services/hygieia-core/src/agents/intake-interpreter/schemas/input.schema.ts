import { z } from "zod";
import {
  userSymptomSchema,
  ageGroupSchema
} from "@hygieiashield/zod-contracts";

export const intakeInputSchema = z.object({
  transcript: z.string().optional(),
  selectedSymptoms: z.array(userSymptomSchema).default([]),
  ageGroup: ageGroupSchema
});

export type IntakeInput = z.infer<typeof intakeInputSchema>;
