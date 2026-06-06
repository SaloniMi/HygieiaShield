import dotenv from 'dotenv';
import app from './app.js';
import { connectMongo } from "./db/mongo.js";
import { ensureIndexes } from './db/repositories/fhir.repository.js';
import dns from "node:dns";

dns.setServers([
    "1.1.1.1",
    "1.0.0.1",
]);

dotenv.config();

const PORT = process.env.PORT || 4000;

async function bootstrap() {
    await connectMongo();
    await ensureIndexes();

    const server = app.listen(PORT, () => {
        console.log(`API Gateway running on port ${PORT}`);
    });

    // 20 minutes
    server.requestTimeout = 20 * 60 * 1000;

    // Must be greater than requestTimeout
    server.headersTimeout = 20 * 60 * 1000 + 5000;
}

bootstrap();