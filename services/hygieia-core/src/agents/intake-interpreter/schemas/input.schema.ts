import { z } from "zod";
import { observableSchema, ageGroupSchema } from "@hygieiashield/zod-contracts";

export const intakeInputSchema = z.object({
  transcript: z.string().optional(),
  selectedObservables: z.array(observableSchema).default([]),
  ageGroup: ageGroupSchema
});

export type InputSchema = z.infer<typeof intakeInputSchema>;
