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
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E2638]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#828E9E] mb-1.5">
            <Link href="/machine-learning" className="hover:text-[#F8FAFC] transition-colors">
              Machine Learning
            </Link>
            <span>/</span>
            <span className="text-[#6C8CFF]">K-Means Clustering</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F8FAFC]">
            K-Means Visualizer
          </h1>
          <p className="text-sm text-[#828E9E] mt-1 max-w-2xl">
            Observe how data points are assigned to clusters and how centroids iteratively shift to minimize within-cluster sum of squared errors.
          </p>
        </div>

        {/* Global Regenerate Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const nextSeed = Math.floor(Math.random() * 10000);
              setSeed(nextSeed);
              handleRegenerate(k, datasetType, pointCount, nextSeed);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-[#12161D] hover:bg-[#1A2230] text-[#F8FAFC] border border-[#232B36] text-xs font-semibold flex items-center gap-2 transition-all active:scale-[0.98]"
            title="Generate a new random seed"
          >
            <Shuffle className="w-3.5 h-3.5 text-[#6C8CFF]" />
            <span>Randomize Seed</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Visualizer Stage (Left) & Controls/Metrics (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ===================================================================
            LEFT / MAIN: Scatter Plot Visualizer Canvas
            =================================================================== */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="w-full rounded-2xl bg-[#090D14] border border-[#1E2638] p-4 sm:p-5 shadow-2xl flex flex-col items-center relative overflow-hidden">
            
            {/* Stage HUD Pill */}
            <div className="w-full flex items-center justify-between mb-3 text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    activeStep?.converged
                      ? "bg-emerald-400"
                      : isPlaying
                      ? "bg-[#6C8CFF] animate-pulse"
                      : "bg-amber-400"
                  }`}
                />
                <span className="font-semibold text-[#F8FAFC]">
                  {activeStep?.converged
                    ? "Converged"
                    : activeStep?.phase === "init"
                    ? "Initialized"
                    : activeStep?.phase === "assigned"
                    ? "Points Assigned"
                    : "Centroids Shifted"}
                </span>
                <span className="text-[#828E9E] font-mono text-[11px] tabular-nums">
                  • Iteration {activeStep?.iteration || 0}
                </span>
              </div>

              {/* Point Hover Coordinates */}
              {hoveredPoint && (
                <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#12161D] border border-[#232B36] font-mono text-[11px] text-[#828E9E]">
                  <span>Point #{hoveredPoint.id}:</span>
                  <span className="text-[#F8FAFC]">({hoveredPoint.x}, {hoveredPoint.y})</span>
                  <span>Cluster:</span>
                  <span
                    className="font-bold"
                    style={{
                      color:
                        hoveredPoint.cluster >= 0
                          ? CLUSTER_COLORS[hoveredPoint.cluster % CLUSTER_COLORS.length]
                          : "#828E9E",
                    }}
                  >
                    {hoveredPoint.cluster >= 0 ? `C${hoveredPoint.cluster + 1}` : "None"}
                  </span>
                </div>
              )}
            </div>

            {/* SVG Scatter Plot Stage */}
            <div className="w-full aspect-square max-w-[500px] flex items-center justify-center relative bg-[#070A0F] rounded-xl border border-[#161D2A] p-2">
              <svg
                viewBox={`0 0 ${svgSize} ${svgSize}`}
                className="w-full h-full select-none"
              >
                {/* Subtle Grid Coordinate Lines */}
                {[20, 40, 60, 80].map((gridLine) => (
                  <React.Fragment key={gridLine}>
                    {/* Vertical line */}
                    <line
                      x1={mapX(gridLine)}
                      y1={mapY(0)}
                      x2={mapX(gridLine)}
                      y2={mapY(100)}
                      stroke="#141C2A"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    {/* Horizontal line */}
                    <line
                      x1={mapX(0)}
                      y1={mapY(gridLine)}
                      x2={mapX(100)}
                      y2={mapY(gridLine)}
                      stroke="#141C2A"
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
                  stroke="#1E2638"
                  strokeWidth="1.5"
                />

                {/* Subtle assignment rays from points to centroids when assigned */}
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
                        strokeOpacity="0.15"
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
                      r={hoveredPoint?.id === p.id ? 6.5 : 4.5}
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
                      {/* Glow halo */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r="14"
                        fill={color}
                        fillOpacity="0.2"
                        className="animate-pulse"
                      />
                      {/* Diamond marker */}
                      <polygon
                        points={`${cx},${cy - 10} ${cx + 10},${cy} ${cx},${cy + 10} ${cx - 10},${cy}`}
                        fill={color}
                        stroke="#FFFFFF"
                        strokeWidth="2"
                        filter="drop-shadow(0 0 6px rgba(0,0,0,0.8))"
                      />
                      {/* Centroid label */}
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
            <div className="w-full flex flex-wrap items-center justify-center gap-3 mt-3 pt-3 border-t border-[#161D2A] text-xs">
              {currentCentroids.map((c) => {
                const count = clusterCounts[c.id] || 0;
                const color = CLUSTER_COLORS[c.id % CLUSTER_COLORS.length];
                return (
                  <div
                    key={`legend-${c.id}`}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#0C1018] border border-[#1A2230]"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-sm"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-mono text-[#F8FAFC] font-semibold text-[11px]">
                      Cluster {c.id + 1}
                    </span>
                    <span className="text-[#828E9E] font-mono text-[10px] tabular-nums">
                      ({count} pts)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dedicated Playback Controller Dock */}
          <div className="w-full p-3 rounded-xl bg-[#090D14] border border-[#1E2638] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
            {/* Play/Step Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleRegenerate()}
                className="p-2 rounded-lg bg-[#12161D] hover:bg-[#1A2230] text-[#828E9E] hover:text-[#F8FAFC] border border-[#232B36] transition-all active:scale-[0.98]"
                title="Reset to Step 0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStepIndex((prev) => Math.max(0, prev - 1));
                }}
                disabled={isAtStart}
                className="p-2 rounded-lg bg-[#12161D] hover:bg-[#1A2230] text-[#828E9E] hover:text-[#F8FAFC] border border-[#232B36] transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
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
                className="px-4 py-1.5 rounded-lg bg-[#6C8CFF] hover:bg-[#5A7BEF] text-white text-xs font-semibold flex items-center gap-2 shadow-md transition-all active:scale-[0.98]"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Pause</span>
                  </>
                ) : isAtEnd ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Replay</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
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
                className="p-2 rounded-lg bg-[#12161D] hover:bg-[#1A2230] text-[#828E9E] hover:text-[#F8FAFC] border border-[#232B36] transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
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
                className="w-full h-1.5 bg-[#12161D] rounded-lg appearance-none cursor-pointer accent-[#6C8CFF]"
              />
              <span className="text-xs font-mono tabular-nums text-[#828E9E] whitespace-nowrap min-w-[70px] text-right">
                Step <strong className="text-[#F8FAFC]">{currentStepIndex}</strong>/{steps.length - 1}
              </span>
            </div>

            {/* Speed Selector */}
            <div className="flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-[#828E9E] mr-0.5" />
              {[
                { label: "Slow", ms: 600 },
                { label: "1x", ms: 300 },
                { label: "2x", ms: 120 },
                { label: "Max", ms: 30 },
              ].map((s) => (
                <button
                  key={s.label}
                  onClick={() => setSpeedMs(s.ms)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium transition-all ${
                    speedMs === s.ms
                      ? "bg-[#6C8CFF] text-white"
                      : "bg-[#12161D] text-[#828E9E] hover:text-[#F8FAFC]"
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
        <div className="lg:col-span-5 flex flex-col space-y-4">
          
          {/* Parameter Configuration Deck */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#090D14] border border-[#1E2638] shadow-xl space-y-4 text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-[#161D2A]">
              <Layers className="w-4 h-4 text-[#6C8CFF]" />
              <h2 className="font-semibold text-[#F8FAFC] text-sm">Algorithm Controls</h2>
            </div>

            {/* Cluster Count (K) */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#828E9E] font-medium">Number of Clusters (K):</span>
                <span className="font-mono font-bold text-[#6C8CFF]">{k}</span>
              </div>
              <div className="grid grid-cols-8 gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((kVal) => (
                  <button
                    key={kVal}
                    onClick={() => {
                      setK(kVal);
                      handleRegenerate(kVal, datasetType, pointCount, seed);
                    }}
                    className={`py-1 rounded text-xs font-mono font-semibold transition-all ${
                      k === kVal
                        ? "bg-[#6C8CFF] text-white shadow-sm"
                        : "bg-[#12161D] text-[#828E9E] hover:text-[#F8FAFC] border border-[#232B36]"
                    }`}
                  >
                    {kVal}
                  </button>
                ))}
              </div>
            </div>

            {/* Dataset Type Selector */}
            <div className="space-y-1.5">
              <span className="text-[#828E9E] font-medium block">Dataset Distribution:</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "separated", label: "Separated" },
                  { id: "blobs", label: "Gaussian Blobs" },
                  { id: "uniform", label: "Random Uniform" },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setDatasetType(type.id as KMeansDatasetType);
                      handleRegenerate(k, type.id as KMeansDatasetType, pointCount, seed);
                    }}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all ${
                      datasetType === type.id
                        ? "bg-[#6C8CFF]/20 text-[#6C8CFF] border border-[#6C8CFF]/50 font-semibold"
                        : "bg-[#12161D] text-[#828E9E] hover:text-[#F8FAFC] border border-[#232B36]"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Point Count */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#828E9E] font-medium">Sample Size (N):</span>
                <span className="font-mono font-bold text-[#F8FAFC]">{pointCount} points</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[40, 80, 120, 160].map((count) => (
                  <button
                    key={count}
                    onClick={() => {
                      setPointCount(count);
                      handleRegenerate(k, datasetType, count, seed);
                    }}
                    className={`py-1 rounded text-xs font-mono transition-all ${
                      pointCount === count
                        ? "bg-[#1A2230] text-[#F8FAFC] border border-[#6C8CFF]/40 font-bold"
                        : "bg-[#12161D] text-[#828E9E] hover:text-[#F8FAFC] border border-[#232B36]"
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Real-Time Mathematical Metrics Panel */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#090D14] border border-[#1E2638] shadow-xl space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#161D2A]">
              <span className="font-semibold text-[#F8FAFC] text-sm">Cluster Metrics</span>
              <span className="text-[10px] font-mono text-[#828E9E]">Real-Time Evaluation</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Metric 1: WCSS (Inertia) */}
              <div className="p-3 rounded-xl bg-[#0F1420] border border-[#1E2638]">
                <span className="text-[10px] font-medium text-[#828E9E] uppercase tracking-wider block">
                  Inertia (WCSS)
                </span>
                <span className="font-mono text-base font-bold text-amber-300 tabular-nums">
                  {activeStep ? activeStep.wcss.toLocaleString() : "0"}
                </span>
                <span className="text-[10px] text-[#64748B] block mt-0.5">
                  Σ ||x - c_k||²
                </span>
              </div>

              {/* Metric 2: Convergence Status */}
              <div className="p-3 rounded-xl bg-[#0F1420] border border-[#1E2638]">
                <span className="text-[10px] font-medium text-[#828E9E] uppercase tracking-wider block">
                  Status
                </span>
                <span
                  className={`text-sm font-semibold flex items-center gap-1.5 mt-0.5 ${
                    activeStep?.converged ? "text-emerald-400" : "text-[#6C8CFF]"
                  }`}
                >
                  {activeStep?.converged ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Converged</span>
                    </>
                  ) : (
                    <span>Optimizing...</span>
                  )}
                </span>
                <span className="text-[10px] font-mono text-[#64748B] block mt-0.5">
                  Δ = {activeStep?.maxCentroidDelta ?? 0}
                </span>
              </div>

              {/* Metric 3: Iteration */}
              <div className="p-3 rounded-xl bg-[#0F1420] border border-[#1E2638]">
                <span className="text-[10px] font-medium text-[#828E9E] uppercase tracking-wider block">
                  Iteration
                </span>
                <span className="font-mono text-base font-bold text-[#F8FAFC] tabular-nums">
                  {activeStep?.iteration || 0}
                </span>
                <span className="text-[10px] text-[#64748B] block mt-0.5">
                  Step {currentStepIndex}/{steps.length - 1}
                </span>
              </div>

              {/* Metric 4: Reassigned Points */}
              <div className="p-3 rounded-xl bg-[#0F1420] border border-[#1E2638]">
                <span className="text-[10px] font-medium text-[#828E9E] uppercase tracking-wider block">
                  Reassigned
                </span>
                <span className="font-mono text-base font-bold text-[#F8FAFC] tabular-nums">
                  {activeStep?.reassignedCount ?? 0}
                </span>
                <span className="text-[10px] text-[#64748B] block mt-0.5">
                  Points shifted
                </span>
              </div>
            </div>

            {/* Live Step Explanation */}
            <div className="p-3 rounded-xl bg-[#070A0F] border border-[#1A2230] text-[11px] text-[#A7AFBB] leading-relaxed">
              <span className="text-[#6C8CFF] font-semibold mr-1">Step Trace:</span>
              {activeStep?.explanation || "Ready to begin."}
            </div>
          </div>

          {/* Pedagogical Note (Elbow Method & WCSS Behavior) */}
          <div className="p-4 rounded-2xl bg-[#0F1420] border border-[#232B36] space-y-2 text-xs">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
              <Info className="w-4 h-4 shrink-0" />
              <span>Pedagogical Insight: The Elbow Method</span>
            </div>
            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
              Within-cluster sum of squares (WCSS) <strong>strictly decreases as K increases</strong>, eventually hitting 0 when K = N (each point is its own cluster).
            </p>
            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
              Therefore, a lower WCSS does not alone prove that a larger K is superior. In machine learning practice, researchers run multiple K trials and look for the <strong className="text-[#F8FAFC]">"Elbow Point"</strong>—the inflection where adding another centroid yields diminishing returns in variance reduction.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
