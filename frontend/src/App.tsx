import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";

function App() {
    return (
        <BrowserRouter>
            <ToastProvider>
                <div className="min-h-screen bg-[#F0F2F5]">
                    <Navbar />
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/patients" element={<Patients />} />
                    </Routes>
                </div>
            </ToastProvider>
        </BrowserRouter>
    );
}

export default App;