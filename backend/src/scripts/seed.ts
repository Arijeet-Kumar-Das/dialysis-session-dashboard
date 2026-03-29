import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import Patient from "../models/Patient";
import Session from "../models/Session";
import { detectAnomalies } from "../services/anomaly.service";
import anomalyThresholds from "../config/anomalyThresholds";

/* ── Patient definitions ── */
const PATIENTS = [
    { name: "Rajesh Kumar", age: 58, gender: "male" as const, dryWeight: 68.5, contactNumber: "9876543210" },
    { name: "Priya Sharma", age: 45, gender: "female" as const, dryWeight: 55.0, contactNumber: "9123456789" },
    { name: "Mohammed Ali", age: 62, gender: "male" as const, dryWeight: 72.0, contactNumber: "9988776655" },
    { name: "Anita Desai", age: 51, gender: "female" as const, dryWeight: 60.0, contactNumber: "9871234567" },
    { name: "Kavita Reddy", age: 39, gender: "female" as const, dryWeight: 52.0, contactNumber: "9012345678" },
    { name: "Arjun Patel", age: 70, gender: "male" as const, dryWeight: 80.0, contactNumber: "9345678901" },
];

/*
 * Session config:
 *   pi  = patient index, hr = scheduled hour, st = status
 *   pre/post = delta above dryWeight (null = no vitals yet)
 *   bp = systolic BP, dur = duration, m = machine, u = unit
 */
const SESSION_CONFIGS = [
    // Rajesh Kumar — 3 sessions
    { pi: 0, hr: 8,  st: "completed",   pre: 4.2, post: 0.5, bp: 145, dur: 240, m: "M-101", u: "Ward-A", n: "Excess fluid at intake. Removed successfully during session." },
    { pi: 0, hr: 14, st: "in_progress", pre: 1.5, post: null, bp: 155, dur: null, m: "M-103", u: "Ward-A", n: "Second session today. Monitoring vitals closely." },
    { pi: 0, hr: 19, st: "not_started", pre: null, post: null, bp: null, dur: null, m: "M-108", u: "Ward-A", n: "" },

    // Priya Sharma — 3 sessions (one with high BP anomaly)
    { pi: 1, hr: 9,  st: "completed",   pre: 2.1, post: 0.3, bp: 192, dur: 210, m: "M-102", u: "Ward-B", n: "BP elevated throughout session. Cardiologist consulted." },
    { pi: 1, hr: 15, st: "not_started", pre: null, post: null, bp: null, dur: null, m: "M-105", u: "Ward-B", n: "" },
    { pi: 1, hr: 18, st: "not_started", pre: null, post: null, bp: null, dur: null, m: null,  u: "Ward-B", n: "" },

    // Mohammed Ali — 2 sessions (short session anomaly)
    { pi: 2, hr: 7,  st: "completed",   pre: 3.8, post: 1.2, bp: 165, dur: 90,  m: "M-104", u: "ICU",  n: "Session ended early — patient discomfort. Weight gain concerning." },
    { pi: 2, hr: 13, st: "in_progress", pre: 2.5, post: null, bp: 170, dur: null, m: "M-101", u: "ICU",  n: "Resuming treatment. Patient more comfortable." },

    // Anita Desai — 3 sessions (good vitals)
    { pi: 3, hr: 10, st: "completed",   pre: 1.8, post: 0.2, bp: 130, dur: 240, m: "M-106", u: "Ward-A", n: "Routine session. No concerns." },
    { pi: 3, hr: 16, st: "in_progress", pre: 2.0, post: null, bp: 138, dur: null, m: "M-102", u: "Ward-B", n: "All vitals within normal range." },
    { pi: 3, hr: 19, st: "not_started", pre: null, post: null, bp: null, dur: null, m: "M-107", u: "ICU",  n: "" },

    // Kavita Reddy — 2 sessions (long session anomaly)
    { pi: 4, hr: 6,  st: "completed",   pre: 1.0, post: 0.1, bp: 120, dur: 330, m: "M-109", u: "General", n: "Session ran long — machine pressure issue, resolved at 11:30." },
    { pi: 4, hr: 17, st: "in_progress", pre: 1.5, post: null, bp: 128, dur: null, m: "M-110", u: "General", n: "Evening session. Patient comfortable." },

    // Arjun Patel — 2 sessions (weight gain + high BP crisis)
    { pi: 5, hr: 11, st: "completed",   pre: 5.0, post: 2.0, bp: 188, dur: 200, m: "M-111", u: "ICU",  n: "Significant fluid overload. BP crisis during session — IV medication given." },
    { pi: 5, hr: 20, st: "not_started", pre: null, post: null, bp: null, dur: null, m: "M-112", u: "Ward-A", n: "" },
];

async function seed() {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI is not set in .env");

    await mongoose.connect(uri);
    console.log("✓ Connected to MongoDB");

    const today = new Date().toISOString().slice(0, 10);
    let patientsCreated = 0;
    let patientsSkipped = 0;
    let sessionsCreated = 0;
    let sessionsSkipped = 0;

    // ── Upsert patients (skip if name already exists) ──
    const patientDocs: any[] = [];

    for (const data of PATIENTS) {
        let patient = await Patient.findOne({ name: data.name });
        if (patient) {
            console.log(`⏭ Patient exists: ${patient.name}`);
            patientsSkipped++;
        } else {
            patient = await new Patient(data).save();
            console.log(`✓ Created patient: ${patient.name} (dry weight: ${patient.dryWeight}kg)`);
            patientsCreated++;
        }
        patientDocs.push(patient);
    }

    // ── Add sessions (skip if same patient + exact scheduledDate already exists today) ──
    for (const c of SESSION_CONFIGS) {
        const patient = patientDocs[c.pi];
        if (!patient) {
            console.log(`⚠ Skipping session: patient index ${c.pi} not found`);
            continue;
        }

        const scheduledDate = new Date(`${today}T${String(c.hr).padStart(2, "0")}:00:00`);

        // Check for duplicate: exact same patient + exact same scheduledDate
        const existing = await Session.findOne({
            patientId: patient._id,
            scheduledDate: scheduledDate,
        });

        if (existing) {
            console.log(`  ⏭ Session exists: ${patient.name} @ ${c.hr}:00`);
            sessionsSkipped++;
            continue;
        }

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
            scheduledDate,
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

        const tag = anomalies.length > 0 ? `⚠ ${anomalies.length} anomal${anomalies.length === 1 ? "y" : "ies"}` : "✓ normal";
        console.log(`  → ${patient.name} @ ${c.hr}:00 [${c.st}] [${c.u}] ${tag}`);
        sessionsCreated++;
    }

    console.log(`\n══════════════════════════════════════`);
    console.log(`  Patients: ${patientsCreated} created, ${patientsSkipped} skipped`);
    console.log(`  Sessions: ${sessionsCreated} created, ${sessionsSkipped} skipped`);
    console.log(`  Date:     ${today}`);
    console.log(`══════════════════════════════════════\n`);

    await mongoose.disconnect();
}

seed().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});
