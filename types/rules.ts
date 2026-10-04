export interface Rule {
  id: string;
  ifs: string[]; // antecedent (LHS): all must be known facts
  then: string;  // consequent (RHS)
}

export type RulePhase = "start" | "match" | "resolve" | "act" | "ask" | "done";
export type ConflictStrategy = "order" | "specificity";

// Immutable snapshot for one visualization step (plugs into AlgorithmStep<RuleState>)
export interface RuleState {
  rules: Rule[];
  facts: string[];            // working memory
  newFact: string | null;     // fact added in this step
  conflictSet: string[];      // rule ids matching right now (forward)
  firedRules: string[];
  currentRuleId: string | null;
  goalStack: string[];        // active subgoals (backward)
  proven: string[];
  phase: RulePhase;
}
