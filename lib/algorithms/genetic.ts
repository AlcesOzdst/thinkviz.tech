import { 
  OptimizationState, 
  Individual, 
  CrossoverEvent, 
  MutationEvent, 
  GenerationStat, 
  GAConfig, 
  SelectionStrategy 
} from "@/types/optimization";
import { AlgorithmStep } from "@/types/visualizer";
import { getLandscape, EvaluatedLandscape } from "./landscapes";

export const GA_PSEUDOCODE = [
  "Initialize population P with N random chromosomes",
  "Evaluate fitness f(x) for each individual in P",
  "Sort population & preserve top elites into P_next",
  "Select mating parents via Selection operator",
  "Recombine parent chromosomes using Crossover at split locus",
  "Apply Mutation with probability Pm (random bit flip)",
  "Advance generation counter and check convergence",
];

export const CHROMOSOME_LENGTH = 16;
const MAX_INT_16 = 65535; // 2^16 - 1

/**
 * Encodes a real-valued phenotype x in [minX, maxX] into a 16-bit binary genotype string.
 */
export function encodeChromosome(x: number, minX: number, maxX: number): string {
  const clamped = Math.max(minX, Math.min(maxX, x));
  const normalized = (clamped - minX) / (maxX - minX);
  const intVal = Math.round(normalized * MAX_INT_16);
  return intVal.toString(2).padStart(CHROMOSOME_LENGTH, "0");
}

/**
 * Decodes a 16-bit binary genotype string into a real-valued phenotype x in [minX, maxX].
 */
export function decodeChromosome(bits: string, minX: number, maxX: number): number {
  const intVal = parseInt(bits, 2) || 0;
  return minX + (intVal / MAX_INT_16) * (maxX - minX);
}

/**
 * Calculates standard deviation (diversity) of population phenotypes.
 */
function calculateDiversity(xs: number[]): number {
  if (xs.length <= 1) return 0;
  const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
  const variance = xs.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / (xs.length - 1);
  return Math.sqrt(variance);
}

/**
 * Selection Operator implementations: Tournament, Roulette Wheel, Rank-based.
 */
function selectParent(
  population: Individual[],
  strategy: SelectionStrategy,
  tournamentSize: number = 3
): Individual {
  if (strategy === "tournament") {
    // Pick k random individuals and take the one with the highest fitness
    let best = population[Math.floor(Math.random() * population.length)];
    for (let i = 1; i < tournamentSize; i++) {
      const candidate = population[Math.floor(Math.random() * population.length)];
      if (candidate.fitness > best.fitness) {
        best = candidate;
      }
    }
    return best;
  }

  if (strategy === "rank") {
    // Rank selection: probability proportional to rank index (1 = worst, N = best)
    const n = population.length;
    const totalRankSum = (n * (n + 1)) / 2;
    let r = Math.random() * totalRankSum;
    // population is sorted best first (rank 1 is best)
    for (let i = 0; i < n; i++) {
      const rankWeight = n - i; // best gets weight N, worst gets weight 1
      if (r <= rankWeight) {
        return population[i];
      }
      r -= rankWeight;
    }
    return population[0];
  }

  // Default: Roulette Wheel (fitness-proportionate with offset)
  const rand = Math.random() * 100;
  let cum = 0;
  for (const ind of population) {
    cum += ind.selectionProb;
    if (rand <= cum) {
      return ind;
    }
  }
  return population[0];
}

/**
 * Assigns ranks and roulette selection probabilities.
 */
