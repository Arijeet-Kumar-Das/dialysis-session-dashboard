import { useState } from "react";
import type { Patient, Session } from "../types";
import { createSession, updateSession } from "../api/sessions";
import { useToast } from "../context/ToastContext";
import { detectAnomaliesClient } from "../utils/anomalyDetector";

interface SessionFormProps {
    patients: Patient[];
    editingSession?: Session | null;
    defaultPatientId?: string;
    onSuccess: (wasEditing: boolean) => void;
    onClose: () => void;
}

export default function SessionForm({
    patients,
    editingSession,
    defaultPatientId,
    onSuccess,
    onClose,
}: SessionFormProps) {
    const isEditMode = !!editingSession;
    const { showToast } = useToast();

    const [form, setForm] = useState({
        patientId: defaultPatientId ?? editingSession?.patientId._id ?? "",
        scheduledDate: new Date().toISOString().slice(0, 16),
        preWeight: editingSession?.preWeight?.toString() ?? "",
        postWeight: editingSession?.postWeight?.toString() ?? "",
        systolicBP: editingSession?.systolicBP?.toString() ?? "",
        durationMinutes: editingSession?.durationMinutes?.toString() ?? "",
        machineId: editingSession?.machineId ?? "",
        nurseNotes: editingSession?.nurseNotes ?? "",
        status: editingSession?.status ?? "not_started",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // ── Live anomaly preview ──
    const selectedPatient = patients.find((p) => p._id === form.patientId);
    const dryWeight = isEditMode
        ? editingSession.patientId.dryWeight
        : selectedPatient?.dryWeight ?? 0;

    const liveAnomalies = detectAnomaliesClient(
        {
            preWeight: form.preWeight ? Number(form.preWeight) : undefined,
            systolicBP: form.systolicBP ? Number(form.systolicBP) : undefined,
            durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : undefined,
        },
        dryWeight
    );

    const handleSubmit = async () => {
        setError(null);

        if (!isEditMode && !form.patientId) {
            setError("Please select a patient");
            return;
        }

        setLoading(true);
        try {
            if (isEditMode) {
                await updateSession(editingSession._id, {
                    nurseNotes: form.nurseNotes,
                    status: form.status as Session["status"],
                    preWeight: form.preWeight ? Number(form.preWeight) : undefined,
                    postWeight: form.postWeight ? Number(form.postWeight) : undefined,
                    systolicBP: form.systolicBP ? Number(form.systolicBP) : undefined,
                    durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : undefined,
                    machineId: form.machineId || undefined,
                });
                showToast("Session updated successfully", "success");
            } else {
                await createSession({
                    patientId: form.patientId,
                    scheduledDate: new Date(form.scheduledDate).toISOString(),
                    preWeight: form.preWeight ? Number(form.preWeight) : undefined,
                    postWeight: form.postWeight ? Number(form.postWeight) : undefined,
                    systolicBP: form.systolicBP ? Number(form.systolicBP) : undefined,
                    durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : undefined,
                    machineId: form.machineId || undefined,
                    nurseNotes: form.nurseNotes || undefined,
                    status: form.status,
                });
                showToast("Session created successfully", "success");
            }
            onSuccess(isEditMode);
            onClose();
        } catch {
            showToast("Failed to save session. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
                    <div>
                        <h2 className="font-semibold text-slate-800">
                            {isEditMode ? "Edit Session" : "New Session"}
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {isEditMode
                                ? `Updating session for ${editingSession.patientId.name}`
                                : "Record a new dialysis session"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-4 space-y-4">
                    {/* Patient Select */}
                    {!isEditMode && (
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">
                                Patient *
                            </label>
                            <select
                                name="patientId"
                                value={form.patientId}
                                onChange={handleChange}
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select patient...</option>
                                {patients.map((p) => (
                                    <option key={p._id} value={p._id}>
                                        {p.name} — dry wt: {p.dryWeight}kg
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Scheduled Date */}
                    {!isEditMode && (
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">
                                Scheduled Date &amp; Time *
                            </label>
                            <input
                                type="datetime-local"
                                name="scheduledDate"
                                value={form.scheduledDate}
                                onChange={handleChange}
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}

                    {/* Vitals Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <FormInput label="Pre Weight (kg)" name="preWeight" value={form.preWeight} onChange={handleChange} placeholder="e.g. 74.5" />
                        <FormInput label="Post Weight (kg)" name="postWeight" value={form.postWeight} onChange={handleChange} placeholder="e.g. 71.0" />
                        <FormInput label="Systolic BP (mmHg)" name="systolicBP" value={form.systolicBP} onChange={handleChange} placeholder="e.g. 140" />
                        <FormInput label="Duration (min)" name="durationMinutes" value={form.durationMinutes} onChange={handleChange} placeholder="e.g. 240" />
                    </div>

                    {/* Machine ID — text input, not number */}
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">
                            Machine ID
                        </label>
                        <input
                            type="text"
                            name="machineId"
                            value={form.machineId}
                            onChange={handleChange}
                            placeholder="e.g. M-101"
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">
                            Status
                        </label>
                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="not_started">Not Started</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    {/* Nurse Notes */}
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">
                            Nurse Notes
                        </label>
                        <textarea
                            name="nurseNotes"
                            value={form.nurseNotes}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Any observations or notes..."
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>

                    {/* ── Live Anomaly Preview ── */}
                    {liveAnomalies.length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 animate-fade-in-up">
                            <div className="flex items-center gap-2 mb-2">
                                <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd"
                                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                        clipRule="evenodd" />
                                </svg>
                                <p className="text-amber-700 text-xs font-semibold">
                                    {liveAnomalies.length} anomal{liveAnomalies.length === 1 ? "y" : "ies"} detected
                                </p>
                            </div>
                            <ul className="space-y-1">
                                {liveAnomalies.map((a, i) => (
                                    <li key={i} className="text-amber-600 text-xs pl-6">• {a}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Inline validation error */}
                    {error && (
                        <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">
                            {error}
                        </p>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 flex gap-3 sticky bottom-0 bg-white rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 rounded-lg border border-slate-200 text-sm text-slate-500 hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {loading ? "Saving..." : isEditMode ? "Save Changes" : "Create Session"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Reusable number input ── */
function FormInput({
    label,
    name,
    value,
    onChange,
    placeholder,
}: {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
}) {
    return (
        <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
                {label}
            </label>
            <input
                type="number"
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
    );
}