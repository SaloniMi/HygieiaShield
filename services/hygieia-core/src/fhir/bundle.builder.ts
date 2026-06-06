import {
  ObservablesType,
  AgeGroupType,
  ESILevelType
} from "@hygieiashield/zod-contracts";
import { generateToken } from "../utils/human-token-generator.js";
import { buildConditions } from "./resource-builder/condition.builder.js";
import { buildEncounter } from "./resource-builder/encounter.builder.js";
import { buildPatient } from "./resource-builder/patient.builder.js";

export function buildFHIRBundleForPatient(input: {
  patientName: string;
  ageGroup: AgeGroupType;
  observables: ObservablesType;
  esiLevel: ESILevelType;
  facilityId?: string;
}) {
  const token = generateToken();

  const patient = buildPatient({
    token,
    patientName: input.patientName,
    ageGroup: input.ageGroup
  });

  const conditions = buildConditions(patient.id, input.observables);

  const encounter = buildEncounter({
    token,
    patientId: patient.id,
    esiLevel: input.esiLevel,
    status: "PLANNED",
    facilityId: input.facilityId ?? ""
  });

  return {
    token,
    patient,
    conditions,
    encounter
  };
}
