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
    await connectMongo();        // establish DB connection first
    await ensureIndexes();       // then ensure indexes exist
    const server = app.listen(PORT, () => {
        console.log(`API Gateway running on port ${PORT}`);
    });
    server.requestTimeout = 10 * 60 * 1000;
    server.headersTimeout = 10 * 60 * 1000 + 5000;
}

bootstrap();
