// Represents the landscape of a 1D function for optimization search
export interface OptimizationLandscape {
  minX: number;
  maxX: number;
}

export type GAPhase =
  | "init"
  | "evaluate"
  | "elitism"
  | "selection"
  | "crossover"
  | "mutation"
  | "next_generation"
  | "converged";

export type SelectionStrategy = "tournament" | "roulette" | "rank";

export interface Individual {
  id: string;
  x: number; // Phenotype (real-valued search coordinate)
  fitness: number; // Objective function score
  chromosome: string; // 16-bit binary genotype string
  rank: number; // Rank in generation (1 = highest fitness)
  selectionProb: number; // Selection probability percentage (0-100)
  role: "elite" | "parent" | "offspring" | "mutated" | "normal";
  parentIds?: [string, string];
}

export interface CrossoverEvent {
  parent1Id: string;
  parent2Id: string;
  parent1Chromosome: string;
  parent2Chromosome: string;
  crossoverPoint: number;
  offspringChromosome: string;
  offspringX: number;
  offspringFitness: number;
}

export interface MutationEvent {
  individualId: string;
  beforeChromosome: string;
  afterChromosome: string;
  flippedBit: number; // 0-indexed locus where mutation occurred
  oldX: number;
  newX: number;
  oldFitness: number;
  newFitness: number;
}

export interface GenerationStat {
  generation: number;
  bestFitness: number;
  avgFitness: number;
  worstFitness: number;
  bestX: number;
  diversity: number; // Standard deviation of x positions in population
}

export interface LandscapePreset {
  id: string;
  name: string;
  description: string;
  minX: number;
  maxX: number;
  globalMax: { x: number; y: number };
  localTrapsCount: number;
}

export interface GAConfig {
  populationSize: number;
  generations: number;
  crossoverRate: number;
  mutationRate: number;
  selectionStrategy: SelectionStrategy;
  elitismCount: number;
  tournamentSize: number;
  landscapeId: string;
}

// Represents the state of the search at a specific moment in time
export interface OptimizationState {
  currentX: number;
  currentY: number;
  visitedX: number[]; // History of the path taken (primarily for hill climbing)
  consideredX: number[]; // Neighbor points currently being evaluated
  population?: number[]; // Legacy array of raw X positions for basic scatter plotting
  
  // Rich Genetic Algorithm state properties
  individuals?: Individual[];
  generation?: number;
  maxGenerations?: number;
  phase?: GAPhase;
  activeParents?: [Individual, Individual];
  activeCrossover?: CrossoverEvent | null;
  activeMutation?: MutationEvent | null;
  historyStats?: GenerationStat[];
  globalBest?: { x: number; fitness: number; generation: number; chromosome: string };
  landscapeId?: string;
  diversity?: number;
  hcComparisonPath?: number[]; // Optional Hill Climbing trajectory for comparison
}
