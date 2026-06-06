import { findByPatientId } from "../../db/repositories/fhir.repository.js";
import { getExtensionValue } from "./utils.js";

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

            status: encounter.status,

            encounterId: encounter.id,

            observables,

            patientNotes,

            vitals: record.vitals ?? [],

            brief: record.derived?.doctorBrief ?? null,

            createdAt: record.createdAt,
            updatedAt: record.updatedAt
        };

        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
}