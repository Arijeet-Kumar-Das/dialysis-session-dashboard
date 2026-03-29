import axios from "axios";
import type { ApiResponse, Patient } from "../types/index.ts";

const BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

export async function fetchAllPatients(): Promise<Patient[]> {
    const res = await axios.get<ApiResponse<Patient[]>>(`${BASE_URL}/patients`);
    return res.data.data;
}

export async function createPatient(
    payload: Omit<Patient, "_id" | "createdAt">
): Promise<Patient> {
    const res = await axios.post<ApiResponse<Patient>>(
        `${BASE_URL}/patients`,
        payload
    );
    return res.data.data;
}

export async function updatePatient(
    id: string,
    payload: Partial<Omit<Patient, "_id" | "createdAt">>
): Promise<Patient> {
    const res = await axios.patch<ApiResponse<Patient>>(
        `${BASE_URL}/patients/${id}`,
        payload
    );
    return res.data.data;
}

export async function deletePatient(id: string): Promise<Patient> {
    const res = await axios.delete<ApiResponse<Patient>>(
        `${BASE_URL}/patients/${id}`
    );
    return res.data.data;
}