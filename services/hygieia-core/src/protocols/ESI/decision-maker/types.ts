export interface ESIDecisionSignals {
  lifesavingIntervention: boolean;
  highRisk: boolean;
  predictedResources: number;
}

export type ESILevel = 1 | 2 | 3 | 4 | 5;

export interface ESIResult extends ESIDecisionSignals {
  esiLevel: ESILevel;
}
