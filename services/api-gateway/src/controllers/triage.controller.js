import { runTriageWorkflow } from '@hygieiashield/core';
import { processTriage } from '../services/triage.service.js';
import { createFHIRRecord } from '../db/repositories/fhir.repository.js';

export async function triagePatient(req, res, next) {
    try {
        const requestBody = processTriage(req.body)
        const result = await runTriageWorkflow(requestBody);
        const { response = {}, persistence = {} } = result ?? {};
        await createFHIRRecord(persistence)
        res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        next(error);
    }
}