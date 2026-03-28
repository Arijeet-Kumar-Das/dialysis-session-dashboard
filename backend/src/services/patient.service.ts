import Patient, { IPatient } from "../models/Patient";
import Session from "../models/Session";

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
    return patient.save();
}

export async function updatePatient(
    id: string,
    input: UpdatePatientInput
): Promise<IPatient | null> {
    return Patient.findByIdAndUpdate(id, input, {
        new: true,
        runValidators: true,
    });
}

export async function deletePatient(id: string): Promise<IPatient | null> {
    const patient = await Patient.findByIdAndDelete(id);
    if (patient) {
        // Remove all sessions belonging to this patient
        await Session.deleteMany({ patientId: id });
    }
    return patient;
}