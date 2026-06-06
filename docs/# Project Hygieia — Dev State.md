# Project Hygieia — Dev State

> **Last updated:** Session 3
> **Purpose:** Read this FIRST in every new session. Saves ~3000 tokens of re-explanation.
> **Rule:** After any major architectural decision, update this file before ending the session.

---

## What this project is

Three-track Microsoft Agents League Hackathon submission (June 4-14, 2026).
One unified system: PulseTriage (public) → AegisCore (AI pipeline) → PulseOps (clinical) + WardOps (Teams).
Prize pool: $55,000. Submission deadline: June 14, 2026.

Full design doc: README.md
Data flow: docs/architecture/data-flow.md (to be written)

---

## Repository layout

```
apps/pulse-triage/          Track 1: Next.js mobile PWA (anti-panic triage UI)
apps/pulse-ops/             Track 2+: Next.js clinical workstation (nurse + doctor)
apps/ward-ops/              Track 3: Teams bot + Copilot Studio
apps/demo-control/          Hackathon demo orchestrator (surge simulator)
services/aegis-core/        3-agent AI pipeline (Agent 1, 2, 3)
services/api-gateway/       Express REST API + Zod validation middleware
services/realtime-sync/     SSE / WebSocket real-time bridge
packages/zod-contracts/     All shared TypeScript Zod schemas (source of truth)
packages/clinical-protocols/ Clinical data (ESI, AHA BLS, LOINC, SNOMED)
data/                       Mock CSV, fake patients JSON
scripts/                    Seed, simulate, reset
```

---

## Three users, three tracks

| User                         | Interface              | Track   |
| ---------------------------- | ---------------------- | ------- |
| Sarah — panicked relative    | PulseTriage mobile PWA | Track 1 |
| Nurse Priya — bedside intake | PulseOps workstation   | Track 2 |
| Shift Coordinator — command  | WardOps Teams bot      | Track 3 |

---

## Agent architecture (CRITICAL — read carefully)

### Agent naming (from architecture PDF — do not rename)

```
Agent 1: Intake Interpreter     — NLP: raw text → ObservableCode[]
Agent 2: Context Grounder       — RAG: observables → ESI level + routing
Agent 3: Deterministic Gatekeeper — Pure code: vitals → risk flags + override
```

### Agent 2 architecture (SETTLED after Session 3 debate)

**Hybrid approach: pre-map + FoundryIQ always-on retrieval**

```
Observables + age + context
        ↓
Step 1: Pre-map lookup (always, <1ms, zero deps)
        observable → deterministic chapter chunks
        Covers Decision Point A/B/C main criteria
        FILE: services/aegis-core/src/agents/context-grounder/vector-store/esi-chunks.json

Step 2: FoundryIQ grounded retrieval (always, topK=2)
        NOT conditional — always fires, cheap at topK=2
        Returns: closest clinical example + groundedness score + citation
        This is the Azure AI Foundry Track 2 demo story

Step 3: Deduplicate + combine chunks from Step 1 + Step 2

Step 4: Structured LLM prompt → three boolean answers ONLY
        Q1: isLifesavingIntervention (Decision Point A)
        Q2: isHighRisk (Decision Point B)
        Q3: resourceCount 0|1|2+ (Decision Point C)
        LLM reads retrieved text. CODE makes final ESI level determination.

Step 5: Code maps booleans → ESI level
        A=true → ESI 1
        B=true → ESI 2
        C=0    → ESI 5
        C=1    → ESI 4
        C=2+   → ESI 3
```

**Why always-on FoundryIQ (not conditional):**

- Conditional firing requires writing edge-case detection logic (deterministic complexity moved, not removed)
- At topK=2 on a 50-chunk fixed corpus, latency is acceptable
- Groundedness score + citation is always valuable for the agent trace
- Avoids the "when is it an edge case" architectural question entirely

**Why NOT pure pre-map for routing decisions:**
Pre-map is single-observable lookup with no concept of:

- Age-acuity interaction (same observable = different ESI for elderly vs child)
- Temporal context ("since yesterday" vs "right now")
- Cluster interaction (two ESI-4 observables can combine to ESI-2)
- Absence of expected findings

