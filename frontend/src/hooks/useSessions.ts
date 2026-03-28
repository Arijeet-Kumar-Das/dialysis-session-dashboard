import { useEffect, useState } from "react";
import type { Session } from "../types";
import { fetchTodaySessions } from "../api/sessions";

export function useSessions(unit?: string) {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const load = (showSpinner: boolean) => {
        if (showSpinner) setLoading(true);
        fetchTodaySessions(unit)
            .then((data) => {
                setSessions(data);
                setLastUpdated(new Date());
                setError(null);
            })
            .catch(() => {
                if (showSpinner) setError("Failed to load sessions");
            })
            .finally(() => {
                if (showSpinner) setLoading(false);
            });
    };

    const refresh = () => load(true);

    useEffect(() => {
        load(true);
        const interval = setInterval(() => load(false), 30000);
        return () => clearInterval(interval);
    }, [unit]);

    return { sessions, loading, error, refresh, lastUpdated };
}