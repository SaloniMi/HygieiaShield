import { z } from "zod";

export const gateKeeperOutputSchema = z.object({
  finalESI: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5)
  ]),
  overridden: z.boolean(),

  reasons: z.array(z.string())
});

export type GateKeeperOutput = z.infer<typeof gateKeeperOutputSchema>;
