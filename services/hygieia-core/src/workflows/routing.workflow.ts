// workflows/routing.workflow.ts

import {
  determineCareCenter,
  determineCareType
} from "../care-route-engine/route-decider.js";
import { CareRouteTypeInput } from "../care-route-engine/schemas/input.schema.js";

export async function runRouteWorkflow(input: CareRouteTypeInput) {
  // Find the careType necessary for the person
  const careTypeResult = determineCareType(input);
  if (careTypeResult) {
    // Find the best care route for the given type and user locations
    const careRoute = await determineCareCenter({
      careType: careTypeResult.careType,
      userCoordinates: input.userCoordinates
    });

    return {
      recommendedFacility: careRoute,
      careType: careTypeResult
    };
  }
}
