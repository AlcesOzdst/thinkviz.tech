"use client";

import React from "react";
import { AlgorithmStep, AlgorithmMetrics } from "@/types/visualizer";
import { GridState } from "@/types/grid";
import { MetricsPanel } from "@/components/visualization/MetricsPanel";

export interface StepExplanationProps {
  step: AlgorithmStep<GridState> | null;
  metrics?: AlgorithmMetrics | null;
}

const PSEUDOCODE_LINES = [
  { line: 1, code: "1. Add start node to OPEN set with g(n)=0, h(n)" },
  { line: 2, code: "2. Select node in OPEN with minimum f(n) = g(n) + h(n)" },
  { line: 3, code: "3. If node is GOAL: reconstruct optimal path & finish" },
  { line: 4, code: "4. Move current node from OPEN to CLOSED set" },
  { line: 5, code: "5. Examine 4-directional unvisited neighbors" },
  { line: 6, code: "6. Calculate tentative g(n) = g(current) + cost" },
  { line: 7, code: "7. If tentative g(n) < g(neighbor): update parent & costs" },
  { line: 8, code: "8. Repeat loop until goal is reached or OPEN is empty" },
];

export function StepExplanation({ step, metrics }: StepExplanationProps) {
  // Normalize highlighted line to valid range [1, 8]
  let activeLine = step ? step.highlightedLine : 1;
  if (activeLine > 8) activeLine = 8;
  if (activeLine < 1) activeLine = 1;

  // Active node details from current step snapshot
  const activePos = step?.state.currentNode;
  const activeNode =
    activePos && step ? step.state.grid[activePos.row]?.[activePos.col] : null;
  const hasActiveNode = activeNode && activeNode.gCost !== Infinity;

  const currentMetrics = metrics ?? (step ? step.metrics : null);

  return (
    <div className="w-full rounded-xl bg-[#15181D] border border-[#292E36] overflow-hidden flex flex-col divide-y divide-[#292E36]">
      {/* Learning Panel Header */}
      <div className="px-4 py-3 bg-[#1B1F25] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#F1F3F5]">
            Algorithm Walkthrough
          </span>
        </div>

        {step ? (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#263352] border border-[#6C8CFF]/30 text-xs font-mono font-semibold text-[#6C8CFF]">
            <span>Step {step.stepIndex + 1}</span>
            <span className="text-[#737C89]">/</span>
            <span className="text-[#A7AFBB]">{step.metrics.totalSteps}</span>
          </div>
        ) : (
          <span className="text-xs text-[#737C89] font-mono px-2 py-0.5 rounded bg-[#0D0F12] border border-[#292E36]">
            Ready to Visualize
          </span>
        )}
      </div>

      {/* Step Narrative Action */}
      <div className="p-4 space-y-2">
        <div className="text-[11px] font-semibold text-[#A7AFBB] uppercase tracking-wider">
          Current Action
        </div>
        <div className="p-3 rounded-lg bg-[#0D0F12] border border-[#292E36] text-xs text-[#F1F3F5] leading-relaxed">
          {step ? (
            <p>{step.description}</p>
          ) : (
            <p className="text-[#737C89]">
              Grid is in edit mode. Click or drag to draw walls, drag Start (S) or Goal (G), then click &quot;Visualize A*&quot; to begin.
            </p>
          )}
        </div>
      </div>

      {/* Beginner-Friendly Cost Breakdown (g, h, f) */}
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[11px] font-semibold text-[#A7AFBB] uppercase tracking-wider">
            Node Score Evaluation
          </span>
          {hasActiveNode && (
            <span className="font-mono text-[11px] text-[#A7AFBB] bg-[#0D0F12] px-2 py-0.5 rounded border border-[#292E36]">
              Node ({activeNode.row}, {activeNode.col})
            </span>
          )}
        </div>

        {hasActiveNode ? (
          <div className="grid grid-cols-3 gap-2">
            {/* g(n) */}
            <div className="p-2.5 rounded-lg bg-[#0D0F12] border border-[#292E36] flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-[#737C89] font-medium block">
                  Distance from Start
                </span>
                <span className="text-sm sm:text-base font-bold font-mono text-[#F1F3F5] mt-0.5 block">
                  g(n) = {activeNode.gCost}
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-[#737C89] mt-1 block">
                Exact path cost
              </span>
            </div>

            {/* h(n) */}
            <div className="p-2.5 rounded-lg bg-[#0D0F12] border border-[#292E36] flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-[#737C89] font-medium block">
                  Estimated to Goal
                </span>
                <span className="text-sm sm:text-base font-bold font-mono text-[#F1F3F5] mt-0.5 block">
                  h(n) = {activeNode.hCost.toFixed(1)}
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-[#737C89] mt-1 block">
                Heuristic estimate
              </span>
            </div>

            {/* f(n) */}
            <div className="p-2.5 rounded-lg bg-[#263352]/40 border border-[#6C8CFF]/40 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-[#6C8CFF] font-semibold block">
                  Total Priority
                </span>
                <span className="text-sm sm:text-base font-bold font-mono text-[#6C8CFF] mt-0.5 block">
                  f(n) = {activeNode.fCost.toFixed(1)}
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-[#A7AFBB] mt-1 block">
                f(n) = g(n) + h(n)
              </span>
            </div>
          </div>
        ) : (
          <div className="p-2.5 rounded-lg bg-[#0D0F12] border border-[#292E36] text-[11px] text-[#737C89] leading-relaxed">
            <span className="text-[#A7AFBB] font-medium">A* Formula: </span>
            <strong className="text-[#F1F3F5] font-mono">f(n) = g(n) + h(n)</strong>. Nodes with the lowest total estimated cost <span className="text-[#6C8CFF] font-mono">f(n)</span> are prioritized for expansion.
          </div>
        )}
      </div>

      {/* Connected Live Metrics */}
      <div className="p-4">
        <MetricsPanel metrics={currentMetrics} />
      </div>

      {/* Pseudocode Execution Tracker */}
      <div className="p-4 space-y-2">
        <div className="text-[11px] font-semibold text-[#A7AFBB] uppercase tracking-wider">
          Pseudocode Tracker
        </div>
        <div className="rounded-lg bg-[#0D0F12] border border-[#292E36] p-2 font-mono text-[11px] leading-relaxed text-[#737C89] space-y-0.5">
          {PSEUDOCODE_LINES.map((item) => {
            const isHighlighted = step ? item.line === activeLine : false;

            return (
              <div
                key={item.line}
                className={`px-2 py-1 rounded transition-colors ${
                  isHighlighted
                    ? "bg-[#263352] text-[#F1F3F5] font-medium border-l-2 border-[#6C8CFF]"
                    : "hover:text-[#A7AFBB]"
                }`}
              >
                {item.code}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

