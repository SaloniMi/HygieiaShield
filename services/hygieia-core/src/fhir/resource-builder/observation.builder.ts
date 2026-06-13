import crypto from "crypto";
import { VITALS_LOINC } from "@hygieiashield/clinical-protocols";
import { VitalsType } from "@hygieiashield/zod-contracts";

type BuildObservationsInput = {
  patientId: string;
  encounterId?: string;
  vitals: VitalsType;
  recordedAt?: string;
};

export function buildObservations({
  patientId,
  encounterId,
  vitals,
  recordedAt = new Date().toISOString()
}: BuildObservationsInput) {
  const observations = [];

  const subject = {
    reference: `Patient/${patientId}`
  };

  const encounter = encounterId
    ? { reference: `Encounter/${encounterId}` }
    : undefined;

  const baseObservation = () => ({
    resourceType: "Observation",
    id: crypto.randomUUID(),
    status: "final",
    subject,
    ...(encounter && { encounter }),
    effectiveDateTime: recordedAt
  });

  for (const [key, value] of Object.entries(vitals)) {
    if (value === undefined || value === null) continue;

    // BP handled separately
    if (key === "systolicBP" || key === "diastolicBP") continue;

    const meta = VITALS_LOINC[key as keyof typeof VITALS_LOINC];
    if (!meta) continue;

    if (meta.code) {
      observations.push({
        ...baseObservation(),

        category: [
          {
            coding: [
              {
                system:
                  "http://terminology.hl7.org/CodeSystem/observation-category",
                code: "vital-signs"
              }
            ]
          }
        ],

        code: {
          coding: [
            {
              system: "http://loinc.org",
              code: meta.code,
              display: meta.display
            }
          ]
        },

        valueQuantity: {
          value,
          unit: meta.unit
        }
      });

      continue;
    }

    // Custom observations (AVPU, Oxygen, Pain)
    observations.push({
      ...baseObservation(),

      code: {
        text: meta.display
      },

      ...(typeof value === "boolean"
        ? { valueBoolean: value }
        : typeof value === "number"
          ? { valueInteger: value }
          : { valueString: String(value) })
    });
  }

  // Special FHIR Blood Pressure Panel
  if (vitals.systolicBP !== undefined && vitals.diastolicBP !== undefined) {
    observations.push({
      ...baseObservation(),

      category: [
        {
          coding: [
            {
              system:
                "http://terminology.hl7.org/CodeSystem/observation-category",
              code: "vital-signs"
            }
          ]
        }
      ],

      code: {
        coding: [
          {
            system: "http://loinc.org",
            code: "85354-9",
            display: "Blood pressure panel"
          }
        ]
      },

      component: [
        {
          code: {
            coding: [
              {
                system: "http://loinc.org",
                code: "8480-6"
              }
            ]
          },
          valueQuantity: {
            value: vitals.systolicBP,
            unit: "mmHg"
          }
        },
        {
          code: {
            coding: [
              {
                system: "http://loinc.org",
                code: "8462-4"
              }
            ]
          },
          valueQuantity: {
            value: vitals.diastolicBP,
            unit: "mmHg"
          }
        }
      ]
    });
  }

  return observations;
}
