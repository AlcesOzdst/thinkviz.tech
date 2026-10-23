"use client";

import React from "react";
import { AlgorithmMetrics } from "@/types/visualizer";

export interface MetricsPanelProps {
  metrics: AlgorithmMetrics | null;
}

export function MetricsPanel({ metrics }: MetricsPanelProps) {
  const nodesExplored = metrics ? metrics.nodesExplored : 0;
  const frontierSize = metrics ? metrics.frontierSize : 0;
  const totalSteps = metrics ? metrics.totalSteps : 0;

  let pathCostDisplay = "-";
  if (metrics && metrics.pathCost > 0 && metrics.pathCost !== Infinity) {
    pathCostDisplay = metrics.pathCost.toFixed(2);
  }

  return (
    <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* Nodes Explored Card */}
      <div className="p-3.5 rounded-xl bg-[#12161D] border border-[#232B36] flex flex-col justify-between">
        <span className="text-[11px] font-medium text-[#828E9E] uppercase tracking-wide">
          Nodes Explored
        </span>
        <span className="text-xl font-bold font-mono text-[#F8FAFC] mt-1">
          {nodesExplored}
        </span>
      </div>

      {/* Frontier Size Card */}
      <div className="p-3.5 rounded-xl bg-[#12161D] border border-[#232B36] flex flex-col justify-between">
        <span className="text-[11px] font-medium text-[#828E9E] uppercase tracking-wide">
          Frontier Size
        </span>
        <span className="text-xl font-bold font-mono text-[#F59E0B] mt-1">
          {frontierSize}
        </span>
      </div>

      {/* Path Cost Card */}
      <div className="p-3.5 rounded-xl bg-[#12161D] border border-[#232B36] flex flex-col justify-between">
        <span className="text-[11px] font-medium text-[#828E9E] uppercase tracking-wide">
          Path Cost g(n)
        </span>
        <span className="text-xl font-bold font-mono text-[#10B981] mt-1">
          {pathCostDisplay}
        </span>
      </div>

      {/* Total Steps Card */}
      <div className="p-3.5 rounded-xl bg-[#12161D] border border-[#232B36] flex flex-col justify-between">
        <span className="text-[11px] font-medium text-[#828E9E] uppercase tracking-wide">
          Total Steps
        </span>
        <span className="text-xl font-bold font-mono text-[#F8FAFC] mt-1">
          {totalSteps}
        </span>
      </div>
    </div>
  );
}
