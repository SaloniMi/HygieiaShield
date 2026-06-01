import { z } from "zod";

export const observableSchema = z.enum([
  // === RESPIRATORY / CARDIOVASCULAR (High Acuity) ===
  "DIFFICULTY_BREATHING", // Gasping, stridor, severe asthma
  "BLUISH_LIPS_OR_FACE", // Cyanosis, hypoxia indicator
  "CRUSHING_CHEST_PAIN", // Suspected Myocardial Infarction (Heart Attack)
  "IRREGULAR_HEARTBEAT", // Palpitations, racing heart
  "SEVERE_BLEEDING", // Uncontrolled hemorrhage, arterial spurting

  // === NEUROLOGICAL / ALTERED MENTAL STATE ===
  "LOSS_OF_CONSCIOUSNESS", // Unresponsive, fainted
  "SUDDEN_CONFUSION", // Altered mental status, stroke indicator, delirium
  "SLURRED_SPEECH", // Stroke indicator (FAST protocol)
  "SUDDEN_WEAKNESS_ONE_SIDE", // Stroke indicator (FAST protocol)
  "ACTIVE_SEIZURE", // Status epilepticus or generalized seizure

  // === ENVIRONMENTAL / TRAUMA / SYSTEMIC ===
  "SEVERE_BURNS", // Third-degree or extensive chemical/thermal burns
  "TRAUMATIC_INJURY", // Visible fractures, deep lacerations, head trauma
  "AMPUTATION_OR_CRUSH", // Severe extremity trauma
  "ANAPHYLAXIS_SIGNS", // Airway swelling, severe hives, known allergen exposure
  "POISON_OR_OVERDOSE_SUSPECTED", // Toxic ingestion or chemical exposure

  // === INFECTIOUS / SURGE INDICATORS (High to Moderate Acuity) ===
  "HIGH_FEVER", // Sepsis risk or severe pediatric febrile state
  "PERSISTENT_VOMITING", // Dehydration risk, dynamic fluid-loss metric
  "ABDOMINAL_PAIN", // Appendicitis, ectopic pregnancy, internal bleeding
  "COUGH_WITH_BLOOD", // Hemoptysis, advanced respiratory surge sign
  "SEVERE_DEHYDRATION", // Sunken eyes, lethargy, no urine output

  // === LOWER ACUITY / DIVERSION CANDIDATES (Urgent Care / Outpatient) ===
  // (Agent 2 extracts these to help divert away from the ER)
  "MILD_RESPIRATORY_COUGH", // Common cold, mild flu (divert target)
  "MILD_FEVER", // Non-emergency fever (divert target)
  "MINOR_CUT_OR_ABRASION", // Superficial wounds requiring stitches only
  "LOCALIZED_RASH", // No systemic distress or anaphylaxis
  "MILD_NAUSEA", // No continuous vomiting or severe pain
  "ISOLATED_LIMB_PAIN" // Sprains, minor strains without visible deformity
]);

export const observablesSchema = z.object({
  observables: z.array(observableSchema)
});
