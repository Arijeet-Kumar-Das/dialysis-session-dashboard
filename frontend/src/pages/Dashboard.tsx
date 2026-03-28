import { useState } from "react";
import type { Session } from "../types";
import { useSessions } from "../hooks/useSessions";
import { usePatients } from "../hooks/usePatients";
import { useToast } from "../context/ToastContext";
import PatientCard from "../components/PatientCard";
import SessionForm from "../components/SessionForm";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";

export default function Dashboard() {
    const { sessions, loading, error, refresh, lastUpdated } = useSessions();
    const { patients } = usePatients();
    const { showToast } = useToast();

    const [showForm, setShowForm] = useState(false);
    const [editingSession, setEditingSession] = useState<Session | null>(null);
    const [defaultPatientId, setDefaultPatientId] = useState<string>("");
    const [onlyAnomalies, setOnlyAnomalies] = useState(false);

    const handleAddSession = (patientId: string) => {
        setDefaultPatientId(patientId);
        setEditingSession(null);
        setShowForm(true);
    };

    const handleEditSession = (session: Session) => {
        setEditingSession(session);
        setDefaultPatientId("");
        setShowForm(true);
    };

    const handleFormSuccess = (wasEditing: boolean) => {
        refresh();
        showToast(
            wasEditing ? "Session updated successfully" : "Session created successfully",
            "success"
        );
    };

    const filteredSessions = onlyAnomalies
        ? sessions.filter((s) => s.anomalies.length > 0)
        : sessions;

    // Stats
    const totalSessions = sessions.length;
    const anomalySessions = sessions.filter((s) => s.anomalies.length > 0).length;
    const completedSessions = sessions.filter((s) => s.status === "completed").length;
    const inProgressSessions = sessions.filter((s) => s.status === "in_progress").length;

    return (
        <div className="max-w-7xl mx-auto px-6 py-6">
            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-fade-in-up">
                <StatCard label="Today's Sessions" value={totalSessions} color="text-slate-700" />
                <StatCard label="In Progress" value={inProgressSessions} color="text-amber-600" />
                <StatCard label="Completed" value={completedSessions} color="text-emerald-600" />
                <StatCard
                    label="Anomalies Detected"
                    value={anomalySessions}
                    color="text-red-500"
                    highlight={anomalySessions > 0}
                />
            </div>

            {/* Filter Bar */}
            <div
                className="flex flex-wrap items-center justify-between gap-3 mb-5 animate-fade-in-up"
                style={{ animationDelay: "80ms" }}
            >
                <div className="flex items-center gap-3">
                    <h2 className="text-slate-700 font-semibold text-sm">
                        {onlyAnomalies ? "Patients with Anomalies" : "All Patients Today"}
                        <span className="ml-2 text-slate-400 font-normal">
                            ({filteredSessions.length})
                        </span>
                    </h2>
                    {lastUpdated && (
                        <span className="hidden sm:flex items-center gap-1.5 text-slate-400 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-live-dot" />
                            Updated {lastUpdated.toLocaleTimeString()}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setOnlyAnomalies((prev) => !prev)}
                        className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg border transition-colors ${onlyAnomalies
                                ? "bg-red-50 border-red-200 text-red-600"
                                : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                            }`}
                    >
                        <span
                            className={`w-2 h-2 rounded-full ${onlyAnomalies ? "bg-red-500" : "bg-slate-300"
                                }`}
                        />
                        {onlyAnomalies ? "Showing anomalies only" : "Filter: Anomalies only"}
                        {anomalySessions > 0 && (
                            <span className="bg-red-500 text-white text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-mono leading-none">
                                {anomalySessions}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => {
                            setEditingSession(null);
                            setDefaultPatientId("");
                            setShowForm(true);
                        }}
                        className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                    >
                        <span>+</span> New Session
                    </button>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="mb-4 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs">
                    ⚠️ {error} — Showing last known data.
                </div>
            )}

            {/* Content */}
            {loading ? (
                <Spinner />
            ) : filteredSessions.length === 0 ? (
                <EmptyState
                    title={onlyAnomalies ? "No anomalies found" : "No sessions today"}
                    description={
                        onlyAnomalies
                            ? "All patients are within normal parameters. Great work!"
                            : "No sessions are scheduled for today. Add a new session to get started."
                    }
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredSessions.map((session, i) => (
                        <div
                            key={session._id}
                            className="animate-fade-in-up"
                            style={{ animationDelay: `${(i + 2) * 60}ms` }}
                        >
                            <PatientCard
                                session={session}
                                onAddSession={handleAddSession}
                                onEditNotes={handleEditSession}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Session Form Modal */}
            {showForm && (
                <SessionForm
                    patients={patients}
                    editingSession={editingSession}
                    defaultPatientId={defaultPatientId}
                    onSuccess={handleFormSuccess}
                    onClose={() => setShowForm(false)}
                />
            )}
        </div>
    );
}

/* ── Stat card helper ── */
function StatCard({
    label,
    value,
    color,
    highlight = false,
}: {
    label: string;
    value: number;
    color: string;
    highlight?: boolean;
}) {
    return (
        <div
            className={`bg-white rounded-xl px-5 py-4 border transition-all ${highlight ? "border-red-100 shadow-red-50 shadow-md" : "border-slate-100"
                }`}
        >
            <p className="text-slate-400 text-xs mb-1">{label}</p>
            <p className={`font-mono font-bold text-2xl ${color}`}>{value}</p>
        </div>
    );
}