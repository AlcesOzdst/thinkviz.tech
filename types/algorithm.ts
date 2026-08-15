export type AlgorithmCategory =
  | "Uninformed Search"
  | "Informed Search"
  | "Local Search"
  | "Constraint Satisfaction"
  | "Adversarial Search";

export type AlgorithmDifficulty = "Beginner" | "Intermediate" | "Advanced";

export interface AlgorithmMeta {
  id: string;
  name: string;
  shortName: string;
  category: AlgorithmCategory;
  description: string;
  longDescription: string;
  timeComplexity: string;
  spaceComplexity: string;
  difficulty: AlgorithmDifficulty;
  featured: boolean;
  tags: string[];
  visualizerType: "grid" | "graph" | "tree" | "game-tree" | "optimization";
}

export interface CategoryInfo {
  name: AlgorithmCategory;
  slug: string;
  description: string;
  algorithmCount: number;
  iconName: string;
}
