import { z } from "zod";

export const ESIOutputSchema = z.object({
  lifesavingIntervention: z.boolean(),
  highRisk: z.boolean(),
  predictedResources: z.number().int()
  // evidence: z.array(z.string()).default([]),
  // confidence: z.number().min(0).max(1)
});
