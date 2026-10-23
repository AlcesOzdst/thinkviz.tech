"use client";

import React from "react";
import { AlgorithmMetrics } from "@/types/visualizer";
import { Activity, Compass, Network, Layers } from "lucide-react";

export interface MetricsPanelProps {
  metrics: AlgorithmMetrics | null;
  currentNode?: { row: number; col: number; gCost: number; hCost: number; fCost: number } | null;
  variant?: "horizontal" | "vertical";
}

export function MetricsPanel({ metrics, currentNode, variant = "vertical" }: MetricsPanelProps) {
  const nodesExplored = metrics ? metrics.nodesExplored : 0;
  const frontierSize = metrics ? metrics.frontierSize : 0;
  const totalSteps = metrics ? metrics.totalSteps : 0;

  let pathCostDisplay = "—";
  if (metrics && metrics.pathCost > 0 && metrics.pathCost !== Infinity) {
    pathCostDisplay = metrics.pathCost.toFixed(2);
  }

  if (variant === "horizontal") {
    return (
      <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs">
        {/* Nodes Explored */}
        <div className="flex items-center gap-1.5 font-mono tabular-nums">
          <Layers className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          <span className="text-[var(--text-secondary)] font-sans text-[11px]">Explored:</span>
          <span className="font-bold text-[var(--text-primary)]">{nodesExplored}</span>
        </div>

        {/* Frontier */}
        <div className="flex items-center gap-1.5 font-mono tabular-nums">
          <Compass className="w-3.5 h-3.5 text-[var(--color-frontier)]" />
          <span className="text-[var(--text-secondary)] font-sans text-[11px]">Frontier:</span>
          <span className="font-bold text-[var(--color-frontier)]">{frontierSize}</span>
        </div>

        {/* Path Cost */}
        <div className="flex items-center gap-1.5 font-mono tabular-nums">
          <Network className="w-3.5 h-3.5 text-[var(--color-path)]" />
          <span className="text-[var(--text-secondary)] font-sans text-[11px]">Cost g(n):</span>
          <span className="font-bold text-[var(--color-path)]">{pathCostDisplay}</span>
        </div>

        {/* Total Steps */}
        <div className="flex items-center gap-1.5 font-mono tabular-nums">
          <Activity className="w-3.5 h-3.5 text-[var(--color-accent)]" />
          <span className="text-[var(--text-secondary)] font-sans text-[11px]">Frames:</span>
          <span className="font-semibold text-[var(--text-primary)]">{totalSteps}</span>
        </div>

        {/* Active Node Evaluation */}
        {currentNode && currentNode.gCost !== Infinity && (
          <div className="flex items-center gap-2 px-2 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] font-mono tabular-nums text-[11px]">
            <span className="text-[var(--text-muted)]">({currentNode.row},{currentNode.col})</span>
            <span className="text-[var(--text-secondary)]">g:{currentNode.gCost}</span>
            <span className="text-[var(--text-secondary)]">h:{currentNode.hCost.toFixed(1)}</span>
            <span className="font-bold text-[var(--color-accent)]">f:{currentNode.fCost.toFixed(1)}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] overflow-hidden">
      {/* Telemetry Header */}
      <div className="px-4 py-2.5 border-b border-[var(--border-default)] bg-[var(--bg-elevated)] flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
          <Activity className="w-3.5 h-3.5 text-[var(--color-accent)]" />
          <span>Real-time Telemetry HUD</span>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
          Live Stream
        </span>
      </div>

      {/* Telemetry Metric Rows */}
      <div className="divide-y divide-[var(--border-subtle)] text-xs">
        {/* Nodes Explored */}
        <div className="px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <Layers className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span>Nodes Explored</span>
          </div>
          <span className="font-mono tabular-nums text-base font-bold text-[var(--text-primary)]">
            {nodesExplored}
          </span>
        </div>

        {/* Frontier / Open Queue Size */}
        <div className="px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <Compass className="w-3.5 h-3.5 text-[var(--color-frontier)]" />
            <span>Frontier (Open Set)</span>
          </div>
          <span className="font-mono tabular-nums text-base font-bold text-[var(--color-frontier)]">
            {frontierSize}
          </span>
        </div>

        {/* Path Cost */}
        <div className="px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <Network className="w-3.5 h-3.5 text-[var(--color-path)]" />
            <span>Optimal Cost g(n)</span>
          </div>
          <span className="font-mono tabular-nums text-base font-bold text-[var(--color-path)]">
            {pathCostDisplay}
          </span>
        </div>

        {/* Total Step Count */}
        <div className="px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--text-muted)]" />
            <span>Total Step Frames</span>
          </div>
          <span className="font-mono tabular-nums text-base font-semibold text-[var(--text-primary)]">
            {totalSteps}
          </span>
        </div>

        {/* Active Node Mathematical Breakdown */}
        {currentNode && currentNode.gCost !== Infinity && (
          <div className="p-3 bg-[var(--bg-primary)]">
            <div className="text-[11px] text-[var(--text-muted)] mb-1 flex items-center justify-between">
              <span>Active Evaluation</span>
              <span className="font-mono tabular-nums text-[var(--text-primary)] font-medium">
                ({currentNode.row}, {currentNode.col})
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="py-1 px-1.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                <span className="text-[9px] uppercase block text-[var(--text-muted)]">g(cost)</span>
                <span className="font-mono tabular-nums font-semibold text-xs text-[var(--text-primary)]">
                  {currentNode.gCost}
                </span>
              </div>
              <div className="py-1 px-1.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                <span className="text-[9px] uppercase block text-[var(--text-muted)]">h(heur)</span>
                <span className="font-mono tabular-nums font-semibold text-xs text-[var(--text-primary)]">
                  {currentNode.hCost.toFixed(1)}
                </span>
              </div>
              <div className="py-1 px-1.5 rounded bg-[var(--color-accent-subtle)] border border-[var(--color-accent)]/30">
                <span className="text-[9px] uppercase block text-[var(--color-accent)]">f(total)</span>
                <span className="font-mono tabular-nums font-bold text-xs text-[var(--color-accent)]">
                  {currentNode.fCost.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
