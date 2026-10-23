/**
 * Regression Playground Mathematical Logic
 * Pure algorithmic functions: Ordinary Least Squares (OLS), Polynomial QR/Gaussian solver,
 * MSE, MAE, R², zero-variance guards, and reproducible synthetic dataset generation.
 */

import type {
  RegressionPoint,
  RegressionModel,
  RegressionMetrics,
  RegressionConfig,
  RegressionDatasetType,
} from "./types.ts";
import { createPrng } from "./kmeans.ts";



// ============================================================================
// Matrix Operations: Gaussian Elimination with Partial Pivoting
// Stably solves system A * w = b where A is n x n and b is n x 1.
// ============================================================================
export function solveLinearSystem(A: number[][], b: number[]): number[] | null {
  const n = A.length;
  // Deep clone to prevent mutating input arguments
  const M: number[][] = A.map((row) => [...row]);
  const y: number[] = [...b];

  for (let col = 0; col < n; col++) {
    // 1. Partial pivoting: find row with maximum absolute value in current column
    let maxRow = col;
    let maxVal = Math.abs(M[col][col]);
    for (let row = col + 1; row < n; row++) {
      const val = Math.abs(M[row][col]);
      if (val > maxVal) {
        maxVal = val;
        maxRow = row;
      }
    }

    // Singular or near-singular matrix check
    if (maxVal < 1e-12) {
      return null;
    }

    // Swap rows
    if (maxRow !== col) {
      const tempRow = M[col];
      M[col] = M[maxRow];
      M[maxRow] = tempRow;

      const tempY = y[col];
      y[col] = y[maxRow];
      y[maxRow] = tempY;
    }

    // 2. Eliminate lower rows
    for (let row = col + 1; row < n; row++) {
      const factor = M[row][col] / M[col][col];
      for (let j = col; j < n; j++) {
        M[row][j] -= factor * M[col][j];
      }
      y[row] -= factor * y[col];
    }
  }

  // 3. Back substitution
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = y[i];
    for (let j = i + 1; j < n; j++) {
      sum -= M[i][j] * x[j];
    }
    x[i] = sum / M[i][i];
  }

  return x;
}

// ============================================================================
// Normal Equation Matrix Builder for Polynomial Regression
// Computes (X^T * X + lambda * I) and X^T * y
// ============================================================================
export function fitPolynomialRegression(
  points: { x: number; y: number }[],
  degree: number,
  regularization = 1e-7
): number[] {
  const m = degree + 1;
  const n = points.length;

  if (n === 0) return new Array(m).fill(0);

  // For degree 1 (simple linear regression), use direct closed-form formula for exactness
  if (degree === 1) {
    let sumX = 0;
    let sumY = 0;
    for (const p of points) {
      sumX += p.x;
      sumY += p.y;
    }
    const meanX = sumX / n;
    const meanY = sumY / n;

    let num = 0;
    let den = 0;
    for (const p of points) {
      num += (p.x - meanX) * (p.y - meanY);
      den += (p.x - meanX) * (p.x - meanX);
    }

    if (Math.abs(den) < 1e-12) {
      // Degenerate vertical points
      return [meanY, 0];
    }

    const slope = num / den;
    const intercept = meanY - slope * meanX;
    return [intercept, slope];
  }

  // Generalized Polynomial Least-Squares via Normal Equations
  // XtX[j][k] = sum_{i=1}^n x_i^(j+k)
  // Xty[j] = sum_{i=1}^n x_i^j * y_i
  const maxPow = 2 * degree;
  const xPowersSum = new Array(maxPow + 1).fill(0);

  for (const p of points) {
    let curXPow = 1;
    for (let pIdx = 0; pIdx <= maxPow; pIdx++) {
      xPowersSum[pIdx] += curXPow;
      curXPow *= p.x;
    }
  }

  const XtX: number[][] = Array.from({ length: m }, () => new Array(m).fill(0));
  const Xty: number[] = new Array(m).fill(0);

  for (let j = 0; j < m; j++) {
    for (let k = 0; k < m; k++) {
      XtX[j][k] = xPowersSum[j + k];
      if (j === k) {
        // Tikhonov stabilization to prevent ill-conditioned Vandermonde matrix inversion
        XtX[j][k] += regularization;
      }
    }

    let ySum = 0;
    for (const p of points) {
      ySum += Math.pow(p.x, j) * p.y;
    }
    Xty[j] = ySum;
  }

  const coeffs = solveLinearSystem(XtX, Xty);
  if (!coeffs || coeffs.some((c) => isNaN(c) || !isFinite(c))) {
    // Fallback to simple mean if matrix is degenerate
    const meanY = points.reduce((acc, p) => acc + p.y, 0) / n;
    const fallback = new Array(m).fill(0);
    fallback[0] = meanY;
    return fallback;
  }

  return coeffs;
}

// ============================================================================
// Model Prediction Evaluator
// ŷ = sum_{j=0}^d w_j * x^j
// ============================================================================
export function evaluatePolynomial(coefficients: number[], x: number): number {
  let result = 0;
  let curX = 1;
  for (let j = 0; j < coefficients.length; j++) {
    result += coefficients[j] * curX;
    curX *= x;
  }
  return result;
}

