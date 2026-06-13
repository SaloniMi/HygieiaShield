// patient.builder.js

import { PatientFHIRType } from "@hygieiashield/zod-contracts";

export function buildPatient(input: PatientFHIRType) {
  return {
    resourceType: "Patient",

    id: input.patientId,

    active: true,

    identifier: [
      {
        use: "official",
        system: "https://hygieia.dev/token",
        value: input.token
      }
    ],

    name: [
      {
        use: "official",
        text: input.patientName
      }
    ],

    extension: [
      {
        url: "https://hygieia.dev/age-group",
        valueString: input.ageGroup
      }
    ]
  };
}
