// workflows/triage.workflow.ts

import { runIntakeInterpreter } from "../agents/intake-interpreter/index.js";
import { runESIEvaluator } from "../agents/esi-evaluator/index.js";
import { runGatekeeper } from "../agents/deterministic-gatekeeper/index.js";
import type { AgeGroupType, VitalsType } from "@hygieiashield/zod-contracts";
import { runRouteWorkflow } from "./routing.workflow.js";
import { decideStatusBasedOnESILevel } from "../protocols/ESI/decision-maker/decision.maker.js";
import { buildFHIRBundleForPatient } from "../fhir/bundle.builder.js";

export async function runTriageWorkflow(input: {
  patientName: string;
  ageGroup: AgeGroupType;
  vitals?: VitalsType;
  transcript?: string;
  symptoms?: string[];
  geoLocation: {
    latitude: number;
    longitude: number;
  };
}) {
  // Find observables
  const intake = await runIntakeInterpreter(input);

  // Find ESI
  const riskAssessment = await runESIEvaluator({
    ...intake,
    ageGroup: input.ageGroup
  });

  // Run gatekeeper
  const gatekeeperResult = await runGatekeeper({
    ...riskAssessment,
    observables: intake.observables,
    ageGroup: input.ageGroup,
    vitals: input.vitals
  });

  const statusInfo = decideStatusBasedOnESILevel(gatekeeperResult.finalESI);

  const routingResult = await runRouteWorkflow({
    esiLevel: gatekeeperResult?.finalESI,
    userCoordinates: input?.geoLocation
  });

  const builderResult = buildFHIRBundleForPatient({
    patientName: input.patientName,
    ageGroup: input.ageGroup,
    observables: intake.observables,
    esiLevel: gatekeeperResult.finalESI,
    facilityId: routingResult?.recommendedFacility?.facility_id
  });

  const token = builderResult.token;

  return {
    response: {
      token,
      patientStatus: statusInfo,
      ...intake,
      ...riskAssessment,
      ...routingResult,
      ...gatekeeperResult
    },
    persistence: {
      ...builderResult
    }
  };
}
