// patient.builder.js

import crypto from "crypto";
import { PatientFHIRType } from "@hygieiashield/zod-contracts";

export function buildPatient(input: PatientFHIRType) {
  return {
    resourceType: "Patient",

    id: crypto.randomUUID(),

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
