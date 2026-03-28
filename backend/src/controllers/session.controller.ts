import { Request, Response, NextFunction } from "express";
import * as sessionService from "../services/session.service";

export async function getTodaySessions(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const unit = req.query.unit as string | undefined;
        const sessions = await sessionService.getTodaySessions(unit);
        res.status(200).json({ success: true, data: sessions });
    } catch (error) {
        next(error);
    }
}

export async function getSessionById(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const session = await sessionService.getSessionById(req.params.id as string);

        if (!session) {
            res.status(404).json({ success: false, message: "Session not found" });
            return;
        }

        res.status(200).json({ success: true, data: session });
    } catch (error) {
        next(error);
    }
}

export async function createSession(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const {
            patientId,
            scheduledDate,
            preWeight,
            postWeight,
            systolicBP,
            durationMinutes,
            machineId,
            nurseNotes,
            unit,
            status,
        } = req.body;

        if (!patientId || !scheduledDate) {
            res.status(400).json({
                success: false,
                message: "patientId and scheduledDate are required",
            });
            return;
        }

        const session = await sessionService.createSession({
            patientId,
            scheduledDate: new Date(scheduledDate),
            preWeight,
            postWeight,
            systolicBP,
            durationMinutes,
            machineId,
            nurseNotes,
            unit,
            status,
        });

        res.status(201).json({ success: true, data: session });
    } catch (error) {
        next(error);
    }
}

export async function updateSession(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const updated = await sessionService.updateSession(req.params.id as string, req.body);

        if (!updated) {
            res.status(404).json({ success: false, message: "Session not found" });
            return;
        }

        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
}

export async function deleteSession(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const deleted = await sessionService.deleteSession(req.params.id as string);

        if (!deleted) {
            res.status(404).json({ success: false, message: "Session not found" });
            return;
        }

        res.status(200).json({ success: true, data: deleted });
    } catch (error) {
        next(error);
    }
}