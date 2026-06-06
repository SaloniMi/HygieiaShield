import { VITALS_LOINC } from "../loinc/loinc-directory.js";

type Vitals = Record<string, unknown>;

export function formatVitalsForClinician(vitals: Vitals): string {
  const parts: string[] = [];
  const directory = VITALS_LOINC;

  const getUnit = (key: string) =>
    directory[key as keyof typeof directory]?.unit ?? "";

  // SpO2
  if (vitals.spo2 != null) {
    parts.push(`SpO₂ ${vitals.spo2}${getUnit("spo2")}`);
  }

  // Heart rate
  if (vitals.heartRate != null) {
    parts.push(`HR ${vitals.heartRate} ${getUnit("heartRate")}`);
  }

  // Respiratory rate
  if (vitals.respiratoryRate != null) {
    parts.push(`RR ${vitals.respiratoryRate} ${getUnit("respiratoryRate")}`);
  }

  // Blood pressure (grouped)
  if (vitals.systolicBP != null || vitals.diastolicBP != null) {
    const sys = vitals.systolicBP ?? "-";
    const dia = vitals.diastolicBP ?? "-";
    parts.push(`BP ${sys}/${dia} mmHg`);
  }

  // Temperature
  if (vitals.temperatureC != null) {
    parts.push(`Temp ${vitals.temperatureC}${getUnit("temperatureC")}`);
  }

  // Pain score
  if (vitals.painScore != null) {
    parts.push(`Pain ${vitals.painScore}/10`);
  }

  // Oxygen support (boolean)
  if (vitals.isSupplementalOxygen != null) {
    parts.push(`O₂ support ${vitals.isSupplementalOxygen ? "Yes" : "No"}`);
  }

  // Consciousness
  if (vitals.levelOfConsciousness != null) {
    parts.push(`LOC ${vitals.levelOfConsciousness}`);
  }

  return parts.join(" · ");
}
