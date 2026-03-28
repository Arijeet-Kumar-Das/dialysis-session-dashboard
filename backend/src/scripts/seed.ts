import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import Patient from "../models/Patient";
import Session from "../models/Session";
import { detectAnomalies } from "../services/anomaly.service";
import anomalyThresholds from "../config/anomalyThresholds";

const PATIENTS = [
    { name: "Rajesh Kumar", age: 58, gender: "male" as const, dryWeight: 68.5, contactNumber: "9876543210" },
    { name: "Priya Sharma", age: 45, gender: "female" as const, dryWeight: 55.0, contactNumber: "9123456789" },
    { name: "Mohammed Ali", age: 62, gender: "male" as const, dryWeight: 72.0, contactNumber: "9988776655" },
    { name: "Anita Desai", age: 51, gender: "female" as const, dryWeight: 60.0, contactNumber: "9871234567" },
];

async function seed() {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI is not set in .env");

    await mongoose.connect(uri);
    console.log("✓ Connected to MongoDB");

    await Session.deleteMany({});
    await Patient.deleteMany({});
    console.log("✓ Cleared existing data");

    const today = new Date().toISOString().slice(0, 10);
    const created: any[] = [];

    for (const data of PATIENTS) {
        const patient = await new Patient(data).save();
        created.push(patient);
        console.log(`✓ Patient: ${patient.name} (dry weight: ${patient.dryWeight}kg)`);
    }


    const configs = [

        { pi: 0, hr: 8, st: "completed", pre: 4.2, post: 0.5, bp: 145, dur: 240, m: "M-101", u: "Ward-A", n: "Excess fluid at intake. Removed successfully during session." },

        { pi: 0, hr: 14, st: "in_progress", pre: 1.5, post: null, bp: 155, dur: null, m: "M-103", u: "Ward-A", n: "Second session today. Monitoring vitals closely." },


        { pi: 1, hr: 9, st: "completed", pre: 2.1, post: 0.3, bp: 192, dur: 210, m: "M-102", u: "Ward-B", n: "BP elevated throughout session. Cardiologist consulted." },

        { pi: 1, hr: 15, st: "not_started", pre: null, post: null, bp: null, dur: null, m: "M-105", u: "Ward-B", n: "" },

        { pi: 1, hr: 18, st: "not_started", pre: null, post: null, bp: null, dur: null, m: null, u: "Ward-B", n: "" },

        { pi: 2, hr: 7, st: "completed", pre: 3.8, post: 1.2, bp: 165, dur: 90, m: "M-104", u: "ICU", n: "Session ended early — patient discomfort. Weight gain concerning." },

        { pi: 2, hr: 13, st: "in_progress", pre: 2.5, post: null, bp: 170, dur: null, m: "M-101", u: "ICU", n: "Resuming treatment. Patient more comfortable." },


        { pi: 3, hr: 10, st: "completed", pre: 1.8, post: 0.2, bp: 130, dur: 240, m: "M-106", u: "Ward-A", n: "Routine session. No concerns." },

        { pi: 3, hr: 16, st: "in_progress", pre: 2.0, post: null, bp: 138, dur: null, m: "M-102", u: "Ward-B", n: "All vitals within normal range." },

        { pi: 3, hr: 19, st: "not_started", pre: null, post: null, bp: null, dur: null, m: "M-107", u: "ICU", n: "" },
    ];

    for (const c of configs) {
        const patient = created[c.pi];
        const preWeight = c.pre !== null ? patient.dryWeight + c.pre : undefined;
        const postWeight = c.post !== null ? patient.dryWeight + c.post : undefined;
        const systolicBP = c.bp ?? undefined;
        const durationMinutes = c.dur ?? undefined;

        const anomalies = detectAnomalies(
            { preWeight, postWeight, systolicBP, durationMinutes },
            patient.dryWeight,
            anomalyThresholds
        );

        await new Session({
            patientId: patient._id,
            scheduledDate: new Date(`${today}T${String(c.hr).padStart(2, "0")}:00:00`),
            status: c.st,
            preWeight,
            postWeight,
            systolicBP,
            durationMinutes,
            machineId: c.m ?? undefined,
            unit: c.u,
            nurseNotes: c.n || undefined,
            anomalies,
        }).save();

        const tag = anomalies.length > 0 ? `⚠ ${anomalies.length} anomalies` : "✓ normal";
        console.log(`  → ${patient.name} @ ${c.hr}:00 [${c.st}] ${tag}`);
    }

    console.log(`\n✅ Seeded ${created.length} patients, ${configs.length} sessions`);
    await mongoose.disconnect();
}

seed().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});
