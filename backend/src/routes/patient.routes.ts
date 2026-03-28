import { Router } from "express";
import {
    getAllPatients,
    getPatientById,
    createPatient,
} from "../controllers/patient.controller";

const router = Router();

router.get("/", getAllPatients);
router.get("/:id", getPatientById);
router.post("/", createPatient);

export default router;