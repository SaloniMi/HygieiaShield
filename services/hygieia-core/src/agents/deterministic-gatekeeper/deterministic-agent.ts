import { GateKeeperInput } from "./schemas/input.schema.js";
import { GateKeeperOutput } from "./schemas/output.schema.js";
/**
 * Observables that strongly indicate an ESI-2 presentation
 * according to ESI v5 high-risk criteria.
 *
 * These are the cases we should NEVER allow Agent 2
 * to downgrade.
 */
const HARD_HIGH_RISK = new Set([
  "DIFFICULTY_BREATHING",
  "BLUISH_LIPS_OR_FACE",

  "CRUSHING_CHEST_PAIN",

  "LOSS_OF_CONSCIOUSNESS",
  "SUDDEN_CONFUSION",
  "SLURRED_SPEECH",
  "SUDDEN_WEAKNESS_ONE_SIDE",
  "ACTIVE_SEIZURE",

  "SEVERE_BURNS",
  "AMPUTATION_OR_CRUSH",

  "ANAPHYLAXIS_SIGNS",
  "POISON_OR_OVERDOSE_SUSPECTED",

  "SEVERE_ABDOMINAL_PAIN",
  "COUGH_WITH_BLOOD",
  "SEVERE_DEHYDRATION"
]);

/**
 * Decision Point A
 * ESI 1
 */
function requiresESI1(input: GateKeeperInput, reasons: string[]): boolean {
  const { vitals, observables } = input;

  if (input.lifesavingIntervention) {
    reasons.push("Immediate lifesaving intervention required");

    return true;
  }

  if (vitals.levelOfConsciousness === "UNRESPONSIVE") {
    reasons.push("Patient is unresponsive");

    return true;
  }

  if (vitals.spo2 < 85 && observables.includes("DIFFICULTY_BREATHING")) {
    reasons.push("Severe hypoxia with respiratory distress");

    return true;
  }

  if (vitals.systolicBP < 80 && observables.includes("CRUSHING_CHEST_PAIN")) {
    reasons.push("Profound hypotension with chest pain");

    return true;
  }

  if (vitals.systolicBP < 80 && observables.includes("SEVERE_BLEEDING")) {
    reasons.push("Profound hypotension with severe bleeding");

    return true;
  }

  return false;
}

/**
 * Deterministic high-risk validator.
 *
 * Used only to catch obvious under-triage.
 */
function shouldForceHighRisk(
  input: GateKeeperInput,
  reasons: string[]
): boolean {
  for (const observable of input.observables) {
    if (HARD_HIGH_RISK.has(observable)) {
      reasons.push(`High-risk observable detected: ${observable}`);
      return true;
    }
  }

  const v = input.vitals;

  if (
    v.levelOfConsciousness === "VERBAL" ||
    v.levelOfConsciousness === "PAINFUL"
  ) {
    reasons.push(`Altered consciousness: ${v.levelOfConsciousness}`);

    return true;
  }

  if (v.spo2 < 92 && input.observables.includes("DIFFICULTY_BREATHING")) {
    reasons.push("Hypoxia with respiratory distress");

    return true;
  }

  return false;
}

/**
 * Decision Point C
 */
function resourceBasedESI(predictedResources: number): 3 | 4 | 5 {
  if (predictedResources <= 0) {
    return 5;
  }

  if (predictedResources === 1) {
    return 4;
  }

  return 3;
}

/**
 * Decision Point D
 *
 * Handbook reassessment vitals.
 */
function hasDangerVitals(input: GateKeeperInput): boolean {
  const v = input.vitals;

  return (
    v.heartRate > 100 ||
    v.respiratoryRate > 20 ||
    v.spo2 < 92 ||
    v.systolicBP < 90 ||
    v.levelOfConsciousness !== "ALERT"
  );
}

function hasCriticalVitals(input: GateKeeperInput): boolean {
  const v = input.vitals;

  return v.spo2 < 90 || v.systolicBP < 90 || v.levelOfConsciousness !== "ALERT";
}

export async function runGatekeeper(
  input: GateKeeperInput
): Promise<GateKeeperOutput> {
  const reasons: string[] = [];

  /**
   * =====================================
   * Decision Point A
   * ESI 1
   * =====================================
   */
  if (requiresESI1(input, reasons)) {
    return {
      finalESI: 1,
      overridden: input.predictedESI !== 1,
      reasons
    };
  }

  /**
   * =====================================
   * Validate Agent 2 high-risk decision
   * =====================================
   */
  let correctedHighRisk = input.highRisk;

  if (!input.highRisk) {
    const forceHighRisk = shouldForceHighRisk(input, reasons);

    if (forceHighRisk) {
      correctedHighRisk = true;

      reasons.push("Agent 3 corrected highRisk=false → true");
    }
  }

  /**
   * =====================================
   * Decision Point B
   * ESI 2
   * =====================================
   */
  if (correctedHighRisk) {
    reasons.push("ESI 2 due to high-risk presentation");
    return {
      finalESI: 2,
      overridden: input.predictedESI !== 2,
      reasons
    };
  }

  if (hasCriticalVitals(input)) {
    reasons.push("The vitals show the patient is critical");
    return {
      finalESI: 2,
      overridden: true,
      reasons
    };
  }

  /**
   * =====================================
   * Decision Point C
   * Resource Prediction
   * =====================================
   */
  const esi = resourceBasedESI(input.predictedResources);

  reasons.push(`Predicted resources: ${input.predictedResources}`);

  /**
   * =====================================
   * Decision Point D
   * Vital Sign Reassessment
   * =====================================
   */
  if (esi === 3 && hasDangerVitals(input)) {
    reasons.push("Dangerous vital signs triggered ESI upgrade");
    return {
      finalESI: 2,
      overridden: esi !== input.predictedESI,
      reasons
    };
  }

  return {
    finalESI: esi,
    overridden: esi !== input.predictedESI,
    reasons
  };
}