// ============================================================================
// Regression Metrics: MSE, MAE, and R²
// Explicitly handles zero target variance: R² is undefined (returns null).
// ============================================================================
export function calculateRegressionMetrics(
  points: { x: number; y: number }[],
  coefficients: number[]
): RegressionMetrics {
  const n = points.length;
  if (n === 0) {
    return { mse: 0, mae: 0, r2: null, count: 0 };
  }

  let ssRes = 0;
  let sumAbsErr = 0;
  let sumY = 0;

  for (const p of points) {
    const yPred = evaluatePolynomial(coefficients, p.x);
    const err = p.y - yPred;
    ssRes += err * err;
    sumAbsErr += Math.abs(err);
    sumY += p.y;
  }

  const mse = Number((ssRes / n).toFixed(4));
  const mae = Number((sumAbsErr / n).toFixed(4));

  const meanY = sumY / n;
  let ssTot = 0;
  for (const p of points) {
    const diff = p.y - meanY;
    ssTot += diff * diff;
  }

  // Mathematically correct handling for zero variance in observed targets:
  // When ssTot is 0 (all target values identical), R² = 1 - (ssRes / 0) is undefined.
  let r2: number | null = null;
  if (ssTot > 1e-10) {
    const calculatedR2 = 1 - ssRes / ssTot;
    r2 = Number(calculatedR2.toFixed(4));
  }

  return { mse, mae, r2, count: n };
}

// ============================================================================
// Equation String Formatter (for LaTeX / UI display)
// ============================================================================
export function formatEquationString(coefficients: number[]): string {
  if (coefficients.length === 0) return "ŷ = 0";

  const terms: string[] = [];
  for (let i = coefficients.length - 1; i >= 0; i--) {
    const c = coefficients[i];
    if (Math.abs(c) < 1e-4 && terms.length > 0) continue;

    const absC = Math.abs(c).toFixed(3);
    const sign = c >= 0 ? (terms.length === 0 ? "" : "+ ") : "- ";

    if (i === 0) {
      terms.push(`${sign}${absC}`);
    } else if (i === 1) {
      terms.push(`${sign}${absC}x`);
    } else {
      terms.push(`${sign}${absC}x^${i}`);
    }
  }

  return `ŷ = ${terms.length > 0 ? terms.join(" ") : "0"}`;
}

// ============================================================================
// Synthetic Dataset Generator with Adjustable Noise
// ============================================================================
export function generateRegressionDataset(
  type: RegressionDatasetType,
  count: number,
  noise: number,
  seed: number,
  enableSplit: boolean,
  trainRatio = 0.75
): { points: RegressionPoint[]; trainPoints: RegressionPoint[]; testPoints: RegressionPoint[] } {
  const prng = createPrng(seed);
  const points: RegressionPoint[] = [];

  // Generate evenly spaced X coordinates with slight random jitter
  const step = 90 / Math.max(1, count - 1);

  for (let i = 0; i < count; i++) {
    const baseX = 5 + i * step;
    const x = Math.max(5, Math.min(95, baseX + (prng() - 0.5) * 1.5));
    let trueY = 0;

    switch (type) {
      case "linear":
        // y = 0.85 * x + 15
        trueY = 0.85 * x + 15;
        break;
      case "quadratic":
        // Inverted parabola: y = -0.024 * (x - 50)^2 + 75
        trueY = -0.024 * Math.pow(x - 50, 2) + 75;
        break;
      case "sine":
        // Sine wave: y = 50 + 26 * sin(x / 11)
        trueY = 50 + 26 * Math.sin(x / 11);
        break;
      case "noisy_cluster":
        // S-curve / sigmoid-like cluster
        trueY = 20 + 60 / (1 + Math.exp(-(x - 50) / 10));
        break;
    }

    // Add normal-distributed zero-mean noise
    const u1 = Math.max(1e-15, prng());
    const u2 = prng();
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    const noisyY = trueY + z * noise;

    const clampedY = Math.max(5, Math.min(95, noisyY));

    points.push({
      id: i,
      x: Number(x.toFixed(2)),
      y: Number(clampedY.toFixed(2)),
      isTest: false,
    });
  }

  // Deterministic train/test assignment if split is active
  let trainPoints = points;
  let testPoints: RegressionPoint[] = [];

  if (enableSplit && count >= 4) {
    const splitPrng = createPrng(seed + 777);
    const indices = Array.from({ length: count }, (_, i) => i);
    // Fisher-Yates deterministic shuffle
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(splitPrng() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    const testCount = Math.max(1, Math.floor(count * (1 - trainRatio)));
    const testIndexSet = new Set(indices.slice(0, testCount));

    points.forEach((p, idx) => {
      p.isTest = testIndexSet.has(idx);
    });

    trainPoints = points.filter((p) => !p.isTest);
    testPoints = points.filter((p) => p.isTest);
  }

  return { points, trainPoints, testPoints };
}

// ============================================================================
// Complete Model Fitting Pipeline
// Fits model parameters on training subset and computes metrics across splits.
// ============================================================================
export function fitModel(
  points: RegressionPoint[],
  degree: number,
  enableSplit: boolean
): RegressionModel {
  const trainPoints = enableSplit ? points.filter((p) => !p.isTest) : points;
  const testPoints = enableSplit ? points.filter((p) => p.isTest) : [];

  const coefficients = fitPolynomialRegression(trainPoints, degree);
  const predict = (x: number) => evaluatePolynomial(coefficients, x);
  const equationString = formatEquationString(coefficients);

  const trainMetrics = calculateRegressionMetrics(trainPoints, coefficients);
  const testMetrics = enableSplit && testPoints.length > 0
    ? calculateRegressionMetrics(testPoints, coefficients)
    : null;
  const totalMetrics = calculateRegressionMetrics(points, coefficients);

  return {
    degree,
    coefficients,
    predict,
    equationString,
    trainMetrics,
    testMetrics,
    totalMetrics,
  };
}
