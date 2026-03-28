import { useEffect, useState } from "react";
import type { Session } from "../types";
import { fetchTodaySessions } from "../api/sessions";

export function useSessions() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = () => {
        setLoading(true);
        fetchTodaySessions()
            .then(setSessions)
            .catch(() => setError("Failed to load sessions"))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        refresh();
    }, []);

    return { sessions, loading, error, refresh };
}