function rankAndScorePopulation(
  individuals: { id: string; x: number; fitness: number; chromosome: string; role?: Individual["role"]; parentIds?: [string, string] }[]
): Individual[] {
  // Sort descending by fitness
  const sorted = [...individuals].sort((a, b) => b.fitness - a.fitness);

  // Compute offset fitness so all values are positive for roulette wheel
  const minFitness = Math.min(...sorted.map((ind) => ind.fitness));
  const offset = minFitness < 0 ? Math.abs(minFitness) + 0.1 : 0.1;
  const shiftedSum = sorted.reduce((sum, ind) => sum + (ind.fitness + offset), 0);

  return sorted.map((ind, index) => {
    const prob = shiftedSum > 0 ? ((ind.fitness + offset) / shiftedSum) * 100 : 100 / sorted.length;
    return {
      id: ind.id,
      x: ind.x,
      fitness: ind.fitness,
      chromosome: ind.chromosome,
      rank: index + 1,
      selectionProb: parseFloat(prob.toFixed(2)),
      role: ind.role || (index === 0 ? "elite" : "normal"),
      parentIds: ind.parentIds,
    };
  });
}

/**
 * Generates an optional Hill Climbing comparison trajectory on the given landscape.
 */
function generateHCComparison(landscape: EvaluatedLandscape, startX: number = 2.5): number[] {
  const path: number[] = [startX];
  let curX = startX;
  const step = 0.5;

  for (let i = 0; i < 50; i++) {
    const leftX = Math.max(landscape.minX, curX - step);
    const rightX = Math.min(landscape.maxX, curX + step);

    let nextX = curX;
    let nextY = landscape.getY(curX);

    if (landscape.getY(leftX) > nextY) {
      nextX = leftX;
      nextY = landscape.getY(leftX);
    }
    if (landscape.getY(rightX) > nextY) {
      nextX = rightX;
      nextY = landscape.getY(rightX);
    }

    if (nextX === curX) break; // Trapped in local peak!
    curX = nextX;
    path.push(curX);
  }

  return path;
}

/**
 * Comprehensive Genetic Algorithm Step Generator.
 * Emits detailed, immutable state snapshots for each evolutionary operator:
 * Initial Swarm -> Fitness Evaluation -> Elitism -> Selection -> Crossover -> Mutation -> Convergence.
 */
