import axios from "axios";
import type { ApiResponse, Session } from "../types";

const BASE_URL = "http://localhost:5000/api";

export async function fetchTodaySessions(unit?: string): Promise<Session[]> {
    const url = unit
        ? `${BASE_URL}/sessions/today?unit=${encodeURIComponent(unit)}`
        : `${BASE_URL}/sessions/today`;
    const res = await axios.get<ApiResponse<Session[]>>(url);
    return res.data.data;
}

export async function createSession(payload: {
    patientId: string;
    scheduledDate: string;
    preWeight?: number;
    postWeight?: number;
    systolicBP?: number;
    durationMinutes?: number;
    machineId?: string;
    nurseNotes?: string;
    status?: string;
}): Promise<Session> {
    const res = await axios.post<ApiResponse<Session>>(
        `${BASE_URL}/sessions`,
        payload
    );
    return res.data.data;
}

export async function updateSession(
    id: string,
    payload: {
        nurseNotes?: string;
        status?: string;
        preWeight?: number;
        postWeight?: number;
        systolicBP?: number;
        durationMinutes?: number;
        machineId?: string;
    }
): Promise<Session> {
    const res = await axios.patch<ApiResponse<Session>>(
        `${BASE_URL}/sessions/${id}`,
        payload
    );
    return res.data.data;
}

export async function deleteSession(id: string): Promise<Session> {
    const res = await axios.delete<ApiResponse<Session>>(
        `${BASE_URL}/sessions/${id}`
    );
    return res.data.data;
}