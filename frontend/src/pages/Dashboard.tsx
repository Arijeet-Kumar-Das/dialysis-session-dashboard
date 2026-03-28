import { useState } from "react";
import type { Session } from "../types";
import { useSessions } from "../hooks/useSessions";
import { usePatients } from "../hooks/usePatients";
import PatientCard from "../components/PatientCard";
import SessionForm from "../components/SessionForm";
import Spinner from "../components/ui/Spinner"
import EmptyState from "../components/ui/EmptyState";
import PatientForm from "../components/PatientForm";

export default function Dashboard() {
    const { sessions, loading, error, refresh } = useSessions();
    const { patients } = usePatients();

    const [showForm, setShowForm] = useState(false);
    const [editingSession, setEditingSession] = useState<Session | null>(null);
    const [defaultPatientId, setDefaultPatientId] = useState<string>("");
    const [onlyAnomalies, setOnlyAnomalies] = useState(false);
    const [showPatientForm, setShowPatientForm] = useState(false);

    const handleAddSession = (patientId: string) => {
        setDefaultPatientId(patientId);
        setEditingSession(null);
        setShowForm(true);
    };

    const handleEditNotes = (session: Session) => {
        setEditingSession(session);
        setDefaultPatientId("");
        setShowForm(true);
    };

    const handleFormSuccess = () => {
        refresh();
    };

    const filteredSessions = onlyAnomalies
        ? sessions.filter((s) => s.anomalies.length > 0)
        : sessions;

    // Stats for header
    const totalSessions = sessions.length;
    const anomalySessions = sessions.filter((s) => s.anomalies.length > 0).length;
    const completedSessions = sessions.filter((s) => s.status === "completed").length;
    const inProgressSessions = sessions.filter((s) => s.status === "in_progress").length;

    return (
        <div className="min-h-screen bg-[#F0F2F5]">
            {/* Navbar */}
            <nav className="bg-[#0F1B2D] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-white font-semibold text-sm leading-tight">
                            Dialysis Dashboard
                        </h1>
                        <p className="text-slate-400 text-xs">Session Intake & Anomaly Monitor</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-xs">
                        {new Date().toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </span>
                    <button
                        onClick={() => setShowPatientForm(true)}
                        className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                    >
                        + Add Patient
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
            </nav>

            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-4 mb-6">
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
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-slate-700 font-semibold text-sm">
                        {onlyAnomalies ? "Patients with Anomalies" : "All Patients Today"}
                        <span className="ml-2 text-slate-400 font-normal">
                            ({filteredSessions.length})
                        </span>
                    </h2>
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
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <Spinner />
                ) : error ? (
                    <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-4 text-red-600 text-sm">
                        {error}
                    </div>
                ) : filteredSessions.length === 0 ? (
                    <EmptyState
                        title={onlyAnomalies ? "No anomalies found" : "No sessions today"}
                        description={
                            onlyAnomalies
                                ? "All patients are within normal parameters."
                                : "No sessions are scheduled for today. Add a new session to get started."
                        }
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredSessions.map((session) => (
                            <PatientCard
                                key={session._id}
                                session={session}
                                onAddSession={handleAddSession}
                                onEditNotes={handleEditNotes}
                            />
                        ))}
                    </div>
                )}
            </div>

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
            {showPatientForm && (
                <PatientForm
                    onSuccess={() => { }}
                    onClose={() => setShowPatientForm(false)}
                />
            )}
        </div>
    );
}

// Stat card helper
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