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
import { determineCareRouteForPostArrival } from "../care-route-engine/post-arrival-route/route-decider.js";
import { runESIEvaluator } from "../agents/esi-evaluator/esi-calculator-agent.js";

export async function runNurseAssessmentWorkflow(
  input: {
    patient: {
      observables: ObservablesType;
      ageGroup: AgeGroupType;
      unknownMentions: string[];
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

  // Find ESI
  const riskAssessment = await runESIEvaluator(
    {
      observables: input.patient.observables ?? [],
      unknownMentions: input.patient.unknownMentions ?? [],
      ageGroup: input.patient.ageGroup
    },
    ctx
  );

  // Run gatekeeper
  const gatekeeperResult = await runGatekeeper(
    {
      observables: input.patient.observables,
      ageGroup: input.patient.ageGroup,
      vitals: input.vitals,
      esiLevel: riskAssessment.esiLevel
    },
    ctx
  );

  const observations = buildObservations({
    patientId: input.patient.id,
    encounterId: input.patient.encounterId,
    vitals: input.vitals
  });

  // Post-arrival, route workflow -
  // 1. Find care type
  // 2. Find ward type
  const routeResult = determineCareRouteForPostArrival(
    {
      esiLevel: gatekeeperResult.finalESI,
      vitalFlags: gatekeeperResult.vitalFlags ?? []
    },
    ctx
  );

  return {
    ok: true,
    response: {
      ...gatekeeperResult,
      ...routeResult
    },
    persistence: {
      vitalFlags: gatekeeperResult.vitalFlags ?? [],
      observations
    }
  };
}
