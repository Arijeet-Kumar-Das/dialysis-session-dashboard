import request from "supertest";
import mongoose from "mongoose";

import app from "../src/index";



afterAll(async () => {
    await mongoose.connection.collection("sessions").deleteMany({});
    await mongoose.connection.collection("patients").deleteMany({});
    await mongoose.disconnect();
});

describe("Patient API", () => {
    it("POST /api/patients - should create a patient", async () => {
        const res = await request(app).post("/api/patients").send({
            name: "Test Patient",
            age: 50,
            gender: "female",
            dryWeight: 65,
        });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe("Test Patient");
    });

    it("POST /api/patients - should fail without required fields", async () => {
        const res = await request(app).post("/api/patients").send({
            name: "Incomplete Patient",
        });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it("GET /api/patients - should return list of patients", async () => {
        const res = await request(app).get("/api/patients");

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });
});

describe("Session API", () => {
    let patientId: string;

    beforeAll(async () => {
        const res = await request(app).post("/api/patients").send({
            name: "Session Test Patient",
            age: 40,
            gender: "male",
            dryWeight: 70,
        });
        patientId = res.body.data._id;
    });

    it("POST /api/sessions - should create session and detect anomalies", async () => {
        const res = await request(app)
            .post("/api/sessions")
            .send({
                patientId,
                scheduledDate: new Date().toISOString(),
                preWeight: 75,
                systolicBP: 185,
                durationMinutes: 90,
                machineId: "M-101",
                status: "in_progress",
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.anomalies).toHaveLength(3);
    });

    it("POST /api/sessions - should fail without patientId", async () => {
        const res = await request(app).post("/api/sessions").send({
            scheduledDate: new Date().toISOString(),
        });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it("GET /api/sessions/today - should return today's sessions", async () => {
        const res = await request(app).get("/api/sessions/today");

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });
});