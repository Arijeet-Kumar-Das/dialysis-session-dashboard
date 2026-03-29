import { useEffect, useState } from "react";
import { socket } from "../socket";
import { useToast } from "../context/ToastContext";

type RefreshFn = (() => void) | null;

export function useSocket(refreshSessions: RefreshFn, refreshPatients: RefreshFn) {
    const { showToast } = useToast();
    const [connected, setConnected] = useState(socket.connected);

    useEffect(() => {
        function onConnect() {
            setConnected(true);
        }
        function onDisconnect() {
            setConnected(false);
        }

        // Session events
        function onSessionCreated(session: any) {
            refreshSessions?.();
            const name = session?.patientId?.name ?? "Unknown";
            showToast(`New session added for ${name}`, "success");
        }
        function onSessionUpdated(session: any) {
            refreshSessions?.();
            const name = session?.patientId?.name ?? "Unknown";
            showToast(`Session updated for ${name}`, "success");
        }
        function onSessionDeleted() {
            refreshSessions?.();
            showToast("Session deleted", "success");
        }

        // Patient events
        function onPatientCreated(patient: any) {
            refreshPatients?.();
            showToast(`New patient registered: ${patient?.name ?? "Unknown"}`, "success");
        }
        function onPatientUpdated(patient: any) {
            refreshPatients?.();
            showToast(`Patient updated: ${patient?.name ?? "Unknown"}`, "success");
        }
        function onPatientDeleted() {
            refreshPatients?.();
            showToast("Patient deleted", "success");
        }

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("session:created", onSessionCreated);
        socket.on("session:updated", onSessionUpdated);
        socket.on("session:deleted", onSessionDeleted);
        socket.on("patient:created", onPatientCreated);
        socket.on("patient:updated", onPatientUpdated);
        socket.on("patient:deleted", onPatientDeleted);

        // Sync initial state
        setConnected(socket.connected);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("session:created", onSessionCreated);
            socket.off("session:updated", onSessionUpdated);
            socket.off("session:deleted", onSessionDeleted);
            socket.off("patient:created", onPatientCreated);
            socket.off("patient:updated", onPatientUpdated);
            socket.off("patient:deleted", onPatientDeleted);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { connected };
}
