import {
  FacilityRow,
  UserCoordinates
} from "../services/hospital-capacity-retriever/retriever.interface.js";

export async function getRouteMetrics(
  from: UserCoordinates,
  to: { latitude: number; longitude: number }
) {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${from.longitude},${from.latitude};${to.longitude},${to.latitude}` +
    `?overview=false`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.routes?.length) {
    return {
      distanceMeters: Infinity,
      durationSeconds: Infinity
    };
  }

  const baseDuration = data.routes[0].duration;

  const trafficMultiplier = getTrafficMultiplier(data.routes[0].distance);

  return {
    distanceMeters: data.routes[0].distance,
    durationSeconds: baseDuration * trafficMultiplier
  };
}

function getTrafficMultiplier(baseDistanceMeters: number) {
  const hour = new Date().getHours();

  const timeFactor =
    hour >= 8 && hour <= 11
      ? 1.35 // morning peak
      : hour >= 17 && hour <= 20
        ? 1.5 // evening peak
        : 1.0;

  const distanceKm = baseDistanceMeters / 1000;

  const distanceFactor = distanceKm < 3 ? 1.05 : distanceKm < 10 ? 1.15 : 1.25;

  return timeFactor * distanceFactor;
}

export function computeQueueTimeMinutes(facility: FacilityRow) {
  const BASE_WAIT = 45;
  const s = facility.surge_index;

  if (s < 0.7) {
    return s * 0.3 * BASE_WAIT; // smooth region
  }

  if (s < 1.0) {
    return Math.pow(s, 2.5) * BASE_WAIT; // congestion curve
  }

  return BASE_WAIT * Math.exp(3 * (s - 1)); // overload spike
}

export function computeFacilityScore(params: {
  distanceMeters: number;
  surgeIndex: number;
}) {
  const distanceKm = params.distanceMeters / 1000;

  // Normalize:
  const distanceScore = distanceKm; // linear penalty
  const surgeScore = params.surgeIndex * 10; // amplify load impact

  return distanceScore + surgeScore;
}
