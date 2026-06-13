import { AgentContext, Facility } from "@hygieiashield/zod-contracts";
import type {
  CareRouteDestinationInput,
  CareRouteTypeInput
} from "./schemas/input.schema.js";
import type { CareRouteOutput } from "./schemas/output.schema.js";
import {
  computeQueueTimeMinutes,
  computeSurgeIndex,
  getRouteMetrics
} from "./utils.js";
import { ESI_CARE_TYPE } from "../mapper.js";

export async function determineCareRouteForPreArrival(
  input: CareRouteTypeInput,
  ctx: AgentContext
): Promise<CareRouteOutput> {
  // Find the careType necessary for the person
  const careType = ESI_CARE_TYPE[input.esiLevel];

  // Find the best care route for the given type and user locations
  const careRoute = await determineCareFacility(
    {
      careType: careType,
      userCoordinates: input.userCoordinates
    },
    ctx
  );

  console.log("PRE_ARRIVAL CARE ROUTE", {
    recommendedFacility: careRoute,
    careType
  });

  return {
    recommendedFacility: careRoute,
    careType
  };
}

export async function determineCareFacility(
  input: CareRouteDestinationInput,
  ctx: AgentContext
) {
  const { careType, userCoordinates } = input;

  const facilities = await ctx.dbConnectors.getHospitals({});

  // filter purely by surge > 100 and routingPaused
  let candidates = facilities.filter((facility) => {
    const unit =
      careType === "ER"
        ? facility.emergency
        : careType === "UrgentCare"
          ? facility.urgentCare
          : facility.outpatient;

    return !unit.routingPaused && computeSurgeIndex(facility, careType) > 100;
  });

  if (candidates.length === 0) {
    // All facilities paused or over capacity, falling back to full network

    candidates = facilities;
  }

  const scored = await Promise.all(
    candidates.map(async (facility) => {
      const route = await getRouteMetrics(userCoordinates, {
        latitude: facility.location.coordinates[1],
        longitude: facility.location.coordinates[0]
      });

      const travelTimeMinutes = route.durationSeconds / 60;
      const queueTimeMinutes = computeQueueTimeMinutes(facility, careType);
      const surgeIndex = computeSurgeIndex(facility, careType);

      const timeToCareMinutes = travelTimeMinutes + queueTimeMinutes + 5; // 5 min intake buffer

      const score = timeToCareMinutes * (1 + surgeIndex / 100);

      return {
        facility,
        distanceMeters: route.distanceMeters,
        travelTimeMinutes,
        queueTimeMinutes,
        timeToCareMinutes,
        score
      };
    })
  );

  scored.sort((a, b) => a.score - b.score);

  const best = scored[0];

  return {
    latitude: best.facility.location.coordinates[1],
    longitude: best.facility.location.coordinates[0],
    facility_id: best.facility._id,
    facility_name: best.facility.name,
    distance: best.distanceMeters?.toFixed(1),
    travelTime: best.travelTimeMinutes?.toFixed(1),
    waitTime: best.queueTimeMinutes?.toFixed(1)
  };
}
