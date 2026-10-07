"use client";

import React, { useState, useMemo, useEffect } from "react";
import { PlaybackToolbar } from "@/components/visualization/PlaybackToolbar";
import { useVisualizerPlayback } from "@/hooks/useVisualizerPlayback";
import { 
  generateHillClimbingSteps, 
  OPTIMIZATION_RESOLUTION 
} from "@/lib/algorithms/hillClimbing";
import { 
  generateGeneticAlgorithmSteps, 
  GA_PSEUDOCODE 
} from "@/lib/algorithms/genetic";
import { 
  LANDSCAPES, 
  getLandscape, 
  DEFAULT_LANDSCAPE_ID 
} from "@/lib/algorithms/landscapes";
import { ConvergenceChart } from "@/components/visualization/optimization/ConvergenceChart";
import { ChromosomeInspector } from "@/components/visualization/optimization/ChromosomeInspector";
import { PopulationTable } from "@/components/visualization/optimization/PopulationTable";
import { 
  OptimizationState, 
  GAConfig, 
  SelectionStrategy 
} from "@/types/optimization";
import { AlgorithmStep } from "@/types/visualizer";

const HILL_CLIMBING_PSEUDOCODE = [
  "Initialize current state with starting position x",
  "Evaluate objective fitness f(current)",
  "Generate and evaluate adjacent state neighbors",
  "If highest neighbor > f(current), move uphill to neighbor",
  "Else if all neighbors <= f(current), terminate at Local Optimum",
];

interface OptimizationWorkspaceProps {
  algorithmId: string;
}

