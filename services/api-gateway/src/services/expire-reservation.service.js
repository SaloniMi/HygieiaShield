import { decrementPending } from "../db/repositories/facilities.repository.js";
import { expireReservation } from "../db/repositories/facility-reservation.repository.js";

export async function expireReservations(expiredReservations) {
    const now = new Date();

    const chunk = expiredReservations.slice(0, 200);

    for (const res of chunk) {
        try {
            // Step 1: idempotent state transition
            const result = await expireReservation(res._id);

            // If already processed by another worker → skip
            if (result.modifiedCount === 0) continue;

            // Step 2: safe facility counter update
            await decrementPending(
                res.facilityId,
                res.careType
            );

            console.log(
                `[EXPIRED] encounter=${res.encounterId} facility=${res.facilityId}`
            );

        } catch (err) {
            // individual reservation failure should NOT stop loop
            console.error("Reservation processing failed:", err);
        }
    }
}