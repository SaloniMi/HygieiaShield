import { GateKeeperInput } from "./schemas/input.schema.js";
import { GateKeeperOutput } from "./schemas/output.schema.js";
import {
  AgentContext,
  VitalFlag,
  VitalsType
} from "@hygieiashield/zod-contracts";
import {
  evaluateAllVitals,
  VITAL_RULES,
  VITALS_LOINC
} from "@hygieiashield/clinical-protocols";
import { AgentEventLogger } from "../../realtime/agent-event.logger.js";

/* =========================
   HIGH RISK OBSERVABLES
========================= */
const HARD_HIGH_RISK = new Set<string>([
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

/* =========================
   TYPES
========================= */

type VitalLevel = "HIGH" | "CRITICAL" | "NORMAL" | "INFO";

type VitalTrigger = {
  vital: string;
  level: VitalLevel;
  flag: string | null;
  value: unknown;
};

type VitalContext = {
  criticalEvents: ReadonlyArray<{ vital: string; flag: string }>;
  highFlags: ReadonlySet<string>;
  hasAnyCritical: boolean;
};

type VitalResult = ReturnType<typeof evaluateAllVitals>[number];

/* =========================
   VITAL FLAG BUILDER
   Converts vitalResults → structured VitalFlag[]
   Only includes HIGH and CRITICAL breaches — NORMAL is omitted
========================= */

function buildVitalFlags(vitalResults: VitalResult[]): VitalFlag[] {
  const flags: VitalFlag[] = [];

  for (const result of vitalResults) {
    const triggered = result.triggered;
    if (!triggered || !triggered.flag) continue;

    const level = triggered.level;
    if (level !== "HIGH" && level !== "CRITICAL") continue;

    const meta = VITALS_LOINC[result.vital as keyof typeof VITALS_LOINC] ?? {
      display: result.vital,
      unit: ""
    };

    const rule = VITAL_RULES[result.vital as keyof typeof VITALS_LOINC];

    // Find the matching threshold entry so we can surface operator + value
    let thresholdEntry;
    if (rule?.type === "numeric") {
      const match = rule.thresholds.find(
        (t: { flag: string; level: string }) =>
          t.flag === triggered.flag && t.level === level
      );
      if (match) thresholdEntry = match;
    }

    flags.push({
      vital: result.vital,
      vitalLabel: meta.display,
      value: (result as VitalResult).value,
      unit: meta.unit ?? undefined,
      flag: triggered.flag,
      threshold: thresholdEntry
        ? {
            operator: thresholdEntry.operator ?? undefined,
            value: thresholdEntry.value
          }
        : undefined,
      level
    });
  }
  // Sort: CRITICAL first, then HIGH
  return flags.sort((a, b) => {
    if (a.level === b.level) return 0;
    return a.level === "CRITICAL" ? -1 : 1;
  });
}

/* =========================
   VITAL EXTRACTION
========================= */

function getVitals(input: GateKeeperInput): Partial<VitalsType> {
  return input.vitals ?? {};
}

/* =========================
   CONTEXT BUILDER
========================= */

function buildVitalContext(vitalResults: VitalResult[]): VitalContext {
  const criticalEvents: { vital: string; flag: string }[] = [];
  const highFlags = new Set<string>();

  for (const r of vitalResults as Array<{
    vital: string;
    value: unknown;
    triggered?: VitalTrigger;
  }>) {
    const triggered = r.triggered;
    if (!triggered) continue;

    const { level, flag } = triggered;

    if (level === "CRITICAL" && flag) {
      criticalEvents.push({ vital: r.vital, flag });
    }

    if (level === "HIGH" && flag) {
      highFlags.add(flag);
    }
  }

  return {
    criticalEvents,
    highFlags,
    hasAnyCritical: criticalEvents.length > 0
  };
}

/* =========================
   ESI-1 (IMMEDIATE LIFE THREAT)
========================= */
function requiresESI1(input: GateKeeperInput, context: VitalContext): boolean {
  const v = getVitals(input);
  const obs = input.observables ?? [];

  if (v.levelOfConsciousness === "UNRESPONSIVE") return true;
  if (v.levelOfConsciousness === "PAINFUL") return true;
  if (obs.includes("UNRESPONSIVE_OR_OBTUNDED")) return true;
  if (context.hasAnyCritical) return true;
  if (obs.includes("SEVERE_RESPIRATORY_DISTRESS")) return true;
  if (obs.includes("PROFOUND_HYPOTENSION_SHOCK")) return true;
  if (input.ageGroup === "NEONATE" && obs.includes("FLACCID_INFANT"))
    return true;

  return false;
}

/* =========================
   ESI-2 HIGH RISK LOGIC
========================= */

function shouldForceHighRisk(
  input: GateKeeperInput,
  context: VitalContext,
  reasons: string[]
): boolean {
  const obs = input.observables ?? [];

  // CRITICAL always escalates
  if (context.hasAnyCritical) {
    reasons.push(
      `Critical physiological events: ${context.criticalEvents
        .map((e) => `${e.vital}:${e.flag}`)
        .join(", ")}`
    );
    return true;
  }

  // HARD OVERRIDE OBSERVABLES
  for (const o of obs) {
    if (HARD_HIGH_RISK.has(o)) {
      reasons.push(`Hard high-risk observable: ${o}`);
      return true;
    }
  }

  // PAIN (strict flag-based, no string inference)
  if (context.highFlags.has("SEVERE_PAIN")) {
    reasons.push("Severe pain threshold reached.");
    return true;
  }

  // OBSTETRIC instability
  if (
    obs.includes("PREGNANT_OR_POSTPARTUM_HIGH_BP") &&
    context.highFlags.has("HYPOTENSION")
  ) {
    reasons.push("Obstetric instability detected.");
    return true;
  }

  return false;
}

/* =========================
   MAIN ORCHESTRATOR
========================= */

export async function runGatekeeper(
  input: GateKeeperInput,
  ctx: AgentContext
): Promise<GateKeeperOutput> {
  const start = Date.now();

  const reasons: string[] = [];

  // ── Evaluate all vitals up front ──────────────────────────────────────────
  const vitals = getVitals(input);
  const hasVitals = Object.keys(vitals).length > 0;
  const vitalResults = hasVitals ? evaluateAllVitals(vitals, VITAL_RULES) : [];

  const context = buildVitalContext(vitalResults);

  // Only populate vitalFlags when vitals were actually provided
  const vitalFlags = hasVitals ? buildVitalFlags(vitalResults) : [];

  /* ─────────────────────────────────────────────────────────────
     EVENT HELPER (single source of truth)
  ───────────────────────────────────────────────────────────── */
  const publishEvent = async (final: GateKeeperOutput) => {
    const event = AgentEventLogger.gatekeeperCompleted({
      trace: ctx.trace,
      finalESI: final.finalESI,
      previousESI: input.esiLevel,
      input,
      overridden: final.overridden,
      vitalFlags,
      reasons,
      latencyMs: Date.now() - start
    });

    await ctx.eventBus.publish(event);
  };

  /* =========================
     STEP 1: ESI-1
  ========================= */
  let isLifeSavingNeeded = input.esiLevel === 1;
  if (!isLifeSavingNeeded && requiresESI1(input, context)) {
    isLifeSavingNeeded = true;
    reasons.push("ESI-1 triggered by deterministic rule engine.");
  }

  if (isLifeSavingNeeded) {
    const result: GateKeeperOutput = {
      finalESI: 1,
      overridden: input.esiLevel !== 1,
      reasons,
      vitalFlags
    };

    await publishEvent(result);
    console.log("DETERMINISTIC GATEKEEPER", result);
    return result;
  }

  /* =========================
     STEP 2: ESI-2
  ========================= */

  let isHighRisk = input.esiLevel === 2;

  if (!isHighRisk && shouldForceHighRisk(input, context, reasons)) {
    isHighRisk = true;
    reasons.push("High-risk classification enforced by rule engine.");
  }

  if (isHighRisk) {
    const result: GateKeeperOutput = {
      finalESI: 2,
      overridden: input.esiLevel !== 2,
      reasons,
      vitalFlags
    };

    await publishEvent(result);
    return result;
  }

  /* =========================
     STEP 3: Vital escalation (ESI 3 → 2)
  ========================= */

  const hasHighRiskVitals = context.highFlags.size > 0;

  if (hasHighRiskVitals) {
    reasons.push(
      `High-risk vitals present: ${Array.from(context.highFlags).join(", ")}`
    );

    const result: GateKeeperOutput = {
      finalESI: 2,
      overridden: true,
      reasons,
      vitalFlags
    };

    await publishEvent(result);
    return result;
  }

  /* =========================
     FINAL: No escalation
  ========================= */
  const result: GateKeeperOutput = {
    finalESI: input.esiLevel,
    overridden: false,
    reasons,
    vitalFlags
  };

  await publishEvent(result);
  return result;
}
