import { decrementPending, markArrival } from "../db/repositories/facilities.repository.js";
import { consumeReservation, getReservationByEncounter } from "../db/repositories/facility-reservation.repository.js";
import { appendVitals, updateClinicalAssessment, updateEncounter } from "../db/repositories/fhir.repository.js";
import { DESTINATION_TYPE } from "./utils/mapper.js";

export async function postProcessPatientVitalsArrival(patient, result) {

    const { response = {}, persistence = {} } = result ?? {};

    // Append vitals in the MongoDB
    await appendVitals(patient.token, persistence.observations ?? [])
    // Update the clinical assessment with vital flags
    await updateClinicalAssessment(patient.token, {
        vitalFlags: persistence.vitalFlags ?? []
    });

    // Consume the reservation
    const reservationSaved = getReservationByEncounter(patient.encounterId)
    const isDestinationCareTypeChanged = reservationSaved.careType !== response.careType
    const finalCareType = isDestinationCareTypeChanged ? response.careType : reservationSaved.careType
    const reservationCleared = await consumeReservation(patient.encounterId)
    if (reservationCleared.modifiedCount !== 0) {
        // If the reservation was still open and was consumed, then decrement
        // the pending
        await decrementPending(
            reservationSaved.facilityId,
            DESTINATION_TYPE[reservationSaved.careType]
        );
    }

    console.log(response)

    // Update encounter of the patient to have been ARRIVED and the final ESI Level
    await updateEncounter(patient.token, {
        status: "ARRIVED",
        esiLevel: response.finalESI,
        wardType: response.wardType,
        ...isDestinationCareTypeChanged && { destinationCareType: response.careType }
    })
}