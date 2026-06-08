import { connectMongo } from "../mongo.js";

/**
 * COLLECTION NAME
 */
const COLLECTION = "agent_events";

/**
 * Ensure indexes exist (run once at startup)
 */
export async function ensureIndexesInAgentTrace() {
    const db = await connectMongo();
    const col = db.collection(COLLECTION);
    await col.createIndex({ eventId: 1 }, { unique: true });

    // Primary trace stream (MOST IMPORTANT INDEX)
    await col.createIndex({
        "trace.encounterId": 1,
        timestamp: 1
    });

    // Patient history view
    await col.createIndex({
        "trace.patientId": 1,
        timestamp: -1
    });

    // Token lookup (useful for UI deep-links / QR scan replay)
    await col.createIndex({
        "trace.token": 1,
        timestamp: -1
    });

    await col.createIndex({ timestamp: -1 });
}

/**
 * CREATE AgentEvent RECORD
 */
export async function createAgentEventRecord(record) {
    try {
        const db = await connectMongo();
        const col = db.collection(COLLECTION);

        await col.insertOne(record);
    } catch (e) {
        console.error("Failed to insert AgentEvent:", e);
        throw e;
    }
}

/**
 * PATIENT HISTORY VIEW (UI)
 */
export async function findAgentTracesByPatientId(patientId) {
    const db = await connectMongo();

    return db
        .collection(COLLECTION)
        .find({ "trace.patientId": patientId })
        .sort({ timestamp: 1 })
        .toArray();
}