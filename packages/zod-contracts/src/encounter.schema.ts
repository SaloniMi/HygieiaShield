import { z } from "zod";

export const encounterStatusSchema = z.enum([
  "PLANNED", // Token generated, facility recommended
  "ARRIVED", // Patient checked in and being evaluated by hospital
  "IN_CARE", // Being treated / admitted
  "COMPLETED", // Discharged / encounter finished
  "EXPIRED" // Reservation expired before arrival
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
  status: encounterStatusSchema,
  esiLevel: ESILevelSchema,
  facilityId: z.string().optional(),
  unknownMentions: z.array(z.string()).optional()
});

export type ESILevelType = z.infer<typeof ESILevelSchema>;
export type EncounterFHIRType = z.infer<typeof encounterSchema>;
