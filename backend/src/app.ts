import express from "express";
import cors from "cors";
import patientRoutes from "./routes/patient.routes";
import sessionRoutes from "./routes/session.routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

// --- Middleware ---
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "https://dialysisanalyzer.vercel.app"
    ],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true
}));
app.use(express.json());

// --- Routes ---
app.use("/api/patients", patientRoutes);
app.use("/api/sessions", sessionRoutes);

// --- Health check ---
app.get("/health", (req, res) => {
    res.status(200).json({ success: true, message: "Server is running" });
});

// --- Global error handler ---
app.use(errorHandler);

export default app;
