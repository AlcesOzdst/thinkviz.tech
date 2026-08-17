import { TreeNode, TreeState } from "@/types/tree";
import { AlgorithmStep } from "@/types/visualizer";

/**
 * Helper to generate a complete binary tree with random leaf values.
 */
export function generateDefaultTree(depth: number, isMax: boolean = true, idPrefix: string = "root"): TreeNode {
  if (depth === 0) {
    return {
      id: idPrefix,
      isMaxNode: isMax,
      value: Math.floor(Math.random() * 20) - 9, // -9 to 10
      children: [],
    };
  }
  return {
    id: idPrefix,
    isMaxNode: isMax,
    value: null,
    children: [
      generateDefaultTree(depth - 1, !isMax, `${idPrefix}-L`),
      generateDefaultTree(depth - 1, !isMax, `${idPrefix}-R`),
    ],
  };
}

/**
 * Pure TypeScript Minimax Engine.
 * Generates an array of immutable step snapshots for step-by-step visualization.
 */
export function generateMinimaxSteps(root: TreeNode): AlgorithmStep<TreeState>[] {
  const steps: AlgorithmStep<TreeState>[] = [];
  let stepCounter = 0;
  
  const evaluatedNodes: Record<string, number> = {};
  
  function pushStep(desc: string, currentId: string, line: number) {
    steps.push({
      stepIndex: stepCounter++,
      description: desc,
      highlightedLine: line,
      state: {
        tree: root, // The tree structure itself is static, only evaluated values change
        currentNodeId: currentId,
        evaluatedNodes: { ...evaluatedNodes },
        prunedNodes: [],
        alpha: null,
        beta: null,
      },
      metrics: {
        nodesExplored: Object.keys(evaluatedNodes).length,
        frontierSize: 0,
        pathCost: 0,
        totalSteps: 0,
      }
    });
  }

  function minimax(node: TreeNode): number {
    pushStep(`Visiting node ${node.id} (${node.isMaxNode ? 'MAX' : 'MIN'}).`, node.id, 1);
    
    // Leaf node check
    if (node.children.length === 0) {
      evaluatedNodes[node.id] = node.value!;
      pushStep(`Leaf node reached. Found terminal value: ${node.value}`, node.id, 2);
      return node.value!;
    }
    
    if (node.isMaxNode) {
      let maxEval = -Infinity;
      pushStep(`Initializing max evaluation to -Infinity.`, node.id, 3);

      for (const child of node.children) {
        const evalScore = minimax(child);
        maxEval = Math.max(maxEval, evalScore);
        evaluatedNodes[node.id] = maxEval; // Update provisional value
        pushStep(`Current MAX value updated to ${maxEval}.`, node.id, 4);
      }
      
      pushStep(`MAX node fully evaluated. Best choice is ${maxEval}.`, node.id, 5);
      return maxEval;
    } else {
      let minEval = Infinity;
      pushStep(`Initializing min evaluation to +Infinity.`, node.id, 6);

      for (const child of node.children) {
        const evalScore = minimax(child);
        minEval = Math.min(minEval, evalScore);
        evaluatedNodes[node.id] = minEval; // Update provisional value
        pushStep(`Current MIN value updated to ${minEval}.`, node.id, 7);
      }
      
      pushStep(`MIN node fully evaluated. Best choice is ${minEval}.`, node.id, 8);
      return minEval;
    }
  }
  
  pushStep(`Initialized Minimax Algorithm.`, root.id, 0);
  minimax(root);
  pushStep(`Minimax complete. Optimal game value is ${evaluatedNodes[root.id]}.`, root.id, 9);
  
  // Set total steps for the progress bar
  steps.forEach(s => s.metrics.totalSteps = steps.length);
  return steps;
}
