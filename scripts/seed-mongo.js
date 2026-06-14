import "dotenv/config";
import { MongoClient, ObjectId } from "mongodb";

const facilities = [
  {
    _id: "FAC-05",
    name: "Northcare Hospital",
    location: {
      type: "Point",
      coordinates: [72.84, 19.18]
    },
    emergency: {
      capacity: 8,
      occupied: 3,
      pending: 1,
      routingPaused: false
    },
    urgentCare: {
      capacity: 15,
      occupied: 1,
      pending: 3,
      routingPaused: false
    },
    outpatient: {
      capacity: 15,
      occupied: 10,
      pending: 2,
      routingPaused: false
    },
    createdAt: new Date("2026-06-08T10:24:21.801Z"),
    updatedAt: new Date("2026-06-13T13:03:18.316Z"),
    ER: {
      pending: -2
    }
  },
  {
    _id: "FAC-04",
    name: "Sunrise Health Center",
    location: {
      type: "Point",
      coordinates: [72.91, 19.12]
    },
    emergency: {
      capacity: 15,
      occupied: 11,
      pending: 3,
      routingPaused: false
    },
    urgentCare: {
      capacity: 15,
      occupied: 11,
      pending: 2,
      routingPaused: false
    },
    outpatient: {
      capacity: 15,
      occupied: 11,
      pending: 2,
      routingPaused: false
    },
    createdAt: new Date("2026-06-08T10:24:21.801Z"),
    updatedAt: new Date("2026-06-12T04:08:31.921Z"),
    ER: {
      pending: -1
    }
  }
];

const users = [
  {
    _id: new ObjectId("6a2650762d54a9ca67176654"),
    staffId: "NRS-0042",
    name: "Nurse Priya",
    role: "nurse",
    passwordHash:
      "$2a$12$s43fiTlPq8ASpWyBmVspwuXAjsEIYWXkAU/aw5GPXDoVTP32ICbX6",
    active: true,
    createdAt: new Date("2026-06-08T05:17:42.301Z"),
    updatedAt: new Date("2026-06-08T05:17:42.301Z"),
    facilityId: "FAC-05"
  },
  {
    _id: new ObjectId("6a2650762d54a9ca67176655"),
    staffId: "DR-0091",
    name: "Dr. Anand",
    role: "doctor",
    passwordHash:
      "$2a$12$s43fiTlPq8ASpWyBmVspwuXAjsEIYWXkAU/aw5GPXDoVTP32ICbX6",
    active: true,
    createdAt: new Date("2026-06-08T05:17:42.301Z"),
    updatedAt: new Date("2026-06-08T05:17:42.301Z"),
    facilityId: "FAC-05"
  },
  {
    _id: new ObjectId("6a2650762d54a9ca67176656"),
    staffId: "CO-0007",
    name: "Shift Coord.",
    role: "coordinator",
    passwordHash:
      "$2a$12$s43fiTlPq8ASpWyBmVspwuXAjsEIYWXkAU/aw5GPXDoVTP32ICbX6",
    active: true,
    createdAt: new Date("2026-06-08T05:17:42.301Z"),
    updatedAt: new Date("2026-06-08T05:17:42.301Z"),
    facilityId: "FAC-05"
  }
];

async function seed() {
  const { MONGODB_URI, MONGO_DB_NAME } = process.env;

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is required");
  }

  if (!MONGO_DB_NAME) {
    throw new Error("MONGO_DB_NAME is required");
  }
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();

    const db = client.db(process.env.MONGO_DB_NAME);

    console.log("Connected to MongoDB");

    await db.collection("facilities").deleteMany({});
    await db.collection("users").deleteMany({});

    await db.collection("facilities").insertMany(facilities);
    await db.collection("users").insertMany(users);

    await db.collection("facilities").createIndex({
      location: "2dsphere"
    });

    await db.collection("users").createIndex({ staffId: 1 }, { unique: true });

    console.log("Seed completed successfully");
  } finally {
    await client.close();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
