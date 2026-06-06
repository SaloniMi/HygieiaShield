import { z } from "zod";
import { observableSchema } from "@hygieiashield/zod-contracts";

export const intakeOutputSchema = z.object({
  observables: z.array(observableSchema).default([]),
  unknownMentions: z.array(z.string())
});

export type IntakeOutput = z.infer<typeof intakeOutputSchema>;
