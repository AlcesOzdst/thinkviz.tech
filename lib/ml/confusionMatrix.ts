/**
 * Confusion Matrix Simulator Mathematical Logic
 * Pure algorithmic functions: classification metric calculations, zero-denominator safety,
 * rigorous input validation, and derived pedagogical insights.
 */

import type { ConfusionCounts, ConfusionMetrics, ConfusionPreset } from "./types.ts";



// ============================================================================
// Built-in Presets
// ============================================================================
export const CONFUSION_PRESETS: ConfusionPreset[] = [
  {
    id: "balanced",
    name: "Balanced Classifier",
    description: "Equal distribution between positive and negative classes with typical error rates.",
    counts: { tp: 45, fp: 10, tn: 40, fn: 5 },
  },
  {
    id: "high_fn",
    name: "High False Negatives (Medical Risk)",
    description: "Dangerous miss rate where diseased patients are falsely diagnosed as healthy.",
    counts: { tp: 12, fp: 3, tn: 80, fn: 25 },
  },
  {
    id: "imbalanced",
    name: "Imbalanced (Fraud Detection)",
    description: "99% negative class. Demonstrates the Accuracy Paradox (high accuracy, zero/low recall).",
    counts: { tp: 5, fp: 2, tn: 980, fn: 13 },
  },
  {
    id: "conservative",
    name: "Conservative (High Precision)",
    description: "Minimizes false alarms at the expense of missing several positive cases.",
    counts: { tp: 20, fp: 1, tn: 85, fn: 14 },
  },
  {
    id: "perfect",
    name: "Ideal / Perfect Classifier",
    description: "Zero classification errors (100% accuracy, precision, recall, and F1).",
    counts: { tp: 50, fp: 0, tn: 50, fn: 0 },
  },
];

// ============================================================================
// Input Validation Guard
// Rejects negative, fractional, NaN, and infinite values.
// ============================================================================
export function validateCount(val: unknown): { isValid: boolean; sanitized: number; error?: string } {
  if (val === "" || val === null || val === undefined) {
    return { isValid: false, sanitized: 0, error: "Count cannot be empty." };
  }

  const num = Number(val);

  if (isNaN(num)) {
    return { isValid: false, sanitized: 0, error: "Value must be a valid number." };
  }

  if (!isFinite(num)) {
    return { isValid: false, sanitized: 0, error: "Infinite values are rejected." };
  }

  if (num < 0) {
    return { isValid: false, sanitized: 0, error: "Counts must be non-negative (≥ 0)." };
  }

  if (!Number.isInteger(num)) {
    return { isValid: false, sanitized: Math.floor(num), error: "Counts must be whole integers." };
  }

  if (num > 1000000) {
    return { isValid: false, sanitized: 1000000, error: "Count exceeds educational limit (1,000,000)." };
  }

  return { isValid: true, sanitized: num };
}

export function validateAllCounts(raw: Record<string, unknown>): {
  isValid: boolean;
  counts: ConfusionCounts;
  errors: Partial<Record<keyof ConfusionCounts, string>>;
} {
  const tpVal = validateCount(raw.tp);
  const fpVal = validateCount(raw.fp);
  const tnVal = validateCount(raw.tn);
  const fnVal = validateCount(raw.fn);

  const errors: Partial<Record<keyof ConfusionCounts, string>> = {};
  if (!tpVal.isValid) errors.tp = tpVal.error;
  if (!fpVal.isValid) errors.fp = fpVal.error;
  if (!tnVal.isValid) errors.tn = tnVal.error;
  if (!fnVal.isValid) errors.fn = fnVal.error;

  const isValid = tpVal.isValid && fpVal.isValid && tnVal.isValid && fnVal.isValid;

  return {
    isValid,
    counts: {
      tp: tpVal.sanitized,
      fp: fpVal.sanitized,
      tn: tnVal.sanitized,
      fn: fnVal.sanitized,
    },
    errors,
  };
}

