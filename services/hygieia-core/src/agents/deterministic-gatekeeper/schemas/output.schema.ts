import { z } from "zod";
import { ESILevelSchema, VitalFlagSchema } from "@hygieiashield/zod-contracts";

export const gateKeeperOutputSchema = z.object({
  finalESI: ESILevelSchema,
  overridden: z.boolean(),
  reasons: z.array(z.string()),
  vitalFlags: z.array(VitalFlagSchema)
});

export type GateKeeperOutput = z.infer<typeof gateKeeperOutputSchema>;
