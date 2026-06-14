# 🛡️ Project HygieiaShield

- [🛡️ Project HygieiaShield](#️-project-hygieiashield)
  - [AI-Powered Multi-Agent Emergency Triage and Care Orchestration Ecosystem](#ai-powered-multi-agent-emergency-triage-and-care-orchestration-ecosystem)
- [Vision](#vision)
- [The Problem](#the-problem)
  - [Why Existing Solutions Fall Short](#why-existing-solutions-fall-short)
- [The Solution](#the-solution)
- [The Ecosystem](#the-ecosystem)
  - [PulseTriage](#pulsetriage)
    - [Key Capabilities](#key-capabilities)
  - [PulseOps](#pulseops)
    - [Key Capabilities](#key-capabilities-1)
      - [Clinical Workstation](#clinical-workstation)
      - [Operations Command Center](#operations-command-center)
- [One Night. Four Users. One Continuous Journey.](#one-night-four-users-one-continuous-journey)
  - [1. Sammy — The Family Member](#1-sammy--the-family-member)
  - [2. Nurse Priya — The Triage Nurse of Northcare Hospital](#2-nurse-priya--the-triage-nurse-of-northcare-hospital)
  - [3. Hospital Operations Coordinator](#3-hospital-operations-coordinator)
  - [4. Dr. Anand — The Attending Doctor](#4-dr-anand--the-attending-doctor)
- [The Outcome](#the-outcome)
- [Why The Architecture Is Different](#why-the-architecture-is-different)
  - [Mistake #1](#mistake-1)
  - [Mistake #2](#mistake-2)
  - [Principle 1: Separate Observables from Clinical Metrics](#principle-1-separate-observables-from-clinical-metrics)
    - [Why This Matters](#why-this-matters)
  - [Principle 2: Multi-Agent AI Architecture](#principle-2-multi-agent-ai-architecture)
    - [Intake Interpreter Agent](#intake-interpreter-agent)
    - [ESI Calculator Agent](#esi-calculator-agent)
    - [Deterministic Gatekeeper Agent](#deterministic-gatekeeper-agent)
    - [Care-Route Engine](#care-route-engine)
    - [Doctor Brief Generator](#doctor-brief-generator)
  - [Human Decisions. Machine Assistance.](#human-decisions-machine-assistance)
  - [Architecture Diagram](#architecture-diagram)
- [Technology Stack](#technology-stack)
  - [AI \& Agent Layer](#ai--agent-layer)
  - [Backend \& Frontend](#backend--frontend)
  - [Data \& Standards](#data--standards)
  - [Cloud Infrastructure](#cloud-infrastructure)
- [Clinical Standards](#clinical-standards)
  - [Emergency Severity Index (ESI v5)](#emergency-severity-index-esi-v5)
  - [HL7 FHIR R4](#hl7-fhir-r4)
  - [LOINC](#loinc)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
    - [AI Model](#ai-model)
      - [Option 1: Local AI Models (Ollama)](#option-1-local-ai-models-ollama)
      - [Option 2: Azure AI Models (Recommended for Production)](#option-2-azure-ai-models-recommended-for-production)
    - [Database Setup](#database-setup)
  - [Installation \& Setup](#installation--setup)
    - [1. Clone and Install Dependencies](#1-clone-and-install-dependencies)
    - [2. Configure Environment Variables](#2-configure-environment-variables)
      - [API Gateway](#api-gateway)
      - [PulseTriage App](#pulsetriage-app)
      - [PulseOps App](#pulseops-app)
    - [3. Start MongoDB](#3-start-mongodb)
    - [4. Start Services](#4-start-services)
    - [5. Access Applications](#5-access-applications)

### AI-Powered Multi-Agent Emergency Triage and Care Orchestration Ecosystem

> **From panic to preparedness.**
> **From uncertainty to coordination.**
> **From fragmented information to evidence-grounded decisions.**
>
> HygieiaShield is an AI-powered emergency intelligence ecosystem that transforms fragmented symptom reports into coordinated, clinically grounded care pathways.
>
> Aiming to transform emergency care from a reactive process into a coordinated, pre-arrival intelligence system
>
> By connecting patients, clinicians, and hospital operations before arrival, HygieiaShield enables hospitals to prepare for emergencies before the patient walks through the door.
>
> From first symptom to definitive care, every stakeholder operates from the same evolving picture of the patient.

---

# Vision

The future of emergency care is not faster hospitals.

**It is hospitals that are already prepared before the patient arrives.**

---

# The Problem

During local medical emergencies or public health surges, healthcare systems often fail at the intersection of **human panic** and **systemic data friction**.

When an emergency occurs:

- Citizens rush to the nearest Emergency Room regardless of severity.
- Mild and moderate cases overwhelm already strained facilities.
- Critical patients arrive unaware of long wait times and capacity constraints.
- Hospital staff operate across fragmented systems with limited visibility into incoming demand.
- Administrative bottlenecks slow triage and treatment during the moments that matter most.

The result is not necessarily a shortage of care.

It is a **failure of information flow** at exactly the moment people are least capable of handling friction.

### Why Existing Solutions Fall Short

Most healthcare software unintentionally increases friction by requiring:

- Account creation
- Lengthy form completion
- Structured medical knowledge from untrained, panicked civilians

Many emerging solutions also rely on unconstrained AI outputs, introducing **hallucination risks into safety-critical workflows** where reliability is non-negotiable.

---

# The Solution

HygieiaShield is an **AI-powered, multi-agent emergency triage and care orchestration ecosystem** that transforms unstructured symptom reports into clinically grounded emergency workflows—connecting a family's living room directly to the right clinical facility before they ever leave home.

The platform is designed to:

- 🎙️ Capture symptoms through frictionless voice-first and tap-based intake
- 🤖 Transform unstructured reports into structured clinical path by employing a **multi-agent** architecture
- 📖 Determine patient acuity using grounded ESI v5 reasoning
- 🏥 Intelligently route patients to the right facility—not simply the nearest one
- 👁️ Give hospitals visibility before patients arrive
- 🔄 Enable automated clinician re-triage workflows
- 📋 Generate AI-assisted physician handoff clinical briefs in seconds
- 🔒 Enforce deterministic clinical safety safeguards
- 📈 Detect surges and support operational coordination
- 🔄 Maintain HL7 FHIR-aligned care workflows

Unlike traditional healthcare applications that rely on a single AI model, HygieiaShield employs a **specialized multi-agent architecture** where each agent performs a narrowly scoped clinical or operational responsibility under deterministic safety supervision.

---

# The Ecosystem

![Project Ecosystem](/docs/image1.png)

## PulseTriage

A **public-facing anti-anxiety emergency intake experience** designed for accessibility, speed, and zero-friction reporting.

### Key Capabilities

- No account creation
- No forms
- No medical expertise required, simply describe what you see
- Voice-first symptom reporting
- Structured symptom capture from natural language
- Pre-arrival acuity assessment
- Intelligent care routing

---

## PulseOps

A clinical operations platform designed for hospital clinicians, triage nurses and hospital coordinators.

### Key Capabilities

#### Clinical Workstation

- Patient recall via reservation token
- Pre-arrival encounter visibility for better care
- Vital-sign capture
- Automated re-triage AI workflows to re-determine patient's acuity based on clinical measurements
- AI-assisted physician briefing

#### Operations Command Center

- Real-time capacity monitoring
- Surge detection
- Facility routing controls
- Operational visibility across incoming demand

---

# One Night. Four Users. One Continuous Journey.

## 1. Sammy — The Family Member

Sammy's father Jim experiences acute chest pain.

Sammy opens **PulseTriage**.

- Two symptom selections
- Four seconds of voice input, "Oh my god, my father is having chest pain"
- No huge, multi-step forms
- No login

The system determines the likely acuity level to be High Risk (ESI Level 2) and routes Jim to **Northcare Hospital** instead of the overcrowded **St. Mary's Emergency Department**.

A reservation token is generated:

`RAVEN-4399-S`

Before Jim leaves home, the hospital already knows he is coming.

---

## 2. Nurse Priya — The Triage Nurse of Northcare Hospital

Upon arrival, Nurse Priya retrieves the encounter using the reservation token.

She immediately sees:

- Pre-arrival symptom observations ACUTE_CHEST_PAIN, ageGroup: ADULT (12-64 years)
- Structured intake information

She records Jim's vital signs.

A re-triage workflow executes automatically.

Within seconds:

- Acuity is recalculated to be ESI Level 1 (Critical) due to the elevated heartRate indicating SEVERE TACHYCARDIA
- Safety thresholds are evaluated
- Critical abnormalities are flagged by the Deterministic Gatekeeper

No re-entry.
No repeated questioning.
No lost information.

---

## 3. Hospital Operations Coordinator

As patient volume increases:

- Surge scores update in real time
- Capacity trends become visible
- Routing controls can be adjusted proactively

No phone calls.

No spreadsheets.

No guesswork.

---

## 4. Dr. Anand — The Attending Doctor

Before entering the ICU ward, Dr. Anand receives a structured AI generated physician brief containing:

- Reported symptoms
- Recorded vital signs
- Clinical observations
- Triage outputs
- Safety alerts
- Recommended measures

The summary takes less than ten seconds to review.

Crucial time is saved before the first clinical interaction begins.

---

# The Outcome

Two products.

One continuous transaction.

A journey that begins in a living room and ends in the right clinical hands—with:

- A transition from uncertainty to preparedness
- Grounded clinical reasoning with reduced LLM hallucinations
- Minimal intake friction
- Coordinated operational awareness
- Traceable decision-making
- Complete auditability

---

# Why The Architecture Is Different

Most healthcare AI systems make one of two mistakes:

### Mistake #1

They add friction during the moment users are least capable of handling it.

### Mistake #2

They place unconstrained AI inside safety-critical decision paths where hallucinations are unacceptable.

**HygieiaShield does neither.**

---

## Principle 1: Separate Observables from Clinical Metrics

Panicked patients and families report what they can reliably observe.

Examples:

- Chest pain
- Difficulty breathing
- Bluish lips
- Confusion
- Dizziness

They are **never asked** to provide measurements they cannot accurately know, such as:

- Blood pressure
- Oxygen saturation
- Heart rate

Clinical metrics are collected only by trained medical professionals using appropriate equipment.

#### Why This Matters

By separating human observations from clinician-measured vitals, HygieiaShield:

- Keeps emergency intake simple enough for panicked family members
- Prevents inaccurate self-reported medical measurements from entering the system
- Preserves the integrity of downstream triage decisions
- Ensures clinical assessments are based on appropriately collected data

---

## Principle 2: Multi-Agent AI Architecture

![Project Agents](/docs/image2.png)

Each agent performs a narrowly defined role.

#### [Intake Interpreter Agent](./services/hygieia-core/src/agents/intake-interpreter/)

**Model:** Azure OpenAI Model GPT-4.1-mini

**Purpose:**

- Converts natural language into structured clinical observables and captures any unmapped patient symptoms which might be beneficial for triaging and recording
- Handles noisy, emotional, unstructured user input

**Example:**

**Input**

> "Oh my god, my father is having severe chest pain and is sweating heavily."

Age Group: ADULT (12–64 years)

**Output**

```yaml
observables:
  - ACUTE_CHEST_PAIN
unknownMentions:
  - "sweating heavily"
```

---

### [ESI Calculator Agent](./services/hygieia-core/src/agents/esi-evaluator/)

**Model:** Azure OpenAI Model GPT-5-mini

**Purpose:**

- The ESI Calculator transforms observations and vitals into a grounded triage assessment using ESI v5 guidance retrieved through Azure AI Foundry.
- Determines key triage indicators, including:
  - Need for immediate life-saving intervention
  - Presence of high-risk conditions
  - Predicted resource utilization
  - ESI acuity level (1–5)
- Uses Azure AI Foundry's grounded retrieval pipeline to reason against the ESI v5 handbook rather than relying on unconstrained model inference
- Produces citations and groundedness evidence supporting every acuity assessment

**Example:**

**Input**

```yaml
observables:
  - ACUTE_CHEST_PAIN
unknownMentions:
  - "sweating heavily"
ageGroup: ADULT
```

**Output**

```yaml
lifeSavingInterventionNeeded: false
highRisk: true
predictedNumberOfResources: 3
esiLevel: 2
```

---

### [Deterministic Gatekeeper Agent](./services/hygieia-core/src/agents/deterministic-gatekeeper/)

**Model:** None (Pure Deterministic Logic)

**Purpose:**

- Acts as the **final safety authority** within the triage pipeline
- Validates all AI-generated outputs against predefined clinical thresholds and safety rules
- Evaluates clinician-recorded vital signs using deterministic mathematical logic
- Detects critical conditions that require escalation regardless of AI recommendations
- Prevents unsafe routing or acuity assignments caused by model error, incomplete information, or hallucination

Unlike the AI agents, the Deterministic Gatekeeper does not interpret, infer, or generate content.

It applies fixed clinical rules that produce identical outputs for identical inputs every time.

If an AI-generated assessment conflicts with a deterministic safety rule, the Gatekeeper overrides the AI output and enforces the safer clinical pathway.

**Example:**

**Input**

```yaml
esiLevel: 2
highRisk: true
vitals:
  heartRate: 154
  spo2: 92
```

**Output**

```yaml
overrideEsiLevel: 1
riskFlags:
  - SEVERE_TACHYCARDIA
override: true
```

**In HygieiaShield, AI recommends. The Gatekeeper decides.**

---

### [Care-Route Engine](./services/hygieia-core/src/care-route-engine/)

**Model:** None (Pure Deterministic Logic)

**Purpose:**

- Routes patients to the right facility—not simply the nearest one
- Combines patient acuity, capacity, and operational status to determine the optimal destination
- Dynamically balances demand across healthcare facilities during local surges
- Manages the complete reservation lifecycle from intake to arrival
- Powers hospital-level routing controls and surge-response workflows

The Care-Route Engine serves as the operational brain of HygieiaShield, transforming isolated hospitals into a coordinated emergency care network.

**Example:**

**Input**

```yaml
esiLevel: 1
```

**Output**

```yaml
careType: EMERGENCY
facility: Northcare Hospital
reservationToken: RAVEN-4399-S
estimatedWaitTime: 3m
```

---

### [Doctor Brief Generator](./services/hygieia-core/src/agents/doctor-brief-generator/)

**Model:** Azure OpenAI GPT-4.1-mini

**Purpose:**

- Produces a structured physician-ready brief from pre-arrival observations, bedside vitals, triage assessments, and safety alerts
- Surfaces the most clinically relevant information first, reducing information overload during high-pressure situations
- Provides rapid situational awareness before the physician enters the room
- Reduces administrative review time and unnecessary back-and-forth between care teams
- Helps clinicians focus on decision-making rather than information gathering

The Doctor Brief Generator acts as the final intelligence layer in the patient journey—transforming fragmented intake and triage data into an actionable clinical narrative within seconds.

**Example:**

**Input**

```yaml
esiLevel: 1
observables:
  - ACUTE_CHEST_PAIN
unknownMentions:
  - "sweating heavily"
ageGroup: ADULT
vitals:
  heartRate: 154
  spo2: 92
```

**Output**

```yaml
chiefComplaint: Adult patient with ischemic chest pain, severe tachycardia, and severe pain requiring immediate attention.
riskFlags:
  - Severe Tachycardia
clinicalSummary: >
  Adult patient presenting with acute chest pain,
  diaphoresis, and severe tachycardia. Immediate
  physician assessment recommended.
protocolMatch: Ischemic chest pain accompanied by critical vital sign abnormalities.
recommendedActions:
  - Cardiac evaluation
  - Continuous monitoring
  - Urgent physician review
  - 12-lead ECG Monitoring ...
confidence: HIGH - Multiple high-risk clinical indicators including chest pain, severe sweating, severe pain, tachycardia are present.
```

---

## Human Decisions. Machine Assistance.

AI is allowed to:

- Extract information
- Organize information
- Ground information against published standards

AI is **not** allowed to:

- Override vital-sign thresholds
- Assign deterministic risk flags
- Execute operational capacity controls
- Bypass safety rules

Those responsibilities belong to deterministic systems that produce identical outputs for identical inputs—every time.

---

## Architecture Diagram

![Project Screenshot](/docs/HygieiaShieldArch.png)

---

# Technology Stack

### AI & Agent Layer

- Azure OpenAI GPT-4.1-mini — Intake Interpreter Agent
- Azure OpenAI GPT-5-mini — ESI Calculator Agent
- Azure AI Foundry Knowledge & Retrieval — Grounded ESI v5 reasoning

### Backend & Frontend

- Next.js 15
- TypeScript
- Node.js
- RESTful APIs
- Zod — Runtime schema validation and type-safe agent contracts

### Data & Standards

- MongoDB

### Cloud Infrastructure

- Azure AI Foundry
- Azure OpenAI Service

---

# Clinical Standards

This system is built on real-world emergency medicine standards.

### Emergency Severity Index (ESI v5)

- Industry-standard emergency triage framework used across modern emergency departments
- Serves as the triage foundation for acuity assessment

### HL7 FHIR R4

- All encounter transitions map to valid FHIR resources
- Standards-compliant patient state management

### LOINC

Standardized coding for clinical measurements, including:

- SpO₂ — 59408-5
- Heart Rate — 8867-4
- Blood Pressure — 8480-6

---

# Getting Started

## Prerequisites

### AI Model

Before setting up HygieiaShield, you'll need to choose your AI model deployment strategy:

#### Option 1: Local AI Models (Ollama)

If you want to run AI models locally on your machine:

1. **Install Ollama**
   - Download from [ollama.ai](https://ollama.ai)
   - Follow the installation guide for your operating system (Windows, macOS, or Linux)

2. **Pull Required Models**

   ```bash
   ollama pull qwen3:8b
   ```

3. **Verify Ollama is Running**
   - Ollama typically runs on `http://localhost:11434`
   - You can verify by accessing the API endpoint

#### Option 2: Azure AI Models (Recommended for Production)

If you want to use Azure's enterprise-grade models:

1. **Set Up Azure Foundry**
   - Create an [Azure AI Foundry project](https://ai.azure.com)
   - Deploy Azure OpenAI models (GPT-4.1-mini, GPT-5-mini) in your Foundry project
   - Note your API keys and endpoints

2. **Enable Grounded Retrieval (FoundryIQ)**
   - The ESI v5 Handbook (located in `packages/clinical-protocols/src/ESI/`) is used for grounded retrieval
   - This ensures all triage decisions are grounded against published clinical standards, reducing hallucinations
   - Configure your Foundry project to use the clinical protocols knowledge base

### Database Setup

1. Create a free MongoDB Atlas account.
2. Create a cluster.
3. Create a database user.
4. Allow your IP address.
5. Copy the connection string.

## Installation & Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/SaloniMi/HygieiaShield.git
cd HygieiaShield

# Install and build core packages in two commands
npm install
npm run build:core-packages
```

### 2. Configure Environment Variables

Each application requires environment configuration. Create `.env` files in the respective folders:

#### API Gateway

**File:** `services/api-gateway/.env`

```env
# Which provider to use

LLM_PROVIDER=<azure|ollama>
HANDBOOK_RETRIEVER_PROVIDER=<foundry-iq|local>

# Local model

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen3:8b

# Azure

AZURE_AI_FOUNDRY_ENDPOINT=
AZURE_AI_FOUNDRY_KEY=
AZURE_OPENAI_API_VERSION=2025-04-01-preview

AZURE_GPT41_MINI_DEPLOYMENT=gpt-4.1-mini

AZURE_SEARCH_ENDPOINT=
AZURE_SEARCH_QUERY_KEY=
HANDBOOK_SEARCH_INDEX=

ESI_CALCULATOR_MODEL=gpt-5-mini

ESI_HANDBOOK_PATH=../../packages/clinical-protocols/src/ESI/Handbook.md

MONGO_DB_NAME=
MONGO_URI=

FACILITY_ID=FAC-05
FACILITY_NAME=Northcare Hospital
```

#### PulseTriage App

**File:** `apps/pulse-triage/.env.local`

```env
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:4000
```

#### PulseOps App

**File:** `apps/pulse-ops/.env.local`

```env
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:4000

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
```

### 3. Start MongoDB

Populate the database with demo facilities and users:

```bash
npm run seed
```

### 4. Start Services

```bash
# Terminal 1: Start API Gateway
cd services/api-gateway
npm run dev

# Terminal 2: Start PulseOps App
cd apps/pulse-ops
npm run dev

# Terminal 3: Start PulseTriage App
cd apps/pulse-triage
npm run dev
```

### 5. Access Applications

- **PulseTriage** (Public Emergency Intake): http://localhost:3001
- **PulseOps** (Clinical Operations): http://localhost:3000
