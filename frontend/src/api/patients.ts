import axios from "axios";
import type { ApiResponse, Patient } from "../types/index.ts";

const BASE_URL = "http://localhost:5000/api";

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