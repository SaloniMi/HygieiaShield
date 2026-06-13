import { z } from "zod";

export const observableSchema = z.enum([
  // =========================================================================
  // === DECISION POINT A: IMMEDIATE LIFESAVING INTERVENTIONS (ESI LEVEL 1) ===
  // =========================================================================
  "UNRESPONSIVE_OR_OBTUNDED", // Nonverbal, not following commands, or requiring noxious stimuli [cite: 262]
  "APNEIC_OR_PULSELESS", // Cardiac or pulmonary arrest (imminent or active) [cite: 366]
  "SEVERE_RESPIRATORY_DISTRESS", // Agonal breathing, ineffective gas exchange, extreme compromise [cite: 339, 349]
  "ANAPHYLAXIS_WITH_AIRWAY_STRIDOR", // Impaired airway clearance/perfuse shock from allergic reaction [cite: 354, 361]
  "PROFOUND_HYPOTENSION_SHOCK", // Hypotension coupled with clear signs of systemic hypoperfusion [cite: 362]
  "FLACCID_INFANT", // Critical pediatric presentation requiring immediate resuscitation [cite: 365]
  "CRITICAL_PENETRATING_TRAUMA", // Penetrating trauma to head, neck, chest, or abdomen requiring immediate intervention [cite: 366]

  // =========================================================================
  // === DECISION POINT B: HIGH-RISK SITUATIONS / ALERTS (ESI LEVEL 2) =======
  // =========================================================================

  // -- Cardiovascular / Stroke Signs (Time-Sensitive) --
  "ISCHEMIC_CHEST_PAIN", // Active chest pain suspicious for Acute Coronary Syndrome [cite: 424]
  "ACUTE_STROKE_SYMPTOMS", // Gross neuro deficits (aphasia, hemiparesis, facial droop, slurred speech) [cite: 425, 465]
  "THUNDERCLAP_HEADACHE", // Severe, rapid-onset headache suspicious for subarachnoid hemorrhage [cite: 463]
  "HEADACHE_WITH_NUCHAL_RIGIDITY", // Headache accompanied by neck pain or stiffness indicating meningitis risk [cite: 464]

  // -- Vulnerable Populations + Fever --
  "IMMUNOCOMPROMISED_WITH_FEVER", // Oncology/chemotherapy patients presenting with any fever
  "TRANSPLANT_RECIPIENT_WITH_FEVER", // Solid organ transplant patients showing signs of infection or rejection [cite: 428, 564]
  "NEONATAL_FEVER", // Infants under 28 days old with a temperature > 38°C (100.4°F) [cite: 262, 812]

  // -- OB/GYN / Genitourinary High-Risk --
  "PREGNANT_OR_POSTPARTUM_HIGH_BP", // Pregnancy/postpartum status with SBP < 90 or > 150 [cite: 532]
  "POSTPARTUM_HEAVY_BLEEDING", // Heavy vaginal hemorrhage post-delivery (soaking pad an hour, plum-sized clots) [cite: 433, 535, 536]
  "ABDOMINAL_PAIN_PREGNANCY_CAPABLE", // Lower abdominal pain with bleeding (suspicious for ectopic pregnancy/ovarian torsion) [cite: 425, 526, 541]
  "SUSPECTED_TESTICULAR_TORSION", // Sudden, severe testicular or scrotal pain (time-sensitive organ threat) [cite: 540]

  // -- Trauma Mechanism High-Risk (Walk-ins / Dropped off) --
  "HIGH_FALL_MECHANISM", // Falls from 20 feet (6 meters) or more
  "SEVERE_MVC_MECHANISM", // Ejection from vehicle or requirement of mechanical extrication tools
  "COMPROMISED_NEUROVASCULAR_LIMB", // Extremity injuries with signs of compartment syndrome or lost pulses [cite: 554]

  // -- Pediatric Specific High-Risk --
  "BUTTON_BATTERY_OR_MAGNET_INGESTION", // Extremely time-sensitive pediatric foreign body ingestion [cite: 487, 524]
  "PEDIATRIC_RESPIRATORY_STRUGGLE", // Grunting, deep retractions, or belly breathing in children [cite: 493]

  // -- Severe Pain & Distress Triggers --
  "SEVERE_SYSTEMIC_PAIN", // Pain >= 7/10 driven by systemic disruption (e.g., renal colic, sickle cell crisis) [cite: 444, 449]
  "ACUTE_MENTAL_STATUS_CHANGE", // New-onset confusion, somnolence, acute disorientation, or post-ictal states [cite: 435, 440, 466]
  "SEVERE_PSYCHOLOGICAL_DISTRESS", // Acute suicidal/homicidal ideation, psychosis, or extreme acute grief reactions [cite: 429, 457, 458, 570]
  "SEXUAL_ASSAULT_OR_DOMESTIC_VIOLENCE", // Survivors of violence presenting with associated acute trauma/distress [cite: 431, 455, 456]

  // =========================================================================
  // === ESI LEVEL 3: STABLE BUT MANY RESOURCES (2+) ========================
  // =========================================================================

  // -- Respiratory (stable, not requiring immediate intervention) --
  "PRODUCTIVE_COUGH_WITH_FEVER",
  // Pneumonia presentation, stable vitals (labs + imaging = 2 resources)

  "MODERATE_RESPIRATORY_DISTRESS",
  // Tachypnea/wheezing without severe compromise (labs + nebulized meds + imaging)

  // -- Abdominal (stable, multi-resource workup) --
  "ABDOMINAL_PAIN_STABLE",
  // Non-pregnancy, stable vitals (labs + CT + IV fluids = 3 resources)

  "NAUSEA_VOMITING_DEHYDRATION",
  // IV fluids + labs = 2 resources

  // -- Cardiovascular (stable, multi-resource workup) --
  "NON_CARDIAC_CHEST_PAIN",
  // Musculoskeletal or GI chest pain profile needing ECG + labs = 2 resources

  // -- Neurological (stable) --
  "HEADACHE_STABLE_LOW_RISK",
  // No thunderclap, no nuchal rigidity — labs + imaging = 2 resources

  "POST_ICTAL_ALERT_ORIENTED",
  // Known seizure history, now alert (imaging + labs)

  // -- Trauma/Orthopedic (multi-resource) --
  "POSSIBLE_FRACTURE_IMAGING_NEEDED",
  // Suspected fracture requiring X-ray + possible IV pain management = 2 resources

  // -- Infectious / Systemic --
  "FEVER_ADULT_WITH_SOURCE",
  // Adult with identifiable fever source, stable (labs = 1-2 resources)

  "FLANK_PAIN_POSSIBLE_RENAL_COLIC",
  // Labs + CT = 2 resources — also ESI 2 if severe systemic pain

  // -- Vascular --
  "SUSPECTED_DVT",
  // Unilateral leg swelling (labs + ultrasound = 2 resources)

  // =========================================================================
  // === ESI LEVEL 4: STABLE, ONE RESOURCE ==================================
  // =========================================================================

  "SORE_THROAT_STABLE",
  // Exam + throat culture = 1 resource

  "DYSURIA_UNCOMPLICATED",
  // Exam + urine = 1 resource

  "SIMPLE_LACERATION_REPAIR_NEEDED",
  // Simple procedure = 1 resource

  "EAR_PAIN_STABLE",
  // Exam + prescription = 0 or 1 depending on culture

  "CONJUNCTIVITIS_OR_EYE_REDNESS",
  // Stable, no vision loss — exam + prescription

  "MINOR_SKIN_INFECTION",
  // Cellulitis without systemic signs — exam + possible culture = 1 resource

  "STABLE_BACK_PAIN",
  // Musculoskeletal, no red flags, no neuro deficit — exam + oral meds

  "STABLE_ALLERGIC_REACTION",
  // Mild hives, no airway involvement — exam + oral meds

  "MILD_ASTHMA_EXACERBATION",
  // Not in severe distress — exam + nebulized medication = 1 resource

  "URINARY_CATHETER_INSERTION",
  // Simple procedure = 1 resource

  // =========================================================================
  // === ESI LEVEL 5: STABLE, NO RESOURCES ==================================
  // =========================================================================

  "MEDICATION_REFILL_ONLY",
  // Asymptomatic, exam + prescription = 0 resources

  "MINOR_ABRASION_NO_REPAIR",
  // Wound care only, no sutures = 0 resources

  "IMMUNIZATION_ONLY",
  // Tetanus = not an ESI resource

  "PRESCRIPTION_ONLY_VISIT",
  // Lost inhaler, stable, needs prescription = 0 resources

  "MINOR_UPPER_RESPIRATORY_INFECTION",
  // Common cold presentation, stable vitals, exam + prescription

  "STABLE_RASH_NO_DISTRESS"
  // Localized, no systemic involvement
]);

export const observablesSchema = z.array(observableSchema);

export type ObservableType = z.infer<typeof observableSchema>;

export type ObservablesType = ObservableType[];
