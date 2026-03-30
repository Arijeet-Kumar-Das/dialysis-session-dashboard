import { useState, useRef, useEffect } from "react";
import type { Session } from "../types";
import { useSessions } from "../hooks/useSessions";
import { usePatients } from "../hooks/usePatients";
import { useSocket } from "../hooks/useSocket";
import PatientCard from "../components/PatientCard";
import SessionForm from "../components/SessionForm";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";

const UNIT_OPTIONS = ["All Units", "Ward-A", "Ward-B", "ICU", "General"];

/* ── Date helpers ── */
function toDateString(d: Date): string {
    return d.toISOString().slice(0, 10);
}

function getTodayString(): string {
    return toDateString(new Date());
}

function shiftDate(dateStr: string, days: number): string {
    const d = new Date(dateStr + "T12:00:00");
    d.setDate(d.getDate() + days);
    return toDateString(d);
}

function formatReadableDate(dateStr: string): string {
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

type ViewMode = "grid" | "schedule";

export default function Dashboard() {
    const today = getTodayString();
    const [selectedDate, setSelectedDate] = useState(today);
    const [selectedUnit, setSelectedUnit] = useState("");
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const isToday = selectedDate === today;

    const { sessions, loading, error, refresh, lastUpdated } = useSessions(
        selectedDate,
        selectedUnit || undefined
    );
    const { patients, refresh: refreshPatients } = usePatients();

    // Real-time socket
    useSocket(refresh, refreshPatients);

    const [showForm, setShowForm] = useState(false);
    const [editingSession, setEditingSession] = useState<Session | null>(null);
    const [defaultPatientId, setDefaultPatientId] = useState<string>("");
    const [onlyAnomalies, setOnlyAnomalies] = useState(false);

    const handleAddSession = (patientId: string) => {
        refreshPatients();
        setDefaultPatientId(patientId);
        setEditingSession(null);
        setShowForm(true);
    };

    const handleEditSession = (session: Session) => {
        setEditingSession(session);
        setDefaultPatientId("");
        setShowForm(true);
    };

    const handleNewSession = () => {
        refreshPatients();
        setEditingSession(null);
        setDefaultPatientId("");
        setShowForm(true);
    };

    const handleFormSuccess = () => {
        refresh();
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
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-0">
            {/* ── Date Navigation Bar ── */}
            <div className="bg-white border-b border-slate-100 -mx-3 sm:-mx-6 px-3 sm:px-6 py-3 mb-4 sm:mb-6">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSelectedDate(shiftDate(selectedDate, -1))}
                            className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 px-2.5 sm:px-3 py-2 rounded-lg border border-slate-200 transition-colors"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className="hidden xs:inline">Prev Day</span>
                            <span className="xs:hidden">Prev</span>
                        </button>

                        <span className="text-xs sm:text-sm font-semibold text-slate-700 px-2 sm:px-3 text-center">
                            {formatReadableDate(selectedDate)}
                        </span>

                        <button
                            onClick={() => setSelectedDate(shiftDate(selectedDate, 1))}
                            disabled={isToday}
                            className={`flex items-center gap-1 text-xs font-medium px-2.5 sm:px-3 py-2 rounded-lg border transition-colors ${
                                isToday
                                    ? "text-slate-300 border-slate-100 cursor-not-allowed"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50 border-slate-200"
                            }`}
                        >
                            <span className="hidden xs:inline">Next Day</span>
                            <span className="xs:hidden">Next</span>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Today pill — only visible when not on today */}
                    {!isToday && (
                        <button
                            onClick={() => setSelectedDate(today)}
                            className="flex items-center gap-1.5 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 px-3 py-1.5 rounded-full transition-colors"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Jump to Today
                        </button>
                    )}
                </div>
            </div>

            {/* Past-date banner */}
            {!isToday && (
                <div className="mb-4 px-3 sm:px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs animate-fade-in-up">
                    📅 Viewing records for <span className="font-semibold">{formatReadableDate(selectedDate)}</span> — not today's live data.
                </div>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6 animate-fade-in-up">
                <StatCard
                    label={isToday ? "Today's Sessions" : "Sessions"}
                    value={totalSessions}
                    color="text-slate-700"
                />
                <StatCard label="In Progress" value={inProgressSessions} color="text-amber-600" />
                <StatCard label="Completed" value={completedSessions} color="text-emerald-600" />
                <StatCard
                    label="Anomalies"
                    value={anomalySessions}
                    color="text-red-500"
                    highlight={anomalySessions > 0}
                />
            </div>

            {/* Filter Bar — stacks nicely on mobile */}
            <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 animate-fade-in-up"
                style={{ animationDelay: "80ms" }}
            >
                {/* Title + Updated */}
                <div className="flex items-center gap-3 min-w-0">
                    <h2 className="text-slate-700 font-semibold text-sm whitespace-nowrap">
                        {onlyAnomalies ? "Anomalies" : isToday ? "All Patients Today" : "All Patients"}
                        <span className="ml-1.5 text-slate-400 font-normal">
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

                {/* Controls row — wraps into 2 lines on mobile */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* View Toggle */}
                    <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors ${
                                viewMode === "grid"
                                    ? "bg-white text-slate-700 shadow-sm"
                                    : "text-slate-400 hover:text-slate-600"
                            }`}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                            Grid
                        </button>
                        <button
                            onClick={() => setViewMode("schedule")}
                            className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors ${
                                viewMode === "schedule"
                                    ? "bg-white text-slate-700 shadow-sm"
                                    : "text-slate-400 hover:text-slate-600"
                            }`}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Schedule
                        </button>
                    </div>

                    {/* Unit Filter */}
                    <select
                        value={selectedUnit}
                        onChange={(e) => setSelectedUnit(e.target.value)}
                        className="text-xs font-medium px-2.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    >
                        {UNIT_OPTIONS.map((u) => (
                            <option key={u} value={u === "All Units" ? "" : u}>
                                {u}
                            </option>
                        ))}
                    </select>

                    {/* Anomaly Filter — compact on mobile */}
                    <button
                        onClick={() => setOnlyAnomalies((prev) => !prev)}
                        className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-2 rounded-lg border transition-colors ${
                            onlyAnomalies
                                ? "bg-red-50 border-red-200 text-red-600"
                                : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                        }`}
                    >
                        <span
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                onlyAnomalies ? "bg-red-500" : "bg-slate-300"
                            }`}
                        />
                        <span className="hidden sm:inline">
                            {onlyAnomalies ? "Showing anomalies" : "Anomalies only"}
                        </span>
                        <span className="sm:hidden">
                            {onlyAnomalies ? "Anomalies" : "Anomalies"}
                        </span>
                        {anomalySessions > 0 && (
                            <span className="bg-red-500 text-white text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-mono leading-none">
                                {anomalySessions}
                            </span>
                        )}
                    </button>

                    {/* New Session — full width on very small screens */}
                    <button
                        onClick={handleNewSession}
                        className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
                    >
                        <span>+</span> New Session
                    </button>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="mb-4 px-3 sm:px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs">
                    ⚠️ {error} — Showing last known data.
                </div>
            )}

            {/* Content */}
            {loading ? (
                <Spinner />
            ) : filteredSessions.length === 0 ? (
                <EmptyState
                    title={onlyAnomalies ? "No anomalies found" : isToday ? "No sessions today" : "No sessions on this date"}
                    description={
                        onlyAnomalies
                            ? "All patients are within normal parameters. Great work!"
                            : isToday
                                ? "No sessions are scheduled for today. Add a new session to get started."
                                : `No sessions were recorded for ${formatReadableDate(selectedDate)}.`
                    }
                />
            ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
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
                                onDelete={refresh}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <ScheduleTimeline
                    sessions={filteredSessions}
                    onEditSession={handleEditSession}
                />
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
            className={`bg-white rounded-xl px-3 sm:px-5 py-3 sm:py-4 border transition-all ${
                highlight ? "border-red-100 shadow-red-50 shadow-md" : "border-slate-100"
            }`}
        >
            <p className="text-slate-400 text-[11px] sm:text-xs mb-1 truncate">{label}</p>
            <p className={`font-mono font-bold text-xl sm:text-2xl ${color}`}>{value}</p>
        </div>
    );
}

