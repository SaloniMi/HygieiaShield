import { z } from "zod";
import {
  ageGroupSchema,
  observableSchema,
  vitalsSchema,
  ESILevelSchema
} from "@hygieiashield/zod-contracts";

export const doctorBriefInputSchema = z.object({
  ageGroup: ageGroupSchema,
  esiLevel: ESILevelSchema,
  unknownMentions: z.array(z.string()),
  observables: z.array(observableSchema),
  vitals: vitalsSchema.optional()
});

export type DoctorBriefInput = z.infer<typeof doctorBriefInputSchema>;
