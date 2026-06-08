import { z } from "zod";

/**
 * Vitals schema — nurse-entered clinical measurements, collected on physical arrival.
 *
 * DESIGN RULE: These values are NEVER requested from the public user.
 * They are entered by trained medical staff at the PulseOps workstation.
 *
 * LOINC codes documented per field for FHIR Observation resource mapping.
 */
export const vitalsSchema = z.object({
  // LOINC 59408-5
  spo2: z
    .number()
    .min(0, "SpO2 cannot be negative")
    .max(100, "SpO2 cannot exceed 100%")
    .describe("Oxygen Saturation percentage"),

  // LOINC 8480-6
  systolicBP: z
    .number()
    .int("Systolic BP must be a whole number")
    .min(40, "Systolic BP below 40 is incompatible with life")
    .max(300, "Systolic BP cannot exceed 300")
    .describe("Systolic Blood Pressure (mmHg)"),

  // LOINC 8462-4
  diastolicBP: z
    .number()
    .int("Diastolic BP must be a whole number")
    .min(20, "Diastolic BP below 20 is incompatible with life")
    .max(200, "Diastolic BP cannot exceed 200")
    .describe("Diastolic Blood Pressure (mmHg)"),

  // LOINC 8867-4
  heartRate: z
    .number()
    .int("Heart rate must be a whole number")
    .min(20, "Heart rate below 20 is a critical bradycardia event")
    .max(300, "Heart rate cannot exceed 300 bpm")
    .describe("Heart Rate (bpm)"),

  // LOINC 9279-1
  respiratoryRate: z
    .number()
    .int("Respiratory rate must be a whole number")
    .min(1, "Respiratory rate cannot be zero")
    .max(80, "Respiratory rate cannot exceed 80 breaths/min")
    .describe("Respiratory Rate (breaths per minute)"),

  // LOINC 8310-5
  temperatureC: z
    .number()
    .min(25, "Core temperature below 25°C indicates severe hypothermia")
    .max(45, "Core temperature above 45°C indicates fatal hyperpyrexia")
    .describe("Core body temperature in Celsius")
    .optional(),

  isSupplementalOxygen: z
    .boolean()
    .default(false)
    .describe("Is the patient currently receiving oxygen support?")
    .optional(),

  //  AVPU Vitals
  levelOfConsciousness: z.enum(["ALERT", "VERBAL", "PAINFUL", "UNRESPONSIVE"]),

  // Pain Score
  painScore: z.number().int().min(0).max(10).optional()
});

export type VitalsType = z.infer<typeof vitalsSchema>;
