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
  generateGeneticTSPSteps, 
  TSP_PSEUDOCODE, 
  TSP_PRESETS,
  TSPConfig
} from "@/lib/algorithms/geneticTSP";
import { 
  generateGeneticPhraseSteps, 
  PHRASE_PSEUDOCODE,
  PhraseConfig
} from "@/lib/algorithms/geneticPhrase";
import { 
  LANDSCAPES, 
  getLandscape, 
  DEFAULT_LANDSCAPE_ID 
} from "@/lib/algorithms/landscapes";
import { TSPVisualizer } from "@/components/visualization/optimization/TSPVisualizer";
import { PhraseVisualizer } from "@/components/visualization/optimization/PhraseVisualizer";
import { ConvergenceChart } from "@/components/visualization/optimization/ConvergenceChart";
import { ChromosomeInspector } from "@/components/visualization/optimization/ChromosomeInspector";
import { PopulationTable } from "@/components/visualization/optimization/PopulationTable";
import { 
  OptimizationState, 
  GAConfig, 
  GAMode,
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

  // Problem Mode for GA: "tsp" (default, most visual) | "phrase" | "landscape"
  const [gaMode, setGaMode] = useState<GAMode>("tsp");

  // Configuration State for TSP
  const [tspPreset, setTspPreset] = useState<"circle" | "clusters" | "random">("circle");
  const [tspConfig, setTspConfig] = useState<TSPConfig>({
    populationSize: 16,
    generations: 12,
    mutationRate: 0.25,
    crossoverRate: 0.90,
    preset: "circle",
  });

  // Configuration State for Phrase
  const [phraseTarget, setPhraseTarget] = useState<string>("THINKVIZ AI");
  const [phraseConfig, setPhraseConfig] = useState<PhraseConfig>({
    target: "THINKVIZ AI",
    populationSize: 16,
    generations: 14,
    mutationRate: 0.08,
    crossoverRate: 0.85,
  });

  // Configuration State for Continuous Landscape GA
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

  // Landscape View Tabs
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
      if (gaMode === "tsp") {
        newSteps = generateGeneticTSPSteps({ ...tspConfig, preset: tspPreset });
      } else if (gaMode === "phrase") {
        newSteps = generateGeneticPhraseSteps({ ...phraseConfig, target: phraseTarget });
      } else {
        newSteps = generateGeneticAlgorithmSteps(gaConfig);
      }
    } else {
      newSteps = generateHillClimbingSteps(initialX, stepSize, hcLandscapeId);
    }
    setSteps(newSteps);
    setHasGenerated(true);
    playback.reset();
  };

  // Auto-generate on first mount or mode change
  useEffect(() => {
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algorithmId, gaMode, tspPreset]);

  const activeStep = playback.currentStep;
  const activeState = activeStep ? (activeStep.state as OptimizationState) : null;

  // Selected landscape for 1D mode
  const currentLandscapeId = isGA ? gaConfig.landscapeId : hcLandscapeId;
  const landscape = getLandscape(currentLandscapeId);

  // SVG Setup & Normalization for 1D Landscape
  const svgWidth = 840;
  const svgHeight = 400;
  const margin = { top: 60, right: 40, bottom: 60, left: 55 };
  const innerWidth = svgWidth - margin.left - margin.right;
  const innerHeight = svgHeight - margin.top - margin.bottom;

  const { pathData, areaPathData, minY, maxY } = useMemo(() => {
    let d = "";
    let localMinY = Infinity;
    let localMaxY = -Infinity;

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

  const currentMathX = activeState ? activeState.currentX : initialX;
  const currentMathY = activeState ? activeState.currentY : landscape.getY(initialX);

  // Active pseudocode
  const pseudocodeLines = !isGA
    ? HILL_CLIMBING_PSEUDOCODE
    : gaMode === "tsp"
    ? TSP_PSEUDOCODE
    : gaMode === "phrase"
    ? PHRASE_PSEUDOCODE
    : GA_PSEUDOCODE;

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
        return { label: "OPTIMUM CONVERGED", bg: "bg-green-500/25 text-green-300 border-green-500/50" };
      default:
        return { label: "READY", bg: "bg-[#1B1F25] text-[#A7AFBB] border-[#292E36]" };
    }
  };

  const phaseBadge = getPhaseBadge(activeState?.phase);
  const hoveredIndividual = activeState?.individuals?.find((ind) => ind.id === hoveredIndId) || null;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Problem Mode Selector (for Genetic Algorithm) */}
      {isGA && (
        <div className="w-full flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[#15181D] border border-[#292E36]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#737C89] uppercase tracking-wider mr-1">
              Problem Domain:
            </span>
            <button
              onClick={() => setGaMode("tsp")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                gaMode === "tsp"
                  ? "bg-[#6C8CFF] text-white shadow-sm"
                  : "bg-[#0D0F12] text-[#A7AFBB] hover:text-[#F1F3F5] border border-[#292E36]"
              }`}
            >
              <span>📍 Traveling Salesperson (TSP)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/25">Popular</span>
            </button>
            <button
              onClick={() => setGaMode("phrase")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                gaMode === "phrase"
                  ? "bg-[#6C8CFF] text-white shadow-sm"
                  : "bg-[#0D0F12] text-[#A7AFBB] hover:text-[#F1F3F5] border border-[#292E36]"
              }`}
            >
              <span>🔤 Target Phrase Decoder</span>
            </button>
            <button
              onClick={() => setGaMode("landscape")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                gaMode === "landscape"
                  ? "bg-[#6C8CFF] text-white shadow-sm"
                  : "bg-[#0D0F12] text-[#A7AFBB] hover:text-[#F1F3F5] border border-[#292E36]"
              }`}
            >
              <span>📈 Mathematical Landscape</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerate}
              className="px-4 py-1.5 rounded-lg bg-[#6C8CFF] hover:bg-[#5A7BEF] text-white font-medium text-xs transition-colors shadow-sm"
            >
              {hasGenerated ? "Restart Evolution" : "Start Evolution"}
            </button>
          </div>
        </div>
      )}

      {/* Sub-Controls Toolbar tailored to the active mode */}
      <div className="w-full flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#15181D] border border-[#292E36] text-xs">
        <div className="flex items-center gap-3">
          <span
            className={`px-2.5 py-1 text-xs font-semibold rounded-md border font-mono tracking-wider ${phaseBadge.bg}`}
          >
            {isGA ? `PHASE: ${phaseBadge.label}` : "LOCAL SEARCH"}
          </span>
          <span className="text-xs text-[#A7AFBB]">
            {isGA
              ? gaMode === "tsp"
                ? `Evolving 12-city circuit via Order Crossover & 2-Opt Inversion`
                : gaMode === "phrase"
                ? `Evolving character string towards "${phraseTarget}"`
                : `Swarm navigating ${landscape.name}`
              : `Hill Climbing on ${landscape.name}`}
          </span>
        </div>

        {/* Dynamic Hyperparameter Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          {isGA && gaMode === "tsp" && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-[#737C89]">City Layout:</span>
                <select
                  value={tspPreset}
                  onChange={(e) => setTspPreset(e.target.value as "circle" | "clusters" | "random")}
                  className="bg-[#0D0F12] border border-[#292E36] rounded-lg px-2.5 py-1 text-xs text-[#F1F3F5] focus:border-[#6C8CFF] focus:outline-none"
                >
                  <option value="circle">Circular Ring (Untangling Loop)</option>
                  <option value="clusters">Twin Clusters (Hub Bridging)</option>
                  <option value="random">Scattered Terrain</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[#737C89]">Pop:</span>
                <select
                  value={tspConfig.populationSize}
                  onChange={(e) =>
                    setTspConfig((prev) => ({ ...prev, populationSize: parseInt(e.target.value) }))
                  }
                  className="bg-[#0D0F12] border border-[#292E36] rounded-lg px-2 py-1 text-xs text-[#F1F3F5] focus:border-[#6C8CFF] focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={16}>16</option>
                  <option value={24}>24</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[#737C89]">Mutation:</span>
                <select
                  value={tspConfig.mutationRate}
                  onChange={(e) =>
                    setTspConfig((prev) => ({ ...prev, mutationRate: parseFloat(e.target.value) }))
                  }
                  className="bg-[#0D0F12] border border-[#292E36] rounded-lg px-2 py-1 text-xs text-[#F1F3F5] focus:border-[#6C8CFF] focus:outline-none"
                >
                  <option value={0.15}>15%</option>
                  <option value={0.25}>25% (Balanced)</option>
                  <option value={0.40}>40% (Aggressive)</option>
                </select>
              </div>
            </>
          )}

          {isGA && gaMode === "phrase" && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-[#737C89]">Target Phrase:</span>
                <select
                  value={phraseTarget}
                  onChange={(e) => setPhraseTarget(e.target.value)}
                  className="bg-[#0D0F12] border border-[#292E36] rounded-lg px-2.5 py-1 text-xs text-[#F1F3F5] focus:border-[#6C8CFF] focus:outline-none"
                >
                  <option value="THINKVIZ AI">THINKVIZ AI</option>
                  <option value="GENETIC ALGO">GENETIC ALGO</option>
                  <option value="ARTIFICIAL AI">ARTIFICIAL AI</option>
                  <option value="HELLO WORLD">HELLO WORLD</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[#737C89]">Pop:</span>
                <select
                  value={phraseConfig.populationSize}
                  onChange={(e) =>
                    setPhraseConfig((prev) => ({ ...prev, populationSize: parseInt(e.target.value) }))
                  }
                  className="bg-[#0D0F12] border border-[#292E36] rounded-lg px-2 py-1 text-xs text-[#F1F3F5] focus:border-[#6C8CFF] focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={16}>16</option>
                  <option value={24}>24</option>
                </select>
              </div>
            </>
          )}

          {isGA && gaMode === "landscape" && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-[#737C89]">Function:</span>
                <select
                  value={currentLandscapeId}
                  onChange={(e) =>
                    setGaConfig((prev) => ({ ...prev, landscapeId: e.target.value }))
                  }
                  className="bg-[#0D0F12] border border-[#292E36] rounded-lg px-2.5 py-1 text-xs text-[#F1F3F5] focus:border-[#6C8CFF] focus:outline-none"
                >
                  {Object.values(LANDSCAPES).map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[#737C89]">Selection:</span>
                <select
                  value={gaConfig.selectionStrategy}
                  onChange={(e) =>
                    setGaConfig((prev) => ({
                      ...prev,
                      selectionStrategy: e.target.value as SelectionStrategy,
                    }))
                  }
                  className="bg-[#0D0F12] border border-[#292E36] rounded-lg px-2 py-1 text-xs text-[#F1F3F5] focus:border-[#6C8CFF] focus:outline-none"
                >
                  <option value="tournament">Tournament (k=3)</option>
                  <option value="roulette">Roulette Wheel</option>
                  <option value="rank">Rank-Based</option>
                </select>
              </div>

              <button
                onClick={() => setShowHCComparison(!showHCComparison)}
                className={`px-2.5 py-1 rounded border text-xs font-medium transition-colors ${
                  showHCComparison
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                    : "bg-[#1B1F25] text-[#A7AFBB] border-[#292E36] hover:text-[#F1F3F5]"
                }`}
              >
                {showHCComparison ? "Hide HC Trap" : "Compare HC"}
              </button>
            </>
          )}

          {!isGA && (
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
                <span className="font-mono text-[#F1F3F5] text-xs">{initialX.toFixed(1)}</span>
              </div>
              <button
                onClick={handleGenerate}
                className="px-4 py-1.5 rounded-lg bg-[#6C8CFF] text-white font-medium text-xs"
              >
                Start Climb
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Visual Arena based on active problem */}
      {isGA && gaMode === "tsp" && (
        <TSPVisualizer
          cities={activeState?.tspCities || TSP_PRESETS[tspPreset].cities}
          individuals={activeState?.tspIndividuals || []}
          bestTour={activeState?.tspBestTour || []}
          initialDistance={activeState?.tspInitialDistance || 0}
          bestDistance={activeState?.tspBestDistance || 0}
          activeCrossover={activeState?.tspActiveCrossover}
          activeMutation={activeState?.tspActiveMutation}
          phase={activeState?.phase}
          generation={activeState?.generation || 0}
          maxGenerations={tspConfig.generations}
        />
      )}

      {isGA && gaMode === "phrase" && (
        <PhraseVisualizer
          target={activeState?.phraseTarget || phraseTarget}
          individuals={activeState?.phraseIndividuals || []}
          activeCrossover={activeState?.phraseActiveCrossover}
          activeMutation={activeState?.phraseActiveMutation}
          phase={activeState?.phase}
          generation={activeState?.generation || 0}
          maxGenerations={phraseConfig.generations}
        />
      )}

      {/* Mode C: Mathematical 1D Landscape Visualizer */}
      {((isGA && gaMode === "landscape") || !isGA) && (
        <div className="flex flex-col gap-4">
          {/* Landscape Sub-tabs */}
          {isGA && (
            <div className="flex items-center gap-2 border-b border-[#292E36] pb-1 text-xs">
              <button
                onClick={() => setActiveTab("landscape")}
                className={`px-4 py-1.5 rounded-t-lg font-medium transition-all ${
                  activeTab === "landscape"
                    ? "bg-[#15181D] text-[#6C8CFF] border-t-2 border-[#6C8CFF]"
                    : "text-[#A7AFBB] hover:text-[#F1F3F5]"
                }`}
              >
                🗺️ Landscape & Swarm
              </button>
              <button
                onClick={() => setActiveTab("convergence")}
                className={`px-4 py-1.5 rounded-t-lg font-medium transition-all ${
                  activeTab === "convergence"
                    ? "bg-[#15181D] text-[#6C8CFF] border-t-2 border-[#6C8CFF]"
                    : "text-[#A7AFBB] hover:text-[#F1F3F5]"
                }`}
              >
                📈 Convergence Curve
              </button>
              <button
                onClick={() => setActiveTab("inspector")}
                className={`px-4 py-1.5 rounded-t-lg font-medium transition-all ${
                  activeTab === "inspector"
                    ? "bg-[#15181D] text-[#6C8CFF] border-t-2 border-[#6C8CFF]"
                    : "text-[#A7AFBB] hover:text-[#F1F3F5]"
                }`}
              >
                🧬 16-Bit Chromosome Splicing
              </button>
              <button
                onClick={() => setActiveTab("population")}
                className={`px-4 py-1.5 rounded-t-lg font-medium transition-all ${
                  activeTab === "population"
                    ? "bg-[#15181D] text-[#6C8CFF] border-t-2 border-[#6C8CFF]"
                    : "text-[#A7AFBB] hover:text-[#F1F3F5]"
                }`}
              >
                📋 Leaderboard Table
              </button>
            </div>
          )}

          {(!isGA || activeTab === "landscape") && (
            <div className="bg-[#15181D] rounded-xl border border-[#292E36] p-5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[#F1F3F5]">Fitness Landscape Curve</h3>
                {hoveredIndividual && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#1B1F25] border border-[#6C8CFF]/40 text-xs">
                    <span className="font-mono text-[#6C8CFF] font-semibold">{hoveredIndividual.id}:</span>
                    <span className="text-[#A7AFBB]">x = {hoveredIndividual.x.toFixed(2)}</span>
                    <span className="text-[#10B981] font-mono">f(x) = {hoveredIndividual.fitness.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="w-full flex justify-center items-center overflow-hidden relative bg-[#0D0F12] rounded-lg border border-[#292E36] p-4 min-h-[400px]">
                <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="landscapeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#263352" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#0D0F12" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>

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

                  {/* Shaded Area */}
                  <path d={areaPathData} fill="url(#landscapeGrad)" />

                  {/* Curve */}
                  <path d={pathData} fill="none" stroke="#47608A" strokeWidth="3.5" />

                  {/* Global Summit */}
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
                        y={mapYToSvg(landscape.globalMax.y) - 22}
                        textAnchor="middle"
                        fill="#F59E0B"
                        className="text-[10px] font-mono font-semibold"
                      >
                        👑 Global Summit ({landscape.globalMax.x.toFixed(1)})
                      </text>
                    </g>
                  )}

                  {/* Hill climbing comparison overlay */}
                  {((isGA && showHCComparison && activeState?.hcComparisonPath) ||
                    (!isGA && activeState?.visitedX && activeState.visitedX.length > 0)) && (
                    <g>
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
                    </g>
                  )}

                  {/* Swarm Points */}
                  {isGA &&
                    activeState?.individuals?.map((ind) => {
                      const cx = mapXToSvg(ind.x);
                      const cy = mapYToSvg(ind.fitness);
                      const isChampion = ind.rank === 1;

                      let dotColor = ind.role === "elite" ? "#F59E0B" : "#10B981";

                      return (
                        <g
                          key={ind.id}
                          onMouseEnter={() => setHoveredIndId(ind.id)}
                          onMouseLeave={() => setHoveredIndId(null)}
                          className="cursor-pointer"
                        >
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
                          <circle
                            cx={cx}
                            cy={cy}
                            r={isChampion ? 8 : 5.5}
                            fill={dotColor}
                            style={{ filter: `drop-shadow(0 0 5px ${dotColor})` }}
                          />
                        </g>
                      );
                    })}

                  {/* Single Climber */}
                  {!isGA && (
                    <circle
                      cx={mapXToSvg(currentMathX)}
                      cy={mapYToSvg(currentMathY)}
                      r="9"
                      fill="#6C8CFF"
                      stroke="#F1F3F5"
                      strokeWidth="2.5"
                    />
                  )}
                </svg>
              </div>
            </div>
          )}

          {isGA && activeTab === "convergence" && (
            <ConvergenceChart
              stats={activeState?.historyStats || []}
              currentGen={activeState?.generation ?? 0}
              maxGenerations={gaConfig.generations}
              globalBestFitness={activeState?.globalBest?.fitness}
            />
          )}

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

          {isGA && activeTab === "population" && (
            <PopulationTable
              individuals={activeState?.individuals || []}
              hoveredId={hoveredIndId}
              onHoverIndividual={setHoveredIndId}
              maxFitness={landscape.globalMax?.y || 10}
              minFitness={minY}
            />
          )}
        </div>
      )}

      {/* Playback Controls Toolbar */}
      <PlaybackToolbar playback={playback} disabled={!hasGenerated} />

      {/* Bottom Section: Step Narrative + Pseudocode Highlighter (8 cols) and Explanations (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 p-5 rounded-xl bg-[#15181D] border border-[#292E36] space-y-4">
          <div className="flex items-center justify-between border-b border-[#292E36] pb-3 text-xs">
            <span className="font-semibold text-[#F1F3F5]">Step Trace & Explanation</span>
            <span className="font-mono text-[#A7AFBB]">
              {activeStep ? `Step ${activeStep.stepIndex + 1} of ${activeStep.metrics.totalSteps}` : "-"}
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#1B1F25] border border-[#292E36] text-xs text-[#F1F3F5] leading-relaxed">
            <span className="text-[#6C8CFF] font-semibold mr-1.5">Action:</span>
            {activeStep ? activeStep.description : "Click 'Start Evolution' to begin simulation."}
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-[#A7AFBB] block">
              {isGA
                ? gaMode === "tsp"
                  ? "Traveling Salesperson Genetic Algorithm Pseudocode"
                  : gaMode === "phrase"
                  ? "Target Phrase Evolution Pseudocode"
                  : "Genetic Algorithm Optimization Pseudocode"
                : "Hill Climbing Pseudocode"}
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

        {/* AI Educational Insights */}
        <div className="lg:col-span-4 p-5 rounded-xl bg-[#15181D] border border-[#292E36] flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between border-b border-[#292E36] pb-3 mb-3">
              <h4 className="text-xs font-semibold text-[#F1F3F5]">Key Evolutionary Takeaways</h4>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#263352] text-[#6C8CFF] font-medium">
                AI Concepts
              </span>
            </div>

            <div className="text-xs text-[#A7AFBB] leading-relaxed space-y-3">
              {gaMode === "tsp" ? (
                <>
                  <p>
                    <strong className="text-[#F1F3F5]">Traveling Salesperson (TSP)</strong> is an NP-hard
                    problem with $(N-1)! / 2$ possible circuits. For 12 cities, there are ~20 million routes!
                  </p>
                  <p>
                    <span className="text-purple-400 font-medium">Order Crossover (OX)</span> splices valid
                    partial paths between parents without duplicating any cities.
                  </p>
                  <p>
                    <span className="text-rose-400 font-medium">2-Opt Inversion Mutation</span> reverses
                    segments of the tour to directly untangle crossed highway links.
                  </p>
                </>
              ) : gaMode === "phrase" ? (
                <>
                  <p>
                    <strong className="text-[#F1F3F5]">The Dawkins Weasel Program</strong> demonstrates how
                    cumulative selection discovers solutions exponentially faster than random chance.
                  </p>
                  <p>
                    Randomly typing an 11-letter phrase takes $36^{11} \approx 1.3 \times 10^{17}$ tries.
                    With natural selection and mutation, evolution finds it in just ~12 generations!
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong className="text-[#F1F3F5]">Local Search vs Population Evolution</strong>:
                    Hill Climbing gets permanently trapped on local peaks, whereas Genetic Algorithms
                    explore multiple peaks in parallel.
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#0D0F12] border border-[#292E36] text-[11px] text-[#737C89]">
            <div className="flex items-center justify-between">
              <span>Optimization Method:</span>
              <span className="font-mono text-[#10B981] font-semibold">
                {gaMode === "tsp" ? "TSP Order Crossover" : gaMode === "phrase" ? "Character Splicing" : "Binary GA"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
