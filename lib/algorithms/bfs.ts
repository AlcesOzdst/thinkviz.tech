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
 * Pure TypeScript Breadth-First Search (BFS) Engine.
 * Explores nodes level-by-level using a FIFO queue to guarantee the shortest path on an unweighted grid.
 * Generates an array of immutable step snapshots for step-by-step visualization.
 */
export function generateBFSSteps(
  initialGrid: GridNode[][],
  startPos: Position,
  goalPos: Position
): AlgorithmStep<GridState>[] {
  const steps: AlgorithmStep<GridState>[] = [];
  let stepCounter = 0;

  // Working copy of grid
  const workingGrid = cloneGrid(initialGrid);

  // Setup start node values
  const startNode = workingGrid[startPos.row][startPos.col];
  startNode.gCost = 0;
  startNode.hCost = 0;
  startNode.fCost = 0;
  startNode.parent = null;

  // Handle immediate edge case: Start == Goal
  if (startPos.row === goalPos.row && startPos.col === goalPos.col) {
    const pathPositions: Position[] = [{ row: startPos.row, col: startPos.col }];
    steps.push({
      stepIndex: stepCounter++,
      description: `Start node is the goal! Path found immediately at (${startPos.row}, ${startPos.col}) with cost 0.`,
      highlightedLine: 5,
      state: {
        grid: cloneGrid(workingGrid),
        startPos: { ...startPos },
        goalPos: { ...goalPos },
        currentNode: { ...startPos },
        openSetPositions: [],
        closedSetPositions: [{ ...startPos }],
        pathPositions,
        consideredNeighbors: [],
      },
      metrics: {
        nodesExplored: 1,
        frontierSize: 0,
        pathCost: 0,
        totalSteps: 1,
      },
    });
    return steps;
  }

  // FIFO queue for BFS
  const queue: Position[] = [{ row: startPos.row, col: startPos.col }];
  const openSetPositions: Position[] = [{ row: startPos.row, col: startPos.col }];
  const closedSetPositions: Position[] = [];

  // Track discovered positions to prevent re-enqueueing
  const discoveredSet = new Set<string>();
  discoveredSet.add(`${startPos.row},${startPos.col}`);

  // Step 0: Initialization (Line 1: Add START to the queue)
  steps.push({
    stepIndex: stepCounter++,
    description: `Initialized BFS with the start node (${startPos.row}, ${startPos.col}) in the queue.`,
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

  while (queue.length > 0) {
    // Dequeue first node from front of queue (Line 4: Remove the first node from queue)
    const currentPos = queue.shift()!;
    const currentNode = workingGrid[currentPos.row][currentPos.col];

    // Remove from openSetPositions display tracking
    const openIdx = openSetPositions.findIndex(
      (p) => p.row === currentPos.row && p.col === currentPos.col
    );
    if (openIdx !== -1) {
      openSetPositions.splice(openIdx, 1);
    }

    // Check if goal reached (Line 5: If current node is GOAL → reconstruct path)
    if (currentPos.row === goalPos.row && currentPos.col === goalPos.col) {
      const pathPositions: Position[] = [];
      let curr: GridNode | null = currentNode;
      while (curr !== null) {
        pathPositions.unshift({ row: curr.row, col: curr.col });
        if (curr.parent) {
          curr = workingGrid[curr.parent.row][curr.parent.col];
        } else {
          curr = null;
        }
      }

      const finalPathCost = pathPositions.length - 1;

      steps.push({
        stepIndex: stepCounter++,
        description: `Goal reached at (${goalPos.row}, ${goalPos.col})! Reconstructing the shortest path (${finalPathCost} steps).`,
        highlightedLine: 5,
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

    // Add current node to processed / closed list
    closedSetPositions.push(currentPos);

    const consideredNeighbors: Position[] = [];

    // Step: Examining neighbors of current node (Line 6: Examine neighbors of current)
    steps.push({
      stepIndex: stepCounter++,
      description: `Removed node (${currentPos.row}, ${currentPos.col}) at distance ${currentNode.gCost} from queue. Examining neighbors.`,
      highlightedLine: 4,
      state: {
        grid: cloneGrid(workingGrid),
        startPos: { ...startPos },
        goalPos: { ...goalPos },
        currentNode: currentPos,
        openSetPositions: [...openSetPositions],
        closedSetPositions: [...closedSetPositions],
        pathPositions: [],
        consideredNeighbors: [],
      },
      metrics: {
        nodesExplored: closedSetPositions.length,
        frontierSize: openSetPositions.length,
        pathCost: currentNode.gCost,
        totalSteps: 0,
      },
    });

    // Check all 4-directional neighbors
    for (const dir of directions) {
      const neighborRow = currentPos.row + dir.row;
      const neighborCol = currentPos.col + dir.col;
      const neighborKey = `${neighborRow},${neighborCol}`;

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

      // Ignore walls and already discovered cells
      if (neighbor.type === "wall" || discoveredSet.has(neighborKey)) {
        continue;
      }

      // Mark discovered
      discoveredSet.add(neighborKey);
      neighbor.parent = { row: currentPos.row, col: currentPos.col };
      neighbor.gCost = currentNode.gCost + 1;
      neighbor.hCost = 0;
      neighbor.fCost = neighbor.gCost;

      const neighborPos = { row: neighborRow, col: neighborCol };
      consideredNeighbors.push(neighborPos);
      queue.push(neighborPos);
      openSetPositions.push(neighborPos);

      // Record step for newly discovered neighbor (Line 8: Set parent and add neighbor to queue)
      steps.push({
        stepIndex: stepCounter++,
        description: `Discovered node (${neighborRow}, ${neighborCol}) at distance ${neighbor.gCost} and added it to the queue.`,
        highlightedLine: 8,
        state: {
          grid: cloneGrid(workingGrid),
          startPos: { ...startPos },
          goalPos: { ...goalPos },
          currentNode: currentPos,
          openSetPositions: [...openSetPositions],
          closedSetPositions: [...closedSetPositions],
          pathPositions: [],
          consideredNeighbors: [...consideredNeighbors],
        },
        metrics: {
          nodesExplored: closedSetPositions.length,
          frontierSize: openSetPositions.length,
          pathCost: neighbor.gCost,
          totalSteps: 0,
        },
      });
    }
  }

  // Queue is empty: No path exists (Line 9: Return "No path exists")
  steps.push({
    stepIndex: stepCounter++,
    description: `Search completed. No path exists from start to goal.`,
    highlightedLine: 9,
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
