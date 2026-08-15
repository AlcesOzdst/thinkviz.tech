export type Position = {
  row: number;
  col: number;
};

export type CellType = "empty" | "start" | "goal" | "wall";

export interface GridNode {
  row: number;
  col: number;
  type: CellType;
  gCost: number; // Distance from start
  hCost: number; // Estimated heuristic cost to goal
  fCost: number; // gCost + hCost
  parent: Position | null;
}

export interface GridState {
  grid: GridNode[][];
  startPos: Position;
  goalPos: Position;
  currentNode: Position | null;
  openSetPositions: Position[];   // Frontier nodes
  closedSetPositions: Position[]; // Visited nodes
  pathPositions: Position[];      // Reconstructed optimal path
  consideredNeighbors: Position[];
}
