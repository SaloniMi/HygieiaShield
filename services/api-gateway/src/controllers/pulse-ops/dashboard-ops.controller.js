import { decrementOccupied, findFacilityById, updateRoutingStatus } from "../../db/repositories/facilities.repository.js";
import { getIncomingPatients } from "../../db/repositories/facility-reservation.repository.js";
import { getActiveEncounters, updateEncounter } from "../../db/repositories/fhir.repository.js";

/**
 * Gets the shift coordinator's dashboard data in one single API call
 */
export async function getDashboardData(req, res, next) {
    try {
        const { facilityId } = req.params;

        const [
            facility,
            incomingPatients,
            activeEncounters
        ] = await Promise.all([
            findFacilityById(facilityId),
            getIncomingPatients(facilityId),
            getActiveEncounters(facilityId)
        ]);

        return res.status(200).json({
            facility,
            incomingPatients,
            activeEncounters
        });
    } catch (error) {
        next(error);
    }
}

export async function updateRouteStatusForFacility(req, res, next) {
    try {
        const { facilityId } = req.params;
        const { careType, routingPaused } = req.body;

        await updateRoutingStatus(facilityId, careType, routingPaused)

        return res.status(200).json({});
    } catch (error) {
        next(error);
    }
}

export async function completeActiveEncounter(req, res, next) {
    try {
        const { facilityId } = req.params;
        const { encounter } = req.body;
        console.log(encounter)

        await Promise.all([
            // Decrement the occupied slot in the care type
            decrementOccupied(facilityId, encounter.careType),
            // Update the status of the encounter itself
            updateEncounter(encounter.token, { status: "COMPLETED" })
        ]);

        return res.status(200).json({});
    } catch (error) {
        next(error);
    }
}
