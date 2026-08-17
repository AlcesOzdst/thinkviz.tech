// Represents the landscape of a 1D function for optimization search
export interface OptimizationLandscape {
  minX: number;
  maxX: number;
  // We represent the function as an array of pre-computed Y values for simplicity in rendering,
  // or a javascript function. Let's use a JS function for exact calculations, and generate points for SVG.
  // Wait, we can't easily serialize JS functions into React state if we pass them around.
  // Instead, the algorithm generates steps, the landscape is static.
}

// Represents the state of the search at a specific moment in time
export interface OptimizationState {
  currentX: number;
  currentY: number;
  visitedX: number[]; // History of the path taken (primarily for hill climbing)
  consideredX: number[]; // Neighbor points currently being evaluated
  population?: number[]; // The current swarm of points (for genetic algorithms)
}
