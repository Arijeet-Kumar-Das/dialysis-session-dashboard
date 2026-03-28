import { Request, Response, NextFunction } from "express";
import * as patientService from "../services/patient.service";

export async function getAllPatients(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const patients = await patientService.getAllPatients();
        res.status(200).json({ success: true, data: patients });
    } catch (error) {
        next(error);
    }
}

export async function getPatientById(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const patient = await patientService.getPatientById(req.params.id as string);

        if (!patient) {
            res.status(404).json({ success: false, message: "Patient not found" });
            return;
        }

        res.status(200).json({ success: true, data: patient });
    } catch (error) {
        next(error);
    }
}

export async function createPatient(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { name, age, gender, dryWeight, contactNumber } = req.body;

        // Basic input validation
        if (!name || !age || !gender || !dryWeight) {
            res.status(400).json({
                success: false,
                message: "name, age, gender, and dryWeight are required",
            });
            return;
        }

        const patient = await patientService.createPatient({
            name,
            age,
            gender,
            dryWeight,
            contactNumber,
        });

        res.status(201).json({ success: true, data: patient });
    } catch (error) {
        next(error);
    }
}