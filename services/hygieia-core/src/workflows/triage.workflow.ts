// workflows/triage.workflow.ts

import { runIntakeInterpreter } from "../agents/intake-interpreter/index.js";
import { runESIEvaluator } from "../agents/esi-evaluator/index.js";
import { runGatekeeper } from "../agents/deterministic-gatekeeper/index.js";
import type {
  AgeGroupType,
  AgentContext,
  VitalsType
} from "@hygieiashield/zod-contracts";
import { decideStatusBasedOnESILevel } from "@hygieiashield/clinical-protocols";
import {
  buildFHIRBundleForPatient,
  createIdentity
} from "../fhir/bundle.builder.js";
import { determineCareRouteForPreArrival } from "../care-route-engine/pre-arrival-route/route-decider.js";

export async function runTriageWorkflow(
  input: {
    patientName: string;
    ageGroup: AgeGroupType;
    vitals?: VitalsType;
    transcript?: string;
    symptoms?: string[];
    geoLocation: {
      latitude: number;
      longitude: number;
    };
  },
  ctx: AgentContext
) {
  const identityInfo = createIdentity();
  ctx.trace = identityInfo;

  // Find observables
  const intake = await runIntakeInterpreter(input, ctx);

  // Find ESI
  const riskAssessment = await runESIEvaluator(
    {
      ...intake,
      ageGroup: input.ageGroup
    },
    ctx
  );

  // Run gatekeeper
  const gatekeeperResult = await runGatekeeper(
    {
      ...riskAssessment,
      observables: intake.observables,
      ageGroup: input.ageGroup,
      vitals: input.vitals
    },
    ctx
  );

  const statusInfo = decideStatusBasedOnESILevel(gatekeeperResult.finalESI);

  // Pre-arrival, route workflow -
  // 1. Find care type
  // 2. Find best hospital
  const routingResult = await determineCareRouteForPreArrival(
    {
      esiLevel: gatekeeperResult?.finalESI,
      userCoordinates: input?.geoLocation
    },
    ctx
  );

  const builderResult = buildFHIRBundleForPatient({
    identity: identityInfo,
    patientName: input.patientName,
    ageGroup: input.ageGroup,
    observables: intake.observables,
    esiLevel: gatekeeperResult.finalESI,
    careType: routingResult?.careType,
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
