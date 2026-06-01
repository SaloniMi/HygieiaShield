import { GateKeeperInput } from "./schemas/input.schema.js";
import { GateKeeperOutput } from "./schemas/output.schema.js";

/**
 * Single Source of Truth: High Risk Observables
 */
const HARD_HIGH_RISK = new Set([
  "ISCHEMIC_CHEST_PAIN",
  "ACUTE_STROKE_SYMPTOMS",
  "THUNDERCLAP_HEADACHE",
  "HEADACHE_WITH_NUCHAL_RIGIDITY",
  "IMMUNOCOMPROMISED_WITH_FEVER",
  "TRANSPLANT_RECIPIENT_WITH_FEVER",
  "NEONATAL_FEVER",
  "PREGNANT_OR_POSTPARTUM_HIGH_BP",
  "POSTPARTUM_HEAVY_BLEEDING",
  "ABDOMINAL_PAIN_PREGNANCY_CAPABLE",
  "SUSPECTED_TESTICULAR_TORSION",
  "HIGH_FALL_MECHANISM",
  "SEVERE_MVC_MECHANISM",
  "COMPROMISED_NEUROVASCULAR_LIMB",
  "BUTTON_BATTERY_OR_MAGNET_INGESTION",
  "PEDIATRIC_RESPIRATORY_STRUGGLE",
  "SEVERE_SYSTEMIC_PAIN",
  "ACUTE_MENTAL_STATUS_CHANGE",
  "SEVERE_PSYCHOLOGICAL_DISTRESS",
  "SEXUAL_ASSAULT_OR_DOMESTIC_VIOLENCE"
]);

/**
 * Safe vitals accessor (prevents crashes)
 */
function getVitals(input: GateKeeperInput) {
  return input.vitals ?? {};
}

/* =========================
   ESI-1 LOGIC
========================= */
function requiresESI1(input: GateKeeperInput, reasons: string[]): boolean {
  const v = getVitals(input);
  const obs = input.observables ?? [];
  const ageGroup = input.ageGroup;

  if (input.lifesavingIntervention) {
    reasons.push("Lifesaving intervention flag set.");
    return true;
  }

  if (
    v.levelOfConsciousness === "UNRESPONSIVE" ||
    v.levelOfConsciousness === "PAINFUL" ||
    obs.includes("UNRESPONSIVE_OR_OBTUNDED")
  ) {
    reasons.push("Severe consciousness impairment detected.");
    return true;
  }

  if (
    (v.spo2 !== undefined && v.spo2 < 90) ||
    obs.includes("SEVERE_RESPIRATORY_DISTRESS") ||
    obs.includes("PEDIATRIC_RESPIRATORY_STRUGGLE")
  ) {
    reasons.push("Severe respiratory compromise detected.");
    return true;
  }

  if (ageGroup === "NEONATE" && obs.includes("FLACCID_INFANT")) {
    reasons.push("Critical neonatal presentation.");
    return true;
  }

  if (
    (v.systolicBP !== undefined && v.systolicBP < 80) ||
    obs.includes("PROFOUND_HYPOTENSION_SHOCK") ||
    obs.includes("ISCHEMIC_CHEST_PAIN")
  ) {
    reasons.push("Profound circulatory collapse suspected.");
    return true;
  }

  return false;
}

/* =========================
   ESI-2 LOGIC
========================= */
function shouldForceHighRisk(
  input: GateKeeperInput,
  reasons: string[]
): boolean {
  const v = getVitals(input);
  const obs = input.observables ?? [];
  const ageGroup = input.ageGroup;

  // 1. HARD HIGH RISK OBSERVABLES (ONLY SOURCE OF TRUTH)
  for (const o of obs) {
    if (HARD_HIGH_RISK.has(o)) {
      reasons.push(`High-risk observable override: ${o}`);
      return true;
    }
  }

  // 2. Pain + severity alignment
  if (
    (v.painScore !== undefined && v.painScore >= 7) ||
    obs.includes("SEVERE_SYSTEMIC_PAIN")
  ) {
    reasons.push("Severe pain syndrome detected.");
    return true;
  }

  // 3. Neonatal fever (safe optional check)
  if (
    ageGroup === "NEONATE" &&
    v.temperatureC !== undefined &&
    v.temperatureC > 38
  ) {
    reasons.push("Neonatal fever detected.");
    return true;
  }

  // 4. Obstetric instability
  if (
    obs.includes("PREGNANT_OR_POSTPARTUM_HIGH_BP") &&
    v.systolicBP !== undefined &&
    (v.systolicBP > 150 || v.systolicBP < 90)
  ) {
    reasons.push("Obstetric hypertensive instability.");
    return true;
  }

  return false;
}

/* =========================
   VITAL SAFETY CHECK (FIXED)
========================= */
function hasDangerVitalSigns(input: GateKeeperInput): boolean {
  const v = getVitals(input);
  const ageGroup = input.ageGroup;

  if (v.spo2 !== undefined && v.spo2 < 92) return true;

  switch (ageGroup) {
    case "NEONATE":
      return (v.heartRate ?? 0) > 190 || (v.respiratoryRate ?? 0) > 60;

    case "PEDIATRIC":
      return (v.heartRate ?? 0) > 140 || (v.respiratoryRate ?? 0) > 40;

    case "ADULT":
    case "GERIATRIC":
      return (v.heartRate ?? 0) > 100 || (v.respiratoryRate ?? 0) > 20;

    default:
      return false;
  }
}

/* =========================
   RESOURCE LOGIC
========================= */
function resourceBasedESI(predictedResources: number): 3 | 4 | 5 {
  if (predictedResources <= 0) return 5;
  if (predictedResources === 1) return 4;
  return 3;
}

/* =========================
   MAIN ORCHESTRATOR
========================= */
export async function runGatekeeper(
  input: GateKeeperInput
): Promise<GateKeeperOutput> {
  const reasons: string[] = [];

  // STEP 1: ESI-1
  if (requiresESI1(input, reasons)) {
    return {
      finalESI: 1,
      overridden: input.predictedESI !== 1,
      reasons
    };
  }

  // STEP 2: ESI-2
  let isHighRisk = input.highRisk;

  if (!isHighRisk || shouldForceHighRisk(input, reasons)) {
    isHighRisk = true;
    reasons.push("High-risk status enforced by Agent 3.");
  }

  if (isHighRisk) {
    reasons.push("Assigned ESI-2 due to high-risk presentation.");
    return {
      finalESI: 2,
      overridden: input.predictedESI !== 2,
      reasons
    };
  }

  // STEP 3: Resource baseline
  const resourceESI = resourceBasedESI(input.predictedResources);

  reasons.push(`Resource-based ESI: ${resourceESI}`);

  // STEP 4: Vital override (safe now)
  if (resourceESI === 3 && hasDangerVitalSigns(input)) {
    reasons.push("Vital sign escalation to ESI-2.");
    return {
      finalESI: 2,
      overridden: true,
      reasons
    };
  }

  return {
    finalESI: resourceESI,
    overridden: resourceESI !== input.predictedESI,
    reasons
  };
}
