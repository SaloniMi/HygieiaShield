/**
 * Responsible for -
 * Facility retrieval
 * Routing candidate selection
 * Capacity counters
 * Ward occupancy management
 * Surge updates
 */

import { connectMongo } from "../mongo.js";

const COLLECTION = "facilities";

/**
 * Required Indexes
 *
 * 1. location (2dsphere)
 * 2. globalSurgeIndex
 * 3. name
 */

export async function ensureIndexesInFacilities() {
    const db = await connectMongo();
    const col = db.collection(COLLECTION);

    await col.createIndex({
        location: "2dsphere"
    });

    await col.createIndex({
        globalSurgeIndex: 1
    });

    await col.createIndex({
        name: 1
    });
}

/**
 * LIST ALL FACILITIES
 */
export async function getFacilities() {
    const db = await connectMongo();

    return db
        .collection(COLLECTION)
        .find({})
        .toArray();
}

/**
 * FIND FACILITY BY ID
 */
export async function findFacilityById(facilityId) {
    const db = await connectMongo();

    return db.collection(COLLECTION).findOne({
        _id: facilityId
    });
}

/**
 * FIND MANY FACILITIES
 */
export async function findFacilitiesByIds(facilityIds = []) {
    const db = await connectMongo();

    return db
        .collection(COLLECTION)
        .find({
            _id: {
                $in: facilityIds
            }
        })
        .toArray();
}


/**
 * INCREMENT PENDING ARRIVALS
 *
 * destinationType:
 * emergency
 * urgentCare
 * outpatient
 */
export async function incrementPending(
    facilityId,
    destinationType
) {
    const db = await connectMongo();

    return db.collection(COLLECTION).updateOne(
        {
            _id: facilityId
        },
        {
            $inc: {
                [`${destinationType}.pending`]: 1
            },
            $set: {
                updatedAt: new Date().toISOString()
            }
        }
    );
}

/**
 * DECREMENT PENDING ARRIVALS
 */
export async function decrementPending(
    facilityId,
    destinationType
) {
    const db = await connectMongo();

    return db.collection(COLLECTION).updateOne(
        {
            _id: facilityId
        },
        {
            $inc: {
                [`${destinationType}.pending`]: -1
            },
            $set: {
                updatedAt: new Date().toISOString()
            }
        }
    );
}

/**
 * PATIENT ARRIVED
 *
 * occupied++
 */
export async function markArrival(
    facilityId,
    destinationType
) {
    const db = await connectMongo();

    return db.collection(COLLECTION).updateOne(
        {
            _id: facilityId
        },
        {
            $inc: {
                [`${destinationType}.occupied`]: 1
            },
            $set: {
                updatedAt: new Date().toISOString()
            }
        }
    );
}

/**
 * PATIENT DISCHARGED
 *
 * occupied--
 */
export async function decrementOccupied(
    facilityId,
    destinationType
) {
    const db = await connectMongo();

    return db.collection(COLLECTION).updateOne(
        {
            _id: facilityId
        },
        {
            $inc: {
                [`${destinationType}.occupied`]: -1
            },
            $set: {
                updatedAt: new Date().toISOString()
            }
        }
    );
}

export async function updateRoutingStatus(
    facilityId,
    destinationType,
    routingPaused
) {
    const db = await connectMongo();

    return db.collection(COLLECTION).updateOne(
        {
            _id: facilityId
        },
        {
            $set: {
                [`${destinationType}.routingPaused`]: routingPaused
            }
        }
    );
}
