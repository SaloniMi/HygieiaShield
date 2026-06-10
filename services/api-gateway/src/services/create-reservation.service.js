import { incrementPending } from "../db/repositories/facilities.repository.js";
import { createReservation } from "../db/repositories/facility-reservation.repository.js";
import { DESTINATION_TYPE } from "./utils/mapper.js";

export async function createSoftReservation({ facilityId, encounterId, patientId, careType }) {
    await createReservation({ facilityId, encounterId, patientId, careType })

    // Update the pending to get incremented by 1 for the said care type
    await incrementPending(facilityId, DESTINATION_TYPE[careType])

}