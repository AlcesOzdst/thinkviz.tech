import type { Rule, RuleState, ConflictStrategy } from "@/types/rules";
import type { AlgorithmStep } from "@/types/visualizer";

export const FORWARD_PSEUDOCODE = [
  "repeat",
  "  conflictSet = rules whose IF part matches working memory",
  "  if conflictSet is empty: stop",
  "  rule = resolve(conflictSet)",
  "  fire(rule): add its THEN fact to working memory",
  "until no rule matches",
];

export const DEFAULT_RULES: Rule[] = [
  { id: "R1", ifs: ["fever", "cough"], then: "flu_suspected" },
  { id: "R2", ifs: ["flu_suspected", "body_ache"], then: "flu_likely" },
  { id: "R3", ifs: ["flu_likely"], then: "advise_rest" },
  { id: "R4", ifs: ["rash"], then: "allergy" },
];
export const DEFAULT_FACTS = ["fever", "cough", "body_ache"];

export function generateForwardChainingSteps(
  rules: Rule[] = DEFAULT_RULES,
  initialFacts: string[] = DEFAULT_FACTS,
  strategy: ConflictStrategy = "order"
): AlgorithmStep<RuleState>[] {
  const steps: AlgorithmStep<RuleState>[] = [];
  const facts = [...initialFacts];
  const fired: string[] = [];

  function push(desc: string, line: number, phase: RuleState["phase"], extra: Partial<RuleState> = {}) {
    steps.push({
      stepIndex: steps.length,
      description: desc,
      highlightedLine: line,
      state: {
        rules,
        facts: [...facts],
        newFact: null,
        conflictSet: [],
        firedRules: [...fired],
        currentRuleId: null,
        goalStack: [],
        proven: [],
        phase,
        ...extra,
      },
      metrics: {
        nodesExplored: fired.length,
        frontierSize: extra.conflictSet?.length ?? 0,
        pathCost: facts.length,
        totalSteps: 0,
      },
    });
  }

  push(`Working memory starts with: ${facts.join(", ")}.`, 1, "start");

  while (true) {
    // MATCH (refractoriness: a rule fires at most once, and only if it adds something new)
    const conflict = rules.filter(
      (r) => !fired.includes(r.id) && !facts.includes(r.then) && r.ifs.every((f) => facts.includes(f))
    );
    const ids = conflict.map((r) => r.id);
    push(
      ids.length ? `MATCH: rules whose IF part is true: ${ids.join(", ")}.` : "MATCH: no rule matches working memory.",
      2,
      "match",
      { conflictSet: ids }
    );
    if (!conflict.length) break;

    // RESOLVE
    const ordered = strategy === "specificity" ? [...conflict].sort((a, b) => b.ifs.length - a.ifs.length) : conflict;
    const chosen = ordered[0];
    push(
      `RESOLVE (${strategy}): choose ${chosen.id}${conflict.length > 1 ? ` from ${ids.join(", ")}` : ""}.`,
      4,
      "resolve",
      { conflictSet: ids, currentRuleId: chosen.id }
    );

    // ACT
    facts.push(chosen.then);
    fired.push(chosen.id);
    push(`ACT: fire ${chosen.id}, add "${chosen.then}" to working memory.`, 5, "act", {
      currentRuleId: chosen.id,
      newFact: chosen.then,
    });
  }

  push(`DONE: no more rules can fire. Final working memory: ${facts.join(", ")}.`, 6, "done");
  const total = steps.length;
  return steps.map((s) => ({ ...s, metrics: { ...s.metrics, totalSteps: total } }));
}
