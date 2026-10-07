"use client";

import React, { useMemo } from "react";
import { GenerationStat } from "@/types/optimization";

interface ConvergenceChartProps {
  stats: GenerationStat[];
  currentGen: number;
  maxGenerations: number;
  globalBestFitness?: number;
}

export function ConvergenceChart({
  stats,
  currentGen,
  maxGenerations,
  globalBestFitness,
}: ConvergenceChartProps) {
  // Chart dimensions
  const width = 640;
  const height = 220;
  const margin = { top: 24, right: 30, bottom: 36, left: 45 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Filter stats up to current generation
  const activeStats = useMemo(() => {
    return stats.filter((s) => s.generation <= currentGen);
  }, [stats, currentGen]);

  // Compute min and max fitness bounds
  const { minFit, maxFit } = useMemo(() => {
    if (stats.length === 0) return { minFit: 0, maxFit: 10 };
    let min = Infinity;
    let max = -Infinity;
    for (const s of stats) {
      if (s.worstFitness < min) min = s.worstFitness;
      if (s.bestFitness > max) max = s.bestFitness;
    }
    if (globalBestFitness !== undefined && globalBestFitness > max) {
      max = globalBestFitness;
    }
    const pad = (max - min) * 0.1 || 1;
    return { minFit: min - pad, maxFit: max + pad };
  }, [stats, globalBestFitness]);

  const mapGenToSvgX = (gen: number) => {
    const denom = Math.max(1, maxGenerations);
    return margin.left + (gen / denom) * innerWidth;
  };

  const mapFitToSvgY = (fit: number) => {
    const range = maxFit - minFit || 1;
    return margin.top + innerHeight - ((fit - minFit) / range) * innerHeight;
  };

  // Generate paths
  const { bestPath, avgPath, areaPath } = useMemo(() => {
    if (activeStats.length === 0) return { bestPath: "", avgPath: "", areaPath: "" };

    let bestD = "";
    let avgD = "";

    activeStats.forEach((s, idx) => {
      const x = mapGenToSvgX(s.generation);
      const yBest = mapFitToSvgY(s.bestFitness);
      const yAvg = mapFitToSvgY(s.avgFitness);

      if (idx === 0) {
        bestD += `M ${x},${yBest} `;
        avgD += `M ${x},${yAvg} `;
      } else {
        bestD += `L ${x},${yBest} `;
        avgD += `L ${x},${yAvg} `;
      }
    });

    // Area between best and avg
    let areaD = "";
    if (activeStats.length > 1) {
      const first = activeStats[0];
      areaD = `M ${mapGenToSvgX(first.generation)},${mapFitToSvgY(first.bestFitness)} `;
      for (let i = 1; i < activeStats.length; i++) {
        areaD += `L ${mapGenToSvgX(activeStats[i].generation)},${mapFitToSvgY(activeStats[i].bestFitness)} `;
      }
      for (let i = activeStats.length - 1; i >= 0; i--) {
        areaD += `L ${mapGenToSvgX(activeStats[i].generation)},${mapFitToSvgY(activeStats[i].avgFitness)} `;
      }
      areaD += "Z";
    }

    return { bestPath: bestD, avgPath: avgD, areaPath: areaD };
  }, [activeStats, maxGenerations, minFit, maxFit]);

  const latestStat = activeStats[activeStats.length - 1];

  return (
    <div className="w-full flex flex-col bg-[#0D0F12] border border-[#292E36] rounded-xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 border-b border-[#292E36] pb-2.5">
        <div>
          <h4 className="text-xs font-semibold text-[#F1F3F5] flex items-center gap-2">
            <span>Fitness Convergence Curve</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#1B1F25] text-[#A7AFBB] border border-[#292E36]">
              Gen 0 → {currentGen} of {maxGenerations}
            </span>
          </h4>
          <p className="text-[11px] text-[#737C89] mt-0.5">
            Tracks evolution of generation peak vs average fitness over time
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] inline-block shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[#A7AFBB]">Best Fitness:</span>
            <span className="font-mono font-medium text-[#10B981]">
              {latestStat ? latestStat.bestFitness.toFixed(2) : "-"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6C8CFF] inline-block shadow-[0_0_8px_rgba(108,140,255,0.5)]" />
            <span className="text-[#A7AFBB]">Mean Fitness:</span>
            <span className="font-mono font-medium text-[#6C8CFF]">
              {latestStat ? latestStat.avgFitness.toFixed(2) : "-"}
            </span>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-hidden flex items-center justify-center">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[220px]">
          <defs>
            <linearGradient id="fitnessAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6C8CFF" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = margin.top + innerHeight * (1 - pct);
            const val = minFit + (maxFit - minFit) * pct;
            return (
              <g key={`grid-y-${i}`}>
                <line
                  x1={margin.left}
                  y1={y}
                  x2={width - margin.right}
                  y2={y}
                  stroke="#1B1F25"
                  strokeDasharray="3 3"
                />
                <text
                  x={margin.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="#737C89"
                  className="text-[9px] font-mono"
                >
                  {val.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Generation markers on X axis */}
          {Array.from({ length: Math.min(maxGenerations + 1, 9) }).map((_, i) => {
            const genStep = Math.round((i * maxGenerations) / Math.min(maxGenerations, 8));
            const x = mapGenToSvgX(genStep);
            return (
              <g key={`grid-x-${i}`}>
                <line
                  x1={x}
                  y1={margin.top}
                  x2={x}
                  y2={margin.top + innerHeight}
                  stroke="#1B1F25"
                  strokeDasharray="2 2"
                />
                <text
                  x={x}
                  y={margin.top + innerHeight + 14}
                  textAnchor="middle"
                  fill="#737C89"
                  className="text-[9px] font-mono"
                >
                  g={genStep}
                </text>
              </g>
            );
          })}

          {/* Shaded Area between Best and Mean */}
          {areaPath && <path d={areaPath} fill="url(#fitnessAreaGrad)" />}

          {/* Mean Fitness Curve */}
          {avgPath && (
            <path
              d={avgPath}
              fill="none"
              stroke="#6C8CFF"
              strokeWidth="2"
              strokeDasharray="4 2"
            />
          )}

          {/* Best Fitness Curve */}
          {bestPath && (
            <path
              d={bestPath}
              fill="none"
              stroke="#10B981"
              strokeWidth="2.5"
              className="drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]"
            />
          )}

          {/* Data points */}
          {activeStats.map((s) => {
            const cx = mapGenToSvgX(s.generation);
            const cyBest = mapFitToSvgY(s.bestFitness);
            const cyAvg = mapFitToSvgY(s.avgFitness);
            const isCurrent = s.generation === currentGen;

            return (
              <g key={`stat-pts-${s.generation}`}>
                <circle
                  cx={cx}
                  cy={cyAvg}
                  r={isCurrent ? 3.5 : 2}
                  fill="#6C8CFF"
                  opacity={0.8}
                />
                <circle
                  cx={cx}
                  cy={cyBest}
                  r={isCurrent ? 4.5 : 2.5}
                  fill="#10B981"
                  stroke={isCurrent ? "#F1F3F5" : "none"}
                  strokeWidth="1.5"
                  className={isCurrent ? "animate-pulse" : ""}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
