import { useState } from "react";
import type { Patient, Session } from "../types";
import { createSession, updateSession } from "../api/sessions";
import { useToast } from "../context/ToastContext";
import { detectAnomaliesClient } from "../utils/anomalyDetector";
import {
    validateWeight,
    validatePostWeight,
    validateBP,
    validateDuration,
    validateMachineId,
    validateNurseNotes,
} from "../utils/validators";

interface SessionFormProps {
    patients: Patient[];
    editingSession?: Session | null;
    defaultPatientId?: string;
    onSuccess: (wasEditing: boolean) => void;
    onClose: () => void;
}

type FieldErrors = Record<string, string | null>;

function borderClass(value: string, error: string | null | undefined, touched: boolean): string {
    if (error) return "border-red-400";
    if (touched && value.trim()) return "border-emerald-400";
    return "border-slate-200";
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
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        // Clear/revalidate on change
        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
        }
        // Re-check postWeight when preWeight changes
        if (name === "preWeight" && fieldErrors.postWeight) {
            setFieldErrors((prev) => ({
                ...prev,
                postWeight: validatePostWeight(form.postWeight, value),
            }));
        }
    };

    const validateField = (name: string, value: string): string | null => {
        switch (name) {
            case "patientId":
                return !isEditMode && !value ? "Please select a patient" : null;
            case "scheduledDate":
                return !isEditMode && !value ? "Scheduled date is required" : null;
            case "preWeight":
                return validateWeight(value, "Pre weight");
            case "postWeight":
                return validatePostWeight(value, form.preWeight);
            case "systolicBP":
                return validateBP(value);
            case "durationMinutes":
                return validateDuration(value);
            case "machineId":
                return validateMachineId(value);
            case "nurseNotes":
                return validateNurseNotes(value);
            default:
                return null;
        }
    };

    const handleBlur = (name: string) => {
        setTouched((prev) => ({ ...prev, [name]: true }));
        setFieldErrors((prev) => ({
            ...prev,
            [name]: validateField(name, form[name as keyof typeof form]),
        }));
    };

    const validateAll = (): boolean => {
        const errors: FieldErrors = {};
        const fieldsToValidate = isEditMode
            ? ["preWeight", "postWeight", "systolicBP", "durationMinutes", "machineId", "nurseNotes"]
            : ["patientId", "scheduledDate", "preWeight", "postWeight", "systolicBP", "durationMinutes", "machineId", "nurseNotes"];

        const allTouched: Record<string, boolean> = {};
        fieldsToValidate.forEach((f) => {
            errors[f] = validateField(f, form[f as keyof typeof form]);
            allTouched[f] = true;
        });

        setFieldErrors(errors);
        setTouched((prev) => ({ ...prev, ...allTouched }));
        return !Object.values(errors).some(Boolean);
    };

    const hasErrors = Object.values(fieldErrors).some(Boolean);

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
        if (!validateAll()) return;

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
                                onBlur={() => handleBlur("patientId")}
                                className={`w-full border ${borderClass(form.patientId, fieldErrors.patientId, !!touched.patientId)} rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                            >
                                <option value="">Select patient...</option>
                                {patients.map((p) => (
                                    <option key={p._id} value={p._id}>
                                        {p.name} — dry wt: {p.dryWeight}kg
                                    </option>
                                ))}
                            </select>
                            {fieldErrors.patientId && <p className="text-red-500 text-xs mt-1">{fieldErrors.patientId}</p>}
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
                                onBlur={() => handleBlur("scheduledDate")}
                                className={`w-full border ${borderClass(form.scheduledDate, fieldErrors.scheduledDate, !!touched.scheduledDate)} rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                            />
                            {fieldErrors.scheduledDate && <p className="text-red-500 text-xs mt-1">{fieldErrors.scheduledDate}</p>}
                        </div>
                    )}

                    {/* Vitals Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <ValidatedInput
                            label="Pre Weight (kg)"
                            name="preWeight"
                            value={form.preWeight}
                            error={fieldErrors.preWeight}
                            touched={!!touched.preWeight}
                            onChange={handleChange}
                            onBlur={() => handleBlur("preWeight")}
                            placeholder="e.g. 74.5"
                        />
                        <ValidatedInput
                            label="Post Weight (kg)"
                            name="postWeight"
                            value={form.postWeight}
                            error={fieldErrors.postWeight}
                            touched={!!touched.postWeight}
                            onChange={handleChange}
                            onBlur={() => handleBlur("postWeight")}
                            placeholder="e.g. 71.0"
                        />
                        <ValidatedInput
                            label="Systolic BP (mmHg)"
                            name="systolicBP"
                            value={form.systolicBP}
                            error={fieldErrors.systolicBP}
                            touched={!!touched.systolicBP}
                            onChange={handleChange}
                            onBlur={() => handleBlur("systolicBP")}
                            placeholder="e.g. 140"
                        />
                        <ValidatedInput
                            label="Duration (min)"
                            name="durationMinutes"
                            value={form.durationMinutes}
                            error={fieldErrors.durationMinutes}
                            touched={!!touched.durationMinutes}
                            onChange={handleChange}
                            onBlur={() => handleBlur("durationMinutes")}
                            placeholder="e.g. 240"
                        />
                    </div>

                    {/* Machine ID */}
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">
                            Machine ID
                        </label>
                        <input
                            type="text"
                            name="machineId"
                            value={form.machineId}
                            onChange={handleChange}
                            onBlur={() => handleBlur("machineId")}
                            placeholder="e.g. M-101"
                            maxLength={20}
                            className={`w-full border ${borderClass(form.machineId, fieldErrors.machineId, !!touched.machineId)} rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                        />
                        {fieldErrors.machineId && <p className="text-red-500 text-xs mt-1">{fieldErrors.machineId}</p>}
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
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-medium text-slate-500">
                                Nurse Notes
                            </label>
                            <span className={`text-xs font-mono ${form.nurseNotes.length > 500 ? "text-red-500" : "text-slate-400"}`}>
                                {form.nurseNotes.length}/500
                            </span>
                        </div>
                        <textarea
                            name="nurseNotes"
                            value={form.nurseNotes}
                            onChange={handleChange}
                            onBlur={() => handleBlur("nurseNotes")}
                            rows={3}
                            placeholder="Any observations or notes..."
                            className={`w-full border ${borderClass(form.nurseNotes, fieldErrors.nurseNotes, !!touched.nurseNotes)} rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors`}
                        />
                        {fieldErrors.nurseNotes && <p className="text-red-500 text-xs mt-1">{fieldErrors.nurseNotes}</p>}
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
                        disabled={loading || hasErrors}
                        className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {loading ? "Saving..." : isEditMode ? "Save Changes" : "Create Session"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Reusable validated number input ── */
function ValidatedInput({
    label,
    name,
    value,
    error,
    touched,
    onChange,
    onBlur,
    placeholder,
}: {
    label: string;
    name: string;
    value: string;
    error: string | null | undefined;
    touched: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
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
                onBlur={onBlur}
                placeholder={placeholder}
                className={`w-full border ${borderClass(value, error, touched)} rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}