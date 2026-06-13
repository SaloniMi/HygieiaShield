import { z } from "zod";
import {
  ageGroupSchema,
  observableSchema,
  vitalsSchema,
  ESILevelSchema,
  VitalFlagSchema
} from "@hygieiashield/zod-contracts";

export const doctorBriefInputSchema = z.object({
  ageGroup: ageGroupSchema,
  esiLevel: ESILevelSchema,
  unknownMentions: z.array(z.string()),
  observables: z.array(observableSchema),
  vitals: vitalsSchema.optional(),
  vitalFlags: z.array(VitalFlagSchema).optional()
});

export type DoctorBriefInput = z.infer<typeof doctorBriefInputSchema>;
