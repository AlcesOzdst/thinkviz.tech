import { Position, GridNode, GridState } from "@/types/grid";
import { AlgorithmStep } from "@/types/visualizer";
import { MinHeap } from "@/lib/priorityQueue";
import { manhattanDistance, HeuristicFunction } from "@/lib/heuristics";

/**
 * Creates a clean default grid with start, goal, and optional walls.
 */
export function createInitialGrid(
  rows: number,
  cols: number,
  startPos: Position,
  goalPos: Position,
  wallPositions: Position[] = []
): GridNode[][] {
  const wallSet = new Set(wallPositions.map((p) => `${p.row},${p.col}`));
  const grid: GridNode[][] = [];

  for (let r = 0; r < rows; r++) {
    const rowNodes: GridNode[] = [];
    for (let c = 0; c < cols; c++) {
      const isStart = r === startPos.row && c === startPos.col;
      const isGoal = r === goalPos.row && c === goalPos.col;
      const isWall = wallSet.has(`${r},${c}`);

      rowNodes.push({
        row: r,
        col: c,
        type: isStart ? "start" : isGoal ? "goal" : isWall ? "wall" : "empty",
        gCost: Infinity,
        hCost: Infinity,
        fCost: Infinity,
        parent: null,
      });
    }
    grid.push(rowNodes);
  }

  return grid;
}

/**
 * Deep clones the 2D grid matrix to guarantee immutable step snapshots.
 */
function cloneGrid(grid: GridNode[][]): GridNode[][] {
  return grid.map((row) =>
    row.map((node) => ({
      ...node,
      parent: node.parent ? { ...node.parent } : null,
    }))
  );
}

/**
 * Pure TypeScript A* Search Engine.
 * Generates an array of immutable step snapshots for step-by-step visualization.
 */
