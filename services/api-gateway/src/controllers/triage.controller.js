import { runTriageWorkflow } from '@hygieiashield/core';
import { processTriage } from '../services/triage.service.js';
import { createFHIRRecord } from '../db/repositories/fhir.repository.js';
import { generateDoctorBriefAsync } from '../services/generate-doctor-brief.service.js';
import { mongoEventBus } from '../services/mongo-event-bus.service.js'
import { dbConnectors } from '../services/db-connector.service.js';
import { createSoftReservation } from '../services/create-reservation.service.js';

export async function triagePatient(req, res, next) {
    try {
        const { input, trace = {} } = req.body;

        const requestBody = processTriage(input);
        const ctx = {
            trace,
            eventBus: mongoEventBus,
            dbConnectors
        };
        const result = await runTriageWorkflow(requestBody, ctx);
        const { response = {}, persistence = {} } = result ?? {};
        const { recommendedFacility } = response ?? {};

        await createFHIRRecord(persistence);

        // Create reservation in facility
        await createSoftReservation({
            facilityId: recommendedFacility.facility_id,
            encounterId: persistence?.encounter?.id,
            patientId: persistence?.patient?.id,
            careType: response?.careType
        })

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