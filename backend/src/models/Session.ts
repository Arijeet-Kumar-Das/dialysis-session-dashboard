import mongoose, { Document, Schema } from "mongoose";

export type SessionStatus = "not_started" | "in_progress" | "completed";

export interface ISession extends Document {
    patientId: mongoose.Types.ObjectId;
    scheduledDate: Date;
    status: SessionStatus;
    preWeight?: number;
    postWeight?: number;
    systolicBP?: number;
    durationMinutes?: number;
    machineId?: string;
    nurseNotes?: string;
    anomalies: string[];
    createdAt: Date;
    updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
    {
        patientId: {
            type: Schema.Types.ObjectId,
            ref: "Patient",
            required: [true, "Patient ID is required"],
        },
        scheduledDate: {
            type: Date,
            required: [true, "Scheduled date is required"],
        },
        status: {
            type: String,
            enum: ["not_started", "in_progress", "completed"],
            default: "not_started",
        },
        preWeight: { type: Number, min: 0 },
        postWeight: { type: Number, min: 0 },
        systolicBP: { type: Number, min: 0 },
        durationMinutes: { type: Number, min: 0 },
        machineId: { type: String, trim: true },
        nurseNotes: { type: String, trim: true },
        anomalies: { type: [String], default: [] },
    },
    { timestamps: true }
);

export default mongoose.model<ISession>("Session", SessionSchema);