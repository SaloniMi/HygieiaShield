import { findByPatientId } from "../../db/repositories/fhir.repository.js";
import { getExtensionValue } from "./utils.js";
import { VITALS_LOINC } from "@hygieiashield/clinical-protocols";

function extractObservables(conditions = []) {
    return conditions
        .map(condition =>
            condition.code?.coding?.[0]?.code ??
            condition.code?.text
        )
        .filter(Boolean);
}

function extractPatientNotes(encounter = {}) {
    return (encounter.extension ?? [])
        .filter(
            extension =>
                extension.url === "https://hygieia.dev/patient-reported-note"
        )
        .map(extension => extension.valueString)
        .filter(Boolean);
}

const LOINC_TO_VITAL = Object.fromEntries(
    Object.entries(VITALS_LOINC)
        .filter(([, config]) => config.code)
        .map(([key, config]) => [config.code, key])
);

function extractVitals(observations = []) {
    const vitals = {};

    for (const observation of observations) {
        const loincCode = observation.code?.coding?.[0]?.code;

        // Blood pressure panel
        if (loincCode === "85354-9") {
            for (const component of observation.component ?? []) {
                const componentCode =
                    component.code?.coding?.[0]?.code;

                const vitalKey = LOINC_TO_VITAL[componentCode];

                if (vitalKey) {
                    vitals[vitalKey] =
                        component.valueQuantity?.value;
                }
            }

            continue;
        }

        // Standard LOINC vitals
        const vitalKey = LOINC_TO_VITAL[loincCode];

        if (vitalKey) {
            vitals[vitalKey] =
                observation.valueQuantity?.value;
            continue;
        }

        // Non-LOINC custom vitals
        switch (observation.code?.text) {
            case VITALS_LOINC.isSupplementalOxygen.display:
                vitals.isSupplementalOxygen =
                    observation.valueBoolean;
                break;

            case VITALS_LOINC.levelOfConsciousness.display:
                vitals.levelOfConsciousness =
                    observation.valueString;
                break;

            case VITALS_LOINC.painScore.display:
                vitals.painScore =
                    observation.valueInteger;
                break;
        }
    }

    return vitals;
}

export async function getPatient(req, res, next) {
    try {
        const { patientId } = req.params;

        const record = await findByPatientId(patientId);

        if (!record) {
            return res.status(404).json({
                message: "Patient not found"
            });
        }

        const patient = record.patient ?? {};
        const encounter = record.encounter ?? {};
        const conditions = record.conditions ?? [];

        const observations = record.observations ?? [];
        const vitals = extractVitals(observations);

        const observables = extractObservables(conditions);
        const patientNotes = extractPatientNotes(encounter);

        const response = {
            id: patient.id,

            token: record.token,

            patientName:
                patient.name?.[0]?.text ??
                "Unknown Patient",

            ageGroup:
                getExtensionValue(
                    patient.extension,
                    "https://hygieia.dev/age-group"
                ) ?? "UNKNOWN",

            esiLevel: Number(
                getExtensionValue(
                    encounter.extension,
                    "https://hygieia.dev/esi-level"
                )
            ),

            facilityId: getExtensionValue(
                encounter.extension,
                "https://hygieia.dev/facility-id"
            ),

            status: encounter.status,

            encounterId: encounter.id,

            observables,

            patientNotes,

            careType: getExtensionValue(
                encounter.extension,
                "https://hygieia.dev/destination-care-type"
            ),

            wardType: getExtensionValue(
                encounter.extension,
                "https://hygieia.dev/recommended-ward-type"
            ),

            vitals: vitals ?? {},
            vitalFlags: record.derived?.clinicalAssessment?.vitalFlags ?? [],
            createdAt: record.createdAt,
            updatedAt: record.updatedAt
        };

        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
}