// services/aegis-core/src/fhir/condition.builder.ts

import { randomUUID } from "crypto";
import { ObservableType } from "@hygieiashield/zod-contracts";

export function buildConditions(
  patientId: string,
  observables: ObservableType[]
) {
  return observables.map((observable) => ({
    resourceType: "Condition",

    id: randomUUID(),

    clinicalStatus: {
      text: "active"
    },

    subject: {
      reference: `Patient/${patientId}`
    },

    code: {
      coding: [
        {
          system: "https://hygieia.dev/observables",
          code: observable,
          display: observable
        }
      ],
      text: observable
    }
  }));
}
