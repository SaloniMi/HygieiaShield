import { connectMongo } from "../mongo.js";

export async function ensureIndexesInFacilityReservations() {
    const db = await connectMongo();
    const col = db.collection("facility_reservations");

    await col.createIndex({ facilityId: 1 });
    await col.createIndex({ encounterId: 1 }, { unique: true });
    await col.createIndex({ status: 1 });
    await col.createIndex({ ttlAt: 1 });
    await col.createIndex({ facilityId: 1, status: 1 });
}

export async function createReservation({
    facilityId,
    encounterId,
    patientId,
    careType
}) {
    const db = await connectMongo();

    return db.collection("facility_reservations").insertOne({
        facilityId,
        encounterId,
        patientId,
        careType,

        status: "PENDING", // PENDING | CONSUMED | EXPIRED

        createdAt: new Date().toISOString(),
        ttlAt: new Date(Date.now() + 45 * 60 * 1000).toISOString()
    });
}

export async function getReservationByEncounter(encounterId) {
    const db = await connectMongo();

    return db.collection("facility_reservations").findOne({
        encounterId
    });
}

export async function consumeReservation(encounterId) {
    const db = await connectMongo();

    return db.collection("facility_reservations").updateOne(
        {
            encounterId,
            status: "PENDING"
        },
        {
            $set: {
                status: "CONSUMED",
                consumedAt: new Date().toISOString()
            }
        }
    );
}

export async function expireReservation(reservationId) {
    const db = await connectMongo();

    return db.collection("facility_reservations").updateOne(
        {
            _id: reservationId,
            status: "PENDING"
        },
        {
            $set: {
                status: "EXPIRED",
                expiredAt: new Date().toISOString()
            }
        }
    );
}

export async function findExpiredReservations(now = new Date()) {
    const db = await connectMongo();

    return db
        .collection("facility_reservations")
        .find({
            status: "PENDING",
            ttlAt: { $lte: now.toISOString() }
        })
        .limit(500) // safety batch limit for worker stability
        .toArray();
}

export async function getIncomingPatients(facilityId) {
    const db = await connectMongo();

    return db
        .collection("facility_reservations")
        .aggregate([
            {
                $match: {
                    facilityId,
                    status: "PENDING"
                }
            },
            {
                $lookup: {
                    from: "fhirRecords",
                    let: {
                        encounterId: "$encounterId",
                        patientId: "$patientId"
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: [
                                                "$encounter.id",
                                                "$$encounterId"
                                            ]
                                        },
                                        {
                                            $eq: [
                                                "$patient.id",
                                                "$$patientId"
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "patient"
                }
            },
            {
                $unwind: "$patient"
            },
            {
                $project: {
                    _id: 0,

                    reservationId: "$_id",
                    facilityId: 1,
                    encounterId: 1,
                    patientId: 1,
                    careType: 1,
                    createdAt: 1,

                    token: "$patient.token",

                    patientName: {
                        $ifNull: [
                            {
                                $arrayElemAt: [
                                    "$patient.patient.name.text",
                                    0
                                ]
                            },
                            null
                        ]
                    },

                    encounterStatus:
                        "$patient.encounter.status",

                    esiLevel: {
                        $let: {
                            vars: {
                                esi: {
                                    $first: {
                                        $filter: {
                                            input:
                                                "$patient.encounter.extension",
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
                    }
                }
            },
            {
                $sort: {
                    createdAt: 1
                }
            }
        ])
        .toArray();
}