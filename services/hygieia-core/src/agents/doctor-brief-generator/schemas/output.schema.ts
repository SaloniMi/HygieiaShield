import { z } from "zod";

export const doctorBriefOutputSchema = z.object({
  chiefComplaint: z.string(),
  riskFlags: z.array(z.string()).default([]),
  recommendedActions: z.array(z.string()).default([]),
  protocolMatch: z.object({
    name: z.string(),
    rationale: z.string()
  }),
  confidence: z.object({
    level: z.enum(["LOW", "MEDIUM", "HIGH"]),
    explanation: z.string()
  })
});

export type DoctorBriefOutput = z.infer<typeof doctorBriefOutputSchema>;
