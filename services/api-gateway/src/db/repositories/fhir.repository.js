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
export async function ensureIndexesInFHIR() {
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

export async function updateEncounter(
    token,
    {
        status,
        esiLevel,
        destinationCareType,
        wardType
    }
) {
    const db = await connectMongo();

    const update = {
        updatedAt: new Date().toISOString()
    };

    const arrayFilters = [];

    if (status) {
        update["encounter.status"] = status;
    }

    if (esiLevel !== undefined) {
        update["encounter.extension.$[esi].valueString"] = String(esiLevel);

        arrayFilters.push({
            "esi.url": "https://hygieia.dev/esi-level"
        });
    }

    if (destinationCareType !== undefined) {
        update["encounter.extension.$[dest].valueString"] = String(destinationCareType);

        arrayFilters.push({
            "dest.url": "https://hygieia.dev/destination-care-type"
        });
    }

    if (wardType !== undefined) {
        update["encounter.extension.$[ward].valueString"] = String(destinationCareType);

        arrayFilters.push({
            "ward.url": "https://hygieia.dev/recommended-ward-type"
        });
    }

    return db.collection(COLLECTION).updateOne(
        { token },
        { $set: update },
        {
            arrayFilters
        }
    );
}

export async function getPatientRecords(facilityId) {
    if (!facilityId) {
        throw new Error("facilityId is required");
    }

    const db = await connectMongo();
    return db
        .collection(COLLECTION)
        .find({
            "encounter.extension": {
                $elemMatch: {
                    url: "https://hygieia.dev/facility-id",
                    valueString: facilityId
                }
            }
        })
        .sort({ createdAt: -1 })
        .toArray();
}

export async function findByPatientId(patientId) {
    const db = await connectMongo();

    return db.collection(COLLECTION).findOne({
        "patient.id": patientId
    });
}

export async function updateClinicalAssessment(
    token,
    clinicalAssessment
) {
    const db = await connectMongo();

    return db.collection(COLLECTION).updateOne(
        { token },
        {
            $set: {
                "derived.clinicalAssessment": {
                    ...clinicalAssessment,
                    generatedAt: new Date().toISOString()
                },
                updatedAt: new Date().toISOString()
            }
        }
    );
}

export async function updateDoctorBrief(token, doctorBrief) {
    const db = await connectMongo();

    return db.collection(COLLECTION).updateOne(
        { token },
        {
            $set: {
                "derived.doctorBrief": {
                    ...doctorBrief,
                    generatedAt: new Date().toISOString()
                },
                updatedAt: new Date().toISOString()
            }
        }
    );
}

export async function updateDoctorBriefStatus(token, status) {
    const db = await connectMongo();

    return db.collection(COLLECTION).updateOne(
        { token },
        {
            $set: {
                "derived.doctorBrief.status": status,
                updatedAt: new Date().toISOString()
            }
        }
    );
}

/**
 * APPEND VITALS
 */
export async function appendVitals(token, observations) {
    const db = await connectMongo();

    return db.collection(COLLECTION).updateOne(
        { token },
        {
            $push: {
                observations: {
                    $each: observations
                }
            },
            $set: {
                updatedAt: new Date().toISOString()
            }
        }
    );
}

export async function getActiveEncounters(facilityId) {
    const db = await connectMongo();

    return db
        .collection("fhirRecords")
        .aggregate([
            {
                $match: {
                    "encounter.status": {
                        $in: ["ACKNOWLEDGED"]
                    }
                }
            },
            {
                $match: {
                    "encounter.extension": {
                        $elemMatch: {
                            url: "https://hygieia.dev/facility-id",
                            valueString: facilityId
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    encounterId: "$encounter.id",
                    token: 1,
                    patientId: "$patient.id",
                    patientName: {
                        $ifNull: [
                            {
                                $arrayElemAt: [
                                    "$patient.name.text",
                                    0
                                ]
                            },
                            null
                        ]
                    },
                    encounterStatus: "$encounter.status",
                    careType: {
                        $let: {
                            vars: {
                                careType: {
                                    $first: {
                                        $filter: {
                                            input: "$encounter.extension",
                                            as: "ext",
                                            cond: {
                                                $eq: [
                                                    "$$ext.url",
                                                    "https://hygieia.dev/destination-care-type"
                                                ]
                                            }
                                        }
                                    }
                                }
                            },
                            in: "$$careType.valueString"
                        }
                    },
                    esiLevel: {
                        $let: {
                            vars: {
                                esi: {
                                    $first: {
                                        $filter: {
                                            input:
                                                "$encounter.extension",
                                            as: "ext",
                                            cond: {
                                                $eq: [
                                                    "$$ext.url",
                                                    "https://hygieia.dev/esi-level"
                                                ]
                                            }
                                        }
                                    }
                                }
                            },
                            in: "$$esi.valueString"
                        }
                    },
                    updatedAt: 1
                }
            },
            {
                $sort: {
                    updatedAt: -1
                }
            }
        ])
        .toArray();
}