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
  // === DECISION POINT C & D: RESOURCE ESTIMATION & VITAL SIGNS (LEVEL 3) ===
  // =========================================================================
  "STABLE_ABDOMINAL_PAIN", // Constant localized abdominal pain (requires labs + CT scan = Many resources) [cite: 262, 858]
  "STABLE_CHEST_PAIN", // Non-cardiac profile chest pain (requires ECG + labs = Many resources) [cite: 262]
  "SUSPECTED_DEEP_VEIN_THROMBOSIS", // Unilateral leg swelling and pain (requires labs + ultrasound = Many resources) [cite: 262, 753]
  "COMPLEX_LACERATION_OR_SEDATION", // Complex wounds needing procedural sedation or complex repair (= 2 resources) [cite: 262, 755]
  "STABLE_PRODUCTIVE_COUGH", // Productive cough/fever with stable vitals initially (requires labs + X-ray = Many resources) [cite: 262, 850]

  // =========================================================================
  // === LOW ACUITY / ONE OR NO RESOURCES (ESI LEVEL 4 & 5) =================
  // =========================================================================
  "SIMPLE_LACERATION_OR_CATHETER", // Minor cut requiring simple suturing or uncomplicated catheter insertion (= 1 resource) [cite: 262, 755]
  "DYSURIA_STABLE_ADULT", // Painful urination with stable vitals (requires urine analysis/culture = 1 resource) [cite: 753]
  "ACUTE_SORE_THROAT", // Swallowing pain, stable vitals (requires throat swab/culture = 1 resource) [cite: 753]
  "MINOR_ORTHOPEDIC_INJURY", // Isolated sprain/strain needing minor dressing/splint (Crutches/splints = Not ESI resources) [cite: 262, 755]
  "EAR_PAIN_STABLE_CHILD", // Simple otitis media evaluation (Exam + prescription = 0 resources) [cite: 753]
  "MEDICATION_REFILL_REQUEST", // Asymptomatic patient needing standard outpatient renewal (0 resources) [cite: 753, 755]
  "MILD_RASH_NO_DISTRESS" // Localized dermatological presentation, completely stable vitals (0 resources) [cite: 262]
]);

export const observablesSchema = z.array(observableSchema);

export type ObservableType = z.infer<typeof observableSchema>;

export type ObservablesType = ObservableType[];
