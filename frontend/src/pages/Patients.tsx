import { useState, useMemo } from "react";
import type { Patient } from "../types";
import { usePatients } from "../hooks/usePatients";
import { useToast } from "../context/ToastContext";
import { deletePatient } from "../api/patients";
import PatientForm from "../components/PatientForm";
import SessionForm from "../components/SessionForm";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";

export default function Patients() {
    const { patients, loading, error, refresh } = usePatients();
    const { showToast } = useToast();

    const [showPatientForm, setShowPatientForm] = useState(false);
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
    const [showSessionForm, setShowSessionForm] = useState(false);
    const [selectedPatientId, setSelectedPatientId] = useState("");
    const [search, setSearch] = useState("");
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const filteredPatients = useMemo(() => {
        if (!search.trim()) return patients;
        const term = search.toLowerCase();
        return patients.filter((p) => p.name.toLowerCase().includes(term));
    }, [patients, search]);

    const handleAddSession = (patientId: string) => {
        setSelectedPatientId(patientId);
        setShowSessionForm(true);
    };

    const handleEditPatient = (patient: Patient) => {
        setEditingPatient(patient);
        setShowPatientForm(true);
    };

    const handleDeletePatient = async (id: string) => {
        setDeletingId(id);
        try {
            await deletePatient(id);
            showToast("Patient deleted successfully", "success");
            refresh();
        } catch {
            showToast("Failed to delete patient", "error");
        } finally {
            setDeletingId(null);
            setConfirmDeleteId(null);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 animate-fade-in-up">
                <div>
                    <h2 className="text-slate-800 font-semibold text-lg">All Patients</h2>
                    <p className="text-slate-400 text-sm mt-0.5">
                        {patients.length} registered patient{patients.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search patients..."
                            className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 w-48 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        onClick={() => {
                            setEditingPatient(null);
                            setShowPatientForm(true);
                        }}
                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm"
                    >
                        <span>+</span> Add Patient
                    </button>
                </div>
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
            ) : filteredPatients.length === 0 ? (
                <EmptyState
                    title="No results found"
                    description={`No patients match "${search}". Try a different search term.`}
                />
            ) : (
                <div
                    className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in-up"
                    style={{ animationDelay: "100ms" }}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-100">
                                    <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">
                                        Patient
                                    </th>
                                    <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">
                                        Age
                                    </th>
                                    <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">
                                        Gender
                                    </th>
                                    <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">
                                        Dry Weight
                                    </th>
                                    <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">
                                        Contact
                                    </th>
                                    <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredPatients.map((patient, i) => (
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
                                                <span className="font-medium text-slate-700">
                                                    {patient.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-slate-600">
                                            {patient.age} yrs
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="capitalize text-slate-600">
                                                {patient.gender}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="font-mono text-slate-700">
                                                {patient.dryWeight}
                                            </span>
                                            <span className="text-slate-400 ml-0.5">kg</span>
                                        </td>
                                        <td className="px-5 py-4 text-slate-500 font-mono text-xs">
                                            {patient.contactNumber || (
                                                <span className="text-slate-300">—</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => handleAddSession(patient._id)}
                                                    className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors"
                                                >
                                                    + Session
                                                </button>
                                                <button
                                                    onClick={() => handleEditPatient(patient)}
                                                    className="text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 px-2.5 py-1.5 rounded-lg transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                {confirmDeleteId === patient._id ? (
                                                    <div className="flex items-center gap-1 bg-red-50 px-2 py-1 rounded-lg">
                                                        <button
                                                            onClick={() =>
                                                                handleDeletePatient(patient._id)
                                                            }
                                                            disabled={deletingId === patient._id}
                                                            className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                                                        >
                                                            {deletingId === patient._id
                                                                ? "..."
                                                                : "Confirm"}
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                setConfirmDeleteId(null)
                                                            }
                                                            className="text-xs text-slate-500 hover:text-slate-700"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() =>
                                                            setConfirmDeleteId(patient._id)
                                                        }
                                                        className="text-xs font-medium text-red-400 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
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
                    editingPatient={editingPatient}
                    onSuccess={() => {
                        refresh();
                    }}
                    onClose={() => {
                        setShowPatientForm(false);
                        setEditingPatient(null);
                    }}
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
