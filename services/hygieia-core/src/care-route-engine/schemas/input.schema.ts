import { ESILevelType } from "@hygieiashield/zod-contracts";
import type { CareType } from "./output.schema.js";
import type { UserCoordinates } from "../../services/hospital-capacity-retriever/retriever.interface.js";

export interface CareRouteTypeInput {
  esiLevel: ESILevelType;
  userCoordinates: UserCoordinates;
}

export interface CareRouteDestinationInput {
  careType: CareType;
  userCoordinates: UserCoordinates;
}