Pre-map ESI hint must NEVER be shown as confirmed routing to user.

### Pre-map safety contract

```javascript
// ONLY safe use of pre-map for routing:
if (preClass.esiHint === "1") {
  // Route to ER immediately — cost of false positive acceptable
  // Cost of false negative (missing ESI 1) is not acceptable
  return { routing: "ER", esiLevel: "1", confirmed: true, source: "pre-map" };
}
// All other cases: show preliminary UI, wait for LLM confirmation
return {
  routing: preliminaryRouting,
  esiLevel: null,
  confirmed: false,
  source: "pending"
};
```

### UI pattern for async ESI confirmation (SETTLED)

```
Immediate (pre-map, <200ms):
  Map renders with destination
  First-aid actions shown
  Token generated (LION-4821)
  ESI badge shows pulsing "Assessing..." — NOT a number
  Routing labelled "preliminary"

2-8 seconds (LLM confirmed):
  ESI badge resolves to confirmed level
  If routing changed: smooth map transition + gentle alert
  "Route updated — please go to St. Mary's ER instead"
  Doctor brief pushed to PulseOps
  Agent trace streams into PulseOps as LLM responds
```

### Agent 3 (pure code — BUILT and TESTED)

- File: services/aegis-core/src/agents/deterministic-gatekeeper/index.js
- Tests: gatekeeper.test.js — 20/20 passing
- Zero LLM. Mathematical threshold checks only.
- Thresholds: packages/clinical-protocols/risk-thresholds/thresholds.json
- Fires AFTER Agent 2, on nurse-entered vitals
- Can UPGRADE ESI level (e.g. ESI 3 → ESI 2 when SpO2 < 94%)
- NEVER downgrades

---

## PulseTriage screen flow (SETTLED — 3 screens, not 4)

**Old (wrong):** Screen 1 (who) → Screen 2 (symptoms) → Screen 3 (map) → Screen 4 (generate token)

**Correct:** Screen 1 (who) → Screen 2 (symptoms) → Screen 3 (map + token combined)

**Why:** Token is a system output triggered by route confirmation, not a user action.
Token and QR appear automatically on Screen 3 as the backend result.
QR full-screen view is a modal/expandable on Screen 3 — not a separate screen.

**Backend timing:** Token + soft reservation created server-side when "Find care now" is tapped.
By the time Screen 3 renders, LION-4821 already exists in PulseOps queue.

---

## HTTP timeout fix (SETTLED)

**Problem:** 30-second timeout kills LLM calls in local dev. Server returns 500 with no server-side error.

**Root cause:** Default HTTP timeout (Next.js 30s, nginx 60s) kills idle connections before LLM responds.

**Solutions applied:**

1. Increase timeout in Next.js API route:

```javascript
export const maxDuration = 60; // App Router
```

2. Split into two endpoints:

```
POST /api/triage/intake   → pre-map only (~50ms) → Sarah sees route immediately
POST /api/triage/ground   → FoundryIQ + LLM (~5-10s) → streams into agent trace
```

3. Use streaming for LLM call (SSE) — keeps connection alive, no timeout:

```javascript
const stream = await openai.chat.completions.create({
  ...params,
  stream: true
});
for await (const chunk of stream) {
  res.write(
    `data: ${JSON.stringify({ token: chunk.choices[0]?.delta?.content })}\n\n`
  );
}
```

**Speed philosophy:** Emergency system does NOT mean fast LLM call.
It means user is NEVER BLOCKED by the LLM call.
Pre-map gives Sarah her route in <200ms. LLM confirms/corrects asynchronously.

---

## What is DONE ✅

### Foundations

- [x] Full monorepo directory structure
- [x] Root package.json with all workspace scripts
- [x] .gitignore, .env.example (all env vars documented)

### Zod contracts (packages/zod-contracts/src/)

- [x] patient.schema.ts
- [x] observables.schema.ts — 26 observables, 3 acuity tiers
- [x] vitals.schema.ts — 6 vitals, all LOINC codes
- [x] routing.schema.ts
- [x] risk.schema.ts — 11 risk flags, 4 levels
- [x] encounter.schema.ts — 7-state FHIR state machine
- [x] doctor-brief.schema.ts
- [x] index.ts (barrel export)

