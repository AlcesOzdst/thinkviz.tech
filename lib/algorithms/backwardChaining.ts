import type { Rule, RuleState } from "@/types/rules";
import type { AlgorithmStep } from "@/types/visualizer";
import { DEFAULT_RULES, DEFAULT_FACTS } from "./forwardChaining";

export const BACKWARD_PSEUDOCODE = [
  "prove(goal):",
  "  if goal in working memory: return true",
  "  for each rule that concludes goal:",
  "    if prove(every condition in rule.IF): add goal to memory, return true",
  "  return false   (or ask the user)",
];

export function generateBackwardChainingSteps(
  goal: string = "flu_likely",
  rules: Rule[] = DEFAULT_RULES,
  initialFacts: string[] = DEFAULT_FACTS
): AlgorithmStep<RuleState>[] {
  const steps: AlgorithmStep<RuleState>[] = [];
  const facts = [...initialFacts];
  const proven: string[] = [];
  const stack: string[] = [];
  const fired: string[] = [];

  function push(
    desc: string,
    line: number,
    phase: RuleState["phase"],
    current: string | null = null,
    newFact: string | null = null
  ) {
    steps.push({
      stepIndex: steps.length,
      description: desc,
      highlightedLine: line,
      state: {
        rules,
        facts: [...facts],
        newFact,
        conflictSet: [],
        firedRules: [...fired],
        currentRuleId: current,
        goalStack: [...stack],
        proven: [...proven],
        phase,
      },
      metrics: {
        nodesExplored: proven.length,
        frontierSize: stack.length,
        pathCost: facts.length,
        totalSteps: 0,
      },
    });
  }

  function prove(g: string): boolean {
    stack.push(g);
    push(`GOAL: can we prove "${g}"?`, 1, "match");
    if (facts.includes(g)) {
      proven.push(g);
      push(`"${g}" is already a known fact: proven.`, 2, "act");
      stack.pop();
      return true;
    }
    for (const rule of rules.filter((r) => r.then === g)) {
      push(`${rule.id} concludes "${g}". New subgoals: ${rule.ifs.join(", ")}.`, 3, "resolve", rule.id);
      if (rule.ifs.every((c) => prove(c))) {
        facts.push(g);
        proven.push(g);
        fired.push(rule.id);
        push(`All conditions of ${rule.id} hold, so "${g}" is proven.`, 4, "act", rule.id, g);
        stack.pop();
        return true;
      }
    }
    push(`No rule or fact proves "${g}". The engine would ask the user.`, 5, "ask");
    stack.pop();
    return false;
  }

  const ok = prove(goal);
  push(ok ? `DONE: goal "${goal}" is proven.` : `DONE: goal "${goal}" could not be proven.`, 5, "done");
  const total = steps.length;
  return steps.map((s) => ({ ...s, metrics: { ...s.metrics, totalSteps: total } }));
}
