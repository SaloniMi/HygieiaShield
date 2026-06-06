# PulseOps Dashboard

The PulseOps dashboard is a real-time ED triage coordination interface built with Next.js, React, TypeScript, and Tailwind CSS.

## Architecture

The dashboard is located at `/apps/pulse-ops/src/app/pulseops/page.js` and follows a modular component-based architecture.

### Directory Structure

```
src/
├── app/
│   ├── pulseops/
│   │   └── page.js                    # Main dashboard page
│   ├── layout.js
│   ├── page.js
│   └── globals.css
├── components/
│   ├── PatientQueue.js               # Left sidebar - patient queue
│   ├── PatientQueueItem.js           # Individual patient queue item
│   ├── PatientBrief.js               # Main panel - tabbed interface
│   ├── ClinicalBriefTab.js           # Clinical brief tab
│   ├── VitalsEntryTab.js             # Vitals data entry tab
│   ├── AgentTraceTab.js              # Agent execution trace tab
│   ├── TimelineTab.js                # State transition timeline
│   └── DashboardFooter.js            # Footer with action buttons
├── constants/
│   ├── esi-severity.js               # ESI severity levels & colors
│   └── loinc-codes.js                # LOINC codes for vitals
├── lib/
│   ├── mock-data.js                  # Mock patient & clinical data
│   └── fuzzy-search.js               # Fuzzy search utility
└── services/
    └── (API calls will go here)
```

## Components

### PatientQueue (260px Left Sidebar)

- Displays patient queue sorted by ESI severity (Level 1-5)
- Shows severity indicator dots (red/amber/green)
- Includes patient name, chief complaint, token ID, and ETA
- Search input with fuzzy matching for name/token lookup
- Click to select patient

**Props:**

- `patients`: Array of patient objects
- `selectedPatientId`: Currently selected patient ID
- `onSelectPatient`: Callback when patient is selected

### PatientBrief (Main Content Panel)

Tabbed interface showing:

#### Tab 1: Clinical Brief (Read-only)

- Pre-arrival observables (purple tags)
- ESI classification badge
- Agent 3 risk flags (red box for critical alerts)
- Chief complaint (4-line doctor brief)
- Vitals summary
- Recommended actions (numbered list)
- Protocol matching info
- SNOMED codes

#### Tab 2: Vitals Entry

- 4 input fields: SpO₂, Heart Rate, Blood Pressure, Temperature
- LOINC codes displayed for each field
- "Run Agent 3 gatekeeper" button
- Posts to `/api/triage/vitals`

#### Tab 3: Agent Trace

- Monospace terminal-style output
- Color-coded log lines:
  - Blue: Agent info
  - Green: Success/PASS
  - Amber: Warning/FLAG
  - Red: Critical/ALERT

#### Tab 4: Timeline

- Left-bordered vertical timeline
- Color-coded event types:
  - Blue: Admission
  - Green: Clinical
  - Amber: Decision
  - Red: Routing
- Timestamps and event descriptions

### DashboardFooter

- "Acknowledge & Proceed" button (green)
- "Refer to specialist" button
- HygieiaShield verified stamp showing "3 agents"

## Constants

### ESI Severity (src/constants/esi-severity.js)

- ESI Levels 1-5 with color codes
- Severity dots for queue indicators

### LOINC Codes (src/constants/loinc-codes.js)

- Vitals mappings with LOINC codes
- SpO₂: 59408-5
- Heart Rate: 8867-4
- Systolic BP: 8480-6
- Diastolic BP: 8462-4
- Temperature: 8310-5

## Data Flow

1. **Queue Selection**: User clicks patient in left sidebar
2. **Clinical Display**: Patient brief loads with pre-calculated data
3. **Vitals Entry**: Nurse enters measurements in tab 2
4. **Agent Execution**: POST to `/api/triage/vitals` runs Agent 3
5. **Trace Output**: Results displayed in Agent trace tab
6. **Acknowledgment**: Final routing decision via "Acknowledge & Proceed"

## Mock Data

Mock data is provided in `src/lib/mock-data.js`:

- `MOCK_PATIENTS`: Array of 3 sample patients
- `MOCK_PATIENT_BRIEF`: Detailed clinical record
- `MOCK_AGENT_TRACE`: Sample execution log
- `MOCK_TIMELINE`: State transition events

## Styling

- **Framework**: Tailwind CSS v4
- **Color System**:
  - Primary (Blue): #185FA5, #0369a1
  - Success (Green): #10b981, #059669
  - Warning (Amber): #f59e0b
  - Critical (Red): #dc2626, #ef4444
- **Layout**: Flexbox for main layout, Grid for forms
- **Typography**: Geist font family (set in layout.js)

## API Endpoints

### POST /api/triage/vitals

Executes Agent 3 gatekeeper logic on nurse-entered vitals.

**Request:**

```json
{
  "triageId": "LION-4821",
  "vitals": {
    "spo2": 91,
    "heartRate": 112,
    "systolicBP": 148,
    "diastolicBP": 94,
    "temperature": 98.8
  }
}
```

**Response:**

```json
{
  "status": "success",
  "flags": [...],
  "recommendations": [...],
  "routing": "ER"
}
```

## Future Enhancements

1. **Real Patient Data**: Replace mock data with API integration
2. **WebSocket Updates**: Real-time queue updates
3. **Persistent Storage**: Save acknowledged patients
4. **Advanced Filtering**: Sort by time, acuity, assigned location
5. **Bulk Operations**: Multi-select for mass routing
6. **Print/Export**: Generate clinical briefs for handoff

## Usage

### Run Development Server

```bash
npm run dev
# Navigate to http://localhost:3000/pulseops
```

### Build for Production

```bash
npm run build
npm start
```

## Notes

- All components are client-side (`'use client'`) for interactivity
- Matches Zod contract schemas from `packages/zod-contracts`
- Compatible with HygieiaCore Agent 3 pipeline
- No external UI library dependencies (pure Tailwind CSS + React)
