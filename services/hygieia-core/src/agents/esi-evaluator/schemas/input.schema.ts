import { z } from "zod";
import {
  ageGroupSchema,
  observableSchema,
  vitalsSchema
} from "@hygieiashield/zod-contracts";

export const ESIInputSchema = z.object({
  observables: z.array(observableSchema).default([]),
  unknownMentions: z.array(z.string()).default([]),
  ageGroup: ageGroupSchema,
  vitals: vitalsSchema.optional()
});

export type InputSchema = z.infer<typeof ESIInputSchema>;
