import Patient, { IPatient } from "../models/Patient";

interface CreatePatientInput {
    name: string;
    age: number;
    gender: "male" | "female" | "other";
    dryWeight: number;
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