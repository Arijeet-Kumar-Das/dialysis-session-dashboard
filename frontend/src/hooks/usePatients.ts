import { useEffect, useState } from "react";
import type { Patient } from "../types";
import { fetchAllPatients } from "../api/patients";

export function usePatients() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = () => {
        setLoading(true);
        fetchAllPatients()
            .then(setPatients)
            .catch(() => setError("Failed to load patients"))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { patients, loading, error, refresh };
}