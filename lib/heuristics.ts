import { Position } from "@/types/grid";

export type HeuristicFunction = (a: Position, b: Position) => number;

/**
 * Manhattan Distance (L1 norm)
 * Ideal for grid navigation with 4-directional movement (orthogonal).
 */
export const manhattanDistance: HeuristicFunction = (a, b) => {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
};

/**
 * Euclidean Distance (L2 norm)
 * Straight-line distance.
 */
export const euclideanDistance: HeuristicFunction = (a, b) => {
  return Math.sqrt(Math.pow(a.row - b.row, 2) + Math.pow(a.col - b.col, 2));
};

/**
 * Chebyshev Distance (L∞ norm)
 * Ideal for grid navigation with 8-directional movement (including diagonals).
 */
export const chebyshevDistance: HeuristicFunction = (a, b) => {
  return Math.max(Math.abs(a.row - b.row), Math.abs(a.col - b.col));
};
