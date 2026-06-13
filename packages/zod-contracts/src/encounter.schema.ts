import { z } from "zod";

export const encounterStatusSchema = z.enum([
  "PLANNED", // Token generated, facility recommended
  "ARRIVED", // Nurse triaged and token acknowledged by hospital
  "ACKNOWLEDGED", // Patient checked in and acknowledged by hospital after entering vitals
  "COMPLETED" // Discharged / encounter finished
]);

export const ESILevelSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5)
]);

export const encounterSchema = z.object({
  token: z.string(),
  patientId: z.string(),
  encounterId: z.string(),
  status: encounterStatusSchema,
  esiLevel: ESILevelSchema,
  facilityId: z.string().optional(),
  unknownMentions: z.array(z.string()).optional(),
  careType: z.string()
});

export type ESILevelType = z.infer<typeof ESILevelSchema>;
export type EncounterFHIRType = z.infer<typeof encounterSchema>;
