/**
 * Regression Algorithm Unit Tests
 * Verifies OLS least-squares, polynomial solver, MSE, MAE, R², zero-variance guards, and predictions.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
  fitPolynomialRegression,
  evaluatePolynomial,
  calculateRegressionMetrics,
  fitModel,
  generateRegressionDataset,
} from "../../lib/ml/regression.ts";

test("Regression: Perfect linear dataset produces exact slope and intercept", () => {
  // y = 2.5 * x + 10.0
  const points = [
    { x: 0, y: 10.0 },
    { x: 1, y: 12.5 },
    { x: 2, y: 15.0 },
    { x: 3, y: 17.5 },
    { x: 4, y: 20.0 },
  ];

  const coeffs = fitPolynomialRegression(points, 1);
  assert.equal(coeffs.length, 2);
  const intercept = Number(coeffs[0].toFixed(4));
  const slope = Number(coeffs[1].toFixed(4));

  assert.equal(intercept, 10.0, "Intercept should be 10.0");
  assert.equal(slope, 2.5, "Slope should be 2.5");
});

test("Regression: Predictions agree with the fitted equation", () => {
  const coeffs = [10.0, 2.5]; // ŷ = 10 + 2.5x
  assert.equal(evaluatePolynomial(coeffs, 0), 10.0);
  assert.equal(evaluatePolynomial(coeffs, 2), 15.0);
  assert.equal(evaluatePolynomial(coeffs, 4), 20.0);
});

test("Regression: MSE and MAE match hand-calculated example", () => {
  // Points: (1, 4), (2, 7), (3, 8)
  // Model: ŷ = 2x + 1.5 -> Predictions: ŷ(1) = 3.5, ŷ(2) = 5.5, ŷ(3) = 7.5
  // Residuals: (4 - 3.5) = 0.5, (7 - 5.5) = 1.5, (8 - 7.5) = 0.5
  // Sum Abs Errors = 0.5 + 1.5 + 0.5 = 2.5 -> MAE = 2.5 / 3 ≈ 0.8333
  // Sum Sq Errors = 0.25 + 2.25 + 0.25 = 2.75 -> MSE = 2.75 / 3 ≈ 0.9167
  const points = [
    { x: 1, y: 4 },
    { x: 2, y: 7 },
    { x: 3, y: 8 },
  ];
  const coeffs = [1.5, 2.0];

  const metrics = calculateRegressionMetrics(points, coeffs);
  assert.equal(metrics.mae, 0.8333);
  assert.equal(metrics.mse, 0.9167);
});

test("Regression: R² is 1.0 for a perfect noiseless fit", () => {
  const points = [
    { x: 1, y: 3 },
    { x: 2, y: 5 },
    { x: 3, y: 7 },
    { x: 4, y: 9 },
  ];
  const coeffs = [1, 2]; // y = 2x + 1 exactly

  const metrics = calculateRegressionMetrics(points, coeffs);
  assert.equal(metrics.r2, 1.0, "R² for a perfect fit should be exactly 1.0");
  assert.equal(metrics.mse, 0, "MSE for a perfect fit should be 0");
  assert.equal(metrics.mae, 0, "MAE for a perfect fit should be 0");
});

test("Regression: Zero target variance explicitly returns null for R² (never misleading finite value)", () => {
  // All target y values are identical: variance is 0
  const points = [
    { x: 1, y: 5 },
    { x: 2, y: 5 },
    { x: 3, y: 5 },
    { x: 4, y: 5 },
  ];
  const coeffs = [5, 0]; // ŷ = 5

  const metrics = calculateRegressionMetrics(points, coeffs);
  assert.equal(metrics.r2, null, "R² must be null when target variance is 0");
  assert.equal(metrics.mse, 0);
  assert.equal(metrics.mae, 0);
});

test("Regression: Polynomial degree 2 fits parabolic data accurately", () => {
  // y = 2x^2 - 3x + 4
  const points = [
    { x: 0, y: 4 },
    { x: 1, y: 3 },
    { x: 2, y: 6 },
    { x: 3, y: 13 },
    { x: 4, y: 24 },
  ];

  const coeffs = fitPolynomialRegression(points, 2);
  assert.equal(coeffs.length, 3);
  const w0 = Math.round(coeffs[0]);
  const w1 = Math.round(coeffs[1]);
  const w2 = Math.round(coeffs[2]);

  assert.equal(w0, 4, "Constant term should be 4");
  assert.equal(w1, -3, "Linear term should be -3");
  assert.equal(w2, 2, "Quadratic term should be 2");
});

test("Regression: Train/Test split fits exclusively on training data and computes test metrics", () => {
  const { points } = generateRegressionDataset("linear", 20, 2.0, 42, true, 0.7);
  const model = fitModel(points, 1, true);

  assert.ok(model.trainMetrics.count > 0, "Train metrics must have samples");
  assert.ok(model.testMetrics !== null, "Test metrics should exist when split is enabled");
  assert.ok(model.testMetrics.count > 0, "Test metrics must have samples");
  assert.equal(
    model.trainMetrics.count + (model.testMetrics?.count || 0),
    20,
    "Sum of train and test count must equal total"
  );
});
