import { CareType } from "../../mapper.js";

export interface RecommendedFacility {
  facility_id: string;
  facility_name: string;
  distance: string;
  travelTime: string;
  waitTime: string;
  latitude: number;
  longitude: number;
}

export interface CareRouteOutput {
  careType: CareType;
  recommendedFacility: RecommendedFacility;
}
