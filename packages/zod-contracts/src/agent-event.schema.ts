// Single source of truth for AgentEvent.
// Consumed by:
//   - MongoDB logger (one document per event per encounter)
//   - SSE emitter → PulseOps agent trace panel
//   - Future: ElasticSearch index (schema is flat enough to map directly)

import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// Controlled vocabularies
// ─────────────────────────────────────────────────────────────────────────────

export const AgentServiceSchema = z.enum([
  "intake_interpreter", // Agent 1: text → ObservableCode[]
  "context_grounder", // Agent 2: observables → ESI + routing
  "gatekeeper", // Agent 3: vitals → risk flags (pure code)
  "doctor_brief", // MedGemma: structured brief generation
  "care_route_engine", // Pure code: facility scoring + reservation + TTL
  "orchestration" // Pipeline coordinator (not an agent itself)
]);

export const AgentEventTypeSchema = z.enum([
  // Pipeline lifecycle
  "pipeline_started",
  "pipeline_completed",
  "pipeline_failed",

  // Agent lifecycle
  "agent_started",
  "agent_completed",
  "agent_failed",

  // Clinical decisions (the important ones for the trace panel)
  "observables_extracted", // Agent 1 output
  "esi_classified", // Agent 2 pre-arrival output
  "gatekeeper_evaluated", // Agent 3
  "brief_generated", // MedGemma output

  // Logistics
  "routing_decided", // Care-Route Engine: facility selected
  "soft_reservation_placed", // Care-Route Engine: Active_Encounters++
  "ttl_started", // 45-min clock started
  "ttl_expired", // No-show — reservation released
  "patient_arrived", // QR scanned at desk
  "bed_confirmed", // Coordinator clicked confirm in WardOps
  "encounter_completed", // Patient discharged

  // Surge
  "surge_threshold_breached", // surgeIndex > 80%
  "surge_alert_fired" // WardOps Teams card sent
]);

export type AgentService = z.infer<typeof AgentServiceSchema>;
export type AgentEventType = z.infer<typeof AgentEventTypeSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Trace context — links every event back to the encounter
// ─────────────────────────────────────────────────────────────────────────────

const TraceSchema = z.object({
  encounterId: z.string(),
  patientId: z.string(),
  token: z.string() // WORD-NNNN
});

// ─────────────────────────────────────────────────────────────────────────────
// Timeline — UI-facing. Rendered in PulseOps agent trace panel.
// Deliberately human-readable. No machine codes here.
// ─────────────────────────────────────────────────────────────────────────────

const TimelineSchema = z.object({
  agent: z
    .object({
      name: z.string() // "Intake Interpreter"
    })
    .optional(),

  input: z.string().optional(), // human-readable input snapshot

  // Short label shown in the trace panel step list
  // e.g. "ESI classified", "Vital flag raised", "Override"
  headline: z.string(),
  isCriticalFinding: z.boolean().optional(), // if true, highlight in red in UI

  // Step-by-step reasoning — shown when user expands a trace step
  // Keep these clinician-friendly, not code strings
  bullets: z.array(z.string()).optional()
});

// ─────────────────────────────────────────────────────────────────────────────
// Structured — machine-readable clinical codes and outputs
// Used for MongoDB queries and FHIR resource generation
// ─────────────────────────────────────────────────────────────────────────────

const StructuredSchema = z.object({
  // Flag codes raised (Agent 3) — e.g. ["SEVERE_HYPOXEMIA", "TACHYCARDIA"]
  flags: z.array(z.string()).optional().default([]),

  // Routing decision — "ER" | "URGENT_CARE" | "OUTPATIENT"
  routing: z.string().optional(),

  // Numeric scores — queryable
  // e.g. { esiLevel: 2, surgeScore: 83, confidence: 0.91 }
  scores: z.record(z.number()).optional().default({})
});

// ─────────────────────────────────────────────────────────────────────────────
// Debug — machine-readable. NOT shown in PulseOps UI.
// Verbose internal state for debugging and ElasticSearch.
// ─────────────────────────────────────────────────────────────────────────────

const DebugDetailSchema = z.object({
  // Raw agent input (sanitised — no PII beyond what's already in trace)
  input: z.unknown().optional(),
  // Raw agent output
  output: z.unknown().optional(),
  // Internal reasoning steps (code-level, not clinician-facing)
  reasons: z.array(z.string()).optional(),
  // Error details if event_type is *_failed
  error: z
    .object({
      message: z.string(),
      stack: z.string().optional(),
      code: z.string().optional()
    })
    .optional()
});

// ─────────────────────────────────────────────────────────────────────────────
// Full AgentEvent schema
// ─────────────────────────────────────────────────────────────────────────────

export const AgentEventSchema = z.object({
  // MongoDB _id substitute — unique per event
  eventId: z.string(),
  timestamp: z.string().datetime(),

  service: AgentServiceSchema,
  eventType: AgentEventTypeSchema,

  trace: TraceSchema,

  metadata: z.object({
    latencyMs: z.number().optional(),
    success: z.boolean(),
    // Model identifier — only for LLM agents
    model: z.string().optional(), // e.g. "medgemma:4b", "gpt-4o"
    // Whether this event changed the ESI level vs upstream
    overrode: z.boolean().optional()
  }),

  // UI-facing — rendered in PulseOps agent trace panel
  timeline: TimelineSchema,

  // Machine-readable clinical codes and outputs
  structured: StructuredSchema,

  // Verbose internal state — debugging only, not shown in UI
  debugDetail: DebugDetailSchema
});

export type AgentEvent = z.infer<typeof AgentEventSchema>;
