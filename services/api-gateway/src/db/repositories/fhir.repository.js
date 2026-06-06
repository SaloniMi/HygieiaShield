/**
 * Responsible for -
 * Create fhir record
 * Find by token (fast path)
 * Fuzzy search by name
 * Update encounter state
 * Append vitals
 */

import { connectMongo } from "../mongo.js";

// Required Indices on MongoDB collection "fhir-records"
/**
    1. triageId (unique, primary lookup)
    2. search.token (same as triageId, redundant but query-safe)
    3. search.normalizedName (text search / fuzzy lookup)
    4. createdAt (optional for sorting dashboards)
 */



/**
 * COLLECTION NAME
 */
const COLLECTION = "fhirRecords";

/**
 * Ensure indexes exist (run once at startup)
 */
export async function ensureIndexes() {
    const db = await connectMongo();
    const col = db.collection(COLLECTION);

    await col.createIndex({ token: 1 }, { unique: true });

    await col.createIndex({
        "encounter.status": 1
    });

    await col.createIndex({ createdAt: -1 });
}

/**
 * CREATE FHIR RECORD
 */
export async function createFHIRRecord(record) {
    try {
        const db = await connectMongo();
        console.log(record)
        return db.collection(COLLECTION).insertOne({
            ...record,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    } catch (e) {
        console.error("here", e)
    }
}

/**
 * FIND BY TOKEN (PRIMARY PATH)
 */
export async function findByToken(token) {
    const db = await connectMongo();

    return db.collection(COLLECTION).findOne({
        "search.token": token
    });
}

/**
 * FUZZY SEARCH BY NAME
 * (PulseOps search bar)
 */
export async function searchByName(name) {
    const db = await connectMongo();

    return db
        .collection(COLLECTION)
        .find({
            $text: { $search: name }
        })
        .limit(20)
        .toArray();
}

/**
 * UPDATE ENCOUNTER STATE ONLY
 * (ESI, status, routing changes)
 */
export async function updateEncounter(triageId, patch) {
    const db = await connectMongo();

    return db.collection(COLLECTION).updateOne(
        { triageId },
        {
            $set: {
                "encounter.status": patch.status,
                "encounter.extension": patch.extension,
                updatedAt: new Date().toISOString()
            }
        }
    );
}

/**
 * APPEND VITALS (for later Agent 3 integration)
 */
export async function appendVitals(triageId, observation) {
    const db = await connectMongo();

    return db.collection(COLLECTION).updateOne(
        { triageId },
        {
            $push: {
                vitals: observation
            },
            $set: {
                updatedAt: new Date().toISOString()
            }
        }
    );
}