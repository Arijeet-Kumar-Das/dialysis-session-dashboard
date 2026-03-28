import type { Session } from "../types";
import StatusBadge from "./ui/Badge";
import AnomalyBadge from "./AnomalyBadge";

interface PatientCardProps {
    session: Session;
    onAddSession: (patientId: string) => void;
    onEditNotes: (session: Session) => void;
}

export default function PatientCard({
    session,
    onAddSession,
    onEditNotes,
}: PatientCardProps) {
    const patient = session.patientId;
    const hasAnomalies = session.anomalies.length > 0;

    return (
        <div
            className={`bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md ${hasAnomalies ? "border-l-4 border-l-red-400 border-r border-t border-b border-slate-100" : "border border-slate-100"
                }`}
        >
            {/* Card Header */}
            <div className="flex items-start justify-between px-5 pt-5 pb-3">
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-semibold text-sm">
                            {patient.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-800 text-sm leading-tight">
                            {patient.name}
                        </h3>
                        <p className="text-slate-400 text-xs mt-0.5">
                            {patient.age} yrs · {patient.gender} · Dry wt:{" "}
                            <span className="font-mono">{patient.dryWeight}kg</span>
                        </p>
                    </div>
                </div>
                <StatusBadge status={session.status} />
            </div>

            {/* Vitals Grid */}
            <div className="grid grid-cols-4 gap-px bg-slate-100 mx-5 rounded-lg overflow-hidden mb-4">
                <VitalCell label="Pre Wt" value={session.preWeight} unit="kg" />
                <VitalCell label="Post Wt" value={session.postWeight} unit="kg" />
                <VitalCell label="Sys BP" value={session.systolicBP} unit="mmHg" />
                <VitalCell label="Duration" value={session.durationMinutes} unit="min" />
            </div>

            {/* Machine ID + Notes */}
            <div className="px-5 pb-3 flex items-center gap-4 text-xs text-slate-400">
                {session.machineId && (
                    <span>
                        Machine:{" "}
                        <span className="font-mono text-slate-600">{session.machineId}</span>
                    </span>
                )}
                {session.nurseNotes && (
                    <span className="truncate max-w-xs italic">"{session.nurseNotes}"</span>
                )}
            </div>

            {/* Anomalies */}
            {hasAnomalies && (
                <div className="px-5 pb-3 flex flex-wrap gap-1.5">
                    {session.anomalies.map((anomaly, i) => (
                        <AnomalyBadge key={i} anomaly={anomaly} />
                    ))}
                </div>
            )}

            {/* Actions */}
            <div className="px-5 pb-4 pt-1 flex items-center gap-2 border-t border-slate-50">
                <button
                    onClick={() => onEditNotes(session)}
                    className="flex-1 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 py-2 rounded-lg transition-colors"
                >
                    Edit Notes
                </button>
                <button
                    onClick={() => onAddSession(patient._id)}
                    className="flex-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 py-2 rounded-lg transition-colors"
                >
                    + Add Session
                </button>
            </div>
        </div>
    );
}

// Small helper component for vitals
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
        <div className="bg-white px-3 py-2 text-center">
            <p className="text-slate-400 text-xs mb-0.5">{label}</p>
            {value !== undefined ? (
                <p className="font-mono text-slate-700 text-sm font-medium">
                    {value}
                    <span className="text-slate-400 text-xs ml-0.5">{unit}</span>
                </p>
            ) : (
                <p className="text-slate-300 text-sm">—</p>
            )}
        </div>
    );
}