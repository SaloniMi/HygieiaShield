import { z } from "zod";
import { observableSchema } from "@hygieiashield/zod-contracts";

export const intakeInputSchema = z.object({
  transcript: z.string().optional(),

  selectedObservables: z.array(observableSchema).default([])
});
