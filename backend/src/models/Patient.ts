import mongoose, { Document, Schema } from "mongoose";

export interface IPatient extends Document {
    name: string;
    age: number;
    gender: "male" | "female" | "other";
    dryWeight: number;
    contactNumber?: string;
    createdAt: Date;
}

const PatientSchema = new Schema<IPatient>(
    {
        name: {
            type: String,
            required: [true, "Patient name is required"],
            trim: true,
        },
        age: {
            type: Number,
            required: [true, "Age is required"],
            min: [0, "Age must be positive"],
        },
        gender: {
            type: String,
            enum: ["male", "female", "other"],
            required: [true, "Gender is required"],
        },
        dryWeight: {
            type: Number,
            required: [true, "Dry weight is required"],
            min: [0, "Dry weight must be positive"],
        },
        contactNumber: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model<IPatient>("Patient", PatientSchema);