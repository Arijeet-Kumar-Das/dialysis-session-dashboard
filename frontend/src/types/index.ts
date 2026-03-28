export type SessionStatus = "not_started" | "in_progress" | "completed";

export interface Patient {
    _id: string;
    name: string;
    age: number;
    gender: "male" | "female" | "other";
    dryWeight: number;
    contactNumber?: string;
    createdAt: string;
}

export interface Session {
    _id: string;
    patientId: Patient;
    scheduledDate: string;
    status: SessionStatus;
    preWeight?: number;
    postWeight?: number;
    systolicBP?: number;
    durationMinutes?: number;
    machineId?: string;
    nurseNotes?: string;
    unit?: string;
    anomalies: string[];
    createdAt: string;
    updatedAt: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}