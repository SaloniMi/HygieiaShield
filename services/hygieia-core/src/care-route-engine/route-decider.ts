import { loadFacilities } from "../services/hospital-capacity-retriever/ledger.loader.js";
import { FacilityRow } from "../services/hospital-capacity-retriever/retriever.interface.js";
import type {
  CareRouteDestinationInput,
  CareRouteTypeInput
} from "./schemas/input.schema.js";
import type { CareRouteOutput, CareType } from "./schemas/output.schema.js";
import {
  computeFacilityScore,
  computeQueueTimeMinutes,
  getRouteMetrics
} from "./utils.js";

const esiCareTypeMap: Record<1 | 2 | 3 | 4 | 5, CareType> = {
  1: "ER",
  2: "ER",
  3: "ER",
  4: "Urgent Care",
  5: "Outpatient"
};

export function determineCareType(input: CareRouteTypeInput): CareRouteOutput {
  const careType = esiCareTypeMap[input.esiLevel] ?? "unknown";

  return {
    careType,
    reason: `Care route selected from ESI level ${input.esiLevel}.`,
    routeHint: `Route the patient to ${careType}.`
  };
}

export async function determineCareCenter(input: CareRouteDestinationInput) {
  const { careType, userCoordinates } = input;
  const facilities = loadFacilities();

  const filtered = facilities.filter(
    (f: FacilityRow) => f.care_type === careType
  );

  const scored = await Promise.all(
    filtered.map(async (facility) => {
      const route = await getRouteMetrics(userCoordinates, {
        latitude: facility.latitude,
        longitude: facility.longitude
      });

      const queueTimeMinutes = computeQueueTimeMinutes(facility);

      const travelTimeMinutes = route.durationSeconds / 60;

      const etaMinutes = travelTimeMinutes + queueTimeMinutes + 5; // 5 min intake buffer

      const score = computeFacilityScore({
        distanceMeters: route.distanceMeters,
        surgeIndex: facility.surge_index
      });

      return {
        facility,
        distanceMeters: route.distanceMeters,
        travelTimeMinutes,
        queueTimeMinutes,
        etaMinutes,
        score
      };
    })
  );

  scored.sort((a, b) => a.etaMinutes - b.etaMinutes);

  const best = scored[0];

  return {
    ...best.facility,
    distance: best.distanceMeters?.toFixed(1),
    travelTime: best.travelTimeMinutes?.toFixed(1),
    waitTime: best.queueTimeMinutes?.toFixed(1)
  };
}
