import { markArrival } from "../../db/repositories/facilities.repository.js";
import { findByPatientId, updateEncounter } from "../../db/repositories/fhir.repository.js";
import { DESTINATION_TYPE } from "../../services/utils/mapper.js";

export async function acknowledgeOccupancyOfPatient(req, res, next) {
    try {
        const { patientId } = req.params;

        const patientInfo = await findByPatientId(patientId);
        const encounter = patientInfo.encounter;
        const facilityId = encounter.extension.find(ext => ext.url === "https://hygieia.dev/facility-id")?.valueString;
        const careType = encounter.extension.find(ext => ext.url === "https://hygieia.dev/destination-care-type")?.valueString;
        const unit = DESTINATION_TYPE[careType]
        await Promise.all([
            // Update the status of the encounter itself
            updateEncounter(patientInfo.token, { status: "ACKNOWLEDGED" }),
            // Increment the occupied slot in the care type
            markArrival(facilityId, unit)
        ]);

        return res.status(200).json({});
    } catch (error) {
        next(error);
    }
}