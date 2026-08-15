export interface AlgorithmMetrics {
  nodesExplored: number;
  frontierSize: number;
  pathCost: number;
  totalSteps: number;
}

export interface AlgorithmStep<TState> {
  stepIndex: number;
  description: string;
  highlightedLine: number; // Line number in pseudocode (1-based)
  state: TState;            // Immutable snapshot of step state
  metrics: AlgorithmMetrics;
}
