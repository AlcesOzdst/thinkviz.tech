/**
 * K-Means Clustering Mathematical Logic
 * Pure algorithmic functions: distance, assignment, centroid update, WCSS, and step tracing.
 */

import type {
  Point2D,
  Centroid2D,
  KMeansConfig,
  KMeansDatasetType,
  KMeansStep,
} from "./types.ts";
import { CLUSTER_COLORS } from "./types.ts";



// ============================================================================
// Deterministic Seedable PRNG (Mulberry32)
// ============================================================================
export function createPrng(seed: number) {
  let s = Math.floor(Math.abs(seed)) || 123456789;
  return function next(): number {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Normal/Gaussian random generator using Box-Muller transform
function nextGaussian(prng: () => number, mean = 0, stdev = 1): number {
  const u1 = Math.max(1e-15, prng());
  const u2 = prng();
  const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + z * stdev;
}

// ============================================================================
// Distance Metrics
// ============================================================================
export function squaredEuclideanDistance(
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return dx * dx + dy * dy;
}

export function euclideanDistance(
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): number {
  return Math.sqrt(squaredEuclideanDistance(p1, p2));
}

// ============================================================================
// Dataset Generator (Reproducible)
// ============================================================================
export function generateKMeansDataset(
  type: KMeansDatasetType,
  count: number,
  seed: number
): Point2D[] {
  const prng = createPrng(seed);
  const points: Point2D[] = [];

  const clamp = (val: number, min = 5, max = 95) => Math.max(min, Math.min(max, val));

  if (type === "separated") {
    // 3 or 4 widely separated clusters
    const centers = [
      { x: 22, y: 25 },
      { x: 78, y: 28 },
      { x: 30, y: 78 },
      { x: 75, y: 75 },
    ];
    for (let i = 0; i < count; i++) {
      const center = centers[i % centers.length];
      const x = clamp(nextGaussian(prng, center.x, 5.5));
      const y = clamp(nextGaussian(prng, center.y, 5.5));
      points.push({ id: i, x: Number(x.toFixed(2)), y: Number(y.toFixed(2)), cluster: -1 });
    }
  } else if (type === "blobs") {
    // Multi-density overlapping Gaussian blobs
    const centers = [
      { x: 35, y: 35, spread: 8 },
      { x: 65, y: 40, spread: 10 },
      { x: 50, y: 72, spread: 7 },
    ];
    for (let i = 0; i < count; i++) {
      const c = centers[i % centers.length];
      const x = clamp(nextGaussian(prng, c.x, c.spread));
      const y = clamp(nextGaussian(prng, c.y, c.spread));
      points.push({ id: i, x: Number(x.toFixed(2)), y: Number(y.toFixed(2)), cluster: -1 });
    }
  } else {
    // Uniform random distribution
    for (let i = 0; i < count; i++) {
      const x = clamp(prng() * 90 + 5);
      const y = clamp(prng() * 90 + 5);
      points.push({ id: i, x: Number(x.toFixed(2)), y: Number(y.toFixed(2)), cluster: -1 });
    }
  }

  return points;
}

// ============================================================================
// Centroid Initialization (K-Means++ Style Deterministic Pick)
// ============================================================================
export function initializeCentroids(
  points: Point2D[],
  k: number,
  seed: number
): Centroid2D[] {
  if (points.length === 0 || k <= 0) return [];
  const safeK = Math.min(k, points.length);
  const prng = createPrng(seed + 999);

  const centroids: Centroid2D[] = [];
  // 1. Pick first centroid uniformly at random from existing points
  const firstIdx = Math.floor(prng() * points.length);
  centroids.push({
    id: 0,
    x: points[firstIdx].x,
    y: points[firstIdx].y,
    color: CLUSTER_COLORS[0 % CLUSTER_COLORS.length],
  });

  // 2. K-Means++ weighted probability selection for subsequent centroids
  for (let c = 1; c < safeK; c++) {
    // Compute distance from nearest already-chosen centroid for each point
    const distances = points.map((p) => {
      let minDistSq = Infinity;
      for (const centroid of centroids) {
        const dSq = squaredEuclideanDistance(p, centroid);
        if (dSq < minDistSq) minDistSq = dSq;
      }
      return minDistSq;
    });

    const sumDistSq = distances.reduce((acc, d) => acc + d, 0);
    if (sumDistSq === 0) {
      // Degenerate case (all points identical); pick arbitrary
      const fallbackIdx = (firstIdx + c) % points.length;
      centroids.push({
        id: c,
        x: points[fallbackIdx].x,
        y: points[fallbackIdx].y,
        color: CLUSTER_COLORS[c % CLUSTER_COLORS.length],
      });
      continue;
    }

    const r = prng() * sumDistSq;
    let accumulated = 0;
    let selectedIdx = 0;
    for (let i = 0; i < points.length; i++) {
      accumulated += distances[i];
      if (accumulated >= r) {
        selectedIdx = i;
        break;
      }
    }

    centroids.push({
      id: c,
      x: points[selectedIdx].x,
      y: points[selectedIdx].y,
      color: CLUSTER_COLORS[c % CLUSTER_COLORS.length],
    });
  }

  return centroids;
}

// ============================================================================
// Step 1: Assignment Step
// Assign each point to its nearest centroid via Euclidean distance.
// Returns new points array and count of points whose cluster changed.
// ============================================================================
export function assignPointsToCentroids(
  points: Point2D[],
  centroids: Centroid2D[]
): { updatedPoints: Point2D[]; reassignedCount: number } {
  if (centroids.length === 0) {
    return {
      updatedPoints: points.map((p) => ({ ...p, cluster: -1 })),
      reassignedCount: 0,
    };
  }

  let reassignedCount = 0;
  const updatedPoints = points.map((point) => {
    let nearestCluster = 0;
    let minDistanceSq = Infinity;

    for (let c = 0; c < centroids.length; c++) {
      const dSq = squaredEuclideanDistance(point, centroids[c]);
      if (dSq < minDistanceSq) {
        minDistanceSq = dSq;
        nearestCluster = c;
      }
    }

    if (point.cluster !== nearestCluster) {
      reassignedCount++;
    }

    return {
      ...point,
      cluster: nearestCluster,
    };
  });

  return { updatedPoints, reassignedCount };
}

// ============================================================================
// Step 2: Centroid Update Step
// Recalculates centroids as arithmetic mean of assigned points.
// Deterministic empty cluster handling: repositions empty centroid to the
// data point with the largest distance from its assigned centroid.
// ============================================================================
export function updateCentroidPositions(
  points: Point2D[],
  centroids: Centroid2D[]
): { updatedCentroids: Centroid2D[]; maxDelta: number; centroidsMoved: boolean } {
  const k = centroids.length;
  if (k === 0) {
    return { updatedCentroids: [], maxDelta: 0, centroidsMoved: false };
  }

  // Group points by cluster
  const clusterPoints: Point2D[][] = Array.from({ length: k }, () => []);
  for (const p of points) {
    if (p.cluster >= 0 && p.cluster < k) {
      clusterPoints[p.cluster].push(p);
    }
  }

  let maxDelta = 0;
  const updatedCentroids: Centroid2D[] = [];

  for (let c = 0; c < k; c++) {
    const pts = clusterPoints[c];
    let newX = centroids[c].x;
    let newY = centroids[c].y;

    if (pts.length > 0) {
      // Arithmetic mean
      const sumX = pts.reduce((acc, p) => acc + p.x, 0);
      const sumY = pts.reduce((acc, p) => acc + p.y, 0);
      newX = Number((sumX / pts.length).toFixed(3));
      newY = Number((sumY / pts.length).toFixed(3));
    } else {
      // Documented deterministic policy for empty clusters:
      // Re-seed empty centroid to the data point farthest from its currently assigned centroid.
      let farthestPoint: Point2D | null = null;
      let maxDistSq = -1;

      for (const p of points) {
        const assignedCentroid = centroids[p.cluster];
        if (assignedCentroid) {
          const dSq = squaredEuclideanDistance(p, assignedCentroid);
          if (dSq > maxDistSq) {
            maxDistSq = dSq;
            farthestPoint = p;
          }
        }
      }

      if (farthestPoint) {
        newX = farthestPoint.x;
        newY = farthestPoint.y;
      }
    }

    const delta = euclideanDistance(centroids[c], { x: newX, y: newY });
    if (delta > maxDelta) maxDelta = delta;

    updatedCentroids.push({
      id: c,
      x: newX,
      y: newY,
      color: centroids[c].color,
    });
  }

  const centroidsMoved = maxDelta > 0.001;
  return { updatedCentroids, maxDelta, centroidsMoved };
}

// ============================================================================
// Within-Cluster Sum of Squares (WCSS / Inertia)
// ============================================================================
export function calculateWCSS(points: Point2D[], centroids: Centroid2D[]): number {
  if (centroids.length === 0 || points.length === 0) return 0;
  let wcss = 0;

  for (const point of points) {
    if (point.cluster >= 0 && point.cluster < centroids.length) {
      const centroid = centroids[point.cluster];
      wcss += squaredEuclideanDistance(point, centroid);
    }
  }

  return Number(wcss.toFixed(2));
}

// ============================================================================
// Comprehensive Step-by-Step Execution Generator
// ============================================================================
export function generateKMeansSteps(config: KMeansConfig): KMeansStep[] {
  const { k, datasetType, pointCount, seed, maxIterations = 30 } = config;

  const points = generateKMeansDataset(datasetType, pointCount, seed);
  const initialCentroids = initializeCentroids(points, k, seed);

  const steps: KMeansStep[] = [];

  // Initial Step 0: Centroids initialized, points not yet assigned
  let currentPoints = points.map((p) => ({ ...p }));
  let currentCentroids = initialCentroids.map((c) => ({ ...c }));
  let currentWCSS = 0;

  steps.push({
    stepIndex: 0,
    iteration: 0,
    phase: "init",
    points: currentPoints.map((p) => ({ ...p })),
    centroids: currentCentroids.map((c) => ({ ...c })),
    wcss: 0,
    reassignedCount: 0,
    centroidsMoved: true,
    maxCentroidDelta: 0,
    converged: false,
    explanation: `Initialized K=${k} centroids using K-Means++ seeding. Points are ready for initial distance evaluation.`,
  });

  let iteration = 1;
  let isConverged = false;

  while (iteration <= maxIterations && !isConverged) {
    // 1. Assignment Phase
    const assignmentResult = assignPointsToCentroids(currentPoints, currentCentroids);
    currentPoints = assignmentResult.updatedPoints;
    currentWCSS = calculateWCSS(currentPoints, currentCentroids);

    steps.push({
      stepIndex: steps.length,
      iteration,
      phase: "assigned",
      points: currentPoints.map((p) => ({ ...p })),
      centroids: currentCentroids.map((c) => ({ ...c })),
      wcss: currentWCSS,
      reassignedCount: assignmentResult.reassignedCount,
      centroidsMoved: false,
      maxCentroidDelta: 0,
      converged: false,
      explanation: `Iteration ${iteration} [Assignment]: Assigned all ${pointCount} points to their nearest centroid. (${assignmentResult.reassignedCount} point${assignmentResult.reassignedCount === 1 ? "" : "s"} reassigned). Current WCSS: ${currentWCSS.toLocaleString()}.`,
    });

    // 2. Update Phase
    const updateResult = updateCentroidPositions(currentPoints, currentCentroids);
    currentCentroids = updateResult.updatedCentroids;
    const postUpdateWCSS = calculateWCSS(currentPoints, currentCentroids);

    // Convergence check: points did not reassign or centroids barely moved
    isConverged =
      iteration > 1 &&
      (assignmentResult.reassignedCount === 0 || !updateResult.centroidsMoved);

    steps.push({
      stepIndex: steps.length,
      iteration,
      phase: isConverged ? "converged" : "updated",
      points: currentPoints.map((p) => ({ ...p })),
      centroids: currentCentroids.map((c) => ({ ...c })),
      wcss: postUpdateWCSS,
      reassignedCount: assignmentResult.reassignedCount,
      centroidsMoved: updateResult.centroidsMoved,
      maxCentroidDelta: Number(updateResult.maxDelta.toFixed(3)),
      converged: isConverged,
      explanation: isConverged
        ? `Converged at iteration ${iteration}! Point assignments stabilized and centroid displacement is below tolerance (Δ = ${updateResult.maxDelta.toFixed(3)}). Final WCSS: ${postUpdateWCSS.toLocaleString()}.`
        : `Iteration ${iteration} [Update]: Shifted centroids to arithmetic means of cluster members (max displacement Δ = ${updateResult.maxDelta.toFixed(2)}). Post-update WCSS: ${postUpdateWCSS.toLocaleString()}.`,
    });

    iteration++;
  }

  return steps;
}
