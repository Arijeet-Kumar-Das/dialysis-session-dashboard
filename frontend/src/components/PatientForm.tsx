import { useState } from "react";
import type { Patient } from "../types";
import { createPatient, updatePatient } from "../api/patients";
import { useToast } from "../context/ToastContext";

interface PatientFormProps {
    editingPatient?: Patient | null;
    onSuccess: () => void;
    onClose: () => void;
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

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async () => {
        setError(null);

        if (!form.name || !form.age || !form.gender || !form.dryWeight) {
            setError("Name, age, gender and dry weight are required");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                name: form.name,
                age: Number(form.age),
                gender: form.gender as "male" | "female" | "other",
                dryWeight: Number(form.dryWeight),
                contactNumber: form.contactNumber || undefined,
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
                            placeholder="e.g. Jane Smith"
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
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
                                placeholder="e.g. 45"
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
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
                            placeholder="e.g. 68.5"
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-slate-400 mt-1">
                            Used as baseline for anomaly detection
                        </p>
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
                            placeholder="e.g. 9876543210"
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        {loading ? "Saving..." : isEditMode ? "Save Changes" : "Add Patient"}
                    </button>
                </div>
            </div>
        </div>
    );
}