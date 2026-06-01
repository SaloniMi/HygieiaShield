import { z } from "zod";

export const careDestinationSchema = z.enum([
  "ER",
  "URGENT_CARE",
  "OUTPATIENT"
]);

export const routingSchema = z.object({
  facilityId: z.string(),
  facilityName: z.string(),
  facilityType: careDestinationSchema,
  distanceKm: z.number(),
  estimatedTravelMinutes: z.number(),
  estimatedWaitMinutes: z.number(),
  availableBeds: z.number().int(),
  surgeIndex: z.number().min(0).max(100)
});
