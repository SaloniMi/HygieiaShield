import { MongoClient } from "mongodb";


/**
 * Singleton connection holder
 */
let client = null;
let db = null;

/**
 * Connect to MongoDB once and reuse connection
 */
export async function connectMongo() {

    if (db) return db;

    const MONGO_URI = process.env.MONGO_URI;
    const DB_NAME = process.env.MONGO_DB_NAME;

    // Guard rails (fail fast if env missing)
    if (!MONGO_URI) {
        throw new Error("MONGO_URI is not defined in environment");
    }

    if (!DB_NAME) {
        throw new Error("MONGO_DB_NAME is not defined in environment");
    }

    client = new MongoClient(MONGO_URI, {
        maxPoolSize: 10,
        minPoolSize: 1,
    });

    await client.connect();

    db = client.db(DB_NAME);

    console.log("[MongoDB] Connected");

    return db;
}

/**
 * Optional helper if you ever need raw client
 */
export function getClient() {
    if (!client) {
        throw new Error(
            "Mongo client not initialized. Call connectMongo() first."
        );
    }

    return client;
}

/**
 * Optional helper if you need the DB instance
 */
export function getDb() {
    if (!db) {
        throw new Error(
            "Mongo database not initialized. Call connectMongo() first."
        );
    }

    return db;
}

/**
 * Graceful shutdown
 */
export async function closeMongo() {
    if (client) {
        await client.close();

        client = null;
        db = null;

        console.log("[MongoDB] Connection closed");
    }
}