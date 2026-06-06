import { CareType } from "../../care-route-engine/schemas/output.schema.js";

export interface UserCoordinates {
  latitude: number;
  longitude: number;
}

export interface CareRouteDestinationInput {
  careType: CareType;
  userCoordinates: UserCoordinates;
}

export interface FacilityRow {
  facility_id: string;
  facility_name: string;
  care_type: CareType;
  active_encounters: number;
  max_capacity: number;
  surge_index: number;
  latitude: number;
  longitude: number;
}
