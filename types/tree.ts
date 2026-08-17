export interface TreeNode {
  id: string;
  isMaxNode: boolean;
  value: number | null; // Null for internal nodes, number for leaf nodes (and eventually evaluated internal nodes)
  children: TreeNode[];
}

// Represents the state of the tree at a specific moment in time
export interface TreeState {
  tree: TreeNode;
  currentNodeId: string | null;
  evaluatedNodes: Record<string, number>; // Map of node ID to its computed value
  prunedNodes: string[]; // For Alpha-Beta pruning in the future
  alpha: number | null;
  beta: number | null;
}
