import { LandscapePreset } from "@/types/optimization";

export interface EvaluatedLandscape extends LandscapePreset {
  getY: (x: number) => number;
}

export const LANDSCAPES: Record<string, EvaluatedLandscape> = {
  "deceptive-multimodal": {
    id: "deceptive-multimodal",
    name: "Multimodal Deceptive Hills",
    description: "Multiple deceptive local peaks with a high global peak near x ≈ 18.2. Local search (Hill Climbing) easily gets stuck in traps.",
    minX: 0,
    maxX: 20,
    globalMax: { x: 18.23, y: 4.09 },
    localTrapsCount: 3,
    getY: (x: number) => {
      return Math.sin(x) + 0.5 * Math.sin(3 * x) + (x * 0.15);
    },
  },
  "rastrigin": {
    id: "rastrigin",
    name: "Rastrigin Landscape (Periodic Traps)",
    description: "Highly oscillatory benchmark surface with many periodic local maxima testing the genetic algorithm's escape ability.",
    minX: 0,
    maxX: 10,
    globalMax: { x: 5.0, y: 10.0 },
    localTrapsCount: 8,
    getY: (x: number) => {
      const u = x - 5;
      return 10 - (0.15 * u * u - 2 * Math.cos(2 * Math.PI * u) + 2);
    },
  },
  "ackley": {
    id: "ackley",
    name: "Ackley Needle Peak",
    description: "Flat undulating plateau surrounding a narrow, steep global summit at x = 5.0.",
    minX: 0,
    maxX: 10,
    globalMax: { x: 5.0, y: 17.65 },
    localTrapsCount: 6,
    getY: (x: number) => {
      const u = x - 5;
      return 15 * Math.exp(-0.25 * Math.abs(u)) + Math.exp(0.5 * Math.cos(2 * Math.PI * u)) + 1;
    },
  },
  "camelback": {
    id: "camelback",
    name: "Double Peak / Camelback",
    description: "Two distinct summits separated by a deep valley: one deceptive sub-peak (x ≈ 2.8) and one true global peak (x ≈ 7.2).",
    minX: 0,
    maxX: 10,
    globalMax: { x: 7.2, y: 6.8 },
    localTrapsCount: 2,
    getY: (x: number) => {
      return (
        3.5 * Math.exp(-0.6 * Math.pow(x - 2.8, 2)) +
        5.5 * Math.exp(-0.5 * Math.pow(x - 7.2, 2)) +
        0.4 * Math.sin(4 * x) +
        1.5
      );
    },
  },
};

export const DEFAULT_LANDSCAPE_ID = "deceptive-multimodal";

export function getLandscape(landscapeId: string = DEFAULT_LANDSCAPE_ID): EvaluatedLandscape {
  return LANDSCAPES[landscapeId] || LANDSCAPES[DEFAULT_LANDSCAPE_ID];
}
