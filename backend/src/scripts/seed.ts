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

    // Each config: [patientIndex, hour, status, preWeightDelta, postWeightDelta, bp, duration, machine, notes]
    const configs = [
        // Rajesh — session 1: weight gain anomaly (4.2kg above dry weight)
        { pi: 0, hr: 8, st: "completed", pre: 4.2, post: 0.5, bp: 145, dur: 240, m: "M-101", n: "Excess fluid at intake. Removed successfully during session." },
        // Rajesh — session 2: in progress, normal
        { pi: 0, hr: 14, st: "in_progress", pre: 1.5, post: null, bp: 155, dur: null, m: "M-103", n: "Second session today. Monitoring vitals closely." },

        // Priya — session 1: high BP anomaly (192 > 180)
        { pi: 1, hr: 9, st: "completed", pre: 2.1, post: 0.3, bp: 192, dur: 210, m: "M-102", n: "BP elevated throughout session. Cardiologist consulted." },
        // Priya — session 2: not started
        { pi: 1, hr: 15, st: "not_started", pre: null, post: null, bp: null, dur: null, m: "M-105", n: "" },
        // Priya — session 3: not started
        { pi: 1, hr: 18, st: "not_started", pre: null, post: null, bp: null, dur: null, m: null, n: "" },

        // Mohammed — session 1: short duration (90 < 120) + weight gain (3.8 > 3)
        { pi: 2, hr: 7, st: "completed", pre: 3.8, post: 1.2, bp: 165, dur: 90, m: "M-104", n: "Session ended early — patient discomfort. Weight gain concerning." },
        // Mohammed — session 2: in progress, normal
        { pi: 2, hr: 13, st: "in_progress", pre: 2.5, post: null, bp: 170, dur: null, m: "M-101", n: "Resuming treatment. Patient more comfortable." },

        // Anita — session 1: fully normal
        { pi: 3, hr: 10, st: "completed", pre: 1.8, post: 0.2, bp: 130, dur: 240, m: "M-106", n: "Routine session. No concerns." },
        // Anita — session 2: in progress, normal
        { pi: 3, hr: 16, st: "in_progress", pre: 2.0, post: null, bp: 138, dur: null, m: "M-102", n: "All vitals within normal range." },
        // Anita — session 3: not started
        { pi: 3, hr: 19, st: "not_started", pre: null, post: null, bp: null, dur: null, m: "M-107", n: "" },
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
