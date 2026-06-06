import { z } from "zod";

// These are user recorded symptoms (which are common and don't have medical terminologies in them)
export const userSymptomSchema = z.enum([
  "BREATHING_TROUBLE",
  "CHEST_PAIN",
  "STROKE_SIGNS",
  "ALTERED_CONSCIOUSNESS",
  "SEVERE_HEADACHE",
  "TRAUMA_INJURY",
  "FEVER_INFECTION",
  "STOMACH_PAIN",
  "ALLERGIC_REACTION",
  "CRISIS_AND_SAFETY"
]);

export type UserSymptom = z.infer<typeof userSymptomSchema>;
