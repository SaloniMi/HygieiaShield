import { z } from "zod";
import {
  ageGroupSchema,
  ESILevelSchema,
  observableSchema,
  vitalsSchema
} from "@hygieiashield/zod-contracts";

export const gateKeeperInputSchema = z.object({
  observables: z.array(observableSchema),
  vitals: vitalsSchema.optional(),
  esiLevel: ESILevelSchema,
  lifesavingIntervention: z.boolean(),
  highRisk: z.boolean(),
  predictedResources: z.number().int().min(0),
  ageGroup: ageGroupSchema
});

export type GateKeeperInput = z.infer<typeof gateKeeperInputSchema>;
