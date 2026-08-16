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

  let pathCostDisplay = "—";
  if (metrics && metrics.pathCost > 0 && metrics.pathCost !== Infinity) {
    pathCostDisplay = metrics.pathCost.toFixed(1);
  }

  return (
    <div className="w-full space-y-2">
      <div className="text-[11px] font-semibold text-[#A7AFBB] uppercase tracking-wider flex items-center justify-between">
        <span>Search Metrics</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Nodes Explored Card */}
        <div className="p-2.5 rounded-lg bg-[#0D0F12] border border-[#292E36] flex flex-col justify-between">
          <span className="text-[10px] font-medium text-[#737C89] uppercase tracking-wider">
            Explored
          </span>
          <span className="text-base sm:text-lg font-bold font-mono text-[#F1F3F5] mt-0.5">
            {nodesExplored}
          </span>
        </div>

        {/* Frontier Size Card */}
        <div className="p-2.5 rounded-lg bg-[#0D0F12] border border-[#292E36] flex flex-col justify-between">
          <span className="text-[10px] font-medium text-[#737C89] uppercase tracking-wider">
            Frontier
          </span>
          <span className="text-base sm:text-lg font-bold font-mono text-[#6C8CFF] mt-0.5">
            {frontierSize}
          </span>
        </div>

        {/* Path Cost Card */}
        <div className="p-2.5 rounded-lg bg-[#0D0F12] border border-[#292E36] flex flex-col justify-between">
          <span className="text-[10px] font-medium text-[#737C89] uppercase tracking-wider">
            Path Cost
          </span>
          <span className="text-base sm:text-lg font-bold font-mono text-[#55B89A] mt-0.5">
            {pathCostDisplay}
          </span>
        </div>

        {/* Total Steps Card */}
        <div className="p-2.5 rounded-lg bg-[#0D0F12] border border-[#292E36] flex flex-col justify-between">
          <span className="text-[10px] font-medium text-[#737C89] uppercase tracking-wider">
            Total Steps
          </span>
          <span className="text-base sm:text-lg font-bold font-mono text-[#F1F3F5] mt-0.5">
            {totalSteps}
          </span>
        </div>
      </div>
    </div>
  );
}

