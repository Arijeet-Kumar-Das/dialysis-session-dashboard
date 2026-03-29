import Patient, { IPatient } from "../models/Patient";
import Session from "../models/Session";
import { getIO } from "../socket";

interface CreatePatientInput {
    name: string;
    age: number;
    gender: "male" | "female" | "other";
    dryWeight: number;
    contactNumber?: string;
}

interface UpdatePatientInput {
    name?: string;
    age?: number;
    gender?: "male" | "female" | "other";
    dryWeight?: number;
    contactNumber?: string;
}

export async function getAllPatients(): Promise<IPatient[]> {
    return Patient.find().sort({ createdAt: -1 });
}

export async function getPatientById(id: string): Promise<IPatient | null> {
    return Patient.findById(id);
}

export async function createPatient(
    input: CreatePatientInput
): Promise<IPatient> {
    const patient = new Patient(input);
    const saved = await patient.save();
    getIO()?.emit("patient:created", saved);
    return saved;
}

export async function updatePatient(
    id: string,
    input: UpdatePatientInput
): Promise<IPatient | null> {
    const updated = await Patient.findByIdAndUpdate(id, input, {
        new: true,
        runValidators: true,
    });
    if (updated) getIO()?.emit("patient:updated", updated);
    return updated;
}

export async function deletePatient(id: string): Promise<IPatient | null> {
    const patient = await Patient.findByIdAndDelete(id);
    if (patient) {
        await Session.deleteMany({ patientId: id });
        getIO()?.emit("patient:deleted", { id });
    }
    return patient;
}