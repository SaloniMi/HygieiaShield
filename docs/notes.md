# Project Hygieia — Final Recommended Monorepo Structure

```txt
project-hygieia/
│
├── README.md
├── package.json
├── .gitignore
├── .env.example
│
├── apps/
│   │
│   ├── pulse-triage/
│   │   │
│   │   ├── README.md
│   │   ├── package.json
│   │   ├── jsconfig.json
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   │
│   │   ├── public/
│   │   │   ├── icons/
│   │   │   ├── audio/
│   │   │   └── illustrations/
│   │   │
│   │   └── src/
│   │       ├── app/
│   │       ├── components/
│   │       │   ├── calm-ui/
│   │       │   ├── symptom-grid/
│   │       │   ├── voice-input/
│   │       │   ├── route-map/
│   │       │   └── countdown/
│   │       │
│   │       ├── flows/
│   │       ├── hooks/
│   │       ├── lib/
│   │       ├── state/
│   │       ├── services/
│   │       ├── styles/
│   │       ├── constants/
│   │       └── utils/
│   │
│   ├── pulse-ops/
│   │   │
│   │   ├── README.md
│   │   ├── package.json
│   │   ├── jsconfig.json
│   │   ├── next.config.js
│   │   │
│   │   └── src/
│   │       ├── app/
│   │       ├── workstation/
│   │       ├── patient-queue/
│   │       ├── intake/
│   │       ├── doctor-brief/
│   │       ├── vitals/
│   │       ├── fuzzy-search/
│   │       ├── services/
│   │       ├── lib/
│   │       ├── constants/
│   │       └── utils/
│   │
│   ├── ward-ops/
│   │   │
│   │   ├── README.md
│   │   ├── package.json
│   │   ├── bot/
│   │   ├── adaptive-cards/
│   │   ├── teams-webhooks/
│   │   ├── commands/
│   │   ├── surge-monitor/
│   │   ├── capacity-ledger/
│   │   ├── services/
│   │   └── utils/
│   │
│   └── demo-control/
│       │
│       ├── README.md
│       ├── package.json
│       ├── jsconfig.json
│       │
│       └── src/
│           ├── app/
│           ├── scenario-engine/
│           ├── fake-patients/
│           ├── surge-simulator/
│           ├── timeline-control/
│           ├── websocket-control/
│           └── demo-state/
│
├── services/
│   │
│   ├── aegis-core/
│   │   │
│   │   ├── README.md
│   │   ├── package.json
│   │   │
│   │   └── src/
│   │       ├── agents/
│   │       │   │
│   │       │   ├── context-grounder/
│   │       │   ├── feature-extractor/
│   │       │   └── deterministic-gatekeeper/
│   │       │
│   │       ├── routing-engine/
│   │       ├── ttl-worker/
│   │       ├── orchestration/
│   │       ├── realtime/
│   │       ├── fhir/
│   │       ├── validators/
│   │       ├── protocols/
│   │       ├── transforms/
│   │       ├── templates/
│   │       ├── constants/
│   │       ├── services/
│   │       ├── playground/
│   │       └── utils/
│   │
│   ├── api-gateway/
│   │   │
│   │   ├── package.json
│   │   │
│   │   └── src/
│   │       ├── routes/
│   │       ├── middleware/
│   │       ├── websocket/
│   │       ├── controllers/
│   │       ├── services/
│   │       ├── auth/
│   │       ├── constants/
│   │       ├── utils/
│   │       └── server.js
│   │
│   └── realtime-sync/
│       │
│       ├── package.json
│       │
│       └── src/
│           ├── socket-server/
│           ├── event-bus/
│           ├── pubsub/
│           ├── emitters/
│           ├── listeners/
│           └── index.js
│
├── packages/
│   │
│   ├── shared-ui/
│   │   │
│   │   ├── package.json
│   │   │
│   │   └── src/
│   │       ├── buttons/
│   │       ├── cards/
│   │       ├── modals/
│   │       ├── typography/
│   │       ├── motion/
│   │       ├── loading/
│   │       ├── accessibility/
│   │       └── index.js
│   │
│   ├── shared-types/
│   │   │
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   │
│   │   └── src/
│   │       ├── triage/
│   │       ├── observables/
│   │       ├── vitals/
│   │       ├── routing/
│   │       ├── fhir/
│   │       ├── risk/
│   │       └── index.ts
│   │
│   ├── zod-contracts/
│   │   │
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   │
│   │   └── src/
│   │       ├── patient.schema.ts
│   │       ├── observables.schema.ts
│   │       ├── vitals.schema.ts
│   │       ├── routing.schema.ts
│   │       ├── encounter.schema.ts
│   │       ├── risk.schema.ts
│   │       ├── doctor-brief.schema.ts
│   │       └── index.ts
│   │
│   ├── clinical-protocols/
│   │   │
│   │   ├── package.json
│   │   │
│   │   ├── esi/
│   │   ├── aha/
│   │   ├── loinc/
│   │   ├── markdown-templates/
│   │   └── risk-thresholds/
│   │
│   └── config/
│       │
│       ├── package.json
│       │
│       ├── feature-flags/
│       ├── thresholds/
│       ├── environments/
│       └── constants/
│
├── infra/
│   │
│   ├── docker/
│   ├── azure/
│   ├── functions/
│   ├── monitoring/
│   ├── deployment/
│   └── observability/
│
├── data/
│   │
│   ├── hospital_capacity.csv
│   ├── fake_patients.json
│   ├── surge_scenarios.json
│   ├── triage_events.json
│   ├── clinical_handbook.md
│   │
│   └── protocol_tables/
│       ├── esi.json
│       ├── loinc.json
│       ├── snomed.json
│       └── risk_thresholds.json
│
├── docs/
│   │
│   ├── architecture/
│   │   ├── ecosystem-overview.md
│   │   ├── data-flow.md
│   │   ├── agent-breakdown.md
│   │   ├── safety-model.md
│   │   ├── fhir-mapping.md
│   │   └── routing-engine.md
│   │
│   ├── diagrams/
│   ├── screenshots/
│   ├── demo-script/
│   ├── pitch-deck/
│   │
│   └── judges-guide/
│       ├── track-1-pulsetriage.md
│       ├── track-2-pulseops.md
│       ├── track-3-wardops.md
│       └── full-ecosystem.md
│
└── scripts/
    ├── seed.js
    ├── simulate-surge.js
    ├── reset-demo.js
    ├── generate-fake-patients.js
    └── clear-expired-reservations.js

```
