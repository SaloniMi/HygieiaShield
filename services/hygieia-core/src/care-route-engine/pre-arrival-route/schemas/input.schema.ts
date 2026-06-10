import { ESILevelType } from "@hygieiashield/zod-contracts";
import { CareType } from "../../mapper.js";

export interface CareRouteTypeInput {
  esiLevel: ESILevelType;
  userCoordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface CareRouteDestinationInput {
  careType: CareType;
  userCoordinates: {
    latitude: number;
    longitude: number;
  };
}
