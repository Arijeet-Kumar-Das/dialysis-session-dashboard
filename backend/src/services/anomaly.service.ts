import { AnomalyThresholds } from "../types";

interface SessionData {
    preWeight?: number;
    postWeight?: number;
    systolicBP?: number;
    durationMinutes?: number;
}

/**
 * Detects anomalies in a dialysis session.
 * Returns a list of human-readable anomaly strings.
 * Returns empty array if no anomalies found.
 *
 * @param session   - The session data recorded by nurse
 * @param dryWeight - Patient's baseline dry weight in kg
 * @param thresholds - Configurable anomaly thresholds
 */
export function detectAnomalies(
    session: SessionData,
    dryWeight: number,
    thresholds: AnomalyThresholds
): string[] {
    const anomalies: string[] = [];

    // 1. Excess weight gain (pre-session weight vs dry weight)
    if (session.preWeight !== undefined) {
        const weightGain = session.preWeight - dryWeight;
        if (weightGain > thresholds.maxWeightGainKg) {
            anomalies.push(
                `Excess weight gain: ${weightGain.toFixed(1)}kg above dry weight (limit: ${thresholds.maxWeightGainKg}kg)`
            );
        }
    }

    // 2. High systolic blood pressure
    if (session.systolicBP !== undefined) {
        if (session.systolicBP > thresholds.maxSystolicBP) {
            anomalies.push(
                `High systolic BP: ${session.systolicBP} mmHg (limit: ${thresholds.maxSystolicBP} mmHg)`
            );
        }
    }

    // 3. Abnormal session duration
    if (session.durationMinutes !== undefined) {
        if (session.durationMinutes < thresholds.minDurationMinutes) {
            anomalies.push(
                `Session too short: ${session.durationMinutes} min (minimum: ${thresholds.minDurationMinutes} min)`
            );
        } else if (session.durationMinutes > thresholds.maxDurationMinutes) {
            anomalies.push(
                `Session too long: ${session.durationMinutes} min (maximum: ${thresholds.maxDurationMinutes} min)`
            );
        }
    }

    return anomalies;
}