// encounter.builder.js

import crypto from "crypto";
import { EncounterFHIRType } from "@hygieiashield/zod-contracts";

export function buildEncounter(input: EncounterFHIRType) {
  return {
    resourceType: "Encounter",

    id: crypto.randomUUID(),

    status: input.status,

    subject: {
      reference: `Patient/${input.patientId}`
    },

    identifier: [
      {
        system: "https://hygieia.dev/token",
        value: input.token
      }
    ],

    extension: [
      {
        url: "https://hygieia.dev/esi-level",
        valueString: String(input.esiLevel)
      },
      {
        url: "https://hygieia.dev/facility-id",
        valueString: input.facilityId
      },
      ...(input.unknownMentions ?? []).map((mention) => ({
        url: "https://hygieia.dev/patient-reported-note",
        valueString: mention
      }))
    ]
  };
}
