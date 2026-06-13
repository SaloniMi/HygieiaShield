import { VitalRule } from "../engines/vital.evaluator.js";

export const VITAL_RULES = {
  spo2: {
    type: "numeric",
    unit: "%",
    thresholds: [
      {
        level: "CRITICAL",
        operator: "<",
        value: 90,
        flag: "SEVERE_HYPOXEMIA"
      },
      {
        level: "HIGH",
        operator: "<",
        value: 92,
        flag: "HYPOXEMIA_RISK"
      }
    ]
  },

  heartRate: {
    type: "numeric",
    unit: "bpm",
    thresholds: [
      {
        level: "HIGH",
        operator: ">",
        value: 100,
        flag: "TACHYCARDIA"
      },
      {
        level: "CRITICAL",
        operator: ">",
        value: 140,
        flag: "SEVERE_TACHYCARDIA"
      }
    ]
  },

  respiratoryRate: {
    type: "numeric",
    unit: "breaths/min",
    thresholds: [
      {
        level: "HIGH",
        operator: ">",
        value: 20,
        flag: "TACHYPNEA"
      },
      {
        level: "CRITICAL",
        operator: ">",
        value: 40,
        flag: "SEVERE_RESPIRATORY_DISTRESS"
      }
    ]
  },

  systolicBP: {
    type: "numeric",
    unit: "mmHg",
    thresholds: [
      {
        level: "CRITICAL",
        operator: "<",
        value: 80,
        flag: "PROFOUND_HYPOTENSION"
      },
      {
        level: "HIGH",
        operator: "<",
        value: 90,
        flag: "HYPOTENSION"
      }
    ]
  },

  diastolicBP: {
    type: "numeric",
    unit: "mmHg",
    thresholds: [
      {
        level: "CRITICAL",
        operator: "<",
        value: 50,
        flag: "PROFOUND_HYPOTENSION"
      },
      {
        level: "HIGH",
        operator: "<",
        value: 60,
        flag: "LOW_DIASTOLIC_PRESSURE"
      }
    ]
  },

  temperatureC: {
    type: "numeric",
    unit: "°C",
    thresholds: [
      {
        level: "HIGH",
        operator: ">",
        value: 38,
        flag: "FEVER"
      },
      {
        level: "CRITICAL",
        operator: ">",
        value: 40,
        flag: "HYPERPYREXIA"
      },
      {
        level: "CRITICAL",
        operator: "<",
        value: 35,
        flag: "HYPOTHERMIA"
      }
    ]
  },

  painScore: {
    type: "numeric",
    unit: "scale",
    thresholds: [
      {
        level: "HIGH",
        operator: ">=",
        value: 7,
        flag: "SEVERE_PAIN"
      }
    ]
  },

  levelOfConsciousness: {
    type: "enum",
    values: {
      UNRESPONSIVE: {
        level: "CRITICAL",
        flag: "UNRESPONSIVE"
      },
      PAINFUL: {
        level: "CRITICAL",
        flag: "SEVERE_CONSCIOUSNESS_IMPAIRMENT"
      },
      VERBAL: {
        level: "HIGH",
        flag: "ALTERED_CONSCIOUSNESS"
      },
      ALERT: {
        level: "NORMAL",
        flag: null
      }
    }
  },

  isSupplementalOxygen: {
    type: "boolean",
    rules: {
      true: {
        level: "NORMAL",
        flag: "ON_OXYGEN_SUPPORT"
      }
    }
  }
} satisfies Record<string, VitalRule>;
