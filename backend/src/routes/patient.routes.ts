import { Router } from "express";
import {
    getAllPatients,
    getPatientById,
    createPatient,
    updatePatient,
    deletePatient,
} from "../controllers/patient.controller";

const router = Router();

router.get("/", getAllPatients);
router.get("/:id", getPatientById);
router.post("/", createPatient);
router.patch("/:id", updatePatient);
router.delete("/:id", deletePatient);

export default router;