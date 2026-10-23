/**
 * K-Means Algorithm Unit Tests
 * Verifies assignment, arithmetic mean updates, convergence, empty cluster safety, and non-negative WCSS.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
  euclideanDistance,
  squaredEuclideanDistance,
  assignPointsToCentroids,
  updateCentroidPositions,
  calculateWCSS,
  generateKMeansSteps,
  generateKMeansDataset,
  initializeCentroids,
} from "../../lib/ml/kmeans.ts";
import type { Point2D, Centroid2D } from "../../lib/ml/types.ts";


test("K-Means: Euclidean distance is calculated accurately", () => {
  const p1 = { x: 0, y: 0 };
  const p2 = { x: 3, y: 4 };
  assert.equal(euclideanDistance(p1, p2), 5);
  assert.equal(squaredEuclideanDistance(p1, p2), 25);
});

test("K-Means: Points close to the same centroid receive appropriate assignment", () => {
  const centroids: Centroid2D[] = [
    { id: 0, x: 10, y: 10, color: "#3B82F6" },
    { id: 1, x: 90, y: 90, color: "#10B981" },
  ];

  const points: Point2D[] = [
    { id: 0, x: 12, y: 11, cluster: -1 }, // Near C0
    { id: 1, x: 9, y: 10, cluster: -1 },  // Near C0
    { id: 2, x: 88, y: 91, cluster: -1 }, // Near C1
    { id: 3, x: 92, y: 89, cluster: -1 }, // Near C1
  ];

  const result = assignPointsToCentroids(points, centroids);
  assert.equal(result.updatedPoints[0].cluster, 0);
  assert.equal(result.updatedPoints[1].cluster, 0);
  assert.equal(result.updatedPoints[2].cluster, 1);
  assert.equal(result.updatedPoints[3].cluster, 1);
  assert.equal(result.reassignedCount, 4);
});

test("K-Means: Centroids are updated using the exact arithmetic mean", () => {
  const centroids: Centroid2D[] = [
    { id: 0, x: 0, y: 0, color: "#3B82F6" },
    { id: 1, x: 50, y: 50, color: "#10B981" },
  ];

  // Cluster 0 points: (10, 20), (20, 40), (30, 60) -> Mean: x = 20, y = 40
  // Cluster 1 points: (70, 80), (90, 100) -> Mean: x = 80, y = 90
  const points: Point2D[] = [
    { id: 0, x: 10, y: 20, cluster: 0 },
    { id: 1, x: 20, y: 40, cluster: 0 },
    { id: 2, x: 30, y: 60, cluster: 0 },
    { id: 3, x: 70, y: 80, cluster: 1 },
    { id: 4, x: 90, y: 100, cluster: 1 },
  ];

  const { updatedCentroids, centroidsMoved } = updateCentroidPositions(points, centroids);
  assert.equal(centroidsMoved, true);
  assert.equal(updatedCentroids[0].x, 20);
  assert.equal(updatedCentroids[0].y, 40);
  assert.equal(updatedCentroids[1].x, 80);
  assert.equal(updatedCentroids[1].y, 90);
});

test("K-Means: Empty clusters do not create invalid NaN coordinates", () => {
  const centroids: Centroid2D[] = [
    { id: 0, x: 10, y: 10, color: "#3B82F6" },
    { id: 1, x: 80, y: 80, color: "#10B981" },
  ];

  // All points assigned to cluster 0; cluster 1 is empty
  const points: Point2D[] = [
    { id: 0, x: 10, y: 10, cluster: 0 },
    { id: 1, x: 12, y: 11, cluster: 0 },
    { id: 2, x: 40, y: 50, cluster: 0 }, // Farthest point from C0
  ];

  const { updatedCentroids } = updateCentroidPositions(points, centroids);
  assert.equal(updatedCentroids.length, 2);
  for (const c of updatedCentroids) {
    assert.ok(!isNaN(c.x), `Centroid ${c.id} x is NaN`);
    assert.ok(!isNaN(c.y), `Centroid ${c.id} y is NaN`);
    assert.ok(isFinite(c.x), `Centroid ${c.id} x is not finite`);
    assert.ok(isFinite(c.y), `Centroid ${c.id} y is not finite`);
  }
});

test("K-Means: Inertia (WCSS) is strictly non-negative", () => {
  const centroids: Centroid2D[] = [
    { id: 0, x: 20, y: 20, color: "#3B82F6" },
  ];
  const points: Point2D[] = [
    { id: 0, x: 23, y: 24, cluster: 0 }, // d^2 = 9 + 16 = 25
    { id: 1, x: 20, y: 20, cluster: 0 }, // d^2 = 0
  ];

  const wcss = calculateWCSS(points, centroids);
  assert.equal(wcss, 25);
  assert.ok(wcss >= 0, "WCSS must be >= 0");
});

test("K-Means: Separated dataset converges properly in full step trace", () => {
  const steps = generateKMeansSteps({
    k: 3,
    datasetType: "separated",
    pointCount: 60,
    seed: 42,
    maxIterations: 20,
  });

  assert.ok(steps.length > 2, "Expected multiple iteration steps");
  const finalStep = steps[steps.length - 1];
  assert.equal(finalStep.converged, true, "Algorithm should converge on separated clusters");
  assert.ok(finalStep.wcss >= 0, "Final WCSS must be non-negative");

  // Verify all points have valid cluster assignments in [0, 2]
  for (const p of finalStep.points) {
    assert.ok(p.cluster >= 0 && p.cluster < 3, `Point cluster ${p.cluster} out of range`);
  }
});

test("K-Means: Reproducibility with identical seed", () => {
  const pts1 = generateKMeansDataset("blobs", 40, 12345);
  const pts2 = generateKMeansDataset("blobs", 40, 12345);
  assert.deepEqual(pts1, pts2, "Identical seed must generate identical points");

  const c1 = initializeCentroids(pts1, 3, 12345);
  const c2 = initializeCentroids(pts2, 3, 12345);
  assert.deepEqual(c1, c2, "Identical seed must produce identical centroids");
});
