"use client";

import React from "react";
import { AlgorithmStep } from "@/types/visualizer";
import { GridState } from "@/types/grid";

export interface StepExplanationProps {
  step: AlgorithmStep<GridState> | null;
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

export function StepExplanation({ step }: StepExplanationProps) {
  if (!step) {
    return (
      <div className="w-full p-4 rounded-xl bg-[#15181D] border border-[#292E36] text-xs text-[#737C89]">
        No step trace active. Click &quot;Visualize A*&quot; to begin algorithm execution.
      </div>
    );
  }

  // Normalize highlighted line to valid range [1, 8]
  let activeLine = step.highlightedLine;
  if (activeLine > 8) activeLine = 8;
  if (activeLine < 1) activeLine = 1;

  // Active node details from current step snapshot
  const activePos = step.state.currentNode;
  const activeNode = activePos ? step.state.grid[activePos.row]?.[activePos.col] : null;
  const hasActiveNode = activeNode && activeNode.gCost !== Infinity;

  return (
    <div className="w-full p-4 rounded-xl bg-[#15181D] border border-[#292E36] space-y-4">
      {/* Header with Step indicator */}
      <div className="flex items-center justify-between border-b border-[#292E36] pb-3 text-xs">
        <span className="font-semibold text-[#F1F3F5]">Step Explanation</span>
        <span className="font-mono text-[#A7AFBB]">
          Step {step.stepIndex + 1} of {step.metrics.totalSteps}
        </span>
      </div>

      {/* Narrative Step Description */}
      <div className="p-3 rounded-lg bg-[#1B1F25] border border-[#292E36] text-xs text-[#F1F3F5] leading-relaxed">
        <span className="text-[#6C8CFF] font-medium mr-1.5">Action:</span>
        {step.description}
      </div>

      {/* Active Node Costs Badge Group (g, h, f) */}
      {hasActiveNode && (
        <div className="p-3 rounded-lg bg-[#0D0F12] border border-[#292E36] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-[#A7AFBB]">
            Current Node: <span className="font-mono font-semibold text-[#F1F3F5]">({activeNode.row}, {activeNode.col})</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-xs">
            <span className="text-[#A7AFBB]">
              g(n) = <strong className="text-[#F1F3F5] font-normal">{activeNode.gCost}</strong>
            </span>
            <span className="text-[#A7AFBB]">
              h(n) = <strong className="text-[#F1F3F5] font-normal">{activeNode.hCost.toFixed(2)}</strong>
            </span>
            <span className="text-[#6C8CFF] font-semibold">
              f(n) = {activeNode.fCost.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Pseudocode Highlighter Block */}
      <div className="space-y-1">
        <span className="text-[11px] font-semibold text-[#A7AFBB] block mb-2">
          A* Pseudocode Execution
        </span>
        <div className="rounded-lg bg-[#0D0F12] border border-[#292E36] p-2.5 font-mono text-[11px] leading-relaxed text-[#737C89]">
          {PSEUDOCODE_LINES.map((item) => {
            const isHighlighted = item.line === activeLine;

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
