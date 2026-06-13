import { VitalFlag } from "@hygieiashield/zod-contracts";
import { VITALS_LOINC } from "../loinc/loinc-directory.js";

type Vitals = Record<string, unknown>;

export function formatVitalsForClinician(vitals: Vitals): string {
  const parts: string[] = [];

  for (const [key, value] of Object.entries(vitals)) {
    if (value == null) continue;

    if (key === "diastolicBP") continue;

    if (key === "systolicBP") {
      parts.push(
        `BP ${vitals.systolicBP ?? "-"}/${vitals.diastolicBP ?? "-"} mmHg`
      );
      continue;
    }

    const config = VITALS_LOINC[key as keyof typeof VITALS_LOINC];

    if (!config) continue;

    switch (config.inputType) {
      case "boolean":
        parts.push(`${config.display} ${value ? "Yes" : "No"}`);
        break;

      case "select":
        parts.push(`${config.display}: ${value}`);
        break;

      default:
        parts.push(`${config.display} ${value}${config.unit ?? ""}`);
    }
  }

  return parts.join(" · ");
}

function humanizeFlag(flag: string): string {
  return flag
    .toLowerCase()
    .split("_")
    .map((word, i) =>
      i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word
    )
    .join(" ");
}

export function formatVitalFlagForClinician(flag: VitalFlag): string {
  const finding = humanizeFlag(flag.flag);

  // Numeric vital
  if (flag.threshold) {
    if (flag.threshold) {
      return `${flag.vitalLabel}: ${flag.value}${
        flag.unit ? ` ${flag.unit}` : ""
      } (${flag.threshold.operator}${flag.threshold.value}${
        flag.unit ? ` ${flag.unit}` : ""
      }) — ${finding}`;
    }
  }

  // Boolean vital
  if (typeof flag.value === "boolean") {
    return `${flag.vitalLabel}: ${flag.value ? "Yes" : "No"}. ${finding}.`;
  }

  // Enum vital
  return `${flag.vitalLabel}: ${flag.value}. ${finding}.`;
}

export function formatVitalFlagsForClinician(flags: VitalFlag[]): string[] {
  return flags.map(formatVitalFlagForClinician);
}
