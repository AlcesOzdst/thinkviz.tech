import { Position, GridNode, GridState } from "@/types/grid";
import { AlgorithmStep } from "@/types/visualizer";

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
 * Pure TypeScript Depth-First Search (DFS) Engine.
 * Generates an array of immutable step snapshots for step-by-step visualization.
 */
export function generateDfsSteps(
  initialGrid: GridNode[][],
  startPos: Position,
  goalPos: Position
): AlgorithmStep<GridState>[] {
  const steps: AlgorithmStep<GridState>[] = [];
  let stepCounter = 0;

  const workingGrid = cloneGrid(initialGrid);
  const startNode = workingGrid[startPos.row][startPos.col];
  startNode.gCost = 0;

  // LIFO Stack for DFS
  const stack: GridNode[] = [];
  const openSetPositions: Position[] = [];
  const closedSetPositions: Position[] = [];
  const closedSetKey = new Set<string>();

  stack.push({ ...startNode });
  openSetPositions.push({ row: startPos.row, col: startPos.col });

  // Record Step 0: Initialization
  steps.push({
    stepIndex: stepCounter++,
    description: `Initialized Depth-First Search.`,
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

  // For visual appeal in DFS, checking Right, Down, Left, Up usually looks best on a grid
  const directions = [
    { row: 0, col: 1 },  // Right
    { row: 1, col: 0 },  // Down
    { row: 0, col: -1 }, // Left
    { row: -1, col: 0 }, // Up
  ];

  while (stack.length > 0) {
    // Extract node from top of stack (LIFO)
    const current = stack.pop()!;
    const currentKey = `${current.row},${current.col}`;
    const bestKnownNode = workingGrid[current.row][current.col];

    if (closedSetKey.has(currentKey)) {
      continue;
    }

    const currentPos = { row: current.row, col: current.col };

    const openIdx = openSetPositions.findIndex(
      (p) => p.row === current.row && p.col === current.col
    );
    if (openIdx !== -1) {
      openSetPositions.splice(openIdx, 1);
    }

    if (current.row === goalPos.row && current.col === goalPos.col) {
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
        description: `Goal reached at (${goalPos.row}, ${goalPos.col})! Path reconstructed with length ${finalPathCost} (DFS does not guarantee optimal paths).`,
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

      steps.forEach((s) => (s.metrics.totalSteps = steps.length));
      return steps;
    }

    closedSetPositions.push(currentPos);
    closedSetKey.add(currentKey);

    const consideredNeighbors: Position[] = [];

    // Push neighbors in reverse order so the first defined direction gets popped first
    for (let i = directions.length - 1; i >= 0; i--) {
      const dir = directions[i];
      const neighborRow = current.row + dir.row;
      const neighborCol = current.col + dir.col;

      if (
        neighborRow < 0 ||
        neighborRow >= workingGrid.length ||
        neighborCol < 0 ||
        neighborCol >= workingGrid[0].length
      ) {
        continue;
      }

      const neighbor = workingGrid[neighborRow][neighborCol];

      if (neighbor.type === "wall" || closedSetKey.has(`${neighborRow},${neighborCol}`)) {
        continue;
      }

      consideredNeighbors.push({ row: neighborRow, col: neighborCol });

      const tentativeGCost = current.gCost + 1;

      neighbor.parent = { row: current.row, col: current.col };
      neighbor.gCost = tentativeGCost;
      neighbor.hCost = 0; 
      neighbor.fCost = tentativeGCost;

      stack.push({ ...neighbor });

      const inOpenSet = openSetPositions.some(
        (p) => p.row === neighborRow && p.col === neighborCol
      );

      if (!inOpenSet) {
        openSetPositions.push({ row: neighborRow, col: neighborCol });
      }
    }

    steps.push({
      stepIndex: stepCounter++,
      description: `Evaluating node (${current.row}, ${current.col}) at depth ${current.gCost}. Stack size: ${stack.length}.`,
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
