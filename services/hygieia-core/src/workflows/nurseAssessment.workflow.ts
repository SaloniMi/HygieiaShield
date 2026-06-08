// workflows/nurseAssessment.workflow.ts

import { runGatekeeper } from "../agents/deterministic-gatekeeper/index.js";
import {
  AgentContext,
  vitalsSchema,
  type AgeGroupType,
  type ESILevelType,
  type ObservablesType,
  type VitalsType
} from "@hygieiashield/zod-contracts";
import { buildObservations } from "../fhir/resource-builder/observation.builder.js";

export async function runNurseAssessmentWorkflow(
  input: {
    patient: {
      observables: ObservablesType;
      ageGroup: AgeGroupType;
      esiLevel: ESILevelType;
      id: string;
      encounterId: string;
    };
    vitals: VitalsType;
  },
  ctx: AgentContext
) {
  // Enforce the vitals are correct
  const parsed = vitalsSchema.safeParse(input.vitals);

  if (!parsed.success) {
    return {
      ok: false,
      error: {
        type: "VALIDATION_ERROR",
        issues: parsed.error.flatten()
      }
    };
  }

  // Run gatekeeper
  const gatekeeperResult = await runGatekeeper(
    {
      observables: input.patient.observables,
      ageGroup: input.patient.ageGroup,
      vitals: input.vitals,
      esiLevel: input.patient.esiLevel
    },
    ctx
  );

  const observations = buildObservations({
    patientId: input.patient.id,
    encounterId: input.patient.encounterId,
    vitals: input.vitals
  });

  return {
    ok: true,
    response: gatekeeperResult,
    persistence: {
      vitalFlags: gatekeeperResult.vitalFlags ?? [],
      observations
    }
  };
}
