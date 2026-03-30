import { useState } from "react";
import type { Session } from "../types";
import StatusBadge from "./ui/Badge";
import AnomalyBadge from "./AnomalyBadge";
import { deleteSession } from "../api/sessions";
import { useToast } from "../context/ToastContext";

interface PatientCardProps {
    session: Session;
    onAddSession: (patientId: string) => void;
    onEditNotes: (session: Session) => void;
    onDelete?: () => void;
}

export default function PatientCard({
    session,
    onAddSession,
    onEditNotes,
    onDelete,
}: PatientCardProps) {
    const patient = session.patientId;
    const hasAnomalies = session.anomalies.length > 0;
    const { showToast } = useToast();
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await deleteSession(session._id);
            showToast("Session deleted successfully", "success");
            onDelete?.();
        } catch {
            showToast("Failed to delete session", "error");
        } finally {
            setDeleting(false);
            setConfirmDelete(false);
        }
    };

    return (
        <div
            className={`bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md ${
                hasAnomalies
                    ? "border-l-4 border-l-red-400 border-r border-t border-b border-slate-100 anomaly-pulse"
                    : "border border-slate-100"
            }`}
        >
            {/* Card Header */}
            <div className="flex items-start justify-between px-3 sm:px-5 pt-4 sm:pt-5 pb-2 sm:pb-3">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    {/* Avatar */}
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-semibold text-sm">
                            {patient.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-semibold text-slate-800 text-sm leading-tight truncate">
                            {patient.name}
                        </h3>
                        <p className="text-slate-400 text-[11px] sm:text-xs mt-0.5 truncate">
                            {patient.age} yrs · {patient.gender} · Dry wt:{" "}
                            <span className="font-mono">{patient.dryWeight}kg</span>
                        </p>
                    </div>
                </div>
                <StatusBadge status={session.status} />
            </div>

            {/* Vitals Grid — 2 cols on tiny, 4 cols on sm+ */}
            <div className="grid grid-cols-4 gap-px bg-slate-100 mx-3 sm:mx-5 rounded-lg overflow-hidden mb-3 sm:mb-4">
                <VitalCell label="Pre Wt" value={session.preWeight} unit="kg" />
                <VitalCell label="Post Wt" value={session.postWeight} unit="kg" />
                <VitalCell label="Sys BP" value={session.systolicBP} unit="mmHg" />
                <VitalCell label="Duration" value={session.durationMinutes} unit="min" />
            </div>

            {/* Machine ID + Unit + Notes */}
            <div className="px-3 sm:px-5 pb-2 sm:pb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                {session.machineId && (
                    <span className="whitespace-nowrap">
                        Machine:{" "}
                        <span className="font-mono text-slate-600">{session.machineId}</span>
                    </span>
                )}
                {session.unit && (
                    <span className="whitespace-nowrap">
                        Unit:{" "}
                        <span className="font-medium text-slate-600">{session.unit}</span>
                    </span>
                )}
                {session.nurseNotes && (
                    <span className="truncate italic" style={{ maxWidth: "100%" }}>"{session.nurseNotes}"</span>
                )}
            </div>

            {/* Anomalies */}
            {hasAnomalies && (
                <div className="px-3 sm:px-5 pb-2 sm:pb-3 flex flex-wrap gap-1.5">
                    {session.anomalies.map((anomaly, i) => (
                        <AnomalyBadge key={i} anomaly={anomaly} />
                    ))}
                </div>
            )}

            {/* Delete Confirmation */}
            {confirmDelete && (
                <div className="mx-3 sm:mx-5 mb-2 sm:mb-3 bg-red-50 border border-red-100 rounded-lg px-3 py-2 flex items-center justify-between">
                    <p className="text-red-600 text-xs">Delete this session?</p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setConfirmDelete(false)}
                            className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="text-xs text-red-600 font-medium hover:bg-red-100 px-2 py-1 rounded transition-colors disabled:opacity-50"
                        >
                            {deleting ? "Deleting..." : "Confirm"}
                        </button>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="px-3 sm:px-5 pb-3 sm:pb-4 pt-1 flex items-center gap-1 border-t border-slate-50">
                <button
                    onClick={() => onEditNotes(session)}
                    className="flex-1 text-[11px] sm:text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 py-2 rounded-lg transition-colors"
                >
                    Edit Session
                </button>
                <button
                    onClick={() => setConfirmDelete(true)}
                    className="text-[11px] sm:text-xs font-medium text-red-400 hover:text-red-600 hover:bg-red-50 py-2 px-2 sm:px-3 rounded-lg transition-colors"
                >
                    Delete
                </button>
                <button
                    onClick={() => onAddSession(patient._id)}
                    className="flex-1 text-[11px] sm:text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 py-2 rounded-lg transition-colors"
                >
                    + Add Session
                </button>
            </div>
        </div>
    );
}

function VitalCell({
    label,
    value,
    unit,
}: {
    label: string;
    value?: number;
    unit: string;
}) {
    return (
        <div className="bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-center">
            <p className="text-slate-400 text-[10px] sm:text-xs mb-0.5 truncate">{label}</p>
            {value !== undefined ? (
                <p className="font-mono text-slate-700 text-xs sm:text-sm font-medium">
                    {value}
                    <span className="text-slate-400 text-[10px] sm:text-xs ml-0.5">{unit}</span>
                </p>
            ) : (
                <p className="text-slate-300 text-xs sm:text-sm">—</p>
            )}
        </div>
    );
}