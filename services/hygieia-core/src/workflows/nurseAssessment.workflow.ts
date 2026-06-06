// workflows/nurseAssessment.workflow.ts

import { runGatekeeper } from "../agents/deterministic-gatekeeper/index.js";
import type {
  AgeGroupType,
  ESILevelType,
  ObservablesType,
  VitalsType
} from "@hygieiashield/zod-contracts";
import { buildObservations } from "../fhir/resource-builder/observation.builder.js";

export async function runNurseAssessmentWorkflow(input: {
  patient: {
    observables: ObservablesType;
    ageGroup: AgeGroupType;
    esiLevel: ESILevelType;
    id: string;
    encounterId: string;
  };
  vitals: VitalsType;
}) {
  // Run gatekeeper
  const gatekeeperResult = await runGatekeeper({
    observables: input.patient.observables,
    ageGroup: input.patient.ageGroup,
    vitals: input.vitals,
    esiLevel: input.patient.esiLevel
  });

  console.log(gatekeeperResult);

  const observations = buildObservations({
    patientId: input.patient.id,
    encounterId: input.patient.encounterId,
    vitals: input.vitals
  });

  return {
    response: {
      id: input.patient.id,
      ...gatekeeperResult
    },
    persistence: {
      observations
    }
  };
}
