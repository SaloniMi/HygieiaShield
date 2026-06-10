import { ESILevelType, VitalFlag } from "@hygieiashield/zod-contracts";

export interface CareRouteTypeInput {
  esiLevel: ESILevelType;
  vitalFlags: VitalFlag[];
}