// ============================================================================
// Pure Classification Metrics Calculation
// Explicitly handles zero denominators by returning null (never substituting 0).
// ============================================================================
export function calculateConfusionMetrics(counts: ConfusionCounts): ConfusionMetrics {
  const { tp, fp, tn, fn } = counts;

  const total = tp + tn + fp + fn;
  const actualPositive = tp + fn;
  const actualNegative = tn + fp;
  const predictedPositive = tp + fp;
  const predictedNegative = tn + fn;

  // Accuracy = (TP + TN) / Total
  const accuracy = total > 0 ? (tp + tn) / total : null;

  // Precision = TP / (TP + FP)
  const precision = predictedPositive > 0 ? tp / predictedPositive : null;

  // Recall / Sensitivity = TP / (TP + FN)
  const recall = actualPositive > 0 ? tp / actualPositive : null;

  // Specificity = TN / (TN + FP)
  const specificity = actualNegative > 0 ? tn / actualNegative : null;

  // F1-Score = 2 * (Precision * Recall) / (Precision + Recall)
  // Equal to 2*TP / (2*TP + FP + FN)
  let f1Score: number | null = null;
  if (precision !== null && recall !== null) {
    const denom = precision + recall;
    if (denom > 0) {
      f1Score = (2 * precision * recall) / denom;
    }
  }

  return {
    total,
    actualPositive,
    actualNegative,
    predictedPositive,
    predictedNegative,
    accuracy: accuracy !== null ? Number(accuracy.toFixed(4)) : null,
    precision: precision !== null ? Number(precision.toFixed(4)) : null,
    recall: recall !== null ? Number(recall.toFixed(4)) : null,
    specificity: specificity !== null ? Number(specificity.toFixed(4)) : null,
    f1Score: f1Score !== null ? Number(f1Score.toFixed(4)) : null,
  };
}

// ============================================================================
// Derived Pedagogical Observations
// Mathematically grounded insights based on current distribution.
// ============================================================================
export function generateMatrixObservations(
  counts: ConfusionCounts,
  metrics: ConfusionMetrics
): string[] {
  const observations: string[] = [];
  const { total, actualPositive, actualNegative, accuracy, recall, precision, f1Score } = metrics;

  if (total === 0) {
    return ["All matrix cells are zero. Please enter sample counts or choose a preset."];
  }

  // 1. Accuracy Paradox detection
  const posRatio = actualPositive / total;
  const negRatio = actualNegative / total;
  const isImbalanced = posRatio > 0.85 || negRatio > 0.85;

  if (isImbalanced && accuracy !== null && recall !== null) {
    if (accuracy >= 0.9 && recall < 0.6) {
      observations.push(
        `⚠️ Accuracy Paradox: Accuracy is high (${(accuracy * 100).toFixed(1)}%), but Recall is low (${(recall * 100).toFixed(1)}%). In heavily imbalanced datasets (${(negRatio * 100).toFixed(0)}% negative), a trivial model predicting "Negative" on everything scores misleadingly high accuracy while failing to detect positive targets.`
      );
    }
  }

  // 2. Error Trade-off Analysis
  if (counts.fp > 0 || counts.fn > 0) {
    if (counts.fn > counts.fp * 2) {
      observations.push(
        `Type II Error Dominance: False Negatives (${counts.fn}) severely outnumber False Positives (${counts.fp}). In safety-critical or clinical screening tasks, missing true cases is often catastrophic.`
      );
    } else if (counts.fp > counts.fn * 2) {
      observations.push(
        `Type I Error Dominance: False Positives (${counts.fp}) severely outnumber False Negatives (${counts.fn}). This causes high alert fatigue or unnecessary interventions despite catching most positive cases.`
      );
    }
  }

  // 3. F1 vs Accuracy observation
  if (f1Score !== null && accuracy !== null) {
    const diff = Math.abs(accuracy - f1Score);
    if (diff > 0.15) {
      observations.push(
        `F1-Score (${(f1Score * 100).toFixed(1)}%) diverges significantly from Accuracy (${(accuracy * 100).toFixed(1)}%). F1-score is the harmonic mean of Precision and Recall, providing a more reliable single metric when class costs or sizes are asymmetric.`
      );
    }
  }

  // 4. Undefined denominator warnings
  if (metrics.precision === null) {
    observations.push(
      "Precision is Undefined (N/A): The model made 0 positive predictions (TP + FP = 0). The denominator is zero."
    );
  }
  if (metrics.recall === null) {
    observations.push(
      "Recall is Undefined (N/A): The dataset contains 0 actual positive samples (TP + FN = 0)."
    );
  }

  if (observations.length === 0) {
    observations.push(
      `Balanced Performance: The classifier maintains consistent trade-offs across classes with an F1-Score of ${(
        (f1Score ?? 0) * 100
      ).toFixed(1)}% and Accuracy of ${((accuracy ?? 0) * 100).toFixed(1)}%.`
    );
  }

  return observations;
}
