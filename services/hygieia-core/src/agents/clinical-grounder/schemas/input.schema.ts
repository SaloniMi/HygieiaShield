import { z } from "zod";
import { observableSchema } from "@hygieiashield/zod-contracts";

export const ESIInputSchema = z.object({
  observables: z.array(observableSchema).default([]),
  unknownMentions: z.array(z.string()).default([])
});
