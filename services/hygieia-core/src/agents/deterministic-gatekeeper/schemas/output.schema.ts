import { z } from "zod";
import { ESILevelSchema } from "@hygieiashield/zod-contracts";

export const gateKeeperOutputSchema = z.object({
  finalESI: ESILevelSchema,
  overridden: z.boolean(),

  reasons: z.array(z.string())
});

export type GateKeeperOutput = z.infer<typeof gateKeeperOutputSchema>;
