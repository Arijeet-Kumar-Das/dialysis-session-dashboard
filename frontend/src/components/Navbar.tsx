import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import PatientForm from "./PatientForm";

export default function Navbar() {
    const location = useLocation();
    const [showPatientForm, setShowPatientForm] = useState(false);

    return (
        <>
            <nav className="bg-[#0F1B2D] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-white font-semibold text-sm leading-tight">
                                Dialysis Dashboard
                            </h1>
                            <p className="text-slate-400 text-xs">Session Intake &amp; Anomaly Monitor</p>
                        </div>
                    </div>

                    {/* Nav Links */}
                    <div className="hidden sm:flex items-center gap-1 bg-white/5 rounded-lg p-1">
                        <Link
                            to="/"
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                location.pathname === "/"
                                    ? "bg-white/15 text-white"
                                    : "text-slate-400 hover:text-white"
                            }`}
                        >
                            Today's Sessions
                        </Link>
                        <Link
                            to="/patients"
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                location.pathname === "/patients"
                                    ? "bg-white/15 text-white"
                                    : "text-slate-400 hover:text-white"
                            }`}
                        >
                            Patients
                        </Link>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="hidden md:inline text-slate-400 text-xs">
                        {new Date().toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </span>
                    <button
                        onClick={() => setShowPatientForm(true)}
                        className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                    >
                        + Add Patient
                    </button>
                </div>
            </nav>

            {/* Mobile nav links */}
            <div className="sm:hidden bg-[#0F1B2D] border-t border-white/10 px-6 pb-3 flex gap-1">
                <Link
                    to="/"
                    className={`flex-1 text-center px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        location.pathname === "/"
                            ? "bg-white/15 text-white"
                            : "text-slate-400"
                    }`}
                >
                    Sessions
                </Link>
                <Link
                    to="/patients"
                    className={`flex-1 text-center px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        location.pathname === "/patients"
                            ? "bg-white/15 text-white"
                            : "text-slate-400"
                    }`}
                >
                    Patients
                </Link>
            </div>

            {showPatientForm && (
                <PatientForm
                    editingPatient={null}
                    onSuccess={() => {}}
                    onClose={() => setShowPatientForm(false)}
                />
            )}
        </>
    );
}