export function OptimizationWorkspace({ algorithmId }: OptimizationWorkspaceProps) {
  const isGA = algorithmId === "genetic-algorithm";

  // Configuration State for GA
  const [gaConfig, setGaConfig] = useState<GAConfig>({
    populationSize: 16,
    generations: 12,
    crossoverRate: 0.85,
    mutationRate: 0.05,
    selectionStrategy: "tournament",
    elitismCount: 2,
    tournamentSize: 3,
    landscapeId: DEFAULT_LANDSCAPE_ID,
  });

  // Configuration State for Hill Climbing
  const [initialX, setInitialX] = useState<number>(2.5);
  const [hcLandscapeId, setHcLandscapeId] = useState<string>(DEFAULT_LANDSCAPE_ID);
  const [stepSize, setStepSize] = useState<number>(0.5);

  // Active view tab in GA
  const [activeTab, setActiveTab] = useState<"landscape" | "convergence" | "inspector" | "population">("landscape");
  const [showHCComparison, setShowHCComparison] = useState(false);
  const [hoveredIndId, setHoveredIndId] = useState<string | null>(null);

  // Steps & Playback
  const [steps, setSteps] = useState<AlgorithmStep<OptimizationState>[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  const playback = useVisualizerPlayback(steps, algorithmId);

  // Generate steps handler
  const handleGenerate = () => {
    let newSteps: AlgorithmStep<OptimizationState>[] = [];
    if (isGA) {
      newSteps = generateGeneticAlgorithmSteps(gaConfig);
    } else {
      newSteps = generateHillClimbingSteps(initialX, stepSize, hcLandscapeId);
    }
    setSteps(newSteps);
    setHasGenerated(true);
    playback.reset();
  };

  // Auto-generate on first mount or algorithm change
  useEffect(() => {
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algorithmId]);

  const activeStep = playback.currentStep;
  const activeState = activeStep ? (activeStep.state as OptimizationState) : null;
  const activeMetrics = activeStep ? activeStep.metrics : null;

  // Selected landscape
  const currentLandscapeId = isGA ? gaConfig.landscapeId : hcLandscapeId;
  const landscape = getLandscape(currentLandscapeId);

  // SVG Setup & Normalization
  const svgWidth = 840;
  const svgHeight = 400;
  const margin = { top: 60, right: 40, bottom: 60, left: 55 };
  const innerWidth = svgWidth - margin.left - margin.right;
  const innerHeight = svgHeight - margin.top - margin.bottom;

  const { pathData, areaPathData, minY, maxY } = useMemo(() => {
    let d = "";
    let localMinY = Infinity;
    let localMaxY = -Infinity;

    // Find min and max bounds
    for (let i = 0; i <= OPTIMIZATION_RESOLUTION; i++) {
      const x = landscape.minX + (i / OPTIMIZATION_RESOLUTION) * (landscape.maxX - landscape.minX);
      const y = landscape.getY(x);
      if (y < localMinY) localMinY = y;
      if (y > localMaxY) localMaxY = y;
    }

    localMinY -= 0.6;
    localMaxY += 0.8;

    for (let i = 0; i <= OPTIMIZATION_RESOLUTION; i++) {
      const mathX = landscape.minX + (i / OPTIMIZATION_RESOLUTION) * (landscape.maxX - landscape.minX);
      const mathY = landscape.getY(mathX);

      const svgX = margin.left + ((mathX - landscape.minX) / (landscape.maxX - landscape.minX)) * innerWidth;
      const svgY = margin.top + innerHeight - ((mathY - localMinY) / (localMaxY - localMinY)) * innerHeight;

      if (i === 0) d += `M ${svgX},${svgY} `;
      else d += `L ${svgX},${svgY} `;
    }

    const baselineY = margin.top + innerHeight;
    const areaD = `${d} L ${margin.left + innerWidth},${baselineY} L ${margin.left},${baselineY} Z`;

    return { pathData: d, areaPathData: areaD, minY: localMinY, maxY: localMaxY };
  }, [landscape, margin.left, margin.top, innerWidth, innerHeight]);

  const mapXToSvg = (mathX: number) =>
    margin.left + ((mathX - landscape.minX) / (landscape.maxX - landscape.minX)) * innerWidth;
  const mapYToSvg = (mathY: number) =>
    margin.top + innerHeight - ((mathY - minY) / (maxY - minY)) * innerHeight;

  // Active positions
  const currentMathX = activeState ? activeState.currentX : initialX;
  const currentMathY = activeState ? activeState.currentY : landscape.getY(initialX);

  const pseudocodeLines = isGA ? GA_PSEUDOCODE : HILL_CLIMBING_PSEUDOCODE;
  const highlightedLine = activeStep ? activeStep.highlightedLine : 1;

  // Phase badge
  const getPhaseBadge = (phase?: string) => {
    switch (phase) {
      case "init":
        return { label: "INIT POPULATION", bg: "bg-[#263352] text-[#6C8CFF] border-[#6C8CFF]/30" };
      case "evaluate":
        return { label: "FITNESS EVALUATION", bg: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
      case "elitism":
        return { label: "ELITISM PRESERVED", bg: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" };
      case "selection":
        return { label: "PARENT SELECTION", bg: "bg-purple-500/20 text-purple-400 border-purple-500/30" };
      case "crossover":
        return { label: "CROSSOVER SPLICING", bg: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" };
      case "mutation":
        return { label: "MUTATION TRIGGERED", bg: "bg-rose-500/20 text-rose-400 border-rose-500/30" };
      case "next_generation":
        return { label: "NEW GENERATION", bg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" };
      case "converged":
        return { label: "GLOBAL SUMMIT CONVERGED", bg: "bg-green-500/25 text-green-300 border-green-500/50" };
      default:
        return { label: "READY", bg: "bg-[#1B1F25] text-[#A7AFBB] border-[#292E36]" };
    }
  };

  const phaseBadge = getPhaseBadge(activeState?.phase);

  // Find hovered individual
  const hoveredIndividual = activeState?.individuals?.find((ind) => ind.id === hoveredIndId) || null;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Configuration & Control Toolbar */}
      <div className="w-full flex flex-col gap-4 p-5 rounded-xl bg-[#15181D] border border-[#292E36]">
        {/* Top Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`px-2.5 py-1 text-xs font-semibold rounded-md border font-mono tracking-wider ${phaseBadge.bg}`}
            >
              {isGA ? `PHASE: ${phaseBadge.label}` : "LOCAL SEARCH"}
            </span>
            <span className="text-xs text-[#A7AFBB]">
              {isGA
                ? `Gen ${activeState?.generation ?? 0} of ${gaConfig.generations} • ${landscape.name}`
                : `Hill Climbing on ${landscape.name}`}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isGA && (
              <button
                onClick={() => setShowHCComparison(!showHCComparison)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  showHCComparison
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                    : "bg-[#1B1F25] text-[#A7AFBB] border-[#292E36] hover:text-[#F1F3F5]"
                }`}
                title="Overlay Hill Climbing path on this landscape to observe local maximum traps"
              >
                {showHCComparison ? "Hide HC Trap" : "Compare with Hill Climbing"}
              </button>
            )}

            <button
              onClick={handleGenerate}
              className="px-4 py-1.5 rounded-lg bg-[#6C8CFF] hover:bg-[#5A7BEF] text-white font-medium text-xs transition-colors shadow-sm"
            >
              {hasGenerated ? `Restart ${isGA ? "Evolution" : "Climb"}` : `Start ${isGA ? "Evolution" : "Climb"}`}
            </button>
          </div>
        </div>

        {/* Hyperparameter Settings Row */}
        <div className="pt-3 border-t border-[#292E36] flex flex-wrap items-center gap-4 text-xs">
          {/* Landscape Preset Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[#737C89] font-medium">Objective Function:</span>
            <select
              value={currentLandscapeId}
              onChange={(e) => {
                const newId = e.target.value;
                if (isGA) {
                  setGaConfig((prev) => ({ ...prev, landscapeId: newId }));
                } else {
                  setHcLandscapeId(newId);
                }
              }}
              className="bg-[#0D0F12] border border-[#292E36] rounded-lg px-2.5 py-1 text-xs text-[#F1F3F5] focus:border-[#6C8CFF] focus:outline-none"
            >
              {Object.values(LANDSCAPES).map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {isGA ? (
            <>
              {/* Population Size */}
              <div className="flex items-center gap-2">
                <span className="text-[#737C89] font-medium">Population (N):</span>
                <select
                  value={gaConfig.populationSize}
                  onChange={(e) =>
                    setGaConfig((prev) => ({ ...prev, populationSize: parseInt(e.target.value) }))
                  }
                  className="bg-[#0D0F12] border border-[#292E36] rounded-lg px-2.5 py-1 text-xs text-[#F1F3F5] focus:border-[#6C8CFF] focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={16}>16 (Standard)</option>
                  <option value={20}>20</option>
                  <option value={24}>24</option>
                  <option value={32}>32 (Wide)</option>
                </select>
              </div>

              {/* Generations */}
              <div className="flex items-center gap-2">
                <span className="text-[#737C89] font-medium">Generations (G):</span>
                <select
                  value={gaConfig.generations}
                  onChange={(e) =>
                    setGaConfig((prev) => ({ ...prev, generations: parseInt(e.target.value) }))
                  }
                  className="bg-[#0D0F12] border border-[#292E36] rounded-lg px-2.5 py-1 text-xs text-[#F1F3F5] focus:border-[#6C8CFF] focus:outline-none"
                >
                  <option value={8}>8 Gen</option>
                  <option value={12}>12 Gen</option>
                  <option value={16}>16 Gen</option>
                  <option value={20}>20 Gen</option>
                </select>
              </div>

              {/* Selection Strategy */}
              <div className="flex items-center gap-2">
                <span className="text-[#737C89] font-medium">Selection:</span>
                <select
                  value={gaConfig.selectionStrategy}
                  onChange={(e) =>
                    setGaConfig((prev) => ({
                      ...prev,
                      selectionStrategy: e.target.value as SelectionStrategy,
                    }))
                  }
                  className="bg-[#0D0F12] border border-[#292E36] rounded-lg px-2.5 py-1 text-xs text-[#F1F3F5] focus:border-[#6C8CFF] focus:outline-none"
                >
                  <option value="tournament">Tournament (k=3)</option>
                  <option value="roulette">Roulette Wheel (Fitness Proportionate)</option>
                  <option value="rank">Rank-Based Selection</option>
                </select>
              </div>

              {/* Mutation Rate */}
              <div className="flex items-center gap-2">
                <span className="text-[#737C89] font-medium">Mutation (Pm):</span>
                <select
                  value={gaConfig.mutationRate}
                  onChange={(e) =>
                    setGaConfig((prev) => ({ ...prev, mutationRate: parseFloat(e.target.value) }))
                  }
                  className="bg-[#0D0F12] border border-[#292E36] rounded-lg px-2.5 py-1 text-xs text-[#F1F3F5] focus:border-[#6C8CFF] focus:outline-none"
                >
                  <option value={0.02}>2% (Low)</option>
                  <option value={0.05}>5% (Balanced)</option>
                  <option value={0.10}>10% (Active)</option>
                  <option value={0.20}>20% (High Exploration)</option>
                </select>
              </div>

              {/* Crossover Rate */}
              <div className="flex items-center gap-2">
                <span className="text-[#737C89] font-medium">Crossover (Pc):</span>
                <select
                  value={gaConfig.crossoverRate}
                  onChange={(e) =>
                    setGaConfig((prev) => ({ ...prev, crossoverRate: parseFloat(e.target.value) }))
                  }
                  className="bg-[#0D0F12] border border-[#292E36] rounded-lg px-2.5 py-1 text-xs text-[#F1F3F5] focus:border-[#6C8CFF] focus:outline-none"
                >
                  <option value={0.70}>70%</option>
                  <option value={0.85}>85%</option>
                  <option value={1.00}>100%</option>
                </select>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 ml-auto">
                <span className="text-[#737C89] text-[11px]">Presets:</span>
                <button
                  onClick={() => {
                    setGaConfig({
                      populationSize: 16,
                      generations: 12,
                      crossoverRate: 0.85,
                      mutationRate: 0.05,
                      selectionStrategy: "tournament",
                      elitismCount: 2,
                      tournamentSize: 3,
                      landscapeId: DEFAULT_LANDSCAPE_ID,
                    });
                  }}
                  className="px-2 py-0.5 rounded bg-[#1B1F25] hover:bg-[#263352] text-[#A7AFBB] hover:text-[#F1F3F5] text-[10px] border border-[#292E36]"
                >
                  Default
                </button>
                <button
                  onClick={() => {
                    setGaConfig({
                      populationSize: 24,
                      generations: 16,
                      crossoverRate: 0.75,
                      mutationRate: 0.15,
                      selectionStrategy: "roulette",
                      elitismCount: 1,
                      tournamentSize: 3,
                      landscapeId: "rastrigin",
                    });
                  }}
                  className="px-2 py-0.5 rounded bg-[#1B1F25] hover:bg-[#263352] text-[#A7AFBB] hover:text-[#F1F3F5] text-[10px] border border-[#292E36]"
                >
                  High Diversity
                </button>
              </div>
            </>
          ) : (
            /* Hill Climbing specific controls */
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[#737C89]">Start (x):</span>
                <input
                  type="range"
                  min={landscape.minX}
                  max={landscape.maxX}
                  step="0.5"
                  value={initialX}
                  onChange={(e) => setInitialX(parseFloat(e.target.value))}
                  className="cursor-pointer accent-[#6C8CFF] w-32"
                />
                <span className="font-mono text-[#F1F3F5] text-xs w-8">{initialX.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#737C89]">Step Size:</span>
                <select
                  value={stepSize}
                  onChange={(e) => setStepSize(parseFloat(e.target.value))}
                  className="bg-[#0D0F12] border border-[#292E36] rounded-lg px-2.5 py-1 text-xs text-[#F1F3F5] focus:border-[#6C8CFF] focus:outline-none"
                >
                  <option value={0.25}>0.25 (Fine)</option>
                  <option value={0.5}>0.5 (Default)</option>
                  <option value={1.0}>1.0 (Coarse)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Real-time Evolutionary Metrics Cards */}
      {isGA && (
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-[#15181D] border border-[#292E36] flex flex-col justify-between">
            <span className="text-[11px] font-medium text-[#737C89] uppercase tracking-wide">
              Active Generation
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold font-mono text-[#F1F3F5]">
                {activeState?.generation ?? 0}
              </span>
              <span className="text-xs font-mono text-[#737C89]">/ {gaConfig.generations}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#15181D] border border-[#292E36] flex flex-col justify-between">
            <span className="text-[11px] font-medium text-[#737C89] uppercase tracking-wide">
              Peak Fitness f(x*)
            </span>
            <span className="text-xl font-bold font-mono text-[#10B981] mt-1">
              {activeState?.currentY ? activeState.currentY.toFixed(2) : "—"}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#15181D] border border-[#292E36] flex flex-col justify-between">
            <span className="text-[11px] font-medium text-[#737C89] uppercase tracking-wide">
              Mean Swarm Fitness
            </span>
            <span className="text-xl font-bold font-mono text-[#6C8CFF] mt-1">
              {activeState?.historyStats && activeState.historyStats.length > 0
                ? activeState.historyStats[activeState.historyStats.length - 1].avgFitness.toFixed(2)
                : "—"}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#15181D] border border-[#292E36] flex flex-col justify-between">
            <span className="text-[11px] font-medium text-[#737C89] uppercase tracking-wide">
              Gene Diversity (σ)
            </span>
            <span className="text-xl font-bold font-mono text-purple-400 mt-1">
              {activeState?.diversity !== undefined ? activeState.diversity.toFixed(2) : "—"}
            </span>
          </div>
        </div>
      )}

      {/* GA Navigation Tabs */}
      {isGA && (
        <div className="flex items-center gap-2 border-b border-[#292E36] pb-1 text-xs">
          <button
            onClick={() => setActiveTab("landscape")}
            className={`px-4 py-2 rounded-t-lg font-medium transition-all ${
              activeTab === "landscape"
                ? "bg-[#15181D] text-[#6C8CFF] border-t-2 border-[#6C8CFF]"
                : "text-[#A7AFBB] hover:text-[#F1F3F5]"
            }`}
          >
            🗺️ Landscape & Swarm
          </button>
          <button
            onClick={() => setActiveTab("convergence")}
            className={`px-4 py-2 rounded-t-lg font-medium transition-all ${
              activeTab === "convergence"
                ? "bg-[#15181D] text-[#6C8CFF] border-t-2 border-[#6C8CFF]"
                : "text-[#A7AFBB] hover:text-[#F1F3F5]"
            }`}
          >
            📈 Convergence Curve
          </button>
          <button
            onClick={() => setActiveTab("inspector")}
            className={`px-4 py-2 rounded-t-lg font-medium transition-all ${
              activeTab === "inspector"
                ? "bg-[#15181D] text-[#6C8CFF] border-t-2 border-[#6C8CFF]"
                : "text-[#A7AFBB] hover:text-[#F1F3F5]"
            }`}
          >
            🧬 Chromosome Recombination
          </button>
          <button
            onClick={() => setActiveTab("population")}
            className={`px-4 py-2 rounded-t-lg font-medium transition-all ${
              activeTab === "population"
                ? "bg-[#15181D] text-[#6C8CFF] border-t-2 border-[#6C8CFF]"
                : "text-[#A7AFBB] hover:text-[#F1F3F5]"
            }`}
          >
            📋 Population Leaderboard
          </button>
        </div>
      )}

      {/* Main View Area */}
      {(!isGA || activeTab === "landscape") && (
        <div className="bg-[#15181D] rounded-xl border border-[#292E36] p-5 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#F1F3F5]">Fitness Landscape Visualizer</h3>
              <p className="text-xs text-[#A7AFBB] mt-0.5">
                {isGA
                  ? "Swarm points evolve along the curve. Crown marker indicates the global summit; warning markers show local maxima traps."
                  : "Hill Climbing traverses strictly uphill. When all neighbors lead downhill, it gets trapped at a local peak."}
              </p>
            </div>

            {/* Hovered Candidate Preview Tag */}
            {hoveredIndividual && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1B1F25] border border-[#6C8CFF]/40 text-xs">
                <span className="font-mono text-[#6C8CFF] font-semibold">{hoveredIndividual.id}:</span>
                <span className="text-[#A7AFBB]">x = {hoveredIndividual.x.toFixed(2)}</span>
                <span className="text-[#10B981] font-mono">f(x) = {hoveredIndividual.fitness.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="flex-1 flex justify-center items-center overflow-hidden w-full relative bg-[#0D0F12] rounded-lg border border-[#292E36] p-4 min-h-[420px]">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="landscapeFillGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#263352" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#0D0F12" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {/* Grid Lines & X-Axis */}
              <line
                x1={margin.left}
                y1={margin.top + innerHeight}
                x2={svgWidth - margin.right}
                y2={margin.top + innerHeight}
                stroke="#292E36"
                strokeWidth="2"
              />
              <line
                x1={margin.left}
                y1={margin.top}
                x2={margin.left}
                y2={margin.top + innerHeight}
                stroke="#292E36"
                strokeWidth="2"
              />

              {/* X-Axis Ticks & Labels */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                const xVal = landscape.minX + pct * (landscape.maxX - landscape.minX);
                const svgX = margin.left + pct * innerWidth;
                return (
                  <g key={`x-tick-${idx}`}>
                    <line
                      x1={svgX}
                      y1={margin.top + innerHeight}
                      x2={svgX}
                      y2={margin.top + innerHeight + 6}
                      stroke="#737C89"
                      strokeWidth="1.5"
                    />
                    <text
                      x={svgX}
                      y={margin.top + innerHeight + 20}
                      textAnchor="middle"
                      fill="#737C89"
                      className="text-[10px] font-mono"
                    >
                      x={xVal.toFixed(1)}
                    </text>
                  </g>
                );
              })}

              {/* Shaded Area under curve */}
              <path d={areaPathData} fill="url(#landscapeFillGrad)" />

              {/* Landscape Main Curve */}
              <path
                d={pathData}
                fill="none"
                stroke="#47608A"
                strokeWidth="3.5"
                className="drop-shadow-lg"
              />

              {/* Global Maximum Landmark Marker */}
              {landscape.globalMax && (
                <g>
                  <circle
                    cx={mapXToSvg(landscape.globalMax.x)}
                    cy={mapYToSvg(landscape.globalMax.y)}
                    r="6"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="2"
                    strokeDasharray="2 2"
                  />
                  <text
                    x={mapXToSvg(landscape.globalMax.x)}
                    y={mapYToSvg(landscape.globalMax.y) - 24}
                    textAnchor="middle"
                    fill="#F59E0B"
                    className="text-[10px] font-mono font-semibold"
                  >
                    👑 Global Summit ({landscape.globalMax.x.toFixed(1)})
                  </text>
                </g>
              )}

              {/* Hill Climbing Trajectory (if active or if compare toggle enabled) */}
              {((isGA && showHCComparison && activeState?.hcComparisonPath) ||
                (!isGA && activeState?.visitedX && activeState.visitedX.length > 0)) && (
                <g>
                  {/* Trajectory line */}
                  {(() => {
                    const pts = isGA
                      ? activeState?.hcComparisonPath || []
                      : activeState?.visitedX || [];
                    if (pts.length <= 1) return null;
                    return (
                      <path
                        d={`M ${pts.map((vx) => `${mapXToSvg(vx)},${mapYToSvg(landscape.getY(vx))}`).join(" L ")}`}
                        fill="none"
                        stroke="#EF4444"
                        strokeWidth="2.5"
                        strokeDasharray="4 3"
                        opacity="0.85"
                      />
                    );
                  })()}

                  {/* Hill climbing trap point marker */}
                  {(() => {
                    const pts = isGA
                      ? activeState?.hcComparisonPath || []
                      : activeState?.visitedX || [];
                    if (pts.length === 0) return null;
                    const lastPt = pts[pts.length - 1];
                    return (
                      <g>
                        <circle
                          cx={mapXToSvg(lastPt)}
                          cy={mapYToSvg(landscape.getY(lastPt))}
                          r="7"
                          fill="#EF4444"
                          stroke="#F1F3F5"
                          strokeWidth="2"
                        />
                        <text
                          x={mapXToSvg(lastPt)}
                          y={mapYToSvg(landscape.getY(lastPt)) + 22}
                          textAnchor="middle"
                          fill="#EF4444"
                          className="text-[10px] font-mono font-bold"
                        >
                          ⚠️ HC Trapped (x={lastPt.toFixed(1)})
                        </text>
                      </g>
                    );
                  })()}
                </g>
              )}

              {/* Hill Climbing Considered Neighbors */}
              {!isGA &&
                activeState?.consideredX.map((nx, i) => (
                  <circle
                    key={`hc-neighbor-${i}`}
                    cx={mapXToSvg(nx)}
                    cy={mapYToSvg(landscape.getY(nx))}
                    r="5"
                    fill="transparent"
                    stroke="#A7AFBB"
                    strokeWidth="2"
                    opacity="0.7"
                  />
                ))}

              {/* Genetic Algorithm: Population Swarm Points */}
              {isGA &&
                activeState?.individuals?.map((ind) => {
                  const cx = mapXToSvg(ind.x);
                  const cy = mapYToSvg(ind.fitness);
                  const isHovered = ind.id === hoveredIndId;
                  const isChampion = ind.rank === 1;

                  let dotColor = "#10B981"; // emerald default
                  let radius = 5.5;

                  if (ind.role === "elite") {
                    dotColor = "#F59E0B"; // amber
                    radius = 6.5;
                  } else if (ind.role === "parent") {
                    dotColor = "#A855F7"; // purple
                    radius = 6.5;
                  } else if (ind.role === "mutated") {
                    dotColor = "#F43F5E"; // rose
                    radius = 6;
                  }

                  return (
                    <g
                      key={`pop-ind-${ind.id}`}
                      onMouseEnter={() => setHoveredIndId(ind.id)}
                      onMouseLeave={() => setHoveredIndId(null)}
                      className="cursor-pointer"
                    >
                      {/* Champion Halo */}
                      {isChampion && (
                        <circle
                          cx={cx}
                          cy={cy}
                          r="12"
                          fill="none"
                          stroke="#10B981"
                          strokeWidth="2"
                          className="animate-ping opacity-60"
                        />
                      )}

                      {/* Selection Ring */}
                      {(isHovered || isChampion) && (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={radius + 5}
                          fill="none"
                          stroke="#F1F3F5"
                          strokeWidth="2"
                        />
                      )}

                      {/* Dot */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={radius}
                        fill={dotColor}
                        className="transition-all duration-300"
                        style={{ filter: `drop-shadow(0px 0px 6px ${dotColor})` }}
                      />
                    </g>
                  );
                })}

              {/* Current Active Single Climber (Hill Climbing) */}
              {!isGA && (
                <g>
                  <circle
                    cx={mapXToSvg(currentMathX)}
                    cy={mapYToSvg(currentMathY)}
                    r="9"
                    fill="#6C8CFF"
                    stroke="#F1F3F5"
                    strokeWidth="2.5"
                    className="shadow-[0_0_15px_rgba(108,140,255,0.8)]"
                  />
                  <text
                    x={mapXToSvg(currentMathX)}
                    y={mapYToSvg(currentMathY) - 16}
                    textAnchor="middle"
                    fill="#F1F3F5"
                    className="text-xs font-mono font-bold"
                  >
                    {currentMathY.toFixed(2)}
                  </text>
                </g>
              )}

              {/* GA Current Best Coordinates Tag */}
              {isGA && (
                <text
                  x={mapXToSvg(currentMathX)}
                  y={mapYToSvg(currentMathY) - 18}
                  textAnchor="middle"
                  fill="#10B981"
                  className="text-xs font-mono font-bold transition-all duration-300"
                >
                  Best: {currentMathY.toFixed(2)}
                </text>
              )}
            </svg>
          </div>
        </div>
      )}

      {/* Tab 2: Convergence Curve */}
      {isGA && activeTab === "convergence" && (
        <ConvergenceChart
          stats={activeState?.historyStats || []}
          currentGen={activeState?.generation ?? 0}
          maxGenerations={gaConfig.generations}
          globalBestFitness={activeState?.globalBest?.fitness}
        />
      )}

      {/* Tab 3: Chromosome Recombination Inspector */}
      {isGA && activeTab === "inspector" && (
        <ChromosomeInspector
          activeCrossover={activeState?.activeCrossover}
          activeMutation={activeState?.activeMutation}
          activeParents={activeState?.activeParents}
          champion={activeState?.individuals ? activeState.individuals[0] : null}
          globalBest={activeState?.globalBest}
          phase={activeState?.phase}
        />
      )}

      {/* Tab 4: Population Leaderboard Table */}
      {isGA && activeTab === "population" && (
        <PopulationTable
          individuals={activeState?.individuals || []}
          hoveredId={hoveredIndId}
          onHoverIndividual={setHoveredIndId}
          maxFitness={landscape.globalMax?.y || 10}
          minFitness={minY}
        />
      )}

      {/* Playback Controls Toolbar */}
      <PlaybackToolbar playback={playback} disabled={!hasGenerated} />

      {/* Bottom Section: Step Narrative + Pseudocode (8 cols) and Explanations/Metrics (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Step Narrative & Pseudocode Highlighter - 8 cols */}
        <div className="lg:col-span-8 p-5 rounded-xl bg-[#15181D] border border-[#292E36] space-y-4">
          <div className="flex items-center justify-between border-b border-[#292E36] pb-3 text-xs">
            <span className="font-semibold text-[#F1F3F5]">Step Trace & Explanation</span>
            <span className="font-mono text-[#A7AFBB]">
              {activeStep ? `Step ${activeStep.stepIndex + 1} of ${activeStep.metrics.totalSteps}` : "—"}
            </span>
          </div>

          {/* Narrative Action Box */}
          <div className="p-3.5 rounded-lg bg-[#1B1F25] border border-[#292E36] text-xs text-[#F1F3F5] leading-relaxed">
            <span className="text-[#6C8CFF] font-semibold mr-1.5">Action:</span>
            {activeStep ? activeStep.description : "Click 'Start Evolution' to begin evolutionary simulation."}
          </div>

          {/* Pseudocode Execution Box */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-[#A7AFBB] block">
              {isGA ? "Genetic Algorithm Optimization Pseudocode" : "Hill Climbing Pseudocode"}
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

        {/* AI Educational Insights & Comparison Panel - 4 cols */}
        <div className="lg:col-span-4 p-5 rounded-xl bg-[#15181D] border border-[#292E36] flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between border-b border-[#292E36] pb-3 mb-3">
              <h4 className="text-xs font-semibold text-[#F1F3F5]">Core AI Concept</h4>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#263352] text-[#6C8CFF] font-medium">
                {isGA ? "Exploration vs Exploitation" : "Greedy Ascent"}
              </span>
            </div>

            <div className="text-xs text-[#A7AFBB] leading-relaxed space-y-3">
              {isGA ? (
                <>
                  <p>
                    <strong className="text-[#F1F3F5]">Genetic Algorithms</strong> maintain a diverse
                    population of candidate solutions across the search space, avoiding entrapment in
                    deceptive local maxima.
                  </p>
                  <p>
                    <span className="text-purple-400 font-medium">Crossover</span> recombines building
                    blocks from fit parents (exploitation), while{" "}
                    <span className="text-rose-400 font-medium">Mutation</span> introduces random allele
                    flips to escape stagnation (exploration).
                  </p>
                  <p>
                    <span className="text-amber-400 font-medium">Elitism</span> guarantees the highest
                    solution ever discovered is preserved intact into future generations.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong className="text-[#F1F3F5]">Hill Climbing</strong> is a greedy local search
                    technique that only accepts moves strictly uphill.
                  </p>
                  <p>
                    When all immediate adjacent neighbors yield a lower or equal fitness, the algorithm
                    terminates immediately, becoming permanently trapped on local peaks.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Quick Status Box */}
          <div className="p-3 rounded-lg bg-[#0D0F12] border border-[#292E36] text-[11px] text-[#737C89]">
            {isGA ? (
              <div className="flex items-center justify-between">
                <span>All-time Max:</span>
                <span className="font-mono text-[#10B981] font-semibold">
                  {activeState?.globalBest ? `f=${activeState.globalBest.fitness.toFixed(2)}` : "—"}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span>Trapped Status:</span>
                <span className="font-mono text-[#F1F3F5]">
                  {activeStep?.description.includes("Peak reached") ? "Trapped in Local Optima" : "Searching"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
