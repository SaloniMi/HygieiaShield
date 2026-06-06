import fs from "fs";
import { CareType } from "../../care-route-engine/schemas/output.schema.js";
import { FacilityRow } from "./retriever.interface.js";

export function loadFacilities(): FacilityRow[] {
  const filePath = process.env.LEDGER_PATH;

  if (!filePath) {
    throw new Error("ESI_HANDBOOK_PATH is not configured");
  }

  const raw = fs.readFileSync(filePath, "utf-8");

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [header, ...rows] = raw.trim().split("\n");

  return rows.map((row) => {
    const [
      facility_id,
      facility_name,
      care_type,
      active_encounters,
      max_capacity,
      surge_index,
      latitude,
      longitude
    ] = row.split(",");

    return {
      facility_id,
      facility_name,
      care_type: care_type as CareType,
      active_encounters: Number(active_encounters),
      max_capacity: Number(max_capacity),
      surge_index: Number(surge_index),
      latitude: Number(latitude),
      longitude: Number(longitude)
    };
  });
}
