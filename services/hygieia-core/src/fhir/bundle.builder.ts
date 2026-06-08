import {
  ObservablesType,
  AgeGroupType,
  ESILevelType
} from "@hygieiashield/zod-contracts";
import { generateToken } from "../utils/human-token-generator.js";
import { buildConditions } from "./resource-builder/condition.builder.js";
import { buildEncounter } from "./resource-builder/encounter.builder.js";
import { buildPatient } from "./resource-builder/patient.builder.js";
import { randomUUID } from "crypto";

export function createIdentity() {
  return {
    patientId: randomUUID(),
    encounterId: randomUUID(),
    token: generateToken()
  };
}

export function buildFHIRBundleForPatient(input: {
  identity: {
    token: string;
    patientId: string;
    encounterId: string;
  };
  patientName: string;
  ageGroup: AgeGroupType;
  observables: ObservablesType;
  unknownMentions?: string[];
  esiLevel: ESILevelType;
  facilityId?: string;
}) {
  const { token, patientId, encounterId } = input.identity;

  const patient = buildPatient({
    token,
    patientId,
    patientName: input.patientName,
    ageGroup: input.ageGroup
  });

  const conditions = buildConditions(patientId, input.observables);

  const encounter = buildEncounter({
    token,
    encounterId,
    patientId: patientId,
    esiLevel: input.esiLevel,
    status: "PLANNED",
    facilityId: input.facilityId ?? "",
    unknownMentions: input.unknownMentions ?? []
  });

  return {
    token,
    patient,
    conditions,
    encounter
  };
}
