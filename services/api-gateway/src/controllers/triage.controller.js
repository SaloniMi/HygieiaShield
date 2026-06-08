import { runTriageWorkflow } from '@hygieiashield/core';
import { processTriage } from '../services/triage.service.js';
import { createFHIRRecord } from '../db/repositories/fhir.repository.js';
import { generateDoctorBriefAsync } from '../services/generate-doctor-brief.service.js';
import { mongoEventBus } from '../services/mongo-event-bus.service.js'

export async function triagePatient(req, res, next) {
    try {
        const { input, trace = {} } = req.body;

        const requestBody = processTriage(input);
        const ctx = {
            trace,
            eventBus: mongoEventBus
        };
        const result = await runTriageWorkflow(requestBody, ctx);
        const { response = {}, persistence = {} } = result ?? {};

        await createFHIRRecord(persistence)

        generateDoctorBriefAsync({
            token: response.token,
            ageGroup: requestBody.ageGroup,
            observables: response.observables ?? [],
            unknownMentions: response.unknownMentions ?? [],
            esiLevel: response.finalESI
        }, ctx);
        res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        next(error);
    }
}