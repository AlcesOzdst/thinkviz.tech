"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Point2D,
  Centroid2D,
  KMeansDatasetType,
  KMeansStep,
  CLUSTER_COLORS,
} from "@/lib/ml/types.ts";
import {
  generateKMeansSteps,
  generateKMeansDataset,
} from "@/lib/ml/kmeans.ts";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Info,
  Layers,
  Sparkles,
  Gauge,
  CheckCircle2,
  Activity,
} from "lucide-react";

export function KMeansVisualizer() {
  // Configuration State
  const [k, setK] = useState<number>(3);
  const [datasetType, setDatasetType] = useState<KMeansDatasetType>("separated");
  const [pointCount, setPointCount] = useState<number>(80);
  const [seed, setSeed] = useState<number>(42);
  const [speedMs, setSpeedMs] = useState<number>(300);

  // Playback & Animation State
  const [steps, setSteps] = useState<KMeansStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hoveredPoint, setHoveredPoint] = useState<Point2D | null>(null);

  // Generate / Regenerate Steps
  const handleRegenerate = (newK = k, newType = datasetType, newCount = pointCount, newSeed = seed) => {
    setIsPlaying(false);
    const newSteps = generateKMeansSteps({
      k: newK,
      datasetType: newType,
      pointCount: newCount,
      seed: newSeed,
      maxIterations: 35,
    });
    setSteps(newSteps);
    setCurrentStepIndex(0);
  };

  // Initial load
  useEffect(() => {
    handleRegenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animation Loop
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, speedMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speedMs, steps.length]);

  const activeStep: KMeansStep | null = steps[currentStepIndex] || null;
  const currentPoints = activeStep ? activeStep.points : [];
  const currentCentroids = activeStep ? activeStep.centroids : [];
  const isAtStart = currentStepIndex === 0;
  const isAtEnd = steps.length === 0 || currentStepIndex === steps.length - 1;

  // SVG Mapping (Domain [0, 100] -> ViewBox [0, 500])
  const svgSize = 500;
  const padding = 30;
  const plotWidth = svgSize - padding * 2;
  const plotHeight = svgSize - padding * 2;

  const mapX = (x: number) => padding + (x / 100) * plotWidth;
  const mapY = (y: number) => padding + ((100 - y) / 100) * plotHeight;

  // Cluster counts
  const clusterCounts = useMemo(() => {
    const counts = new Array(k).fill(0);
    for (const p of currentPoints) {
      if (p.cluster >= 0 && p.cluster < k) {
        counts[p.cluster]++;
      }
    }
    return counts;
  }, [currentPoints, k]);

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Top Header & CoreNode Breadcrumbs */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-[#0A0E17] border border-white/10 shadow-2xl overflow-hidden">
        <div className="absolute top-3 left-4 text-xs font-mono text-white/20 select-none">+</div>
        <div className="absolute top-3 right-4 text-xs font-mono text-white/20 select-none">+</div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
              <Link href="/machine-learning" className="hover:text-sky-400 transition-colors">
                Machine Learning
              </Link>
              <span>//</span>
              <span className="text-sky-400">Module 01</span>
              <span>//</span>
              <span className="text-slate-300">Spatial Partitioning</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white font-mono">
              K-Means Visualizer
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Observe iterative Euclidean Voronoi partitioning, centroid shifts toward cluster means, and Within-Cluster Sum of Squares (WCSS) convergence.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                const nextSeed = Math.floor(Math.random() * 10000);
                setSeed(nextSeed);
                handleRegenerate(k, datasetType, pointCount, nextSeed);
              }}
              className="px-4 py-2 rounded-xl bg-[#111722] hover:bg-[#162030] text-white border border-white/10 hover:border-white/20 text-xs font-mono font-semibold flex items-center gap-2 transition-all active:scale-[0.98] shadow-sm"
              title="Generate a new random seed"
            >
              <Shuffle className="w-3.5 h-3.5 text-sky-400" />
              <span>Randomize Seed</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Visualizer Stage (Left) & Controls/Metrics (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ===================================================================
            LEFT / MAIN: Scatter Plot Visualizer Canvas
            =================================================================== */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="w-full rounded-3xl bg-[#0A0E17] border border-white/10 p-6 sm:p-7 shadow-2xl flex flex-col items-center relative overflow-hidden">
            
            {/* Stage Header */}
            <div className="w-full flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
                  03 // Spatial Partitioning Canvas
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    activeStep?.converged
                      ? "bg-emerald-400"
                      : isPlaying
                      ? "bg-sky-400 animate-pulse"
                      : "bg-amber-400"
                  }`}
                />
                <span className="font-bold text-white">
                  {activeStep?.converged
                    ? "Converged"
                    : activeStep?.phase === "init"
                    ? "Initialized"
                    : activeStep?.phase === "assigned"
                    ? "Assigned"
                    : "Shifted"}
                </span>
                <span className="text-slate-400">
                  (Iter {activeStep?.iteration || 0})
                </span>
              </div>
            </div>

            {/* SVG Scatter Plot Stage */}
            <div className="w-full aspect-square max-w-[500px] flex items-center justify-center relative bg-[#070A0F] rounded-2xl border border-white/10 p-2 shadow-inner">
              <svg
                viewBox={`0 0 ${svgSize} ${svgSize}`}
                className="w-full h-full select-none"
              >
                {/* Subtle Grid Coordinate Lines */}
                {[20, 40, 60, 80].map((gridLine) => (
                  <React.Fragment key={gridLine}>
                    <line
                      x1={mapX(gridLine)}
                      y1={mapY(0)}
                      x2={mapX(gridLine)}
                      y2={mapY(100)}
                      stroke="#141C2B"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <line
                      x1={mapX(0)}
                      y1={mapY(gridLine)}
                      x2={mapX(100)}
                      y2={mapY(gridLine)}
                      stroke="#141C2B"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                  </React.Fragment>
                ))}

                {/* Outer Bounding Frame */}
                <rect
                  x={padding}
                  y={padding}
                  width={plotWidth}
                  height={plotHeight}
                  fill="none"
                  stroke="#1E293B"
                  strokeWidth="1.5"
                />

                {/* Assignment rays from points to centroids */}
                {activeStep?.phase === "assigned" &&
                  currentPoints.map((p) => {
                    if (p.cluster < 0 || p.cluster >= currentCentroids.length) return null;
                    const c = currentCentroids[p.cluster];
                    return (
                      <line
                        key={`ray-${p.id}`}
                        x1={mapX(p.x)}
                        y1={mapY(p.y)}
                        x2={mapX(c.x)}
                        y2={mapY(c.y)}
                        stroke={CLUSTER_COLORS[p.cluster % CLUSTER_COLORS.length]}
                        strokeWidth="0.75"
                        strokeOpacity="0.2"
                      />
                    );
                  })}

                {/* Data Points */}
                {currentPoints.map((p) => {
                  const isAssigned = p.cluster >= 0;
                  const pointColor = isAssigned
                    ? CLUSTER_COLORS[p.cluster % CLUSTER_COLORS.length]
                    : "#64748B";

                  return (
                    <circle
                      key={`pt-${p.id}`}
                      cx={mapX(p.x)}
                      cy={mapY(p.y)}
                      r={hoveredPoint?.id === p.id ? 7 : 4.5}
                      fill={pointColor}
                      stroke={hoveredPoint?.id === p.id ? "#FFFFFF" : "#070A0F"}
                      strokeWidth={hoveredPoint?.id === p.id ? 2 : 1}
                      className="cursor-pointer transition-all duration-150"
                      onMouseEnter={() => setHoveredPoint(p)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  );
                })}

                {/* Centroids */}
                {currentCentroids.map((c) => {
                  const cx = mapX(c.x);
                  const cy = mapY(c.y);
                  const color = CLUSTER_COLORS[c.id % CLUSTER_COLORS.length];

                  return (
                    <g key={`centroid-${c.id}`} className="cursor-pointer">
                      <circle
                        cx={cx}
                        cy={cy}
                        r="15"
                        fill={color}
                        fillOpacity="0.25"
                        className="animate-pulse"
                      />
                      <polygon
                        points={`${cx},${cy - 11} ${cx + 11},${cy} ${cx},${cy + 11} ${cx - 11},${cy}`}
                        fill={color}
                        stroke="#FFFFFF"
                        strokeWidth="2"
                        filter="drop-shadow(0 0 6px rgba(0,0,0,0.8))"
                      />
                      <text
                        x={cx}
                        y={cy + 3.5}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="9"
                        fontWeight="bold"
                        className="pointer-events-none select-none font-mono"
                      >
                        {c.id + 1}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Centroids Legend */}
            <div className="w-full flex flex-wrap items-center justify-center gap-2.5 mt-4 pt-3 border-t border-white/5 text-xs">
              {currentCentroids.map((c) => {
                const count = clusterCounts[c.id] || 0;
                const color = CLUSTER_COLORS[c.id % CLUSTER_COLORS.length];
                return (
                  <div
                    key={`legend-${c.id}`}
                    className="flex items-center gap-2 px-3 py-1 rounded-xl bg-[#111722] border border-white/10 font-mono"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-sm shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-white font-semibold text-xs">
                      Cluster {c.id + 1}
                    </span>
                    <span className="text-slate-400 text-[11px] tabular-nums">
                      ({count} pts)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dedicated CoreNode AI Playback Scrubber Dock */}
          <div className="w-full p-4 rounded-3xl bg-[#0A0E17] border border-white/10 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Play/Step Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleRegenerate()}
                className="p-2.5 rounded-xl bg-[#111722] hover:bg-[#162030] text-slate-300 hover:text-white border border-white/10 transition-all active:scale-[0.98]"
                title="Reset to Step 0"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStepIndex((prev) => Math.max(0, prev - 1));
                }}
                disabled={isAtStart}
                className="p-2.5 rounded-xl bg-[#111722] hover:bg-[#162030] text-slate-300 hover:text-white border border-white/10 transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
                title="Step backward"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  if (isAtEnd) {
                    setCurrentStepIndex(0);
                    setIsPlaying(true);
                  } else {
                    setIsPlaying(!isPlaying);
                  }
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-lg shadow-sky-500/20 border border-sky-400/40 transition-all active:scale-[0.98]"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause</span>
                  </>
                ) : isAtEnd ? (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span>Replay</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>{isAtStart ? "Run K-Means" : "Resume"}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
                }}
                disabled={isAtEnd}
                className="p-2.5 rounded-xl bg-[#111722] hover:bg-[#162030] text-slate-300 hover:text-white border border-white/10 transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
                title="Step forward"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Scrubber & Step Counter */}
            <div className="flex-1 w-full sm:w-auto flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={Math.max(0, steps.length - 1)}
                value={currentStepIndex}
                onChange={(e) => {
                  setIsPlaying(false);
                  setCurrentStepIndex(Number(e.target.value));
                }}
                className="w-full h-2 bg-[#070A0F] rounded-lg appearance-none cursor-pointer accent-sky-400 border border-white/10"
              />
              <span className="text-xs font-mono tabular-nums text-slate-400 whitespace-nowrap min-w-[80px] text-right">
                Step <strong className="text-white font-bold">{currentStepIndex}</strong>/{steps.length - 1}
              </span>
            </div>

            {/* Speed Selector */}
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <Gauge className="w-4 h-4 text-slate-400 mr-1" />
              {[
                { label: "Slow", ms: 600 },
                { label: "1x", ms: 300 },
                { label: "2x", ms: 120 },
                { label: "Max", ms: 30 },
              ].map((s) => (
                <button
                  key={s.label}
                  onClick={() => setSpeedMs(s.ms)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                    speedMs === s.ms
                      ? "bg-sky-500 text-white shadow-sm"
                      : "bg-[#111722] text-slate-400 hover:text-white border border-white/10"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ===================================================================
            RIGHT: Parameters, Live Metrics & Pedagogical Notes
            =================================================================== */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          
          {/* Parameter Configuration Deck */}
          <div className="p-6 sm:p-7 rounded-3xl bg-[#0A0E17] border border-white/10 shadow-2xl space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-sky-400" />
                <h2 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
                  01 // Hyperparameter Config
                </h2>
              </div>
              <span className="text-xs font-mono text-sky-400">K-Means++ PRNG</span>
            </div>

            {/* Cluster Count (K) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-medium">Number of Clusters (K):</span>
                <span className="font-mono text-base font-bold text-sky-400">{k}</span>
              </div>
              <div className="grid grid-cols-8 gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((kVal) => (
                  <button
                    key={kVal}
                    onClick={() => {
                      setK(kVal);
                      handleRegenerate(kVal, datasetType, pointCount, seed);
                    }}
                    className={`py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                      k === kVal
                        ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20 border border-sky-400/50"
                        : "bg-[#111722] text-slate-300 hover:text-white border border-white/10"
                    }`}
                  >
                    {kVal}
                  </button>
                ))}
              </div>
            </div>

            {/* Dataset Type Selector */}
            <div className="space-y-2">
              <span className="text-slate-300 font-medium block">Dataset Distribution:</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "separated", label: "Separated" },
                  { id: "blobs", label: "Gaussian Blobs" },
                  { id: "uniform", label: "Uniform" },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setDatasetType(type.id as KMeansDatasetType);
                      handleRegenerate(k, type.id as KMeansDatasetType, pointCount, seed);
                    }}
                    className={`py-2 px-2.5 rounded-xl text-xs font-mono transition-all ${
                      datasetType === type.id
                        ? "bg-sky-500/20 text-sky-300 border border-sky-400/50 font-bold"
                        : "bg-[#111722] text-slate-300 hover:text-white border border-white/10"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Point Count */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-medium">Sample Size (N):</span>
                <span className="font-mono font-bold text-white">{pointCount} points</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[40, 80, 120, 160].map((count) => (
                  <button
                    key={count}
                    onClick={() => {
                      setPointCount(count);
                      handleRegenerate(k, datasetType, count, seed);
                    }}
                    className={`py-2 rounded-xl text-xs font-mono transition-all ${
                      pointCount === count
                        ? "bg-[#1A2230] text-white border border-sky-400/40 font-bold"
                        : "bg-[#111722] text-slate-400 hover:text-white border border-white/10"
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Real-Time Mathematical Metrics Panel */}
          <div className="p-6 sm:p-7 rounded-3xl bg-[#0A0E17] border border-white/10 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4 text-sky-400" />
                <h3 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
                  02 // Clustering Telemetry
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">Live Mathematical Readout</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* Metric 1: WCSS (Inertia) */}
              <div className="p-4 rounded-2xl bg-[#111722] border border-white/10">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Inertia (WCSS)
                </span>
                <span className="font-mono text-xl sm:text-2xl font-black text-amber-300 tabular-nums mt-1 block">
                  {activeStep ? activeStep.wcss.toLocaleString() : "0"}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                  Σ ||x − c_k||²
                </span>
              </div>

              {/* Metric 2: Convergence Status */}
              <div className="p-4 rounded-2xl bg-[#111722] border border-white/10">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Status
                </span>
                <span
                  className={`text-sm sm:text-base font-bold flex items-center gap-1.5 mt-1 ${
                    activeStep?.converged ? "text-emerald-400" : "text-sky-400"
                  }`}
                >
                  {activeStep?.converged ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Converged</span>
                    </>
                  ) : (
                    <span>Optimizing...</span>
                  )}
                </span>
                <span className="text-[10px] font-mono text-slate-400 block mt-1">
                  Δ = {activeStep?.maxCentroidDelta ?? 0}
                </span>
              </div>

              {/* Metric 3: Iteration */}
              <div className="p-4 rounded-2xl bg-[#111722] border border-white/10">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Iteration
                </span>
                <span className="font-mono text-xl sm:text-2xl font-black text-white tabular-nums mt-1 block">
                  {activeStep?.iteration || 0}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                  Step {currentStepIndex}/{steps.length - 1}
                </span>
              </div>

              {/* Metric 4: Reassigned Points */}
              <div className="p-4 rounded-2xl bg-[#111722] border border-white/10">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Reassigned
                </span>
                <span className="font-mono text-xl sm:text-2xl font-black text-white tabular-nums mt-1 block">
                  {activeStep?.reassignedCount ?? 0}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                  Points shifted
                </span>
              </div>
            </div>

            {/* Live Step Explanation */}
            <div className="p-4 rounded-2xl bg-[#070A0F] border border-white/10 text-xs text-slate-300 leading-relaxed font-mono">
              <span className="text-sky-400 font-bold mr-1.5">Step Trace:</span>
              {activeStep?.explanation || "Ready to begin."}
            </div>
          </div>

          {/* Pedagogical Note (Elbow Method & WCSS Behavior) */}
          <div className="p-6 sm:p-7 rounded-3xl bg-[#0A0E17] border border-white/10 shadow-2xl space-y-3 text-xs">
            <div className="flex items-center gap-2.5 text-amber-400 font-semibold border-b border-white/5 pb-3">
              <Info className="w-4 h-4 shrink-0" />
              <h3 className="text-xs font-mono font-bold tracking-widest uppercase">
                04 // Diagnostic: The Elbow Method
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Within-cluster sum of squares (WCSS) <strong>strictly decreases as K increases</strong>, hitting 0 when K = N (each point is its own centroid).
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Therefore, a lower WCSS does not alone prove that a larger K is superior. In machine learning practice, researchers run multiple K trials and look for the <strong className="text-sky-300">"Elbow Point"</strong>—the inflection where adding another centroid yields diminishing returns in variance reduction.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