/* ── Schedule Timeline View ── */
const TIMELINE_START = 6; // 06:00
const TIMELINE_END = 22; // 22:00

function ScheduleTimeline({
    sessions,
    onEditSession,
}: {
    sessions: Session[];
    onEditSession: (s: Session) => void;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const nowLineRef = useRef<HTMLDivElement>(null);

    // Group sessions by hour
    const sessionsByHour: Record<number, Session[]> = {};
    for (let h = TIMELINE_START; h <= TIMELINE_END; h++) {
        sessionsByHour[h] = [];
    }
    sessions.forEach((s) => {
        const date = new Date(s.scheduledDate);
        const hour = date.getHours();
        if (hour >= TIMELINE_START && hour <= TIMELINE_END) {
            sessionsByHour[hour].push(s);
        }
    });

    // Current time for the indicator
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const showNowLine = currentHour >= TIMELINE_START && currentHour <= TIMELINE_END;

    // Auto-scroll to current time
    useEffect(() => {
        if (nowLineRef.current) {
            nowLineRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, []);

    const hours = [];
    for (let h = TIMELINE_START; h <= TIMELINE_END; h++) {
        hours.push(h);
    }

    return (
        <div ref={containerRef} className="bg-white rounded-xl border border-slate-100 overflow-hidden animate-fade-in-up">
            <div className="relative">
                {hours.map((hour) => {
                    const isCurrentHour = showNowLine && hour === currentHour;
                    const sessionsInSlot = sessionsByHour[hour];

                    return (
                        <div key={hour} className="relative">
                            {/* Current time line */}
                            {isCurrentHour && (
                                <div
                                    ref={nowLineRef}
                                    className="absolute left-0 right-0 z-10 pointer-events-none"
                                    style={{ top: `${(currentMinute / 60) * 100}%` }}
                                >
                                    <div className="flex items-center">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 -ml-1 flex-shrink-0" />
                                        <div className="flex-1 h-[2px] bg-blue-500" />
                                    </div>
                                </div>
                            )}

                            <div className={`flex border-b border-slate-50 min-h-[64px] sm:min-h-[72px] ${isCurrentHour ? "bg-blue-50/30" : ""}`}>
                                {/* Time label */}
                                <div className="w-14 sm:w-20 flex-shrink-0 px-2 sm:px-4 py-3 border-r border-slate-100">
                                    <span className="font-mono text-[11px] sm:text-xs text-slate-400">
                                        {hour.toString().padStart(2, "0")}:00
                                    </span>
                                </div>

                                {/* Session cards */}
                                <div className="flex-1 px-2 sm:px-3 py-2 min-w-0">
                                    {sessionsInSlot.length === 0 ? (
                                        <p className="text-slate-300 text-xs py-2">No sessions</p>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {sessionsInSlot.map((session) => (
                                                <TimelineCard
                                                    key={session._id}
                                                    session={session}
                                                    onClick={() => onEditSession(session)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ── Timeline slot card ── */
function TimelineCard({ session, onClick }: { session: Session; onClick: () => void }) {
    const hasAnomaly = session.anomalies.length > 0;

    const statusStyles: Record<string, string> = {
        not_started: "bg-slate-50",
        in_progress: "bg-amber-50",
        completed: "bg-emerald-50",
    };

    const statusBadge: Record<string, { bg: string; text: string; label: string }> = {
        not_started: { bg: "bg-slate-100", text: "text-slate-600", label: "Not Started" },
        in_progress: { bg: "bg-amber-100", text: "text-amber-700", label: "In Progress" },
        completed: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Completed" },
    };

    const badge = statusBadge[session.status] ?? statusBadge.not_started;
    const bg = statusStyles[session.status] ?? statusStyles.not_started;

    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 sm:gap-3 ${bg} rounded-lg px-2.5 sm:px-3 py-2 text-left hover:shadow-sm transition-all cursor-pointer border border-transparent hover:border-slate-200 ${
                hasAnomaly ? "border-l-[3px] !border-l-red-400" : ""
            }`}
        >
            <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-slate-700 truncate">
                    {session.patientId.name}
                </p>
                <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 flex-wrap">
                    {session.machineId && (
                        <span className="text-[10px] font-mono text-slate-400">
                            {session.machineId}
                        </span>
                    )}
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
                        {badge.label}
                    </span>
                    {hasAnomaly && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">
                            {session.anomalies.length} anomal{session.anomalies.length === 1 ? "y" : "ies"}
                        </span>
                    )}
                </div>
            </div>
            <svg className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
        </button>
    );
}