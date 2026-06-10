import dotenv from 'dotenv';
import app from './app.js';
import { connectMongo } from "./db/mongo.js";
import { ensureIndexesInAgentTrace } from './db/repositories/agent-trace.repository.js';
import { ensureIndexesInFHIR } from './db/repositories/fhir.repository.js';
import dns from "node:dns";
import { ensureIndexesInUsers } from './db/repositories/users.repository.js';
import { ensureIndexesInFacilities } from './db/repositories/facilities.repository.js';
import { ensureIndexesInFacilityReservations } from './db/repositories/facility-reservation.repository.js';
import { findExpiredReservations } from "./db/repositories/facility-reservation.repository.js";
import { expireReservations } from './services/expire-reservation.service.js';

dns.setServers([
    "1.1.1.1",
    "1.0.0.1",
]);

dotenv.config();

const PORT = process.env.PORT || 4000;

function startReservationExpiryWorker() {
    const INTERVAL_MS = 10 * 1000; // 10 seconds
    let isRunning = false;

    setInterval(async () => {
        if (isRunning) return; // prevents overlap if previous run is still executing
        isRunning = true;

        try {
            // Step 1: fetch expired reservations (bounded)
            const expiredReservations =
                await findExpiredReservations();

            if (!expiredReservations.length) {
                isRunning = false;
                return;
            }
            expireReservations(expiredReservations)
        } catch (err) {
            console.error("Expiry worker fatal error:", err);
        } finally {
            isRunning = false;
        }
    }, INTERVAL_MS);
}

async function bootstrap() {
    await connectMongo();
    await ensureIndexesInFHIR();
    await ensureIndexesInAgentTrace();
    await ensureIndexesInUsers();
    await ensureIndexesInFacilities();
    await ensureIndexesInFacilityReservations();

    const server = app.listen(PORT, () => {
        console.log(`API Gateway running on port ${PORT}`);
    });

    // 20 minutes
    server.requestTimeout = 20 * 60 * 1000;

    // Must be greater than requestTimeout
    server.headersTimeout = 20 * 60 * 1000 + 5000;

    startReservationExpiryWorker();
}

bootstrap();