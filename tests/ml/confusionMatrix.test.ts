/**
 * Confusion Matrix Unit Tests
 * Verifies accuracy, precision, recall, specificity, F1-score, zero-denominator safety, and input validation.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateConfusionMetrics,
  validateCount,
  validateAllCounts,
  CONFUSION_PRESETS,
} from "../../lib/ml/confusionMatrix.ts";

test("Confusion Matrix: Hand-calculated metrics match exact mathematical values", () => {
  // Counts: TP=40, FP=10, TN=30, FN=20
  // Total = 100
  // Accuracy = (40 + 30) / 100 = 0.7000
  // Precision = 40 / (40 + 10) = 40 / 50 = 0.8000
  // Recall = 40 / (40 + 20) = 40 / 60 = 0.6667
  // Specificity = 30 / (30 + 10) = 30 / 40 = 0.7500
  // F1-Score = 2 * (0.8000 * 0.6667) / (0.8000 + 0.6667) = 80 / 110 = 0.7273
  const counts = { tp: 40, fp: 10, tn: 30, fn: 20 };
  const metrics = calculateConfusionMetrics(counts);

  assert.equal(metrics.total, 100);
  assert.equal(metrics.actualPositive, 60);
  assert.equal(metrics.actualNegative, 40);
  assert.equal(metrics.predictedPositive, 50);
  assert.equal(metrics.predictedNegative, 50);

  assert.equal(metrics.accuracy, 0.7);
  assert.equal(metrics.precision, 0.8);
  assert.equal(metrics.recall, 0.6667);
  assert.equal(metrics.specificity, 0.75);
  assert.equal(metrics.f1Score, 0.7273);
});

test("Confusion Matrix: Ideal classifier scores 1.0 (100%) across all metrics", () => {
  const perfectCounts = { tp: 50, fp: 0, tn: 50, fn: 0 };
  const metrics = calculateConfusionMetrics(perfectCounts);

  assert.equal(metrics.accuracy, 1.0);
  assert.equal(metrics.precision, 1.0);
  assert.equal(metrics.recall, 1.0);
  assert.equal(metrics.specificity, 1.0);
  assert.equal(metrics.f1Score, 1.0);
});

test("Confusion Matrix: Zero denominators return null (never silently substitute 0)", () => {
  // All zero counts
  const emptyCounts = { tp: 0, fp: 0, tn: 0, fn: 0 };
  const emptyMetrics = calculateConfusionMetrics(emptyCounts);

  assert.equal(emptyMetrics.accuracy, null, "Accuracy must be null when total is 0");
  assert.equal(emptyMetrics.precision, null, "Precision must be null when TP + FP = 0");
  assert.equal(emptyMetrics.recall, null, "Recall must be null when TP + FN = 0");
  assert.equal(emptyMetrics.specificity, null, "Specificity must be null when TN + FP = 0");
  assert.equal(emptyMetrics.f1Score, null, "F1 must be null when precision and recall are null");

  // Zero positive predictions: TP=0, FP=0, TN=50, FN=10
  const noPosPreds = { tp: 0, fp: 0, tn: 50, fn: 10 };
  const noPosMetrics = calculateConfusionMetrics(noPosPreds);
  assert.equal(noPosMetrics.precision, null, "Precision is undefined when no positive predictions are made");
  assert.equal(noPosMetrics.recall, 0, "Recall is 0/10 = 0.0");
  assert.equal(noPosMetrics.specificity, 1.0, "Specificity is 50/50 = 1.0");
  assert.equal(noPosMetrics.f1Score, null, "F1 is undefined when precision is null");
});

test("Confusion Matrix: Input validator rejects negative, fractional, and non-finite counts", () => {
  // Negative numbers
  const negCheck = validateCount(-5);
  assert.equal(negCheck.isValid, false);
  assert.ok(negCheck.error?.includes("non-negative"));

  // Fractional numbers
  const fracCheck = validateCount(4.5);
  assert.equal(fracCheck.isValid, false);
  assert.ok(fracCheck.error?.includes("whole integers"));

  // Non-finite strings / NaN
  const nanCheck = validateCount("not_a_number");
  assert.equal(nanCheck.isValid, false);

  const infCheck = validateCount(Infinity);
  assert.equal(infCheck.isValid, false);

  // Valid non-negative integers
  const validZero = validateCount(0);
  assert.equal(validZero.isValid, true);
  assert.equal(validZero.sanitized, 0);

  const validHundred = validateCount(100);
  assert.equal(validHundred.isValid, true);
  assert.equal(validHundred.sanitized, 100);
});

test("Confusion Matrix: validateAllCounts enforces batch record safety", () => {
  const badBatch = validateAllCounts({ tp: -2, fp: 10, tn: 20, fn: 5 });
  assert.equal(badBatch.isValid, false);
  assert.ok(badBatch.errors.tp);

  const goodBatch = validateAllCounts({ tp: 45, fp: 10, tn: 40, fn: 5 });
  assert.equal(goodBatch.isValid, true);
  assert.equal(goodBatch.counts.tp, 45);
});

test("Confusion Matrix: All presets contain valid non-negative counts", () => {
  for (const preset of CONFUSION_PRESETS) {
    const check = validateAllCounts(preset.counts as unknown as Record<string, unknown>);
    assert.equal(check.isValid, true, `Preset '${preset.id}' failed validation`);
  }
});
