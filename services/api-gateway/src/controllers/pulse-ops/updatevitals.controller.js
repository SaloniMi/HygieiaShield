import { runNurseAssessmentWorkflow } from "@hygieiashield/core";
import { appendVitals, updateClinicalAssessment, updateEncounter } from "../../db/repositories/fhir.repository.js";
import { generateDoctorBriefAsync } from "../../services/generate-doctor-brief.service.js";
import { mongoEventBus } from '../../services/mongo-event-bus.service.js'

export async function updateVitals(req, res, next) {
    try {
        const { input, trace = {} } = req.body;
        const ctx = {
            trace,
            eventBus: mongoEventBus
        };
        const { patient = {}, vitals } = input ?? {}
        const result = await runNurseAssessmentWorkflow(input, ctx);
        if (!result.ok) {
            if (result.error.type === "VALIDATION_ERROR") {
                return res.status(400).json({
                    success: false,
                    type: "INVALID_VITALS",
                    message: "Some vitals are invalid or out of range",
                    details: result.error.details
                });
            }

            return res.status(500).json({
                success: false,
                type: "WORKFLOW_ERROR",
                message: "Gatekeeper failed to process vitals. Please try again."
            });
        }
        const { response = {}, persistence = {} } = result ?? {};
        await appendVitals(patient.token, persistence.observations ?? [])
        await updateClinicalAssessment(patient.token, {
            vitalFlags: persistence.vitalFlags ?? []
        });

        await updateEncounter(patient.token, { status: "ARRIVED", esiLevel: response.finalESI })

        generateDoctorBriefAsync({
            token: patient.token,
            ageGroup: patient.ageGroup,
            observables: patient.observables ?? [],
            unknownMentions: patient.unknownMentions ?? [],
            esiLevel: response.finalESI,
            vitals: vitals,
            vitalFlags: response.vitalFlags ?? []
        }, ctx);
        res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        next(error);
    }
}