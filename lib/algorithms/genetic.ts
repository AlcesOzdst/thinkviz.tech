import { OptimizationState } from "@/types/optimization";
import { AlgorithmStep } from "@/types/visualizer";
import { getLandscapeY, OPTIMIZATION_DOMAIN } from "./hillClimbing";

export const GA_POPULATION_SIZE = 15;
export const GA_GENERATIONS = 15;

/**
 * Pure TypeScript Genetic Algorithm Engine.
 * Generates an array of immutable step snapshots for step-by-step visualization.
 */
export function generateGeneticAlgorithmSteps(): AlgorithmStep<OptimizationState>[] {
  const steps: AlgorithmStep<OptimizationState>[] = [];
  let stepCounter = 0;
  
  // Initialize random population
  let population: number[] = [];
  for (let i = 0; i < GA_POPULATION_SIZE; i++) {
    const randomX = OPTIMIZATION_DOMAIN.minX + Math.random() * (OPTIMIZATION_DOMAIN.maxX - OPTIMIZATION_DOMAIN.minX);
    population.push(randomX);
  }

  // Helper to push step
  function pushStep(desc: string, line: number, pop: number[]) {
    // Find the best individual to highlight as "current"
    let bestX = pop[0];
    let bestY = -Infinity;
    for (const x of pop) {
      const y = getLandscapeY(x);
      if (y > bestY) {
        bestX = x;
        bestY = y;
      }
    }

    steps.push({
      stepIndex: stepCounter++,
      description: desc,
      highlightedLine: line,
      state: {
        currentX: bestX,
        currentY: bestY,
        visitedX: [],
        consideredX: [],
        population: [...pop],
      },
      metrics: {
        nodesExplored: pop.length,
        frontierSize: 0,
        pathCost: 0,
        totalSteps: 0,
      }
    });
  }

  pushStep(`Initialized generation 0 with a random swarm of ${GA_POPULATION_SIZE} individuals.`, 1, population);

  for (let gen = 1; gen <= GA_GENERATIONS; gen++) {
    // 1. Evaluate Fitness
    const popWithFitness = population.map(x => ({ x, fitness: getLandscapeY(x) }));
    
    // Sort by descending fitness (best first)
    popWithFitness.sort((a, b) => b.fitness - a.fitness);
    
    pushStep(`Generation ${gen}: Evaluated fitness. Best individual found at x=${popWithFitness[0].x.toFixed(2)} with score ${popWithFitness[0].fitness.toFixed(2)}.`, 2, population);

    // 2. Selection (Elitism + Tournament)
    // Keep top 2 elites exactly as they are to ensure we never lose the best solution
    const newPopulation: number[] = [popWithFitness[0].x, popWithFitness[1].x];

    // Select parents for the rest
    const parents = popWithFitness.slice(0, Math.floor(GA_POPULATION_SIZE / 2)).map(p => p.x);
    
    pushStep(`Generation ${gen}: Selected top ${parents.length} individuals to reproduce.`, 3, parents);

    // 3. Crossover & Mutation
    while (newPopulation.length < GA_POPULATION_SIZE) {
      // Pick two random parents
      const parent1 = parents[Math.floor(Math.random() * parents.length)];
      const parent2 = parents[Math.floor(Math.random() * parents.length)];
      
      // Crossover (Blend crossover)
      const childX = (parent1 + parent2) / 2;
      
      // Mutation (Small random step)
      const mutationRate = 0.2;
      const mutationAmt = (Math.random() - 0.5) * 4 * mutationRate; // -0.4 to 0.4
      let mutatedChild = childX + mutationAmt;
      
      // Bound check
      if (mutatedChild < OPTIMIZATION_DOMAIN.minX) mutatedChild = OPTIMIZATION_DOMAIN.minX;
      if (mutatedChild > OPTIMIZATION_DOMAIN.maxX) mutatedChild = OPTIMIZATION_DOMAIN.maxX;
      
      newPopulation.push(mutatedChild);
    }

    population = newPopulation;
    pushStep(`Generation ${gen}: Applied crossover and mutation to spawn new generation swarm.`, 4, population);
  }

  // Final Step
  pushStep(`Evolution complete after ${GA_GENERATIONS} generations! Swarm has converged on the maxima.`, 5, population);
  
  steps.forEach(s => s.metrics.totalSteps = steps.length);
  return steps;
}
