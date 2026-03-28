import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import patientRoutes from "./routes/patient.routes";
import sessionRoutes from "./routes/session.routes";
import { errorHandler } from "./middleware/errorHandler";

// Load env vars first before anything else
dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 5000;

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

// --- Start server ---
const startServer = async (): Promise<void> => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
};

startServer();

export default app; // exported for tests