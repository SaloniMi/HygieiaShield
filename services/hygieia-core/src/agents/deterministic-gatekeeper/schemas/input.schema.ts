import { z } from "zod";
import { ageGroupSchema, observableSchema } from "@hygieiashield/zod-contracts";
import { vitalsSchema } from "@hygieiashield/zod-contracts";

export const gateKeeperInputSchema = z.object({
  observables: z.array(observableSchema),
  vitals: vitalsSchema,
  predictedESI: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5)
  ]),
  lifesavingIntervention: z.boolean(),
  highRisk: z.boolean(),
  predictedResources: z.number().int().min(0),
  ageGroup: ageGroupSchema
});

export type GateKeeperInput = z.infer<typeof gateKeeperInputSchema>;
