import { useState } from "react";
import type { Patient, Session } from "../types";
import { createSession, updateSession } from "../api/sessions";

interface SessionFormProps {
    patients: Patient[];
    editingSession?: Session | null;   // if set → edit notes mode
    defaultPatientId?: string;         // pre-select patient
    onSuccess: () => void;
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
            }
            onSuccess();
            onClose();
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        // Backdrop
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h2 className="font-semibold text-slate-800">
                        {isEditMode ? "Edit Session" : "Add New Session"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-4 space-y-4">
                    {/* Patient Select — only in create mode */}
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

                    {/* Scheduled Date — only in create mode */}
                    {!isEditMode && (
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">
                                Scheduled Date & Time *
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

                    {/* Machine ID */}
                    <FormInput label="Machine ID" name="machineId" value={form.machineId} onChange={handleChange} placeholder="e.g. M-101" />

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

                    {/* Error */}
                    {error && (
                        <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">
                            {error}
                        </p>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
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

// Small reusable input
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