// Typed factory functions — one per significant pipeline event.
// Every function returns a fully-typed AgentEvent ready for:
//   - MongoDB insert
//
// Usage:
//   const event = AgentEventLogger.gatekeeperVitalFlag({ ... })
//   await db.agentEvents.insertOne(event)

import { randomUUID } from "crypto";
import { VitalFlag, AgentEvent, BaseTrace } from "@hygieiashield/zod-contracts";
import { GateKeeperInput } from "../agents/deterministic-gatekeeper/schemas/input.schema.js";
import {
  formatVitalFlagsForClinician,
  formatVitalsForClinician
} from "@hygieiashield/clinical-protocols";
import { DoctorBriefInput } from "../agents/doctor-brief-generator/schemas/input.schema.js";

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────

function now(): string {
  return new Date().toISOString();
}

function makeId(): string {
  return randomUUID();
}

function convertBooleanToYesNo(value: boolean): string {
  return Boolean(value) ? "Yes" : "No";
}

// ─────────────────────────────────────────────────────────────────────────────
// Agent 1 — Intake Interpreter
// ─────────────────────────────────────────────────────────────────────────────

function intakeCompleted(params: {
  trace: BaseTrace;
  observables: string[];
  unknownMentions: string[];
  latencyMs: number;
  rawText?: string;
  model?: string;
}): AgentEvent {
  const { trace, observables, unknownMentions, latencyMs, model } = params;

  return {
    eventId: makeId(),
    timestamp: now(),
    service: "intake_interpreter",
    eventType: "observables_extracted",
    trace,
    metadata: {
      latencyMs,
      success: true,
      model
    },
    timeline: {
      agent: {
        name: "Agent 1 · Intake Interpreter"
      },
      input: params.rawText,

      headline: `Observables extracted — ${observables.length} mapped, ${unknownMentions.length} unmapped`,
      bullets: [
        ...observables.map(
          (o) => `Mapped: ${o.replace(/_/g, " ").toLowerCase()}`
        ),
        ...unknownMentions.map((m) => `Unmapped (passed through): "${m}"`)
      ]
    },
    structured: {
      flags: observables,
      scores: {}
    },
    debugDetail: {
      input: { rawText: params.rawText },
      output: { observables, unknownMentions }
    }
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Agent 2 — Context Grounder (pre-arrival)
// ─────────────────────────────────────────────────────────────────────────────

function esiClassified(params: {
  trace: BaseTrace;
  observables: string[];
  unknownMentions: string[];
  esiLevel: number;
  lifesavingIntervention: boolean;
  highRisk: boolean;
  ageGroup: string;
  predictedResources: number;
  latencyMs: number;
  model?: string;
}): AgentEvent {
  const {
    trace,
    esiLevel,
    observables,
    unknownMentions,
    lifesavingIntervention,
    predictedResources,
    highRisk,
    ageGroup,
    latencyMs,
    model
  } = params;

  return {
    eventId: makeId(),
    timestamp: now(),
    service: "context_grounder",
    eventType: "esi_classified",
    trace,
    metadata: {
      latencyMs,
      success: true,
      model
    },
    timeline: {
      agent: {
        name: "Agent 2 · ESI Context grounder"
      },
      input: [
        ...observables.map(
          (o) => `Mapped: ${o.replace(/_/g, " ").toLowerCase()}`
        ),
        ...unknownMentions.map((m) => `Unmapped (passed through): "${m}"`)
      ].join(" · "),

      headline: `ESI Level ${esiLevel} (derived via ESI v5 Handbook)`,
      isCriticalFinding: [1, 2].includes(esiLevel),
      bullets: [
        `Life saving intervention needed: ${convertBooleanToYesNo(lifesavingIntervention)}`,
        `High Risk: ${convertBooleanToYesNo(highRisk)}`,
        `Number of resources predicted: ${predictedResources}`,
        `ESI Level: ${esiLevel}`
      ]
    },
    structured: {
      flags: [],
      scores: {
        esiLevel
      }
    },
    debugDetail: {
      input: { observables, unknownMentions, ageGroup },
      output: { lifesavingIntervention, predictedResources, highRisk, esiLevel }
    }
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Agent 3 — Gatekeeper: summary event (override or approval)
// ─────────────────────────────────────────────────────────────────────────────

function gatekeeperCompleted(params: {
  trace: BaseTrace;
  finalESI: number;
  previousESI: number;
  input: GateKeeperInput;
  overridden: boolean;
  vitalFlags?: VitalFlag[];
  reasons?: string[];
  latencyMs: number;
}): AgentEvent {
  const {
    trace,
    finalESI,
    previousESI,
    overridden,
    vitalFlags,
    reasons,
    input,
    latencyMs
  } = params;

  const flags = vitalFlags ?? [];
  const hasCritical = flags.some((f) => f.level === "CRITICAL");

  const inputSummary = [
    `ESI (pre): ${input.esiLevel}`,
    `Age group: ${input.ageGroup}`,
    `Observables: ${input.observables.join(", ")}`,
    input.vitals
      ? `Vitals: ${formatVitalsForClinician(input.vitals)}`
      : "No vitals (pre-arrival)"
  ].join(" · ");

  return {
    eventId: makeId(),
    timestamp: now(),
    service: "gatekeeper",
    eventType: "gatekeeper_evaluated",
    trace,
    metadata: {
      latencyMs,
      success: true,
      overrode: overridden
    },
    timeline: {
      agent: {
        name: "Agent 3 · Deterministic gatekeeper (pure code — no LLM)"
      },
      headline: overridden
        ? `Gatekeeper override: ESI ${previousESI} to ${finalESI}`
        : flags.length > 0
          ? `${flags.length} vital flag(s) evaluated. ESI ${finalESI} confirmed.`
          : `ESI ${finalESI} confirmed`,

      isCriticalFinding: hasCritical || overridden,
      input: inputSummary,

      bullets: [
        ...(reasons ?? []),
        flags.length > 0
          ? `Vital flags: ${flags.map((f) => f.flag).join(", ")}`
          : "No Vital flags found",
        hasCritical ? "Critical condition detected" : null
      ].filter(Boolean) as string[]
    },
    structured: {
      flags: flags.map((f) => f.flag),
      scores: { finalESI, previousESI, flagCount: flags.length }
    },
    debugDetail: {
      input,
      output: { finalESI, overridden, vitalFlags, reasons }
    }
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// MedGemma — Doctor brief generated
// ─────────────────────────────────────────────────────────────────────────────

function doctorBriefGenerated(params: {
  trace: BaseTrace;
  input: DoctorBriefInput;
  chiefComplaint: string;
  riskFlags: string[]; // MedGemma additions only (Agent 3 flags excluded)
  recommendedActions: string[];
  protocolMatch: { name: string; rationale: string };
  confidence: { level: string; explanation: string };
  unknownMentions: string[];
  latencyMs: number;
  model?: string;
}): AgentEvent {
  const {
    trace,
    input,
    chiefComplaint,
    riskFlags,
    recommendedActions,
    protocolMatch,
    confidence,
    unknownMentions,
    latencyMs,
    model
  } = params;

  const inputSummary = [
    `ESI (pre): ${input.esiLevel}`,
    `Age group: ${input.ageGroup}`,
    `Observables: ${input.observables.join(", ")}`,
    input.vitals
      ? `Vitals: ${formatVitalsForClinician(input.vitals)}`
      : "No vitals"
  ].join(" · ");

  return {
    eventId: makeId(),
    timestamp: now(),
    service: "doctor_brief",
    eventType: "brief_generated",
    trace,
    metadata: {
      latencyMs,
      success: true,
      model // "medgemma:4b"
    },
    timeline: {
      agent: {
        name: "Agent 4 · Doctor brief generator"
      },
      input: inputSummary,
      headline: `Doctor brief has been generated. Chief complaint discovered is "${chiefComplaint}"`,
      isCriticalFinding: false,
      bullets: [
        `Protocol: ${protocolMatch.name}`,
        `Confidence: ${confidence.level} — ${confidence.explanation}`,
        ...recommendedActions.map((a) => `→ ${a}`),
        ...riskFlags.map((f) => `◈ ${f}`)
      ].filter(Boolean) as string[]
    },
    structured: {
      scores: {},
      flags: riskFlags
    },
    debugDetail: {
      input,
      output: params
    }
  };
}

export const AgentEventLogger = {
  intakeCompleted,
  esiClassified,
  gatekeeperCompleted,
  doctorBriefGenerated
};
