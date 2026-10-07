import { OptimizationState } from "@/types/optimization";
import { AlgorithmStep } from "@/types/visualizer";
import { getLandscape, DEFAULT_LANDSCAPE_ID } from "./landscapes";

const defaultLandscape = getLandscape(DEFAULT_LANDSCAPE_ID);
export const OPTIMIZATION_DOMAIN = { minX: defaultLandscape.minX, maxX: defaultLandscape.maxX };
export const OPTIMIZATION_RESOLUTION = 120; // Number of points to sample for SVG rendering

export const getLandscapeY = (x: number, landscapeId: string = DEFAULT_LANDSCAPE_ID) => {
  return getLandscape(landscapeId).getY(x);
};

export function generateHillClimbingSteps(
  initialX: number, 
  stepSize: number = 0.5,
  landscapeId: string = DEFAULT_LANDSCAPE_ID
): AlgorithmStep<OptimizationState>[] {
  const landscape = getLandscape(landscapeId);
  const steps: AlgorithmStep<OptimizationState>[] = [];
  let stepCounter = 0;
  
  let currentX = initialX;
  const visitedX: number[] = [];
  
  function pushStep(desc: string, line: number, current: number, considered: number[] = []) {
    steps.push({
      stepIndex: stepCounter++,
      description: desc,
      highlightedLine: line,
      state: {
        currentX: current,
        currentY: landscape.getY(current),
        visitedX: [...visitedX],
        consideredX: considered,
        landscapeId,
      },
      metrics: {
        nodesExplored: visitedX.length,
        frontierSize: considered.length,
        pathCost: parseFloat(landscape.getY(current).toFixed(2)),
        totalSteps: 0,
      }
    });
  }

  pushStep(`Initialized Hill Climbing at starting position x = ${currentX.toFixed(2)}.`, 1, currentX);

  const maxIterations = 100;
  let iterations = 0;

  while (iterations < maxIterations) {
    iterations++;
    visitedX.push(currentX);
    
    // Bounds-checked neighbors
    const leftX = currentX - stepSize;
    const rightX = currentX + stepSize;
    const neighbors: number[] = [];
    if (leftX >= landscape.minX) neighbors.push(leftX);
    if (rightX <= landscape.maxX) neighbors.push(rightX);
    
    pushStep(`Evaluating adjacent state neighbors.`, 2, currentX, neighbors);
    
    let bestNextX = currentX;
    let bestY = landscape.getY(currentX);
    
    for (const nx of neighbors) {
      const ny = landscape.getY(nx);
      if (ny > bestY) {
        bestNextX = nx;
        bestY = ny;
      }
    }
    
    if (bestNextX === currentX) {
      pushStep(`Peak reached. All immediate neighbors lead downhill. Trapped in Local Maximum at x = ${currentX.toFixed(2)} (f = ${bestY.toFixed(2)})!`, 3, currentX);
      break;
    } else {
      pushStep(`Higher evaluation found at x = ${bestNextX.toFixed(2)} (f = ${bestY.toFixed(2)}). Moving uphill.`, 4, currentX, [bestNextX]);
      currentX = bestNextX;
    }
  }
  
  steps.forEach(s => s.metrics.totalSteps = steps.length);
  return steps;
}
