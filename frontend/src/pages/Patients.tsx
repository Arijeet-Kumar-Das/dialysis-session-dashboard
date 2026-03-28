import { useState } from "react";
import { usePatients } from "../hooks/usePatients";
import { useToast } from "../context/ToastContext";
import PatientForm from "../components/PatientForm";
import SessionForm from "../components/SessionForm";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";

export default function Patients() {
    const { patients, loading, error, refresh } = usePatients();
    const { showToast } = useToast();

    const [showPatientForm, setShowPatientForm] = useState(false);
    const [showSessionForm, setShowSessionForm] = useState(false);
    const [selectedPatientId, setSelectedPatientId] = useState("");

    const handleAddSession = (patientId: string) => {
        setSelectedPatientId(patientId);
        setShowSessionForm(true);
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 animate-fade-in-up">
                <div>
                    <h2 className="text-slate-800 font-semibold text-lg">All Patients</h2>
                    <p className="text-slate-400 text-sm mt-0.5">
                        {patients.length} registered patient{patients.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <button
                    onClick={() => setShowPatientForm(true)}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm"
                >
                    <span>+</span> Add Patient
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <Spinner />
            ) : error ? (
                <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-4 text-red-600 text-sm">
                    {error}
                </div>
            ) : patients.length === 0 ? (
                <EmptyState
                    title="No patients registered"
                    description="Add your first patient to start creating dialysis sessions."
                />
            ) : (
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-100">
                                    <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">Patient</th>
                                    <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">Age</th>
                                    <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">Gender</th>
                                    <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">Dry Weight</th>
                                    <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">Contact</th>
                                    <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {patients.map((patient, i) => (
                                    <tr
                                        key={patient._id}
                                        className="hover:bg-slate-50/50 transition-colors animate-fade-in-up"
                                        style={{ animationDelay: `${(i + 1) * 50}ms` }}
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-blue-600 font-semibold text-sm">
                                                        {patient.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <span className="font-medium text-slate-700">{patient.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-slate-600">{patient.age} yrs</td>
                                        <td className="px-5 py-4">
                                            <span className="capitalize text-slate-600">{patient.gender}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="font-mono text-slate-700">{patient.dryWeight}</span>
                                            <span className="text-slate-400 ml-0.5">kg</span>
                                        </td>
                                        <td className="px-5 py-4 text-slate-500 font-mono text-xs">
                                            {patient.contactNumber || <span className="text-slate-300">—</span>}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <button
                                                onClick={() => handleAddSession(patient._id)}
                                                className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                + Add Session
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modals */}
            {showPatientForm && (
                <PatientForm
                    onSuccess={() => {
                        refresh();
                        showToast("Patient added successfully", "success");
                    }}
                    onClose={() => setShowPatientForm(false)}
                />
            )}
            {showSessionForm && (
                <SessionForm
                    patients={patients}
                    defaultPatientId={selectedPatientId}
                    onSuccess={() => {
                        showToast("Session created successfully", "success");
                    }}
                    onClose={() => setShowSessionForm(false)}
                />
            )}
        </div>
    );
}
