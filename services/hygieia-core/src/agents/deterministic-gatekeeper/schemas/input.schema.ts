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
  ageGroup: ageGroupSchema
});

export type GateKeeperInput = z.infer<typeof gateKeeperInputSchema>;
