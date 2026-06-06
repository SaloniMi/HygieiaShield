import { z } from "zod";
import { ESILevelSchema } from "@hygieiashield/zod-contracts";

/**
 * A single vital flag — what was measured, what the value was,
 * what the threshold is, and how severe the breach is.
 *
 * This is the structured form of what was previously buried in reasons[].
 * Used by:
 *   - PulseOps red flag box (Agent 3 risk flags section)
 *   - MedGemma prompt (passed in so it does not repeat these)
 *   - Agent trace panel (full audit trail)
 *   - FHIR Observation resource (clinical record)
 */
export const VitalFlagSchema = z.object({
  // The vital sign key — matches VitalsType field name
  vital: z.string(),
  // e.g. "SpO₂", "Heart rate", "Systolic BP"
  vitalLabel: z.string(),
  // The actual value the nurse entered
  value: z.union([z.number(), z.string(), z.boolean()]),
  // The unit for display — "%", "bpm", "mmHg", "°C", etc.
  unit: z.string().optional(),
  // The flag code — e.g. "SEVERE_HYPOXEMIA", "TACHYCARDIA"
  flag: z.string(),
  // The threshold that was breached
  threshold: z
    .object({
      operator: z.enum(["<", "<=", ">", ">=", "=="]),
      value: z.number()
    })
    .optional(),
  // Severity tier — drives UI colour (amber vs red)
  level: z.enum(["HIGH", "CRITICAL"])
});
export type VitalFlag = z.infer<typeof VitalFlagSchema>;

export const gateKeeperOutputSchema = z.object({
  finalESI: ESILevelSchema,
  overridden: z.boolean(),
  reasons: z.array(z.string()),
  vitalFlags: z.array(VitalFlagSchema)
});

export type GateKeeperOutput = z.infer<typeof gateKeeperOutputSchema>;
