import { ageGroupSchema } from '@hygieiashield/zod-contracts';
import { z } from 'zod';

export const triageIncomingSchema = z.object({
    patientName: z.string().trim().default('Anonymous'),
    ageGroup: ageGroupSchema,

    // Expecting an object of selected symptoms/observables
    symptoms: z.object({
        transcript: z.string().optional(),
        selections: z.array(z.string()).default([]),
    }).default({}),

    // Validating the structure of incoming geolocation data
    location: z.object({
        lat: z.number(),
        lng: z.number()
    }),
}).passthrough()

export function processTriage(rawBody) {
    // 1. Safely validate and parse the incoming body
    const validatedData = triageIncomingSchema.parse(rawBody);

    // 2. Map the data into the orchestrator's exact schema definition
    const orchestratorPayload = {
        patientName: validatedData.patientName,
        ageGroup: validatedData.ageGroup,
        timestamp: new Date().toISOString(),
        transcript: validatedData.symptoms.transcript ?? "",
        selectedSymptoms: validatedData.symptoms.selections,
        geoLocation: validatedData.location ? {
            latitude: validatedData.location.lat,
            longitude: validatedData.location.lng
        } : null
    };

    // 3. Hand off the clean payload to the core library
    return orchestratorPayload
}