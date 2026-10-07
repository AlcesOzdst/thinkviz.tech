"use client";

import React, { useState, useEffect } from "react";
import { PlaybackToolbar } from "@/components/visualization/PlaybackToolbar";
import { MetricsPanel } from "@/components/visualization/MetricsPanel";
import { useVisualizerPlayback } from "@/hooks/useVisualizerPlayback";
import {
  generateForwardChainingSteps,
  DEFAULT_RULES,
  DEFAULT_FACTS,
  FORWARD_PSEUDOCODE,
} from "@/lib/algorithms/forwardChaining";
import {
  generateBackwardChainingSteps,
  BACKWARD_PSEUDOCODE,
} from "@/lib/algorithms/backwardChaining";
import { RuleState, ConflictStrategy } from "@/types/rules";
import { AlgorithmStep } from "@/types/visualizer";

interface RuleWorkspaceProps {
  algorithmId: string;
}

export function RuleWorkspace({ algorithmId }: RuleWorkspaceProps) {
  const isBackward = algorithmId === "backward-chaining";

  // Controls state
  const [strategy, setStrategy] = useState<ConflictStrategy>("order");
  const [selectedGoal, setSelectedGoal] = useState<string>("flu_likely");
  const [steps, setSteps] = useState<AlgorithmStep<RuleState>[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  const playback = useVisualizerPlayback(steps, algorithmId);

  const handleGenerate = () => {
    let newSteps: AlgorithmStep<RuleState>[] = [];
    if (isBackward) {
      newSteps = generateBackwardChainingSteps(selectedGoal, DEFAULT_RULES, DEFAULT_FACTS);
    } else {
      newSteps = generateForwardChainingSteps(DEFAULT_RULES, DEFAULT_FACTS, strategy);
    }
    setSteps(newSteps);
    setHasGenerated(true);
    playback.reset();
  };

  // Auto-generate on first mount or when switching algorithm
  useEffect(() => {
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algorithmId]);

  const activeStep = playback.currentStep;
  const activeState = activeStep ? (activeStep.state as RuleState) : null;
  const activeMetrics = activeStep ? activeStep.metrics : null;

  const currentPhase = activeState?.phase || "start";
  const pseudocodeLines = isBackward ? BACKWARD_PSEUDOCODE : FORWARD_PSEUDOCODE;
  const highlightedLine = activeStep ? activeStep.highlightedLine : 1;

  // Phase Badge Styling
  const getPhaseBadge = (phase: string) => {
    switch (phase) {
      case "match":
        return { label: "MATCH", bg: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
      case "resolve":
        return { label: "RESOLVE", bg: "bg-purple-500/20 text-purple-400 border-purple-500/30" };
      case "act":
        return { label: "ACT / FIRE", bg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" };
      case "ask":
        return { label: "ASK / UNRESOLVED", bg: "bg-rose-500/20 text-rose-400 border-rose-500/30" };
      case "done":
        return { label: "COMPLETED", bg: "bg-blue-500/20 text-blue-400 border-blue-500/30" };
      default:
        return { label: "INITIALIZED", bg: "bg-[#263352] text-[#6C8CFF] border-[#6C8CFF]/30" };
    }
  };

  const phaseBadge = getPhaseBadge(currentPhase);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Controls Toolbar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#15181D] border border-[#292E36]">
        <div className="flex items-center gap-3">
          <span
            className={`px-2.5 py-1 text-xs font-semibold rounded-md border font-mono tracking-wider ${phaseBadge.bg}`}
          >
            PHASE: {phaseBadge.label}
          </span>
          <span className="text-xs text-[#A7AFBB]">
            {isBackward
              ? "Goal-driven reasoning (working backward from hypothesis)"
              : "Data-driven inference (matching IF conditions to derive new facts)"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Strategy Selector for Forward Chaining */}
          {!isBackward ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#737C89]">Resolution Strategy:</span>
              <select
                value={strategy}
                onChange={(e) => {
                  setStrategy(e.target.value as ConflictStrategy);
                }}
                className="bg-[#0D0F12] border border-[#292E36] rounded-lg px-3 py-1.5 text-xs text-[#F1F3F5] focus:border-[#6C8CFF] focus:outline-none"
              >
                <option value="order">Rule Order (First Match)</option>
                <option value="specificity">Specificity (Most Antecedents)</option>
              </select>
            </div>
          ) : (
            /* Target Goal Selector for Backward Chaining */
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#737C89]">Target Goal:</span>
              <select
                value={selectedGoal}
                onChange={(e) => {
                  setSelectedGoal(e.target.value);
                }}
                className="bg-[#0D0F12] border border-[#292E36] rounded-lg px-3 py-1.5 text-xs text-[#F1F3F5] focus:border-[#6C8CFF] focus:outline-none"
              >
                <option value="flu_likely">flu_likely (Requires 2 steps)</option>
                <option value="advise_rest">advise_rest (Requires 3 steps)</option>
                <option value="flu_suspected">flu_suspected (Requires 1 step)</option>
                <option value="allergy">allergy (Fails - missing rash)</option>
              </select>
            </div>
          )}

          <button
            onClick={handleGenerate}
            className="px-4 py-1.5 rounded-lg bg-[#6C8CFF] hover:bg-[#5A7BEF] text-white font-medium text-xs transition-colors"
          >
            {hasGenerated ? "Restart Inference" : "Run Inference"}
          </button>
        </div>
      </div>

      {/* Main 3-Column Visualization Board */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Column 1: Knowledge Base (Rules) - 5 cols */}
        <div className="lg:col-span-5 bg-[#15181D] rounded-xl border border-[#292E36] p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#292E36]">
            <div>
              <h3 className="text-sm font-semibold text-[#F1F3F5]">Knowledge Base (Rules)</h3>
              <p className="text-[11px] text-[#737C89] mt-0.5">
                Production rules structured as IF (antecedents) → THEN (consequent)
              </p>
            </div>
            <span className="text-xs font-mono text-[#A7AFBB] bg-[#1B1F25] px-2 py-0.5 rounded border border-[#292E36]">
              {DEFAULT_RULES.length} Rules
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1">
            {DEFAULT_RULES.map((rule) => {
              const isCurrent = activeState?.currentRuleId === rule.id;
              const isFired = activeState?.firedRules.includes(rule.id) ?? false;
              const inConflict = activeState?.conflictSet.includes(rule.id) ?? false;

              return (
                <div
                  key={rule.id}
                  className={`p-3 rounded-lg border transition-all duration-300 ${
                    isCurrent
                      ? "bg-[#263352]/50 border-[#6C8CFF] shadow-sm shadow-[#6C8CFF]/20"
                      : isFired
                      ? "bg-[#10B981]/5 border-[#10B981]/30 opacity-75"
                      : inConflict
                      ? "bg-amber-500/10 border-amber-500/40"
                      : "bg-[#0D0F12] border-[#292E36]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#F1F3F5] bg-[#1B1F25] px-2 py-0.5 rounded border border-[#292E36]">
                        {rule.id}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-semibold text-[#6C8CFF] uppercase tracking-wider animate-pulse">
                          ● Active
                        </span>
                      )}
                      {inConflict && !isFired && !isCurrent && (
                        <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">
                          Candidate
                        </span>
                      )}
                    </div>
                    {isFired && (
                      <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        ✓ Fired
                      </span>
                    )}
                  </div>

                  <div className="text-xs font-mono space-y-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[#737C89] font-sans text-[11px]">IF</span>
                      {rule.ifs.map((antecedent, i) => {
                        const isKnown = activeState?.facts.includes(antecedent) ?? false;
                        return (
                          <React.Fragment key={antecedent}>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[11px] transition-colors ${
                                isKnown
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold"
                                  : "bg-[#1B1F25] text-[#A7AFBB] border border-[#292E36]"
                              }`}
                            >
                              {antecedent}
                            </span>
                            {i < rule.ifs.length - 1 && (
                              <span className="text-[#737C89] font-sans text-[10px]">AND</span>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-1.5 pt-1 border-t border-[#292E36]/60">
                      <span className="text-[#6C8CFF] font-sans text-[11px]">THEN</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                          activeState?.facts.includes(rule.then)
                            ? "bg-[#6C8CFF]/20 text-[#6C8CFF] border border-[#6C8CFF]/40"
                            : "bg-[#1B1F25] text-[#A7AFBB] border border-[#292E36]"
                        }`}
                      >
                        {rule.then}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 2: Working Memory (Facts) - 4 cols */}
        <div className="lg:col-span-4 bg-[#15181D] rounded-xl border border-[#292E36] p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#292E36]">
            <div>
              <h3 className="text-sm font-semibold text-[#F1F3F5]">Working Memory</h3>
              <p className="text-[11px] text-[#737C89] mt-0.5">Known facts in the current state</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {activeState?.facts.length ?? 0} Facts
            </span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[380px] pr-1">
            {activeState && activeState.facts.length > 0 ? (
              activeState.facts.map((fact) => {
                const isJustAdded = activeState.newFact === fact;
                const isInitial = DEFAULT_FACTS.includes(fact);

                return (
                  <div
                    key={fact}
                    className={`flex items-center justify-between p-2.5 rounded-lg border font-mono text-xs transition-all duration-300 ${
                      isJustAdded
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-200 shadow-sm shadow-emerald-500/30 scale-[1.02]"
                        : "bg-[#0D0F12] border-[#292E36] text-[#F1F3F5]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isJustAdded
                            ? "bg-emerald-400 animate-ping"
                            : isInitial
                            ? "bg-[#6C8CFF]"
                            : "bg-[#20C997]"
                        }`}
                      />
                      <span>{fact}</span>
                    </div>
                    <span className="text-[10px] text-[#737C89] uppercase tracking-wider font-sans">
                      {isJustAdded ? "★ Newly Added" : isInitial ? "Initial" : "Inferred"}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-[#737C89] py-8 text-center italic">
                Working memory is empty.
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Inference Engine Status (Conflict Set / Goal Stack) - 3 cols */}
        <div className="lg:col-span-3 bg-[#15181D] rounded-xl border border-[#292E36] p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#292E36]">
            <div>
              <h3 className="text-sm font-semibold text-[#F1F3F5]">
                {isBackward ? "Goal Stack" : "Conflict Set"}
              </h3>
              <p className="text-[11px] text-[#737C89] mt-0.5">
                {isBackward ? "Subgoals being verified" : "Matching rules ready to fire"}
              </p>
            </div>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[380px] pr-1">
            {!isBackward ? (
              /* Forward Chaining: Conflict Set */
              activeState?.conflictSet && activeState.conflictSet.length > 0 ? (
                activeState.conflictSet.map((ruleId) => {
                  const isChosen = activeState.currentRuleId === ruleId;
                  return (
                    <div
                      key={ruleId}
                      className={`p-2.5 rounded-lg border text-xs font-mono transition-all ${
                        isChosen
                          ? "bg-purple-500/20 border-purple-500 text-purple-200"
                          : "bg-amber-500/10 border-amber-500/30 text-amber-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{ruleId}</span>
                        <span className="text-[10px] font-sans">
                          {isChosen ? "Selected" : "Candidate"}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-[#737C89] py-8 text-center italic">
                  No rules in conflict set.
                </div>
              )
            ) : (
              /* Backward Chaining: Goal Stack & Proven Facts */
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-semibold text-[#737C89] uppercase tracking-wider block mb-2">
                    Active Stack (Top to Bottom)
                  </span>
                  {activeState?.goalStack && activeState.goalStack.length > 0 ? (
                    <div className="space-y-1.5">
                      {activeState.goalStack.map((g, idx) => (
                        <div
                          key={`${g}-${idx}`}
                          className="flex items-center gap-2 p-2 rounded bg-[#0D0F12] border border-[#292E36] text-xs font-mono text-[#F1F3F5]"
                        >
                          <span className="text-[#6C8CFF] font-bold text-[10px]">#{idx + 1}</span>
                          <span>{g}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-[#737C89] italic">Stack is empty.</div>
                  )}
                </div>

                {activeState?.proven && activeState.proven.length > 0 && (
                  <div className="pt-3 border-t border-[#292E36]">
                    <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block mb-2">
                      Proven Goals
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeState.proven.map((p) => (
                        <span
                          key={p}
                          className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono text-[11px]"
                        >
                          ✓ {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Playback Controls Toolbar */}
      <PlaybackToolbar playback={playback} disabled={!hasGenerated} />

      {/* Bottom Section: Step Narrative + Pseudocode (Left) and Metrics (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Step Narrative & Pseudocode Highlighter - 8 cols */}
        <div className="lg:col-span-8 p-5 rounded-xl bg-[#15181D] border border-[#292E36] space-y-4">
          <div className="flex items-center justify-between border-b border-[#292E36] pb-3 text-xs">
            <span className="font-semibold text-[#F1F3F5]">Step Trace & Explanation</span>
            <span className="font-mono text-[#A7AFBB]">
              {activeStep ? `Step ${activeStep.stepIndex + 1} of ${activeStep.metrics.totalSteps}` : "-"}
            </span>
          </div>

          {/* Narrative Action Box */}
          <div className="p-3 rounded-lg bg-[#1B1F25] border border-[#292E36] text-xs text-[#F1F3F5] leading-relaxed">
            <span className="text-[#6C8CFF] font-semibold mr-1.5">Action:</span>
            {activeStep ? activeStep.description : "Click 'Run Inference' to start simulation."}
          </div>

          {/* Pseudocode Execution Box */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-[#A7AFBB] block">
              {isBackward ? "Backward Chaining Pseudocode" : "Forward Chaining Pseudocode"}
            </span>
            <div className="rounded-lg bg-[#0D0F12] border border-[#292E36] p-2.5 font-mono text-xs leading-relaxed text-[#737C89]">
              {pseudocodeLines.map((line, idx) => {
                const lineNum = idx + 1;
                const isLineActive = lineNum === highlightedLine;
                return (
                  <div
                    key={idx}
                    className={`px-2 py-1 rounded transition-colors ${
                      isLineActive
                        ? "bg-[#263352] text-[#F1F3F5] font-medium border-l-2 border-[#6C8CFF]"
                        : "hover:text-[#A7AFBB]"
                    }`}
                  >
                    <span className="text-[#737C89] select-none mr-2">{lineNum}.</span>
                    {line}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Real-time Metrics Panel - 4 cols */}
        <div className="lg:col-span-4 flex flex-col justify-start">
          <MetricsPanel metrics={activeMetrics} />
        </div>
      </div>
    </div>
  );
}
