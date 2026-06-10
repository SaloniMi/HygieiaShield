import { AgentContext, VitalFlag } from "@hygieiashield/zod-contracts";
import { ESI_CARE_TYPE } from "../mapper.js";
import { CareRouteTypeInput } from "./schemas/input.schema.js";
import { CareRouteOutput } from "./schemas/output.schema.js";

export function determineCareRouteForPostArrival(
  input: CareRouteTypeInput,
  ctx: AgentContext
): CareRouteOutput {
  // Find the careType necessary for the person
  const careType = ESI_CARE_TYPE[input.esiLevel];

  // Find the best ward type from GENERAL|ICU if the careType is ER
  if (careType === "ER") {
    return {
      careType,
      wardType: determineWardType(input)
    };
  }

  return {
    careType
  };
}

function determineWardType(input: CareRouteTypeInput) {
  const isCritical = input.vitalFlags?.find(
    (flag: VitalFlag) => flag.level === "CRITICAL"
  );

  const isHighRisk = input.vitalFlags?.find(
    (flag: VitalFlag) => flag.level === "HIGH"
  );

  if (input.esiLevel === 1 || isCritical) {
    return "ICU";
  }

  if (isHighRisk) {
    return "General";
  }

  return;
}
