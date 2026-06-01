import { z } from "zod";

export const patientSchema = z.object({
  patientName: z.string().min(1).max(120),

  ageGroup: z.enum(["CHILD", "ADULT", "ELDERLY"])
});
