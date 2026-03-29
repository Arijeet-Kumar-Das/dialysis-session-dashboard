import express from "express";
import cors from "cors";
import patientRoutes from "./routes/patient.routes";
import sessionRoutes from "./routes/session.routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Routes ---
app.use("/api/patients", patientRoutes);
app.use("/api/sessions", sessionRoutes);

// --- Health check ---
app.get("/health", (req, res) => {
    res.status(200).json({ success: true, message: "Server is running" });
});

// --- Global error handler (must be last) ---
app.use(errorHandler);

export default app;
