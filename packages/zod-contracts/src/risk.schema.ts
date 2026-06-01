import { z } from "zod";

export const riskLevelSchema = z.enum([
  "LOW", // Outpatient / Diversion target
  "MODERATE", // Urgent Care track
  "HIGH", // Main ER track
  "CRITICAL" // Resuscitation bay / Immediate override
]);

export const riskFlagSchema = z.enum([
  "LOW_SPO2",
  "HYPERTENSIVE_CRISIS",
  "TACHYCARDIA",
  "BRADYCARDIA",
  "HYPOTENSION",
  "SEVERE_FEVER",
  "SEPSIS_RISK",
  "STROKE_INDICATOR",
  "CARDIAC_EMERGENCY",
  "HEMORRHAGE_RISK",
  "RESPIRATORY_DISTRESS"
]);

export const riskSchema = z.object({
  level: riskLevelSchema,

  // Can be an empty array [] if level is LOW
  flags: z.array(riskFlagSchema),

  // True if Agent 3 overrode Agent 2's assessment based on mathematical vital rules
  gatekeeperOverride: z.boolean(),

  // Strict validation ensuring format is always YYYY-MM-DDTHH:mm:ssZ
  generatedAt: z.string().datetime({
    message: "Must be a valid ISO 8601 UTC datetime string"
  })
});
