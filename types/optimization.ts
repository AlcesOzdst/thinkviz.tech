// Represents the landscape of a 1D function for optimization search
export interface OptimizationLandscape {
  minX: number;
  maxX: number;
}

export type GAMode = "tsp" | "phrase" | "landscape";

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

// Mathematical 1D Continuous Individual
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

// ==========================================
// Traveling Salesperson Problem (TSP) Types
// ==========================================
export interface TSPCity {
  id: number;
  label: string;
  x: number;
  y: number;
}

export interface TSPIndividual {
  id: string;
  tour: number[]; // Permutation of city IDs [0, 4, 1, 3, ...]
  distance: number; // Total Euclidean tour distance
  fitness: number; // Normalized fitness (higher is better)
  rank: number;
  role: "elite" | "parent" | "offspring" | "mutated" | "normal";
}

export interface TSPCrossoverEvent {
  parent1Id: string;
  parent2Id: string;
  parent1Tour: number[];
  parent2Tour: number[];
  cutStart: number;
  cutEnd: number;
  childTour: number[];
  childDistance: number;
}

export interface TSPMutationEvent {
  individualId: string;
  beforeTour: number[];
  afterTour: number[];
  swappedIdx1: number;
  swappedIdx2: number;
  oldDistance: number;
  newDistance: number;
}

// ==========================================
// Target Phrase Evolution Types
// ==========================================
export interface PhraseIndividual {
  id: string;
  phrase: string;
  matches: number;
  accuracy: number; // Percentage 0 - 100%
  fitness: number;
  rank: number;
  role: "elite" | "parent" | "offspring" | "mutated" | "normal";
}

export interface PhraseCrossoverEvent {
  parent1Id: string;
  parent2Id: string;
  parent1Phrase: string;
  parent2Phrase: string;
  splitPoint: number;
  childPhrase: string;
}

export interface PhraseMutationEvent {
  individualId: string;
  beforePhrase: string;
  afterPhrase: string;
  mutatedIndex: number;
  oldChar: string;
  newChar: string;
}

// ==========================================
// Main Unified Optimization State
// ==========================================
export interface OptimizationState {
  currentX: number;
  currentY: number;
  visitedX: number[]; // History of the path taken (primarily for hill climbing)
  consideredX: number[]; // Neighbor points currently being evaluated
  population?: number[]; // Legacy array of raw X positions for basic scatter plotting
  
  // General GA state
  gaMode?: GAMode;
  generation?: number;
  maxGenerations?: number;
  phase?: GAPhase;
  diversity?: number;

  // Continuous 1D GA properties
  individuals?: Individual[];
  activeParents?: [Individual, Individual];
  activeCrossover?: CrossoverEvent | null;
  activeMutation?: MutationEvent | null;
  historyStats?: GenerationStat[];
  globalBest?: { x: number; fitness: number; generation: number; chromosome: string };
  landscapeId?: string;
  hcComparisonPath?: number[]; // Optional Hill Climbing trajectory for comparison

  // TSP Specific properties
  tspCities?: TSPCity[];
  tspIndividuals?: TSPIndividual[];
  tspBestTour?: number[];
  tspInitialDistance?: number;
  tspBestDistance?: number;
  tspActiveCrossover?: TSPCrossoverEvent | null;
  tspActiveMutation?: TSPMutationEvent | null;
  tspHistoryDistances?: { generation: number; bestDist: number; avgDist: number }[];

  // Phrase Evolution properties
  phraseTarget?: string;
  phraseIndividuals?: PhraseIndividual[];
  phraseActiveCrossover?: PhraseCrossoverEvent | null;
  phraseActiveMutation?: PhraseMutationEvent | null;
  phraseHistoryAccuracies?: { generation: number; bestAcc: number; avgAcc: number }[];
}
