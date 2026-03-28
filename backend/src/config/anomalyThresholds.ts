import { AnomalyThresholds } from "../types";

const anomalyThresholds: AnomalyThresholds = {
    maxWeightGainKg: 3,        // flag if patient gained more than 3kg over dry weight
    maxSystolicBP: 180,        // flag if systolic BP exceeds 180 mmHg
    minDurationMinutes: 120,   // flag if session shorter than 2 hours
    maxDurationMinutes: 300,   // flag if session longer than 5 hours
};

export default anomalyThresholds;