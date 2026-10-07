import { 
  TSPCity, 
  TSPIndividual, 
  TSPCrossoverEvent, 
  TSPMutationEvent, 
  OptimizationState 
} from "@/types/optimization";
import { AlgorithmStep } from "@/types/visualizer";

export const TSP_PSEUDOCODE = [
  "Initialize population with N random city permutation tours",
  "Evaluate total Euclidean tour distance and fitness (1 / Distance)",
  "Sort population and preserve shortest elite tours into next generation",
  "Select parent tours via Tournament Selection based on distance",
  "Apply Order Crossover (OX) to inherit sub-path segments from both parents",
  "Apply 2-Opt Inversion Mutation to untangle crossing road edges",
  "Advance generation and track distance convergence curve",
];

export interface TSPConfig {
  populationSize: number;
  generations: number;
  mutationRate: number;
  crossoverRate: number;
  preset: "circle" | "clusters" | "random";
}

// Preset City Map Layouts (scaled to 680 x 360 SVG area)
export const TSP_PRESETS: Record<string, { name: string; description: string; cities: TSPCity[] }> = {
  circle: {
    name: "Circular Ring (12 Cities)",
    description: "Cities placed along a circular perimeter. The optimal tour is an untangled perimeter loop, making genetic improvements instantly visible.",
    cities: [
      { id: 0, label: "A", x: 340, y: 50 },
      { id: 1, label: "B", x: 470, y: 85 },
      { id: 2, label: "C", x: 560, y: 175 },
      { id: 3, label: "D", x: 560, y: 265 },
      { id: 4, label: "E", x: 470, y: 325 },
      { id: 5, label: "F", x: 340, y: 345 },
      { id: 6, label: "G", x: 210, y: 325 },
      { id: 7, label: "H", x: 120, y: 265 },
      { id: 8, label: "I", x: 120, y: 175 },
      { id: 9, label: "J", x: 210, y: 85 },
      { id: 10, label: "K", x: 280, y: 60 },
      { id: 11, label: "L", x: 400, y: 60 },
    ],
  },
  clusters: {
    name: "Twin City Clusters (12 Cities)",
    description: "Two distinct city hubs separated by a central gap. Tests how GA navigates within each hub before crossing between them.",
    cities: [
      // Cluster 1 (Left)
      { id: 0, label: "A", x: 150, y: 90 },
      { id: 1, label: "B", x: 230, y: 80 },
      { id: 2, label: "C", x: 260, y: 160 },
      { id: 3, label: "D", x: 220, y: 240 },
      { id: 4, label: "E", x: 140, y: 230 },
      { id: 5, label: "F", x: 110, y: 150 },
      // Cluster 2 (Right)
      { id: 6, label: "G", x: 440, y: 100 },
      { id: 7, label: "H", x: 540, y: 90 },
      { id: 8, label: "I", x: 570, y: 180 },
      { id: 9, label: "J", x: 520, y: 260 },
      { id: 10, label: "K", x: 430, y: 250 },
      { id: 11, label: "L", x: 390, y: 170 },
    ],
  },
  random: {
    name: "Scattered Terrain (12 Cities)",
    description: "Classic irregular distribution of cities across geographic coordinates.",
    cities: [
      { id: 0, label: "A", x: 120, y: 80 },
      { id: 1, label: "B", x: 310, y: 60 },
      { id: 2, label: "C", x: 520, y: 70 },
      { id: 3, label: "D", x: 590, y: 160 },
      { id: 4, label: "E", x: 460, y: 230 },
      { id: 5, label: "F", x: 540, y: 310 },
      { id: 6, label: "G", x: 340, y: 330 },
      { id: 7, label: "H", x: 200, y: 290 },
      { id: 8, label: "I", x: 90, y: 220 },
      { id: 9, label: "J", x: 220, y: 180 },
      { id: 10, label: "K", x: 380, y: 150 },
      { id: 11, label: "L", x: 160, y: 110 },
    ],
  },
};

/**
 * Calculates total tour length for a closed-loop sequence of city IDs.
 */
