import { useState } from "react";
import type { Patient } from "../types";
import { createPatient, updatePatient } from "../api/patients";
import { useToast } from "../context/ToastContext";
import {
    validateName,
    validateAge,
    validateDryWeight,
    validateContactNumber,
} from "../utils/validators";

interface PatientFormProps {
    editingPatient?: Patient | null;
    onSuccess: () => void;
    onClose: () => void;
}

type FieldErrors = Record<string, string | null>;

function borderClass(value: string, error: string | null | undefined, touched: boolean): string {
    if (error) return "border-red-400";
    if (touched && value.trim()) return "border-emerald-400";
    return "border-slate-200";
}

export default function PatientForm({ editingPatient, onSuccess, onClose }: PatientFormProps) {
    const isEditMode = !!editingPatient;
    const { showToast } = useToast();
    const [form, setForm] = useState({
        name: editingPatient?.name ?? "",
        age: editingPatient?.age?.toString() ?? "",
        gender: editingPatient?.gender ?? "male",
        dryWeight: editingPatient?.dryWeight?.toString() ?? "",
        contactNumber: editingPatient?.contactNumber ?? "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        // Clear error on change
        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
        }
    };

    const validateField = (name: string, value: string): string | null => {
        switch (name) {
            case "name": return validateName(value);
            case "age": return validateAge(value);
            case "dryWeight": return validateDryWeight(value);
            case "contactNumber": return validateContactNumber(value);
            default: return null;
        }
    };

    const handleBlur = (name: string) => {
        setTouched((prev) => ({ ...prev, [name]: true }));
        setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, form[name as keyof typeof form]) }));
    };

    const validateAll = (): boolean => {
        const errors: FieldErrors = {
            name: validateName(form.name),
            age: validateAge(form.age),
            dryWeight: validateDryWeight(form.dryWeight),
            contactNumber: validateContactNumber(form.contactNumber),
        };
        setFieldErrors(errors);
        setTouched({ name: true, age: true, dryWeight: true, contactNumber: true });
        return !Object.values(errors).some(Boolean);
    };

    const hasErrors = Object.values(fieldErrors).some(Boolean);

    const handleSubmit = async () => {
        setError(null);
        if (!validateAll()) return;

        setLoading(true);
        try {
            const payload = {
                name: form.name.trim(),
                age: Number(form.age),
                gender: form.gender as "male" | "female" | "other",
                dryWeight: Number(form.dryWeight),
                contactNumber: form.contactNumber.trim() || undefined,
            };

            if (isEditMode) {
                await updatePatient(editingPatient._id, payload);
                showToast("Patient updated successfully", "success");
            } else {
                await createPatient(payload);
                showToast("Patient added successfully", "success");
            }
            onSuccess();
            onClose();
        } catch {
            showToast(
                isEditMode
                    ? "Failed to update patient. Please try again."
                    : "Failed to create patient. Please try again.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div>
                        <h2 className="font-semibold text-slate-800">
                            {isEditMode ? "Edit Patient" : "Add New Patient"}
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {isEditMode
                                ? `Updating ${editingPatient.name}`
                                : "Register a new patient to the system"}
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
                    {/* Name */}
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">
                            Full Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            onBlur={() => handleBlur("name")}
                            placeholder="e.g. Jane Smith"
                            maxLength={100}
                            className={`w-full border ${borderClass(form.name, fieldErrors.name, !!touched.name)} rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                        />
                        {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
                    </div>

                    {/* Age + Gender */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">
                                Age *
                            </label>
                            <input
                                type="number"
                                name="age"
                                value={form.age}
                                onChange={handleChange}
                                onBlur={() => handleBlur("age")}
                                placeholder="e.g. 45"
                                className={`w-full border ${borderClass(form.age, fieldErrors.age, !!touched.age)} rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                            />
                            {fieldErrors.age && <p className="text-red-500 text-xs mt-1">{fieldErrors.age}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">
                                Gender *
                            </label>
                            <select
                                name="gender"
                                value={form.gender}
                                onChange={handleChange}
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    {/* Dry Weight */}
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">
                            Dry Weight (kg) *
                        </label>
                        <input
                            type="number"
                            name="dryWeight"
                            value={form.dryWeight}
                            onChange={handleChange}
                            onBlur={() => handleBlur("dryWeight")}
                            placeholder="e.g. 68.5"
                            className={`w-full border ${borderClass(form.dryWeight, fieldErrors.dryWeight, !!touched.dryWeight)} rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                        />
                        {fieldErrors.dryWeight ? (
                            <p className="text-red-500 text-xs mt-1">{fieldErrors.dryWeight}</p>
                        ) : (
                            <p className="text-xs text-slate-400 mt-1">
                                Used as baseline for anomaly detection
                            </p>
                        )}
                    </div>

                    {/* Contact Number */}
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">
                            Contact Number{" "}
                            <span className="text-slate-300 font-normal">(optional)</span>
                        </label>
                        <input
                            type="text"
                            name="contactNumber"
                            value={form.contactNumber}
                            onChange={handleChange}
                            onBlur={() => handleBlur("contactNumber")}
                            placeholder="e.g. 9876543210"
                            maxLength={10}
                            className={`w-full border ${borderClass(form.contactNumber, fieldErrors.contactNumber, !!touched.contactNumber)} rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                        />
                        {fieldErrors.contactNumber && <p className="text-red-500 text-xs mt-1">{fieldErrors.contactNumber}</p>}
                    </div>

                    {/* API Error */}
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
                        disabled={loading || hasErrors}
                        className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {loading ? "Saving..." : isEditMode ? "Save Changes" : "Add Patient"}
                    </button>
                </div>
            </div>
        </div>
    );
}