"use client";

import React from "react";
import { AlgorithmStep } from "@/types/visualizer";
import { GridState } from "@/types/grid";
import { Terminal, Code2, ArrowRight } from "lucide-react";

export interface StepExplanationProps {
  step: AlgorithmStep<GridState> | null;
}

const PSEUDOCODE_LINES = [
  { line: 1, code: "1. Add start node to OPEN set with g=0, h=dist" },
  { line: 2, code: "2. Select node n in OPEN with minimum f(n)" },
  { line: 3, code: "3. If n == GOAL: reconstruct optimal path & return" },
  { line: 4, code: "4. Move node n from OPEN to CLOSED set" },
  { line: 5, code: "5. For each 4-way unvisited neighbor m of n:" },
  { line: 6, code: "6.   tentative_g = g(n) + step_cost(n, m)" },
  { line: 7, code: "7.   If tentative_g < g(m): update parent & costs" },
  { line: 8, code: "8. Repeat loop until GOAL reached or OPEN empty" },
];

export function StepExplanation({ step }: StepExplanationProps) {
  if (!step) {
    return (
      <div className="w-full rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] p-4 text-xs text-[var(--text-muted)] space-y-2">
        <div className="flex items-center gap-1.5 font-semibold text-[var(--text-secondary)]">
          <Terminal className="w-3.5 h-3.5 text-[var(--color-accent)]" />
          <span>Execution Tracer Idle</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Configure parameters or draw obstacles, then click &quot;Execute&quot; to begin step-by-step tracing.
        </p>
      </div>
    );
  }

  // Normalize highlighted line to valid range [1, 8]
  let activeLine = step.highlightedLine;
  if (activeLine > 8) activeLine = 8;
  if (activeLine < 1) activeLine = 1;

  return (
    <div className="w-full rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] overflow-hidden space-y-0">
      {/* Tracer Header */}
      <div className="px-4 py-2.5 border-b border-[var(--border-default)] bg-[var(--bg-elevated)] flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
          <Code2 className="w-3.5 h-3.5 text-[var(--color-accent)]" />
          <span>Pseudocode Execution Tracer</span>
        </div>
        <span className="font-mono tabular-nums text-[10px] text-[var(--text-muted)]">
          Frame {step.stepIndex + 1}/{step.metrics.totalSteps}
        </span>
      </div>

      <div className="p-3.5 space-y-3">
        {/* Narrative Step Description */}
        <div className="p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] leading-relaxed">
          <div className="flex items-start gap-1.5 mb-1 text-[11px] font-semibold text-[var(--color-accent)] uppercase tracking-wider">
            <ArrowRight className="w-3 h-3 mt-0.5" />
            <span>Active Operation</span>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Pseudocode Terminal View */}
        <div className="rounded-lg bg-[var(--pseudocode-bg)] border border-[var(--border-subtle)] p-2 font-mono text-[11px] leading-relaxed select-text">
          {PSEUDOCODE_LINES.map((item) => {
            const isHighlighted = item.line === activeLine;

            return (
              <div
                key={item.line}
                className={`px-2 py-0.5 rounded transition-colors duration-150 flex items-center justify-between ${
                  isHighlighted
                    ? "bg-[var(--pseudocode-active-bg)] text-[var(--pseudocode-active-text)] font-semibold border-l-2 border-[var(--pseudocode-active-border)] pl-1.5"
                    : "text-[var(--pseudocode-line-text)] hover:text-[var(--text-primary)]"
                }`}
              >
                <span>{item.code}</span>
                {isHighlighted && (
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[var(--color-accent)] text-white uppercase ml-2 tracking-tighter">
                    Active
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
