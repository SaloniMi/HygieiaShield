import type { ESIDecisionSignals, ESIResult } from "./types.js";
import { ESILevelType } from "@hygieiashield/zod-contracts";

/**
 * Implements ESI v5 decision flow.
 *
 * IMPORTANT:
 * This is deterministic clinical logic.
 * No AI reasoning should exist here.
 */
export function calculateESI(signals: ESIDecisionSignals): ESILevelType {
  if (signals.lifesavingIntervention) {
    return 1;
  }

  if (signals.highRisk) {
    return 2;
  }

  if (signals.predictedResources >= 2) {
    return 3;
  }

  if (signals.predictedResources === 1) {
    return 4;
  }

  return 5;
}

export function buildESIResult(signals: ESIDecisionSignals): ESIResult {
  return {
    ...signals,
    esiLevel: calculateESI(signals)
  };
}

export function decideStatusBasedOnESILevel(esiLevel: ESILevelType) {
  switch (esiLevel) {
    case 1:
    case 2:
      return {
        status: "critical",
        tag: "Critical"
      };
    case 3:
      return {
        status: "warning",
        tag: "Urgent"
      };
    case 4:
      return {
        status: "info",
        tag: "Standard Care"
      };
    case 5:
      return {
        status: "success",
        tag: "Non Urgent"
      };
  }
}
