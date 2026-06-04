import { z } from "zod";

export const ageGroupSchema = z.enum([
  "NEONATE", // 0–28 days
  "PEDIATRIC", // 1 month–12 years
  "ADULT", // 12–64 years
  "GERIATRIC" // 65+
]);

export const patientSchema = z.object({
  patientName: z.string().min(1).max(120),
  ageGroup: ageGroupSchema
});