### Clinical data (packages/clinical-protocols/)

- [x] risk-thresholds/thresholds.json — all vital thresholds + composite flags
- [x] esi/esi-v4-mapping.json — ESI v4 observable→ESI mapping (legacy, superseded)
- [x] esi/esi-v5-decision-tree.json — ESI v5 full decision tree JSON (Agent 2 backbone)
- [x] esi/esi-v5-scenarios.json — 18 clinical scenarios for RAG corpus
- [x] aha/aha-bls-firstaid.json — pre-validated first-aid lookup by observable

### AegisCore — Agent 2 ingestion pipeline

- [x] services/aegis-core/src/agents/context-grounder/ingest.js
      Builds: esi-chunks.json (50 chunks), esi-static-context.txt (~900 tokens),
      observable-fast-lookup.json, azure-search-documents.json
- [x] services/aegis-core/src/agents/context-grounder/retriever.js
      Mock cosine retriever (offline, no Azure needed)
      fastObservableClassify() — pre-map lookup

### AegisCore — Agent 2 context grounder

- [x] services/aegis-core/src/agents/context-grounder/index.js
      runContextGrounder() — mock mode + Azure OpenAI mode
      Three-question structured prompt
      First-aid action selector from AHA BLS lookup

### AegisCore — Agent 3 (FULLY BUILT + TESTED)

- [x] services/aegis-core/src/agents/deterministic-gatekeeper/index.js
- [x] services/aegis-core/src/agents/deterministic-gatekeeper/gatekeeper.test.js
      20/20 tests passing

### Templates

- [x] services/aegis-core/src/templates/doctor-brief.template.js

### Utilities

- [x] services/aegis-core/src/utils/token-generator.js
- [x] services/aegis-core/src/routing-engine/index.js
- [x] scripts/generate-fake-patients.js — 6 clinical scenarios

### Data

- [x] data/hospital_capacity.csv — 7 facilities
- [x] data/fake_patients.json — auto-generated

### Documentation

- [x] README.md — award-winning, full architecture, all three tracks
- [x] DEV_STATE.md — this file

---

## What is TODO 🔲

### Next priority (no sandbox needed)

- [ ] Agent 2: wire FoundryIQ when Azure credentials arrive
      Currently: mock cosine retriever
      Needed: replace retrieve() in retriever.js with Azure AI Search client
- [ ] Agent 1: build Intake Interpreter
      Input: rawText (mic/free-text from Sarah)
      Output: ObservableCode[] validated by Zod
      Mock mode: keyword matching against observable list
- [ ] services/api-gateway/src/server.js — Express app skeleton
- [ ] POST /api/triage/intake — pre-map fast path (~50ms)
- [ ] POST /api/triage/ground — FoundryIQ + LLM streaming path
- [ ] POST /api/triage/vitals — Agent 3 trigger
- [ ] POST /api/ward/confirm — FHIR Location assignment
- [ ] services/aegis-core/src/orchestration/pipeline.js — Agent 1→2→3 chain
- [ ] services/aegis-core/src/ttl-worker/index.js — 45-min expiry job
- [ ] services/realtime-sync/src/index.js — SSE event emitter
- [ ] apps/pulse-triage/ — Next.js setup + 3-screen flow
- [ ] apps/pulse-ops/ — Next.js setup + patient queue + agent trace panel
- [ ] scripts/seed.js, simulate-surge.js, reset-demo.js

### Needs sandbox (Azure / Teams credentials)

- [ ] Agent 2: Azure AI Foundry FoundryIQ grounded retrieval
      Replace mock retriever with real Azure AI Search client
      Wire groundedness score + citation into agent trace output
- [ ] Agent 1: real Azure OpenAI structured output call
- [ ] WardOps: Teams bot registration + Copilot Studio flow
- [ ] SharePoint bed ledger (Microsoft Graph API)
- [ ] Adaptive Cards posting to Teams channel
- [ ] Redis/Upstash TTL integration
- [ ] Neon PostgreSQL + Prisma schema

### Nice to have

