"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  RegressionPoint,
  RegressionDatasetType,
} from "@/lib/ml/types.ts";
import {
  generateRegressionDataset,
  fitModel,
} from "@/lib/ml/regression.ts";
import {
  Shuffle,
  Info,
  TrendingUp,
  SlidersHorizontal,
  PlusCircle,
  Trash2,
  Split,
  AlertTriangle,
} from "lucide-react";

export function RegressionPlayground() {
  // Configuration State
  const [degree, setDegree] = useState<number>(1);
  const [datasetType, setDatasetType] = useState<RegressionDatasetType>("linear");
  const [noise, setNoise] = useState<number>(6);
  const [pointCount, setPointCount] = useState<number>(35);
  const [seed, setSeed] = useState<number>(101);
  const [enableSplit, setEnableSplit] = useState<boolean>(true);
  const [customPoints, setCustomPoints] = useState<RegressionPoint[]>([]);
  const [hoveredPoint, setHoveredPoint] = useState<RegressionPoint | null>(null);

  // Generate synthetic dataset
  const baseData = useMemo(() => {
    return generateRegressionDataset(
      datasetType,
      pointCount,
      noise,
      seed,
      enableSplit,
      0.75
    );
  }, [datasetType, pointCount, noise, seed, enableSplit]);

  // Combine generated points with any custom user-added points
  const allPoints = useMemo(() => {
    return [...baseData.points, ...customPoints];
  }, [baseData.points, customPoints]);

  // Fit Linear/Polynomial Model via Stable Least-Squares
  const model = useMemo(() => {
    return fitModel(allPoints, degree, enableSplit);
  }, [allPoints, degree, enableSplit]);

  // SVG Mapping (Domain [0, 100] -> ViewBox [0, 500])
  const svgSize = 500;
  const padding = 36;
  const plotWidth = svgSize - padding * 2;
  const plotHeight = svgSize - padding * 2;

  const mapX = (x: number) => padding + (x / 100) * plotWidth;
  const mapY = (y: number) => padding + ((100 - y) / 100) * plotHeight;
  const unmapX = (svgX: number) => Math.max(0, Math.min(100, ((svgX - padding) / plotWidth) * 100));
  const unmapY = (svgY: number) => Math.max(0, Math.min(100, 100 - ((svgY - padding) / plotHeight) * 100));

  // Generate smooth fitted curve path by sampling 200 points along domain [0, 100]
  const curvePath = useMemo(() => {
    const samples = 200;
    let d = "";
    for (let i = 0; i <= samples; i++) {
      const x = (i / samples) * 100;
      const y = model.predict(x);
      const clampedY = Math.max(-20, Math.min(120, y)); // allow slight overshoot for smooth clipping
      const svgX = mapX(x);
      const svgY = mapY(clampedY);
      if (i === 0) d += `M ${svgX},${svgY} `;
      else d += `L ${svgX},${svgY} `;
    }
    return d;
  }, [model]);

  // Click on SVG to add an interactive data point
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const scaleX = svgSize / rect.width;
    const scaleY = svgSize / rect.height;

    const domainX = unmapX(clickX * scaleX);
    const domainY = unmapY(clickY * scaleY);

    const newPoint: RegressionPoint = {
      id: 1000 + customPoints.length,
      x: Number(domainX.toFixed(2)),
      y: Number(domainY.toFixed(2)),
      isTest: enableSplit ? Math.random() > 0.75 : false,
    };

    setCustomPoints((prev) => [...prev, newPoint]);
  };

  // Derive pedagogical observations from actual outputs
  const observations = useMemo(() => {
    const obs: string[] = [];
    const { trainMetrics, testMetrics } = model;

    if (enableSplit && testMetrics) {
      if (trainMetrics.mse < 10 && testMetrics.mse > trainMetrics.mse * 2.5 && degree >= 3) {
        obs.push(
          `⚠️ High Degree Overfitting Detected: Degree ${degree} polynomial achieves ultra-low Training MSE (${trainMetrics.mse.toFixed(2)}), but Test MSE significantly spikes (${testMetrics.mse.toFixed(2)}). The model is memorizing random noise rather than learning generalizable underlying trends.`
        );
      } else if (degree === 1 && (datasetType === "quadratic" || datasetType === "sine") && (trainMetrics.r2 ?? 0) < 0.6) {
        obs.push(
          `Underfitting (High Bias): A linear model (degree 1) is unable to capture the curvature of the ${datasetType} distribution, resulting in high residual error across both training and test sets.`
        );
      } else if ((testMetrics.r2 ?? 0) > 0.8) {
        obs.push(
          `Strong Generalization: Degree ${degree} fits the underlying structure well, maintaining consistent test R² (${((testMetrics.r2 ?? 0) * 100).toFixed(1)}%) close to training R² (${((trainMetrics.r2 ?? 0) * 100).toFixed(1)}%).`
        );
      }
    }

    if (noise > 15) {
      obs.push(
        `High Variance Noise (σ = ${noise}): Large irreducible noise inflates residual dispersion (SS_res), placing an upper ceiling on achievable R² even with the ideal model architecture.`
      );
    }

    if (obs.length === 0) {
      obs.push(
        `Balanced fit: Degree ${degree} model with ${allPoints.length} points. Residual stems show vertical offsets between observed targets and predictions.`
      );
    }

    return obs;
  }, [model, degree, enableSplit, datasetType, noise, allPoints.length]);

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
            <span className="text-[#6C8CFF]">Regression Playground</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F8FAFC]">
            Regression Playground
          </h1>
          <p className="text-sm text-[#828E9E] mt-1 max-w-2xl">
            Fit linear and polynomial regression models via exact least-squares and inspect predictions, residual errors, and generalization metrics.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          {customPoints.length > 0 && (
            <button
              onClick={() => setCustomPoints([])}
              className="px-3 py-1.5 rounded-lg bg-[#12161D] hover:bg-[#1A2230] text-[#828E9E] hover:text-red-400 border border-[#232B36] text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-[0.98]"
              title="Remove custom points"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Points ({customPoints.length})</span>
            </button>
          )}

          <button
            onClick={() => setSeed(Math.floor(Math.random() * 10000))}
            className="px-3.5 py-1.5 rounded-lg bg-[#12161D] hover:bg-[#1A2230] text-[#F8FAFC] border border-[#232B36] text-xs font-semibold flex items-center gap-2 transition-all active:scale-[0.98]"
            title="Randomize data points"
          >
            <Shuffle className="w-3.5 h-3.5 text-[#6C8CFF]" />
            <span>Randomize Seed</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Visualizer Stage (Left) & Controls/Metrics (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ===================================================================
            LEFT / MAIN: Regression Cartesian Plot Canvas
            =================================================================== */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="w-full rounded-2xl bg-[#090D14] border border-[#1E2638] p-4 sm:p-5 shadow-2xl flex flex-col items-center relative overflow-hidden">
            
            {/* Stage HUD / Equation Banner */}
            <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#161D2E] border border-[#6C8CFF]/40 text-[#6C8CFF]">
                  {model.equationString}
                </span>
                <span className="text-[#828E9E] font-mono text-[11px]">
                  (Degree {degree})
                </span>
              </div>

              {/* Point Hover Coordinates */}
              {hoveredPoint ? (
                <div className="flex items-center gap-2 font-mono text-[11px] text-[#828E9E]">
                  <span>Point:</span>
                  <span className="text-[#F8FAFC]">({hoveredPoint.x}, {hoveredPoint.y})</span>
                  <span>Residual:</span>
                  <span
                    className={`font-bold ${
                      hoveredPoint.y >= model.predict(hoveredPoint.x)
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }`}
                  >
                    {(hoveredPoint.y - model.predict(hoveredPoint.x)).toFixed(2)}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[11px] text-[#828E9E]">
                  <PlusCircle className="w-3 h-3 text-[#6C8CFF]" />
                  <span>Click canvas to add points</span>
                </div>
              )}
            </div>

            {/* SVG Coordinate Plot Stage */}
            <div className="w-full aspect-square max-w-[500px] flex items-center justify-center relative bg-[#070A0F] rounded-xl border border-[#161D2A] p-2">
              <svg
                viewBox={`0 0 ${svgSize} ${svgSize}`}
                className="w-full h-full select-none cursor-crosshair"
                onClick={handleSvgClick}
              >
                <defs>
                  <clipPath id="plotClip">
                    <rect x={padding} y={padding} width={plotWidth} height={plotHeight} />
                  </clipPath>
                </defs>

                {/* Coordinate Grid Lines & Axis Numbers */}
                {[0, 20, 40, 60, 80, 100].map((val) => (
                  <React.Fragment key={`axis-${val}`}>
                    {/* Vertical grid line */}
                    <line
                      x1={mapX(val)}
                      y1={mapY(0)}
                      x2={mapX(val)}
                      y2={mapY(100)}
                      stroke={val === 0 ? "#2B384E" : "#141C2A"}
                      strokeWidth={val === 0 ? "1.5" : "1"}
                      strokeDasharray={val === 0 ? "none" : "3 3"}
                    />
                    {/* X-axis label */}
                    <text
                      x={mapX(val)}
                      y={svgSize - 12}
                      textAnchor="middle"
                      fill="#64748B"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      {val}
                    </text>

                    {/* Horizontal grid line */}
                    <line
                      x1={mapX(0)}
                      y1={mapY(val)}
                      x2={mapX(100)}
                      y2={mapY(val)}
                      stroke={val === 0 ? "#2B384E" : "#141C2A"}
                      strokeWidth={val === 0 ? "1.5" : "1"}
                      strokeDasharray={val === 0 ? "none" : "3 3"}
                    />
                    {/* Y-axis label */}
                    <text
                      x={padding - 10}
                      y={mapY(val) + 3}
                      textAnchor="end"
                      fill="#64748B"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      {val}
                    </text>
                  </React.Fragment>
                ))}

                {/* Outer Bounding Box */}
                <rect
                  x={padding}
                  y={padding}
                  width={plotWidth}
                  height={plotHeight}
                  fill="none"
                  stroke="#1E2638"
                  strokeWidth="1.5"
                />

                {/* Residual Stems (Vertical dashed lines from point to fitted curve) */}
                <g clipPath="url(#plotClip)">
                  {allPoints.map((p) => {
                    const yPred = model.predict(p.x);
                    const svgX = mapX(p.x);
                    const svgYActual = mapY(p.y);
                    const svgYPred = mapY(yPred);
                    const isHovered = hoveredPoint?.id === p.id;

                    return (
                      <line
                        key={`residual-${p.id}`}
                        x1={svgX}
                        y1={svgYActual}
                        x2={svgX}
                        y2={svgYPred}
                        stroke={isHovered ? "#FFFFFF" : p.isTest ? "#F59E0B" : "#3B82F6"}
                        strokeWidth={isHovered ? "2" : "1"}
                        strokeDasharray="2 2"
                        strokeOpacity={isHovered ? "0.9" : "0.35"}
                      />
                    );
                  })}
                </g>

                {/* Continuous Fitted Regression Curve */}
                <g clipPath="url(#plotClip)">
                  <path
                    d={curvePath}
                    fill="none"
                    stroke="#6C8CFF"
                    strokeWidth="3"
                    strokeLinecap="round"
                    style={{ filter: "drop-shadow(0 0 6px rgba(108,140,255,0.5))" }}
                  />
                </g>

                {/* Data Points */}
                <g clipPath="url(#plotClip)">
                  {allPoints.map((p) => {
                    const isHovered = hoveredPoint?.id === p.id;
                    const isTest = Boolean(p.isTest);
                    const pointColor = isTest ? "#F59E0B" : "#3B82F6";

                    return (
                      <circle
                        key={`pt-${p.id}`}
                        cx={mapX(p.x)}
                        cy={mapY(p.y)}
                        r={isHovered ? 6.5 : 4.5}
                        fill={pointColor}
                        stroke={isHovered ? "#FFFFFF" : "#070A0F"}
                        strokeWidth={isHovered ? 2 : 1}
                        className="cursor-pointer transition-all duration-150"
                        onMouseEnter={(e) => {
                          e.stopPropagation();
                          setHoveredPoint(p);
                        }}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    );
                  })}
                </g>
              </svg>
            </div>

            {/* Plot Legend */}
            <div className="w-full flex flex-wrap items-center justify-center gap-4 mt-3 pt-3 border-t border-[#161D2A] text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
                <span className="text-[#F8FAFC] font-medium text-[11px]">
                  Training Points ({model.trainMetrics.count})
                </span>
              </div>

              {enableSplit && model.testMetrics && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                  <span className="text-[#F8FAFC] font-medium text-[11px]">
                    Testing Points ({model.testMetrics.count})
                  </span>
                </div>
              )}

              <div className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 bg-[#6C8CFF]" />
                <span className="text-[#6C8CFF] font-semibold text-[11px]">
                  Fitted Curve
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 border-b border-dashed border-[#828E9E]" />
                <span className="text-[#828E9E] text-[11px]">
                  Residuals (y - ŷ)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================================
            RIGHT: Hyperparameters, Numerical Metrics & Overfitting Telemetry
            =================================================================== */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          
          {/* Regression Parameters Deck */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#090D14] border border-[#1E2638] shadow-xl space-y-4 text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-[#161D2A]">
              <SlidersHorizontal className="w-4 h-4 text-[#6C8CFF]" />
              <h2 className="font-semibold text-[#F8FAFC] text-sm">Model Parameters</h2>
            </div>

            {/* Degree Selector (1 - 5) */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#828E9E] font-medium">Polynomial Degree:</span>
                <span className="font-mono font-bold text-[#6C8CFF]">
                  {degree === 1 ? "1 (Linear)" : degree === 2 ? "2 (Quadratic)" : degree === 3 ? "3 (Cubic)" : degree === 4 ? "4 (Quartic)" : "5 (Quintic)"}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDegree(d)}
                    className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                      degree === d
                        ? "bg-[#6C8CFF] text-white shadow-sm"
                        : "bg-[#12161D] text-[#828E9E] hover:text-[#F8FAFC] border border-[#232B36]"
                    }`}
                  >
                    d = {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Dataset Type Selector */}
            <div className="space-y-1.5">
              <span className="text-[#828E9E] font-medium block">Underlying Function:</span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: "linear", label: "Linear Trend" },
                  { id: "quadratic", label: "Parabolic Curve" },
                  { id: "sine", label: "Sine Wave" },
                  { id: "noisy_cluster", label: "Sigmoid Cluster" },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setDatasetType(type.id as RegressionDatasetType)}
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

            {/* Noise Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#828E9E] font-medium">Gaussian Noise (σ):</span>
                <span className="font-mono font-bold text-[#F8FAFC]">{noise}</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={noise}
                onChange={(e) => setNoise(Number(e.target.value))}
                className="w-full h-1.5 bg-[#12161D] rounded-lg appearance-none cursor-pointer accent-[#6C8CFF]"
              />
            </div>

            {/* Sample Size Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#828E9E] font-medium">Sample Points (N):</span>
                <span className="font-mono font-bold text-[#F8FAFC]">{pointCount}</span>
              </div>
              <input
                type="range"
                min="15"
                max="80"
                step="5"
                value={pointCount}
                onChange={(e) => setPointCount(Number(e.target.value))}
                className="w-full h-1.5 bg-[#12161D] rounded-lg appearance-none cursor-pointer accent-[#6C8CFF]"
              />
            </div>

            {/* Train / Test Split Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-[#161D2A]">
              <div className="flex items-center gap-1.5">
                <Split className="w-3.5 h-3.5 text-[#6C8CFF]" />
                <span className="text-[#828E9E] font-medium">Train / Test Split (75% / 25%):</span>
              </div>
              <button
                onClick={() => setEnableSplit(!enableSplit)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  enableSplit
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-[#12161D] text-[#828E9E] border border-[#232B36]"
                }`}
              >
                {enableSplit ? "Active" : "Disabled"}
              </button>
            </div>
          </div>

          {/* Real-Time Metrics & Overfitting Telemetry */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#090D14] border border-[#1E2638] shadow-xl space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#161D2A]">
              <span className="font-semibold text-[#F8FAFC] text-sm">Performance Metrics</span>
              <span className="text-[10px] font-mono text-[#828E9E]">Exact Least-Squares</span>
            </div>

            {/* Split Comparison Cards */}
            {enableSplit && model.testMetrics ? (
              <div className="grid grid-cols-2 gap-2.5">
                {/* Training Set Card */}
                <div className="p-3 rounded-xl bg-[#0F1420] border border-[#1E2638] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#3B82F6] flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                      Training Set
                    </span>
                    <span className="text-[10px] font-mono text-[#828E9E]">
                      {model.trainMetrics.count} pts
                    </span>
                  </div>
                  <div className="space-y-1 font-mono text-xs tabular-nums">
                    <div className="flex justify-between">
                      <span className="text-[#828E9E]">MSE:</span>
                      <span className="font-bold text-[#F8FAFC]">{model.trainMetrics.mse}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#828E9E]">MAE:</span>
                      <span className="text-[#F8FAFC]">{model.trainMetrics.mae}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#828E9E]">R²:</span>
                      <span className="font-bold text-emerald-400">
                        {model.trainMetrics.r2 !== null ? model.trainMetrics.r2 : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Testing Set Card (Held-Out) */}
                <div className="p-3 rounded-xl bg-[#0F1420] border border-[#1E2638] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#F59E0B] flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                      Testing Set
                    </span>
                    <span className="text-[10px] font-mono text-[#828E9E]">
                      {model.testMetrics.count} pts
                    </span>
                  </div>
                  <div className="space-y-1 font-mono text-xs tabular-nums">
                    <div className="flex justify-between">
                      <span className="text-[#828E9E]">MSE:</span>
                      <span className="font-bold text-[#F8FAFC]">{model.testMetrics.mse}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#828E9E]">MAE:</span>
                      <span className="text-[#F8FAFC]">{model.testMetrics.mae}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#828E9E]">R²:</span>
                      <span className="font-bold text-amber-300">
                        {model.testMetrics.r2 !== null ? model.testMetrics.r2 : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Single Metric Summary when Split is Disabled */
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 rounded-xl bg-[#0F1420] border border-[#1E2638]">
                  <span className="text-[10px] font-medium text-[#828E9E] block">MSE</span>
                  <span className="font-mono text-base font-bold text-[#F8FAFC] tabular-nums">
                    {model.totalMetrics.mse}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#0F1420] border border-[#1E2638]">
                  <span className="text-[10px] font-medium text-[#828E9E] block">MAE</span>
                  <span className="font-mono text-base font-bold text-[#F8FAFC] tabular-nums">
                    {model.totalMetrics.mae}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#0F1420] border border-[#1E2638]">
                  <span className="text-[10px] font-medium text-[#828E9E] block">R² Score</span>
                  <span className="font-mono text-base font-bold text-emerald-400 tabular-nums">
                    {model.totalMetrics.r2 !== null ? model.totalMetrics.r2 : "N/A"}
                  </span>
                </div>
              </div>
            )}

            {/* Derived Mathematical Observations */}
            <div className="space-y-2 pt-2 border-t border-[#161D2A]">
              {observations.map((obs, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#070A0F] border border-[#1A2230] text-[11px] text-[#A7AFBB] leading-relaxed flex items-start gap-2"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-[#6C8CFF] shrink-0 mt-0.5" />
                  <span>{obs}</span>
                </div>
              ))}
            </div>
          </div>

          {/* R² Zero-Variance Definition Note */}
          <div className="p-4 rounded-2xl bg-[#0F1420] border border-[#232B36] space-y-2 text-xs">
            <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs">
              <Info className="w-4 h-4 shrink-0" />
              <span>Statistical Rigor: Zero-Variance Target Behavior</span>
            </div>
            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
              R² = 1 - (SS_res / SS_tot). If all target values are identical, the total variance SS_tot = ∑(y_i - ȳ)² = 0.
            </p>
            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
              In this degenerate edge case, dividing by zero renders $R^2$ mathematically undefined. ThinkViz explicitly reports <code className="text-[#F8FAFC] font-mono">N/A</code> rather than silently outputting misleading finite numbers.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
