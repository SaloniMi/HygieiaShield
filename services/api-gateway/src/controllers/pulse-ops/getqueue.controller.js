import { getPatientRecords } from "../../db/repositories/fhir.repository.js";
import { getExtensionValue } from "./utils.js";

function mapFHIRRecordToQueueItem(record) {
    const patient = record.patient ?? {};
    const encounter = record.encounter ?? {};

    const esiLevel = Number(
        getExtensionValue(
            encounter.extension,
            "https://hygieia.dev/esi-level"
        )
    );

    const patientName =
        patient.name?.[0]?.text ??
        "Unknown Patient";

    const ageGroup =
        getExtensionValue(
            patient.extension,
            "https://hygieia.dev/age-group"
        ) ?? "UNKNOWN"

    return {
        id: patient.id,

        token: record.token,

        patientName,

        ageGroup,

        esiLevel,

        status: encounter.status,

        facilityId: getExtensionValue(
            encounter.extension,
            "https://hygieia.dev/facility-id"
        ),

        createdAt: record.createdAt
    };
}

export async function getQueue(req, res, next) {
    try {
        const facilityId = process.env.FACILITY_ID;

        const records = await getPatientRecords(facilityId);

        const queue = records
            .map(mapFHIRRecordToQueueItem)
            .sort((a, b) => {
                // Incoming patients first
                if (a.status === "PLANNED" && b.status !== "PLANNED") {
                    return -1;
                }

                if (a.status !== "PLANNED" && b.status === "PLANNED") {
                    return 1;
                }

                // Higher acuity first
                if (a.esiLevel !== b.esiLevel) {
                    return a.esiLevel - b.esiLevel;
                }

                // Most recent first
                return (
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                );
            });


        return res.status(200).json(queue);
    } catch (error) {
        next(error);
    }
}