export function calculateTourDistance(tour: number[], cities: TSPCity[]): number {
  let dist = 0;
  const n = tour.length;
  for (let i = 0; i < n; i++) {
    const c1 = cities[tour[i]];
    const c2 = cities[tour[(i + 1) % n]];
    const dx = c1.x - c2.x;
    const dy = c1.y - c2.y;
    dist += Math.sqrt(dx * dx + dy * dy);
  }
  return parseFloat(dist.toFixed(1));
}

/**
 * Shuffles an array randomly to create a random permutation tour.
 */
function createRandomTour(numCities: number): number[] {
  const tour = Array.from({ length: numCities }, (_, i) => i);
  for (let i = tour.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tour[i], tour[j]] = [tour[j], tour[i]];
  }
  return tour;
}

/**
 * Order Crossover (OX1): Slices a segment from Parent 1, then fills remaining
 * slots with cities from Parent 2 in order, maintaining relative sequencing.
 */
export function orderCrossover(parent1: number[], parent2: number[]): { child: number[]; cut1: number; cut2: number } {
  const n = parent1.length;
  let cut1 = Math.floor(Math.random() * (n - 2));
  let cut2 = cut1 + 1 + Math.floor(Math.random() * (n - cut1 - 1));

  // Ensure decent slice size
  if (cut2 - cut1 < 2) {
    cut1 = 2;
    cut2 = 6;
  }

  const child: (number | null)[] = new Array(n).fill(null);
  const present = new Set<number>();

  // Copy slice from Parent 1
  for (let i = cut1; i <= cut2; i++) {
    child[i] = parent1[i];
    present.add(parent1[i]);
  }

  // Fill remaining positions from Parent 2 in circular order
  let childIdx = (cut2 + 1) % n;
  let p2Idx = (cut2 + 1) % n;

  for (let count = 0; count < n; count++) {
    const city = parent2[p2Idx];
    if (!present.has(city)) {
      child[childIdx] = city;
      present.add(city);
      childIdx = (childIdx + 1) % n;
    }
    p2Idx = (p2Idx + 1) % n;
  }

  return {
    child: child as number[],
    cut1,
    cut2,
  };
}

/**
 * 2-Opt Inversion Mutation: Reverses a sub-segment of the tour.
 * This is the classic geometric operator that directly untangles crossed lines!
 */
export function inversionMutation(tour: number[]): { mutated: number[]; i1: number; i2: number } {
  const n = tour.length;
  let i1 = Math.floor(Math.random() * (n - 1));
  let i2 = i1 + 1 + Math.floor(Math.random() * (n - i1 - 1));

  const mutated = [...tour];
  let left = i1;
  let right = i2;
  while (left < right) {
    [mutated[left], mutated[right]] = [mutated[right], mutated[left]];
    left++;
    right--;
  }

  return { mutated, i1, i2 };
}

/**
 * Generates interactive step-by-step Genetic Algorithm snapshots for the Traveling Salesperson Problem.
 */