- [ ] apps/demo-control/ — surge scenario panel
- [ ] Agent trace streaming UI in PulseOps
- [ ] docs/judges-guide/ per-track README files
- [ ] CI workflow (.github/workflows/)

---

## Key architectural decisions (DO NOT REVISIT without good reason)

1. **Observable vs Clinical split** — Sarah reports what she SEES. Vitals entered by nurses ONLY. Never mix.

2. **Agent 3 is pure code** — Zero LLM. Mathematical conditionals against thresholds.json. Main safety claim.

3. **Agent 2 uses hybrid: pre-map + FoundryIQ always-on (topK=2)**
   Pre-map: deterministic chapter chunks, <1ms
   FoundryIQ: always fires, clinical example + citation + groundedness score
   NOT conditional — conditional firing just moves complexity into detection logic

4. **Pre-map ESI hint is NEVER shown as confirmed routing**
   Exception: ESI 1 only (route to ER immediately, no LLM wait)
   All other cases: show "Assessing..." until LLM confirms

5. **Two-endpoint pattern for HTTP timeout**
   /api/triage/intake → fast path (pre-map, <200ms)
   /api/triage/ground → slow path (LLM, streaming SSE)

6. **First-aid from lookup table** — AHA BLS actions selected from aha-bls-firstaid.json by observable. NOT generated by LLM.

7. **Token format** — WORD-NNNN (e.g. LION-4821). Pronounceable, no ambiguous chars.

8. **TTL = 45 minutes** — TOKEN_TTL_SECONDS=2700. Soft reservation auto-expires.

9. **Surge threshold = 80%** — SURGE_THRESHOLD_PCT=80. WardOps card fires at surgeScore ≥ 80.

10. **FHIR state machine** — INTAKE_STARTED → ROUTING_COMPLETE → PLANNED → ARRIVED → IN_TRIAGE → COMPLETED (or EXPIRED)

11. **3-screen PulseTriage** — Screen 1 (who) → Screen 2 (symptoms) → Screen 3 (map + token). Token is automatic, not a user action.

12. **JS-heavy** — Schemas in TS, everything else JS. No compilation required to run agents.

---

## Debate log (decisions that were challenged and why they were kept)

### "Use switch-case instead of LLM for ESI classification"

**Challenger:** ChatGPT (fresh session, no context of prior recommendation)
**Response:** Switch-case cannot receive raw human language. Agent 1 converts speech → ObservableCode[], but even then ESI has contextual modifiers (age, medications, cluster combinations) that require reading the handbook. The LLM reads; the code decides. Switch-case is used for Agent 3 vitals — correctly.
**Decision kept:** Hybrid pre-map + FoundryIQ + LLM three-question approach.

### "Only fire FoundryIQ on edge cases"

**Challenger:** Initial architecture proposal in this session
**Response:** Defining "edge case" requires writing detection logic that is itself deterministic complexity. Moving the problem, not solving it. At topK=2 on 50 chunks, always-on retrieval is fast enough. Eliminates branching logic entirely.
**Decision kept:** Always fire FoundryIQ, topK=2.

### "Pre-map ESI hint safe for routing"

**Challenger:** Performance optimization argument
**Response:** Pre-map is single-observable, no age-acuity interaction, no temporal context, no cluster interaction. Can return ESI 4 when correct answer is ESI 2. Patient safety failure. Only safe for ESI 1 immediate routing.
**Decision kept:** Pre-map used only for immediate UI render. LLM confirmation required before routing is confirmed.

---

## Running what exists

```bash
# Test Agent 3 (20 tests, no deps)
node services/aegis-core/src/agents/deterministic-gatekeeper/gatekeeper.test.js

# Run ESI ingestion pipeline (builds vector store)
node services/aegis-core/src/agents/context-grounder/ingest.js

# Generate fake patients
node scripts/generate-fake-patients.js 10

# Install all workspace deps (when ready to run Next.js)
npm install
```

---

## Mock mode

Set MOCK_MODE=true in .env to bypass all external APIs.
Agent 1: keyword matching → ObservableCode[]
Agent 2: pre-map lookup only → ESI hint (no LLM call)
Agent 3: always runs (pure code, no API needed)
WardOps: static adaptive card responses
Full end-to-end demo works without any Azure credentials in mock mode.
