import { z } from "zod";
import { ageGroupSchema, observableSchema } from "@hygieiashield/zod-contracts";

export const ESIInputSchema = z.object({
  observables: z.array(observableSchema).default([]),
  unknownMentions: z.array(z.string()).default([]),
  ageGroup: ageGroupSchema
});

export type InputSchema = z.infer<typeof ESIInputSchema>;