export function generateGeneticTSPSteps(
  customConfig?: Partial<TSPConfig>
): AlgorithmStep<OptimizationState>[] {
  const config: TSPConfig = {
    populationSize: customConfig?.populationSize ?? 16,
    generations: customConfig?.generations ?? 12,
    mutationRate: customConfig?.mutationRate ?? 0.25,
    crossoverRate: customConfig?.crossoverRate ?? 0.90,
    preset: customConfig?.preset ?? "circle",
  };

  const cities = TSP_PRESETS[config.preset].cities;
  const numCities = cities.length;

  const steps: AlgorithmStep<OptimizationState>[] = [];
  let stepCounter = 0;

  // 1. Initialize random population
  const rawPop: TSPIndividual[] = [];
  for (let i = 0; i < config.populationSize; i++) {
    const tour = createRandomTour(numCities);
    const dist = calculateTourDistance(tour, cities);
    rawPop.push({
      id: `Tour-0-${i + 1}`,
      tour,
      distance: dist,
      fitness: parseFloat((100000 / dist).toFixed(2)),
      rank: 0,
      role: "normal",
    });
  }

  function rankTsp(pop: TSPIndividual[]): TSPIndividual[] {
    const sorted = [...pop].sort((a, b) => a.distance - b.distance); // Shortest distance first
    return sorted.map((p, idx) => ({
      ...p,
      rank: idx + 1,
      role: idx === 0 ? "elite" : p.role || "normal",
    }));
  }

  let population = rankTsp(rawPop);
  const initialDistance = population[0].distance;
  let bestEverDistance = population[0].distance;
  let bestEverTour = [...population[0].tour];

  const historyDistances: { generation: number; bestDist: number; avgDist: number }[] = [];

  function recordHistory(gen: number, pop: TSPIndividual[]) {
    const dists = pop.map((p) => p.distance);
    const bestDist = pop[0].distance;
    const avgDist = parseFloat((dists.reduce((a, b) => a + b, 0) / dists.length).toFixed(1));
    historyDistances.push({ generation: gen, bestDist, avgDist });
  }

  recordHistory(0, population);

  function pushTspStep(params: {
    desc: string;
    line: number;
    phase: OptimizationState["phase"];
    pop: TSPIndividual[];
    currentGen: number;
    activeCrossover?: TSPCrossoverEvent | null;
    activeMutation?: TSPMutationEvent | null;
  }) {
    const bestInd = params.pop[0];

    steps.push({
      stepIndex: stepCounter++,
      description: params.desc,
      highlightedLine: params.line,
      state: {
        currentX: bestInd.distance,
        currentY: bestInd.fitness,
        visitedX: [],
        consideredX: [],
        gaMode: "tsp",
        generation: params.currentGen,
        maxGenerations: config.generations,
        phase: params.phase,
        tspCities: cities,
        tspIndividuals: params.pop.map((p) => ({ ...p })),
        tspBestTour: [...bestInd.tour],
        tspInitialDistance: initialDistance,
        tspBestDistance: bestInd.distance,
        tspActiveCrossover: params.activeCrossover,
        tspActiveMutation: params.activeMutation,
        tspHistoryDistances: [...historyDistances],
      },
      metrics: {
        nodesExplored: params.pop.length,
        frontierSize: numCities,
        pathCost: bestInd.distance,
        totalSteps: 0,
      },
    });
  }

  // Step 1: Initial Population Swarm of random tours
  pushTspStep({
    desc: `Initialized Generation 0 with ${config.populationSize} random city permutation tours across ${cities.length} cities. Shortest initial tour length: ${initialDistance} px (tangled random path).`,
    line: 1,
    phase: "init",
    pop: population,
    currentGen: 0,
  });

  // Main Evolutionary Loop
  for (let gen = 1; gen <= config.generations; gen++) {
    // Step A: Evaluate
    pushTspStep({
      desc: `Generation ${gen}: Evaluated Euclidean tour distances. Best tour '${population[0].id}' visits all ${numCities} cities with total length ${population[0].distance} px.`,
      line: 2,
      phase: "evaluate",
      pop: population,
      currentGen: gen,
    });

    // Step B: Elitism
    const eliteCount = 2;
    const nextGen: TSPIndividual[] = [];
    for (let e = 0; e < eliteCount; e++) {
      nextGen.push({
        ...population[e],
        id: `Gen${gen}-Elite${e + 1}`,
        role: "elite",
      });
    }

    pushTspStep({
      desc: `Elitism: Preserved top ${eliteCount} shortest tours directly to protect the best routing segments from destructive crossover.`,
      line: 3,
      phase: "elitism",
      pop: population,
      currentGen: gen,
    });

    // Step C: Selection
    // Tournament selection (pick 3 random, choose shortest)
    function tournamentSelect(): TSPIndividual {
      let b = population[Math.floor(Math.random() * population.length)];
      for (let k = 0; k < 2; k++) {
        const cand = population[Math.floor(Math.random() * population.length)];
        if (cand.distance < b.distance) b = cand;
      }
      return b;
    }

    const parent1 = tournamentSelect();
    let parent2 = tournamentSelect();
    if (parent2.id === parent1.id && population.length > 1) {
      parent2 = population.find((p) => p.id !== parent1.id) || parent2;
    }

    pushTspStep({
      desc: `Selection: Tournament chose Parent 1 (${parent1.id}, dist=${parent1.distance} px) and Parent 2 (${parent2.id}, dist=${parent2.distance} px) based on shorter route distance.`,
      line: 4,
      phase: "selection",
      pop: population,
      currentGen: gen,
    });

    // Step D: Order Crossover
    const { child, cut1, cut2 } = orderCrossover(parent1.tour, parent2.tour);
    const childDist = calculateTourDistance(child, cities);

    const activeCrossover: TSPCrossoverEvent = {
      parent1Id: parent1.id,
      parent2Id: parent2.id,
      parent1Tour: [...parent1.tour],
      parent2Tour: [...parent2.tour],
      cutStart: cut1,
      cutEnd: cut2,
      childTour: [...child],
      childDistance: childDist,
    };

    pushTspStep({
      desc: `Order Crossover (OX): Preserved road segment [${cut1}..${cut2}] from Parent 1 and filled remaining cities from Parent 2. Offspring distance: ${childDist} px.`,
      line: 5,
      phase: "crossover",
      pop: population,
      currentGen: gen,
      activeCrossover,
    });

    // Step E: Inversion Mutation
    let mutatedTour = [...child];
    let didMutate = false;
    let inv1 = 0;
    let inv2 = 0;

    if (Math.random() <= config.mutationRate || gen === 1) {
      const res = inversionMutation(child);
      mutatedTour = res.mutated;
      inv1 = res.i1;
      inv2 = res.i2;
      didMutate = true;
    }

    const mutatedDist = calculateTourDistance(mutatedTour, cities);
    const activeMutation: TSPMutationEvent | null = didMutate
      ? {
          individualId: `Child-${gen}`,
          beforeTour: child,
          afterTour: mutatedTour,
          swappedIdx1: inv1,
          swappedIdx2: inv2,
          oldDistance: childDist,
          newDistance: mutatedDist,
        }
      : null;

    pushTspStep({
      desc: didMutate
        ? `2-Opt Inversion Mutation: Reversed route sub-segment [${inv1}..${inv2}]. Untangled intersecting lines, distance shifted from ${childDist} px to ${mutatedDist} px.`
        : `Mutation check: Tour remained stable (no road inversion triggered with Pm=${config.mutationRate}).`,
      line: 6,
      phase: "mutation",
      pop: population,
      currentGen: gen,
      activeCrossover,
      activeMutation,
    });

    // Produce rest of offspring
    nextGen.push({
      id: `Gen${gen}-Child1`,
      tour: mutatedTour,
      distance: mutatedDist,
      fitness: parseFloat((100000 / mutatedDist).toFixed(2)),
      rank: 0,
      role: didMutate ? "mutated" : "offspring",
    });

    while (nextGen.length < config.populationSize) {
      const pA = tournamentSelect();
      const pB = tournamentSelect();
      const ox = orderCrossover(pA.tour, pB.tour);
      let t = ox.child;
      let isMut = false;

      if (Math.random() <= config.mutationRate) {
        t = inversionMutation(t).mutated;
        isMut = true;
      }

      const d = calculateTourDistance(t, cities);
      nextGen.push({
        id: `Gen${gen}-${nextGen.length + 1}`,
        tour: t,
        distance: d,
        fitness: parseFloat((100000 / d).toFixed(2)),
        rank: 0,
        role: isMut ? "mutated" : "offspring",
      });
    }

    population = rankTsp(nextGen);

    if (population[0].distance < bestEverDistance) {
      bestEverDistance = population[0].distance;
      bestEverTour = [...population[0].tour];
    }

    recordHistory(gen, population);

    // Step F: Generation Swarm Complete
    const improvement = (
      ((initialDistance - population[0].distance) / initialDistance) *
      100
    ).toFixed(1);

    pushTspStep({
      desc: `Generation ${gen} of ${config.generations} complete! Shortest tour length reduced to ${population[0].distance} px (${improvement}% improvement over initial random tour).`,
      line: 7,
      phase: "next_generation",
      pop: population,
      currentGen: gen,
    });
  }

  // Final Step: Complete & Converged
  const totalImprovement = (
    ((initialDistance - bestEverDistance) / initialDistance) *
    100
  ).toFixed(1);

  pushTspStep({
    desc: `TSP Optimization Complete! Evolved across ${config.generations} generations. Final shortest circuit distance: ${bestEverDistance} px (Route untangled by ${totalImprovement}% from ${initialDistance} px).`,
    line: 7,
    phase: "converged",
    pop: population,
    currentGen: config.generations,
  });

  steps.forEach((s) => (s.metrics.totalSteps = steps.length));
  return steps;
}
