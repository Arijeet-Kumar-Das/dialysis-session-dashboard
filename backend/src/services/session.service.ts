import Session, { ISession } from "../models/Session";
import Patient from "../models/Patient";
import { detectAnomalies } from "./anomaly.service";
import anomalyThresholds from "../config/anomalyThresholds";
import { getIO } from "../socket";

interface CreateSessionInput {
    patientId: string;
    scheduledDate: Date;
    preWeight?: number;
    postWeight?: number;
    systolicBP?: number;
    durationMinutes?: number;
    machineId?: string;
    nurseNotes?: string;
    unit?: string;
    status?: "not_started" | "in_progress" | "completed";
}

interface UpdateSessionInput {
    nurseNotes?: string;
    status?: "not_started" | "in_progress" | "completed";
    preWeight?: number;
    postWeight?: number;
    systolicBP?: number;
    durationMinutes?: number;
    machineId?: string;
}

export async function getTodaySessions(date?: string, unit?: string): Promise<ISession[]> {

    let startOfDay: Date;
    let endOfDay: Date;

    if (date) {

        startOfDay = new Date(date + "T00:00:00");
        endOfDay = new Date(date + "T23:59:59.999");
    } else {
        startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
    }

    const query: any = {
        scheduledDate: { $gte: startOfDay, $lte: endOfDay },
    };

    if (unit) {
        query.unit = unit;
    }

    return Session.find(query)
        .populate("patientId", "name age gender dryWeight")
        .sort({ scheduledDate: 1 });
}

export async function createSession(
    input: CreateSessionInput
): Promise<ISession> {

    const patient = await Patient.findById(input.patientId);
    if (!patient) {
        throw new Error("Patient not found");
    }

    // Detect anomalies at creation time
    const anomalies = detectAnomalies(
        {
            preWeight: input.preWeight,
            postWeight: input.postWeight,
            systolicBP: input.systolicBP,
            durationMinutes: input.durationMinutes,
        },
        patient.dryWeight,
        anomalyThresholds
    );

    const session = new Session({
        ...input,
        anomalies,
    });

    const saved = await session.save();
    const populated = await saved.populate("patientId", "name age gender dryWeight");
    getIO()?.emit("session:created", populated);
    return populated;
}

export async function updateSession(
    id: string,
    input: UpdateSessionInput
): Promise<ISession | null> {

    const existing = await Session.findById(id).populate("patientId");
    if (!existing) return null;

    const patient = existing.patientId as any;


    const merged = {
        preWeight: input.preWeight ?? existing.preWeight,
        postWeight: input.postWeight ?? existing.postWeight,
        systolicBP: input.systolicBP ?? existing.systolicBP,
        durationMinutes: input.durationMinutes ?? existing.durationMinutes,
    };

    const anomalies = detectAnomalies(
        merged,
        patient.dryWeight,
        anomalyThresholds
    );

    const updated = await Session.findByIdAndUpdate(
        id,
        { ...input, anomalies },
        { new: true, runValidators: true }
    ).populate("patientId", "name age gender dryWeight");
    if (updated) getIO()?.emit("session:updated", updated);
    return updated;
}

export async function getSessionById(id: string): Promise<ISession | null> {
    return Session.findById(id).populate("patientId", "name age gender dryWeight");
}

export async function deleteSession(id: string): Promise<ISession | null> {
    const deleted = await Session.findByIdAndDelete(id);
    if (deleted) getIO()?.emit("session:deleted", { id });
    return deleted;
}