export function generateGeneticAlgorithmSteps(
  customConfig?: Partial<GAConfig>
): AlgorithmStep<OptimizationState>[] {
  const config: GAConfig = {
    populationSize: customConfig?.populationSize ?? 16,
    generations: customConfig?.generations ?? 12,
    crossoverRate: customConfig?.crossoverRate ?? 0.85,
    mutationRate: customConfig?.mutationRate ?? 0.05,
    selectionStrategy: customConfig?.selectionStrategy ?? "tournament",
    elitismCount: customConfig?.elitismCount ?? 2,
    tournamentSize: customConfig?.tournamentSize ?? 3,
    landscapeId: customConfig?.landscapeId ?? "deceptive-multimodal",
  };

  const landscape = getLandscape(config.landscapeId);
  const hcPath = generateHCComparison(landscape);

  const steps: AlgorithmStep<OptimizationState>[] = [];
  let stepCounter = 0;

  // Initialize Random Population (Generation 0)
  const initialRaw: { id: string; x: number; fitness: number; chromosome: string; role: Individual["role"] }[] = [];
  for (let i = 0; i < config.populationSize; i++) {
    const rawX = landscape.minX + Math.random() * (landscape.maxX - landscape.minX);
    const chromosome = encodeChromosome(rawX, landscape.minX, landscape.maxX);
    const decodedX = decodeChromosome(chromosome, landscape.minX, landscape.maxX);
    const fitness = landscape.getY(decodedX);

    initialRaw.push({
      id: `Gen0-${i + 1}`,
      x: decodedX,
      fitness,
      chromosome,
      role: "normal",
    });
  }

  let currentPopulation = rankAndScorePopulation(initialRaw);
  if (config.elitismCount > 0) {
    for (let e = 0; e < Math.min(config.elitismCount, currentPopulation.length); e++) {
      currentPopulation[e].role = "elite";
    }
  }

  let globalBest = {
    x: currentPopulation[0].x,
    fitness: currentPopulation[0].fitness,
    generation: 0,
    chromosome: currentPopulation[0].chromosome,
  };

  const historyStats: GenerationStat[] = [];

  function recordGenerationStat(gen: number, pop: Individual[]) {
    const fitnesses = pop.map((p) => p.fitness);
    const best = pop[0];
    const avg = fitnesses.reduce((a, b) => a + b, 0) / pop.length;
    const worst = Math.min(...fitnesses);
    const div = calculateDiversity(pop.map((p) => p.x));

    const stat: GenerationStat = {
      generation: gen,
      bestFitness: parseFloat(best.fitness.toFixed(3)),
      avgFitness: parseFloat(avg.toFixed(3)),
      worstFitness: parseFloat(worst.toFixed(3)),
      bestX: parseFloat(best.x.toFixed(2)),
      diversity: parseFloat(div.toFixed(2)),
    };
    historyStats.push(stat);
    return stat;
  }

  const gen0Stat = recordGenerationStat(0, currentPopulation);

  function pushStep(params: {
    desc: string;
    line: number;
    phase: OptimizationState["phase"];
    pop: Individual[];
    currentGen: number;
    activeParents?: [Individual, Individual];
    activeCrossover?: CrossoverEvent | null;
    activeMutation?: MutationEvent | null;
  }) {
    const best = params.pop[0];
    const div = calculateDiversity(params.pop.map((p) => p.x));

    steps.push({
      stepIndex: stepCounter++,
      description: params.desc,
      highlightedLine: params.line,
      state: {
        currentX: best.x,
        currentY: best.fitness,
        visitedX: [],
        consideredX: params.activeParents ? [params.activeParents[0].x, params.activeParents[1].x] : [],
        population: params.pop.map((p) => p.x),
        individuals: params.pop.map((ind) => ({ ...ind })),
        generation: params.currentGen,
        maxGenerations: config.generations,
        phase: params.phase,
        activeParents: params.activeParents,
        activeCrossover: params.activeCrossover,
        activeMutation: params.activeMutation,
        historyStats: historyStats.map((s) => ({ ...s })),
        globalBest: { ...globalBest },
        landscapeId: config.landscapeId,
        diversity: parseFloat(div.toFixed(2)),
        hcComparisonPath: hcPath,
      },
      metrics: {
        nodesExplored: params.pop.length,
        frontierSize: params.activeParents ? 2 : 0,
        pathCost: parseFloat(best.fitness.toFixed(2)),
        totalSteps: 0,
      },
    });
  }

  // 1. Initial Population Step
  pushStep({
    desc: `Initialized Generation 0 with ${config.populationSize} chromosomes randomly dispersed across ${landscape.name} [${landscape.minX}, ${landscape.maxX}]. Best initial fitness: ${currentPopulation[0].fitness.toFixed(2)}.`,
    line: 1,
    phase: "init",
    pop: currentPopulation,
    currentGen: 0,
  });

  // Main Evolutionary Loop
  for (let gen = 1; gen <= config.generations; gen++) {
    // Step A: Fitness Evaluation & Ranking
    pushStep({
      desc: `Generation ${gen}: Evaluated fitness across population. Best individual '${currentPopulation[0].id}' at x = ${currentPopulation[0].x.toFixed(2)} (f = ${currentPopulation[0].fitness.toFixed(2)}). Mean population fitness: ${gen0Stat.avgFitness}.`,
      line: 2,
      phase: "evaluate",
      pop: currentPopulation,
      currentGen: gen,
    });

    // Step B: Elitism Preservation
    const elites: Individual[] = [];
    if (config.elitismCount > 0) {
      for (let e = 0; e < Math.min(config.elitismCount, currentPopulation.length); e++) {
        const eliteClone: Individual = {
          ...currentPopulation[e],
          id: `Gen${gen}-Elite${e + 1}`,
          role: "elite",
        };
        elites.push(eliteClone);
      }
      pushStep({
        desc: `Preserved top ${elites.length} elite champion(s) directly: [${elites.map((el) => `${el.id} (f=${el.fitness.toFixed(2)})`).join(", ")}]. Ensures the best solutions are never destroyed.`,
        line: 3,
        phase: "elitism",
        pop: currentPopulation,
        currentGen: gen,
      });
    }

    // Step C: Selection Demonstration
    const parentA = selectParent(currentPopulation, config.selectionStrategy, config.tournamentSize);
    let parentB = selectParent(currentPopulation, config.selectionStrategy, config.tournamentSize);
    if (parentB.id === parentA.id && currentPopulation.length > 1) {
      parentB = currentPopulation.find((p) => p.id !== parentA.id) || parentB;
    }

    pushStep({
      desc: `Selection (${config.selectionStrategy.toUpperCase()}): Picked Parent A (${parentA.id}, x=${parentA.x.toFixed(2)}, f=${parentA.fitness.toFixed(2)}) and Parent B (${parentB.id}, x=${parentB.x.toFixed(2)}, f=${parentB.fitness.toFixed(2)}) for recombination.`,
      line: 4,
      phase: "selection",
      pop: currentPopulation,
      currentGen: gen,
      activeParents: [parentA, parentB],
    });

    // Step D: Crossover (Recombination)
    let childChromosome: string;
    let crossoverPoint = Math.floor(CHROMOSOME_LENGTH / 2);
    const doCrossover = Math.random() <= config.crossoverRate;

    if (doCrossover) {
      crossoverPoint = 4 + Math.floor(Math.random() * 8); // Cut locus between index 4 and 11
      childChromosome =
        parentA.chromosome.slice(0, crossoverPoint) + parentB.chromosome.slice(crossoverPoint);
    } else {
      childChromosome = parentA.chromosome;
    }

    const childX = decodeChromosome(childChromosome, landscape.minX, landscape.maxX);
    const childFitness = landscape.getY(childX);

    const activeCrossover: CrossoverEvent = {
      parent1Id: parentA.id,
      parent2Id: parentB.id,
      parent1Chromosome: parentA.chromosome,
      parent2Chromosome: parentB.chromosome,
      crossoverPoint,
      offspringChromosome: childChromosome,
      offspringX: childX,
      offspringFitness: childFitness,
    };

    pushStep({
      desc: doCrossover
        ? `Crossover: Single-point cut at locus ${crossoverPoint}. Head from ${parentA.id} ('${parentA.chromosome.slice(0, crossoverPoint)}') + Tail from ${parentB.id} ('${parentB.chromosome.slice(crossoverPoint)}') produced offspring at x = ${childX.toFixed(2)} (f = ${childFitness.toFixed(2)}).`
        : `Crossover: Probability threshold skipped recombination. Offspring cloned from ${parentA.id}.`,
      line: 5,
      phase: "crossover",
      pop: currentPopulation,
      currentGen: gen,
      activeParents: [parentA, parentB],
      activeCrossover,
    });

    // Step E: Mutation
    let mutatedChromosome = childChromosome;
    let didMutate = false;
    let mutatedLocus = -1;

    // Mutate with probability config.mutationRate per chromosome
    if (Math.random() <= config.mutationRate * 4 || Math.random() < 0.25) {
      mutatedLocus = Math.floor(Math.random() * CHROMOSOME_LENGTH);
      const bitArr = mutatedChromosome.split("");
      bitArr[mutatedLocus] = bitArr[mutatedLocus] === "1" ? "0" : "1";
      mutatedChromosome = bitArr.join("");
      didMutate = true;
    }

    const mutX = decodeChromosome(mutatedChromosome, landscape.minX, landscape.maxX);
    const mutFitness = landscape.getY(mutX);

    const activeMutation: MutationEvent | null = didMutate
      ? {
          individualId: `Child-${gen}`,
          beforeChromosome: childChromosome,
          afterChromosome: mutatedChromosome,
          flippedBit: mutatedLocus,
          oldX: childX,
          newX: mutX,
          oldFitness: childFitness,
          newFitness: mutFitness,
        }
      : null;

    pushStep({
      desc: didMutate
        ? `Mutation triggered: Flipped bit at locus ${mutatedLocus} (${childChromosome[mutatedLocus]} → ${mutatedChromosome[mutatedLocus]}). Phenotype shifted from x = ${childX.toFixed(2)} to x = ${mutX.toFixed(2)} (f = ${mutFitness.toFixed(2)}).`
        : `Mutation check: Offspring chromosome remained stable (no bit-flip triggered with Pm = ${config.mutationRate}).`,
      line: 6,
      phase: "mutation",
      pop: currentPopulation,
      currentGen: gen,
      activeParents: [parentA, parentB],
      activeCrossover,
      activeMutation,
    });

    // Produce remainder of offspring for the full population
    const nextGenIndividuals: {
      id: string;
      x: number;
      fitness: number;
      chromosome: string;
      role: Individual["role"];
      parentIds?: [string, string];
    }[] = [...elites];

    // Add demonstrated child
    nextGenIndividuals.push({
      id: `Gen${gen}-Offspring1`,
      x: mutX,
      fitness: mutFitness,
      chromosome: mutatedChromosome,
      role: didMutate ? "mutated" : "offspring",
      parentIds: [parentA.id, parentB.id],
    });

    // Populate remaining slots
    while (nextGenIndividuals.length < config.populationSize) {
      const p1 = selectParent(currentPopulation, config.selectionStrategy, config.tournamentSize);
      const p2 = selectParent(currentPopulation, config.selectionStrategy, config.tournamentSize);

      let chrom: string;
      if (Math.random() <= config.crossoverRate) {
        const cut = 2 + Math.floor(Math.random() * (CHROMOSOME_LENGTH - 4));
        chrom = p1.chromosome.slice(0, cut) + p2.chromosome.slice(cut);
      } else {
        chrom = p1.chromosome;
      }

      let mutated = false;
      if (Math.random() <= config.mutationRate) {
        const bit = Math.floor(Math.random() * CHROMOSOME_LENGTH);
        const chars = chrom.split("");
        chars[bit] = chars[bit] === "1" ? "0" : "1";
        chrom = chars.join("");
        mutated = true;
      }

      const phenoX = decodeChromosome(chrom, landscape.minX, landscape.maxX);
      const fit = landscape.getY(phenoX);

      nextGenIndividuals.push({
        id: `Gen${gen}-${nextGenIndividuals.length + 1}`,
        x: phenoX,
        fitness: fit,
        chromosome: chrom,
        role: mutated ? "mutated" : "offspring",
        parentIds: [p1.id, p2.id],
      });
    }

    currentPopulation = rankAndScorePopulation(nextGenIndividuals);

    // Update all-time global best
    if (currentPopulation[0].fitness > globalBest.fitness) {
      globalBest = {
        x: currentPopulation[0].x,
        fitness: currentPopulation[0].fitness,
        generation: gen,
        chromosome: currentPopulation[0].chromosome,
      };
    }

    const currentStat = recordGenerationStat(gen, currentPopulation);

    // Step F: Next Generation Swarm Complete
    pushStep({
      desc: `Generation ${gen} complete! Swarm updated with ${config.populationSize} individuals. Peak Fitness: ${currentStat.bestFitness}, Mean Fitness: ${currentStat.avgFitness}, Diversity: σ = ${currentStat.diversity}.`,
      line: 7,
      phase: "next_generation",
      pop: currentPopulation,
      currentGen: gen,
    });
  }

  // Final Step: Complete / Converged
  pushStep({
    desc: `Evolution finished across ${config.generations} generations! Swarm converged to optimum at x* = ${globalBest.x.toFixed(2)} with fitness f(x*) = ${globalBest.fitness.toFixed(2)}. Chromosome: [${globalBest.chromosome.slice(0, 4)} ${globalBest.chromosome.slice(4, 8)} ${globalBest.chromosome.slice(8, 12)} ${globalBest.chromosome.slice(12, 16)}].`,
    line: 7,
    phase: "converged",
    pop: currentPopulation,
    currentGen: config.generations,
  });

  steps.forEach((s) => (s.metrics.totalSteps = steps.length));
  return steps;
}
