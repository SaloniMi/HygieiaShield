/**
 * Responsible for -
 * Create user
 * Find by staffId (login)
 * Find by id
 * List users
 */

import { connectMongo } from "../mongo.js";

const COLLECTION = "users";

/**
 * Required Indexes
 *
 * 1. staffId (unique)
 * 2. role
 * 3. createdAt
 */

export async function ensureIndexesInUsers() {
    const db = await connectMongo();
    const col = db.collection(COLLECTION);

    col.createIndex(
        {
            facilityId: 1,
            staffId: 1
        },
        {
            unique: true
        }
    );

    await col.createIndex({
        role: 1
    });

    await col.createIndex({
        createdAt: -1
    });
}

/**
 * CREATE USER
 */
export async function createUser(user) {
    const db = await connectMongo();

    return db.collection(COLLECTION).insertOne({
        ...user,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
}

export async function findByFacilityAndStaffId(
    facilityId,
    staffId
) {
    const db = await connectMongo();

    return db.collection(COLLECTION).findOne({
        facilityId,
        staffId
    });
}

/**
 * FIND BY ID
 */
export async function findById(id) {
    const db = await connectMongo();

    return db.collection(COLLECTION).findOne({
        _id: id
    });
}

/**
 * LIST USERS
 */
export async function getUsers() {
    const db = await connectMongo();

    return db
        .collection(COLLECTION)
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
}