import { useEffect, useState } from "react";
import type { Patient } from "../types";
import { fetchAllPatients } from "../api/patients";

export function usePatients() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchAllPatients()
            .then(setPatients)
            .catch(() => setError("Failed to load patients"))
            .finally(() => setLoading(false));
    }, []);

    return { patients, loading, error };
}