import { findByPatientId } from "../../db/repositories/fhir.repository.js";

export async function getPatientBrief(req, res, next) {
    try {
        const { patientId } = req.params;

        const record = await findByPatientId(patientId);

        if (!record) {
            return res.status(404).json({
                message: "Patient not found"
            });
        }

        const patient = record.patient ?? {};

        const response = {
            id: patient.id,
            brief: record.derived?.doctorBrief ?? null
        };

        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
}