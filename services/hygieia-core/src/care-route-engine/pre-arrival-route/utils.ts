import { Facility } from "@hygieiashield/zod-contracts";
import { CareType } from "../mapper.js";

export async function getRouteMetrics(
  from: { latitude: number; longitude: number },
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

export function computeQueueTimeMinutes(
  facility: Facility,
  careType: CareType
) {
  const unit =
    careType === "ER"
      ? facility.emergency
      : careType === "UrgentCare"
        ? facility.urgentCare
        : facility.outpatient;

  const minutesPerPatient =
    careType === "ER" ? 5 : careType === "UrgentCare" ? 3 : 1;

  return unit.pending * minutesPerPatient;
}

export function computeSurgeIndex(facility: Facility, careType: CareType) {
  const unit =
    careType === "ER"
      ? facility.emergency
      : careType === "UrgentCare"
        ? facility.urgentCare
        : facility.outpatient;

  const totalDemand = unit.occupied + unit.pending;

  return (totalDemand / unit.capacity) * 100;
}
