import { ESILevelType } from "@hygieiashield/zod-contracts";

export interface ESIDecisionSignals {
  lifesavingIntervention: boolean;
  highRisk: boolean;
  predictedResources: number;
}

export interface ESIResult extends ESIDecisionSignals {
  esiLevel: ESILevelType;
}
