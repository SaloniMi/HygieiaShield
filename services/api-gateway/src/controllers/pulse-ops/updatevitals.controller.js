import { runNurseAssessmentWorkflow } from "@hygieiashield/core";
import { appendVitals } from "../../db/repositories/fhir.repository.js";
import { generateDoctorBriefAsync } from "../../services/generate-doctor-brief.service.js";

export async function updateVitals(req, res, next) {
    try {
        console.log(req.body)
        const { patient = {}, vitals } = req.body ?? {}
        const result = await runNurseAssessmentWorkflow(req.body);
        const { response = {}, persistence = {} } = result ?? {};
        await appendVitals(patient.token, persistence.observations ?? [])
        generateDoctorBriefAsync({
            token: patient.token,
            ageGroup: patient.ageGroup,
            observables: patient.observables ?? [],
            unknownMentions: patient.unknownMentions ?? [],
            esiLevel: response.finalESI,
            vitals: vitals
        });
        res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        next(error);
    }
}