export function generateAStarSteps(
  initialGrid: GridNode[][],
  startPos: Position,
  goalPos: Position,
  heuristic: HeuristicFunction = manhattanDistance
): AlgorithmStep<GridState>[] {
  const steps: AlgorithmStep<GridState>[] = [];
  let stepCounter = 0;

  // Working copy of grid
  const workingGrid = cloneGrid(initialGrid);

  // Setup start node values
  const startNode = workingGrid[startPos.row][startPos.col];
  startNode.gCost = 0;
  startNode.hCost = heuristic(startPos, goalPos);
  startNode.fCost = startNode.gCost + startNode.hCost;

  // Priority queue comparing fCost, breaking ties with hCost
  const openSet = new MinHeap<GridNode>((a, b) => {
    if (a.fCost !== b.fCost) return a.fCost - b.fCost;
    return a.hCost - b.hCost;
  });

  const openSetPositions: Position[] = [];
  const closedSetPositions: Position[] = [];
  const closedSetKey = new Set<string>();

  // Push snapshot of start node
  openSet.push({ ...startNode });
  openSetPositions.push({ row: startPos.row, col: startPos.col });

  // Record Step 0: Initialization (Line 1: Add start node to OPEN)
  steps.push({
    stepIndex: stepCounter++,
    description: `Initialized A* Search. Calculated start node heuristic h(n) = ${startNode.hCost.toFixed(2)}.`,
    highlightedLine: 1,
    state: {
      grid: cloneGrid(workingGrid),
      startPos: { ...startPos },
      goalPos: { ...goalPos },
      currentNode: { ...startPos },
      openSetPositions: [...openSetPositions],
      closedSetPositions: [...closedSetPositions],
      pathPositions: [],
      consideredNeighbors: [],
    },
    metrics: {
      nodesExplored: 0,
      frontierSize: openSetPositions.length,
      pathCost: 0,
      totalSteps: 0,
    },
  });

  const directions = [
    { row: -1, col: 0 }, // Up
    { row: 1, col: 0 },  // Down
    { row: 0, col: -1 }, // Left
    { row: 0, col: 1 },  // Right
  ];

  while (!openSet.isEmpty()) {
    // Extract node with minimum f(n)
    const current = openSet.pop()!;
    const currentKey = `${current.row},${current.col}`;
    const bestKnownNode = workingGrid[current.row][current.col];

    // Lazy deletion: If this popped heap entry is stale (a lower-cost version was processed or recorded earlier)
    // or if the node is already in the closed set, discard it immediately.
    if (current.gCost > bestKnownNode.gCost || closedSetKey.has(currentKey)) {
      continue;
    }

    const currentPos = { row: current.row, col: current.col };

    // Remove from openSetPositions display tracking
    const openIdx = openSetPositions.findIndex(
      (p) => p.row === current.row && p.col === current.col
    );
    if (openIdx !== -1) {
      openSetPositions.splice(openIdx, 1);
    }

    // Check if goal reached (Line 3: If node is GOAL, reconstruct path & finish)
    if (current.row === goalPos.row && current.col === goalPos.col) {
      // Reconstruct path
      const pathPositions: Position[] = [];
      let curr: GridNode | null = bestKnownNode;
      while (curr !== null) {
        pathPositions.unshift({ row: curr.row, col: curr.col });
        if (curr.parent) {
          curr = workingGrid[curr.parent.row][curr.parent.col];
        } else {
          curr = null;
        }
      }

      const finalPathCost = current.gCost;

      steps.push({
        stepIndex: stepCounter++,
        description: `Goal reached at (${goalPos.row}, ${goalPos.col})! Optimal path reconstructed with cost ${finalPathCost.toFixed(2)}.`,
        highlightedLine: 3,
        state: {
          grid: cloneGrid(workingGrid),
          startPos: { ...startPos },
          goalPos: { ...goalPos },
          currentNode: currentPos,
          openSetPositions: [...openSetPositions],
          closedSetPositions: [...closedSetPositions, currentPos],
          pathPositions,
          consideredNeighbors: [],
        },
        metrics: {
          nodesExplored: closedSetPositions.length + 1,
          frontierSize: openSetPositions.length,
          pathCost: finalPathCost,
          totalSteps: stepCounter,
        },
      });

      // Update totalSteps in all metric steps
      steps.forEach((s) => (s.metrics.totalSteps = steps.length));
      return steps;
    }

    // Add current to closedSet (Line 4: Move current node to CLOSED)
    closedSetPositions.push(currentPos);
    closedSetKey.add(currentKey);

    const consideredNeighbors: Position[] = [];

    // Evaluate 4-way neighbors
    for (const dir of directions) {
      const neighborRow = current.row + dir.row;
      const neighborCol = current.col + dir.col;

      // Check bounds
      if (
        neighborRow < 0 ||
        neighborRow >= workingGrid.length ||
        neighborCol < 0 ||
        neighborCol >= workingGrid[0].length
      ) {
        continue;
      }

      const neighbor = workingGrid[neighborRow][neighborCol];

      // Skip walls or already closed nodes
      if (neighbor.type === "wall" || closedSetKey.has(`${neighborRow},${neighborCol}`)) {
        continue;
      }

      consideredNeighbors.push({ row: neighborRow, col: neighborCol });

      const tentativeGCost = current.gCost + 1; // Unweighted grid cost = 1 per step

      if (tentativeGCost < neighbor.gCost) {
        neighbor.parent = { row: current.row, col: current.col };
        neighbor.gCost = tentativeGCost;
        neighbor.hCost = heuristic({ row: neighborRow, col: neighborCol }, goalPos);
        neighbor.fCost = neighbor.gCost + neighbor.hCost;

        // Push a value snapshot into openSet heap
        openSet.push({ ...neighbor });

        const inOpenSet = openSetPositions.some(
          (p) => p.row === neighborRow && p.col === neighborCol
        );

        if (!inOpenSet) {
          openSetPositions.push({ row: neighborRow, col: neighborCol });
        }
      }
    }

    // Record Step for current node expansion (Line 2: Select node with lowest f(n))
    steps.push({
      stepIndex: stepCounter++,
      description: `Evaluating node (${current.row}, ${current.col}) with g=${current.gCost}, h=${current.hCost.toFixed(2)}, f=${current.fCost.toFixed(2)}. Checked ${consideredNeighbors.length} neighbors.`,
      highlightedLine: 2,
      state: {
        grid: cloneGrid(workingGrid),
        startPos: { ...startPos },
        goalPos: { ...goalPos },
        currentNode: currentPos,
        openSetPositions: [...openSetPositions],
        closedSetPositions: [...closedSetPositions],
        pathPositions: [],
        consideredNeighbors,
      },
      metrics: {
        nodesExplored: closedSetPositions.length,
        frontierSize: openSetPositions.length,
        pathCost: current.gCost,
        totalSteps: 0,
      },
    });
  }

  // Path not found step (Line 8: OPEN set empty, search completed)
  steps.push({
    stepIndex: stepCounter++,
    description: `Search completed. No path exists from start to goal.`,
    highlightedLine: 8,
    state: {
      grid: cloneGrid(workingGrid),
      startPos: { ...startPos },
      goalPos: { ...goalPos },
      currentNode: null,
      openSetPositions: [],
      closedSetPositions: [...closedSetPositions],
      pathPositions: [],
      consideredNeighbors: [],
    },
    metrics: {
      nodesExplored: closedSetPositions.length,
      frontierSize: 0,
      pathCost: 0,
      totalSteps: stepCounter,
    },
  });

  steps.forEach((s) => (s.metrics.totalSteps = steps.length));
  return steps;
}
