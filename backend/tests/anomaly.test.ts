import { detectAnomalies } from "../src/services/anomaly.service";
import { AnomalyThresholds } from "../src/types";

const thresholds: AnomalyThresholds = {
    maxWeightGainKg: 3,
    maxSystolicBP: 180,
    minDurationMinutes: 120,
    maxDurationMinutes: 300,
};

describe("detectAnomalies", () => {
    it("should return empty array when no anomalies present", () => {
        const result = detectAnomalies(
            { preWeight: 72, systolicBP: 150, durationMinutes: 180 },
            70,
            thresholds
        );
        expect(result).toHaveLength(0);
    });

    it("should detect excess weight gain", () => {
        const result = detectAnomalies(
            { preWeight: 75 }, // 5kg over dry weight of 70
            70,
            thresholds
        );
        expect(result).toHaveLength(1);
        expect(result[0]).toMatch(/excess weight gain/i);
    });

    it("should detect high systolic BP", () => {
        const result = detectAnomalies(
            { systolicBP: 195 },
            70,
            thresholds
        );
        expect(result).toHaveLength(1);
        expect(result[0]).toMatch(/high systolic bp/i);
    });

    it("should detect session too short", () => {
        const result = detectAnomalies(
            { durationMinutes: 90 },
            70,
            thresholds
        );
        expect(result).toHaveLength(1);
        expect(result[0]).toMatch(/too short/i);
    });

    it("should detect session too long", () => {
        const result = detectAnomalies(
            { durationMinutes: 360 },
            70,
            thresholds
        );
        expect(result).toHaveLength(1);
        expect(result[0]).toMatch(/too long/i);
    });

    it("should detect multiple anomalies at once", () => {
        const result = detectAnomalies(
            { preWeight: 75, systolicBP: 195, durationMinutes: 90 },
            70,
            thresholds
        );
        expect(result).toHaveLength(3);
    });

    it("should return empty array when session fields are undefined", () => {
        const result = detectAnomalies({}, 70, thresholds);
        expect(result).toHaveLength(0);
    });
});