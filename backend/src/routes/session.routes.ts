import { Router } from "express";
import {
    getTodaySessions,
    getSessionById,
    createSession,
    updateSession,
    deleteSession,
} from "../controllers/session.controller";

const router = Router();

router.get("/today", getTodaySessions);
router.get("/:id", getSessionById);
router.post("/", createSession);
router.patch("/:id", updateSession);
router.delete("/:id", deleteSession);

export default router;