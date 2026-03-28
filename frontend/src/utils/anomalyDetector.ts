/**
 * Client-side anomaly detection — mirrors backend thresholds exactly.
 * Used for live preview in the SessionForm while nurse fills in vitals.
 */

const THRESHOLDS = {
    maxWeightGainKg: 3,
    maxSystolicBP: 180,
    minDurationMinutes: 120,
    maxDurationMinutes: 300,
};

interface VitalFields {
    preWeight?: number;
    systolicBP?: number;
    durationMinutes?: number;
}

export function detectAnomaliesClient(
    session: VitalFields,
    dryWeight: number
): string[] {
    const anomalies: string[] = [];

    if (session.preWeight !== undefined && dryWeight > 0) {
        const gain = session.preWeight - dryWeight;
        if (gain > THRESHOLDS.maxWeightGainKg) {
            anomalies.push(
                `Excess weight gain: ${gain.toFixed(1)}kg above dry weight (limit: ${THRESHOLDS.maxWeightGainKg}kg)`
            );
        }
    }

    if (session.systolicBP !== undefined && session.systolicBP > THRESHOLDS.maxSystolicBP) {
        anomalies.push(
            `High systolic BP: ${session.systolicBP} mmHg (limit: ${THRESHOLDS.maxSystolicBP} mmHg)`
        );
    }

    if (session.durationMinutes !== undefined) {
        if (session.durationMinutes < THRESHOLDS.minDurationMinutes) {
            anomalies.push(
                `Session too short: ${session.durationMinutes} min (minimum: ${THRESHOLDS.minDurationMinutes} min)`
            );
        } else if (session.durationMinutes > THRESHOLDS.maxDurationMinutes) {
            anomalies.push(
                `Session too long: ${session.durationMinutes} min (maximum: ${THRESHOLDS.maxDurationMinutes} min)`
            );
        }
    }

    return anomalies;
}
