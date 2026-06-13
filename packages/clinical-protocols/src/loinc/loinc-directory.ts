export const VITALS_LOINC = {
  spo2: {
    code: "59408-5",
    display: "SpO₂",
    unit: "%",
    inputType: "number",
    required: true,
    ui: {
      placeholder: "e.g. 91",
      step: 1
    }
  },

  heartRate: {
    code: "8867-4",
    display: "Heart rate",
    unit: "bpm",
    required: true,
    inputType: "number",
    ui: {
      placeholder: "e.g. 112",
      step: 1
    }
  },

  respiratoryRate: {
    code: "9279-1",
    display: "Respiratory rate",
    unit: "breaths/min",
    required: true,
    inputType: "number",
    ui: {
      placeholder: "e.g. 18",
      step: 1
    }
  },

  systolicBP: {
    required: true,
    code: "8480-6",
    display: "Systolic blood pressure",
    unit: "mmHg",
    inputType: "number",
    ui: {
      placeholder: "e.g. 120",
      step: 1
    }
  },

  diastolicBP: {
    required: true,
    code: "8462-4",
    display: "Diastolic blood pressure",
    unit: "mmHg",
    inputType: "number",
    ui: {
      placeholder: "e.g. 80",
      step: 1
    }
  },

  temperatureC: {
    required: false,
    code: "8310-5",
    display: "Body temperature",
    unit: "°C",
    inputType: "number",
    ui: {
      placeholder: "e.g. 36.8",
      step: 0.1
    }
  },

  isSupplementalOxygen: {
    required: false,
    code: null,
    unit: null,
    display: "Supplemental oxygen",
    inputType: "boolean",
    ui: {
      type: "switch"
    }
  },

  levelOfConsciousness: {
    code: null,
    unit: null,
    required: true,
    display: "Level of consciousness (AVPU)",
    inputType: "select",
    ui: {
      options: ["ALERT", "VERBAL", "PAINFUL", "UNRESPONSIVE"]
    }
  },

  painScore: {
    code: null,
    unit: null,
    required: false,
    display: "Pain score",
    inputType: "number",
    ui: {
      placeholder: "0-10",
      min: 0,
      max: 10,
      step: 1
    }
  }
} as const;
