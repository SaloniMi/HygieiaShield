import { z } from "zod";
import { ESILevelSchema } from "@hygieiashield/zod-contracts";

export const ESIAnalysisSchema = z.object({
  lifesavingIntervention: z.boolean(),
  highRisk: z.boolean(),
  predictedResources: z.number().int().min(0)
});

export const ESIOutputSchema = z.object({
  lifesavingIntervention: z.boolean(),
  highRisk: z.boolean(),
  predictedResources: z.number().int().min(0),
  esiLevel: ESILevelSchema
});

export type ESIOutputType = z.infer<typeof ESIOutputSchema>;
