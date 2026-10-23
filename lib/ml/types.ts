/**
 * ThinkViz Machine Learning Types
 * Strict contracts for K-Means, Regression, and Confusion Matrix
 */

// ============================================================================
// 1. K-Means Clustering Types
// ============================================================================

export interface Point2D {
  id: number;
  x: number;
  y: number;
  cluster: number; // Index of assigned cluster (0 to K-1), or -1 if unassigned
}

export interface Centroid2D {
  id: number;
  x: number;
  y: number;
  color: string;
}

export type KMeansDatasetType = "blobs" | "separated" | "uniform";

export interface KMeansConfig {
  k: number;
  datasetType: KMeansDatasetType;
  pointCount: number;
  seed: number;
  maxIterations?: number;
}

export type KMeansPhase = "init" | "assigned" | "updated" | "converged";

export interface KMeansStep {
  stepIndex: number;
  iteration: number;
  phase: KMeansPhase;
  points: Point2D[];
  centroids: Centroid2D[];
  wcss: number;
  reassignedCount: number;
  centroidsMoved: boolean;
  maxCentroidDelta: number;
  converged: boolean;
  explanation: string;
}

// Cluster color palette (accessible, high-contrast, Josef Albers aligned)
export const CLUSTER_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Rose
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
  "#EC4899", // Pink
  "#F97316", // Orange
];

// ============================================================================
// 2. Regression Types
// ============================================================================

export interface RegressionPoint {
  id: number;
  x: number;
  y: number;
  isTest?: boolean;
}

export type RegressionDatasetType = "linear" | "quadratic" | "sine" | "noisy_cluster";

export interface RegressionMetrics {
  mse: number;
  mae: number;
  r2: number | null; // null when target variance is 0 (mathematically undefined)
  count: number;
}

export interface RegressionModel {
  degree: number;
  coefficients: number[]; // [w_0, w_1, ..., w_d] where y = w_0 + w_1*x + ...
  predict: (x: number) => number;
  equationString: string;
  trainMetrics: RegressionMetrics;
  testMetrics: RegressionMetrics | null;
  totalMetrics: RegressionMetrics;
}

export interface RegressionConfig {
  degree: number;
  noise: number;
  pointCount: number;
  datasetType: RegressionDatasetType;
  seed: number;
  enableTrainTestSplit: boolean;
  trainSplitRatio?: number; // default 0.75
}

// ============================================================================
// 3. Confusion Matrix Types
// ============================================================================

export interface ConfusionCounts {
  tp: number; // True Positives
  fp: number; // False Positives
  tn: number; // True Negatives
  fn: number; // False Negatives
}

export interface ConfusionMetrics {
  total: number;
  actualPositive: number;
  actualNegative: number;
  predictedPositive: number;
  predictedNegative: number;
  accuracy: number | null; // null if total == 0
  precision: number | null; // null if TP + FP == 0
  recall: number | null; // null if TP + FN == 0
  specificity: number | null; // null if TN + FP == 0
  f1Score: number | null; // null if precision + recall == 0 or undefined
}

export interface ConfusionPreset {
  id: string;
  name: string;
  description: string;
  counts: ConfusionCounts;
}
