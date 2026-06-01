import type { ESIDecisionSignals, ESILevel, ESIResult } from "./types.js";

/**
 * Implements ESI v5 decision flow.
 *
 * IMPORTANT:
 * This is deterministic clinical logic.
 * No AI reasoning should exist here.
 */
export function calculateESI(signals: ESIDecisionSignals): ESILevel {
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
