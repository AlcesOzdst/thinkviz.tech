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
    <div className="w-full flex flex-col space-y-8">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-2">
            <Link href="/machine-learning" className="hover:text-white transition-colors">
              00 // MACHINE LEARNING
            </Link>
            <span>/</span>
            <span className="text-sky-400 font-bold">MODULE 02 // REGRESSION PLAYGROUND</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-mono font-bold tracking-tight text-white flex items-center gap-3">
            <span>Regression Playground</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 font-mono tracking-widest uppercase">
              LEAST SQUARES
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-2xl font-mono leading-relaxed">
            Polynomial curve fitting, residual error computation (SS_res), and test-train variance inspection via exact analytical least squares.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-3">
          {customPoints.length > 0 && (
            <button
              onClick={() => setCustomPoints([])}
              className="px-4 py-2 rounded-xl bg-[#111722] hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-white/10 hover:border-rose-500/30 text-xs font-mono font-bold flex items-center gap-2 transition-all active:scale-[0.98]"
              title="Remove custom points"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>CLEAR POINTS ({customPoints.length})</span>
            </button>
          )}

          <button
            onClick={() => setSeed(Math.floor(Math.random() * 10000))}
            className="px-4 py-2 rounded-xl bg-[#111722] hover:bg-[#1A2230] text-white border border-white/10 text-xs font-mono font-bold flex items-center gap-2 transition-all active:scale-[0.98]"
            title="Randomize data points"
          >
            <Shuffle className="w-3.5 h-3.5 text-sky-400" />
            <span>RANDOMIZE SEED</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Visualizer Stage (Left) & Controls/Metrics (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* ===================================================================
            LEFT / MAIN: Regression Cartesian Plot Canvas
            =================================================================== */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          <div className="w-full rounded-3xl bg-[#0A0E17] border border-white/10 p-6 sm:p-7 shadow-2xl flex flex-col items-center relative overflow-hidden">
            {/* Corner Crosshairs */}
            <div className="absolute top-3 left-3 text-xs font-mono text-white/20 select-none">+</div>
            <div className="absolute top-3 right-3 text-xs font-mono text-white/20 select-none">+</div>
            <div className="absolute bottom-3 left-3 text-xs font-mono text-white/20 select-none">+</div>
            <div className="absolute bottom-3 right-3 text-xs font-mono text-white/20 select-none">+</div>

            <div className="w-full flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-4 h-4 text-sky-400" />
                <h3 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
                  03 // Cartesian Regression Stage
                </h3>
              </div>
              <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
                <PlusCircle className="w-3 h-3 text-sky-400" />
                <span>CLICK CANVAS TO INJECT SAMPLES</span>
              </div>
            </div>

            {/* Stage HUD / Equation Banner */}
            <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-4 text-xs bg-[#111722] p-3 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-3 py-1 rounded-xl bg-[#0A0E17] border border-sky-400/40 text-sky-300">
                  {model.equationString}
                </span>
                <span className="text-slate-400 font-mono text-xs">
                  (Degree {degree})
                </span>
              </div>

              {/* Point Hover Coordinates */}
              {hoveredPoint ? (
                <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
                  <span className="text-slate-400">Point:</span>
                  <span className="text-white font-bold">({hoveredPoint.x}, {hoveredPoint.y})</span>
                  <span className="text-slate-400">Residual:</span>
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
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <span>Target Domain: [0, 100] × [0, 100]</span>
                </div>
              )}
            </div>

            {/* SVG Coordinate Plot Stage */}
            <div className="w-full aspect-square max-w-[500px] flex items-center justify-center relative bg-[#070A0F] rounded-2xl border border-white/10 p-2 shadow-inner">
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
            <div className="w-full flex flex-wrap items-center justify-center gap-6 mt-4 pt-4 border-t border-white/5 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-sky-500 shadow-sm" />
                <span className="text-white font-bold text-xs">
                  TRAIN ({model.trainMetrics.count})
                </span>
              </div>

              {enableSplit && model.testMetrics && (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-400 shadow-sm" />
                  <span className="text-amber-300 font-bold text-xs">
                    TEST ({model.testMetrics.count})
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="w-5 h-0.5 bg-sky-400 rounded-full" />
                <span className="text-sky-300 font-bold text-xs">
                  FITTED MODEL
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-5 h-0.5 border-b border-dashed border-slate-500" />
                <span className="text-slate-400 text-xs">
                  RESIDUAL (y − ŷ)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================================
            RIGHT: Hyperparameters, Numerical Metrics & Overfitting Telemetry
            =================================================================== */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          
          {/* Regression Parameters Deck */}
          <div className="p-6 sm:p-7 rounded-3xl bg-[#0A0E17] border border-white/10 shadow-2xl space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal className="w-4 h-4 text-sky-400" />
                <h2 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
                  01 // Polynomial Model Spec
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-400">Order & Dynamics</span>
            </div>

            {/* Degree Selector (1 - 5) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-slate-400">POLYNOMIAL DEGREE (d)</span>
                <span className="font-mono font-bold text-sky-400 text-xs px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">
                  {degree === 1 ? "1 // LINEAR" : degree === 2 ? "2 // QUADRATIC" : degree === 3 ? "3 // CUBIC" : degree === 4 ? "4 // QUARTIC" : "5 // QUINTIC"}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDegree(d)}
                    className={`py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                      degree === d
                        ? "bg-[#1A2230] text-white border border-sky-400/40 shadow-sm"
                        : "bg-[#111722] text-slate-400 hover:text-white border border-white/10"
                    }`}
                  >
                    d = {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Dataset Type Selector */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-slate-400 block">UNDERLYING SYNTHETIC FUNCTION</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "linear", label: "Linear Trend" },
                  { id: "quadratic", label: "Parabolic Curve" },
                  { id: "sine", label: "Harmonic Wave" },
                  { id: "noisy_cluster", label: "Sigmoid Cluster" },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setDatasetType(type.id as RegressionDatasetType)}
                    className={`py-2 px-3 rounded-xl text-xs font-mono transition-all text-left ${
                      datasetType === type.id
                        ? "bg-[#1A2230] text-white border border-sky-400/40 font-bold"
                        : "bg-[#111722] text-slate-400 hover:text-white border border-white/10"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Noise Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">GAUSSIAN NOISE (σ)</span>
                <span className="font-bold text-white px-2 py-0.5 rounded bg-[#111722] border border-white/10">{noise}</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={noise}
                onChange={(e) => setNoise(Number(e.target.value))}
                className="w-full h-2 bg-[#111722] rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
            </div>

            {/* Sample Size Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">SAMPLE DENSITY (N)</span>
                <span className="font-bold text-white px-2 py-0.5 rounded bg-[#111722] border border-white/10">{pointCount}</span>
              </div>
              <input
                type="range"
                min="15"
                max="80"
                step="5"
                value={pointCount}
                onChange={(e) => setPointCount(Number(e.target.value))}
                className="w-full h-2 bg-[#111722] rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
            </div>

            {/* Train / Test Split Toggle */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5 font-mono">
              <div className="flex items-center gap-2">
                <Split className="w-4 h-4 text-sky-400" />
                <span className="text-slate-400 text-xs">TRAIN / TEST SPLIT (75% / 25%)</span>
              </div>
              <button
                onClick={() => setEnableSplit(!enableSplit)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  enableSplit
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-[#111722] text-slate-400 border border-white/10"
                }`}
              >
                {enableSplit ? "ACTIVE" : "DISABLED"}
              </button>
            </div>
          </div>

          {/* Real-Time Metrics & Overfitting Telemetry */}
          <div className="p-6 sm:p-7 rounded-3xl bg-[#0A0E17] border border-white/10 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
                02 // Residual Telemetry & Gauges
              </h3>
              <span className="text-xs font-mono text-slate-400">Analytical Least Squares</span>
            </div>

            {/* Split Comparison Cards */}
            {enableSplit && model.testMetrics ? (
              <div className="grid grid-cols-2 gap-3">
                {/* Training Set Card */}
                <div className="p-4 rounded-2xl bg-[#111722] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-xs font-mono font-bold text-sky-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-400" />
                      TRAIN
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {model.trainMetrics.count} PTS
                    </span>
                  </div>
                  <div className="space-y-1.5 font-mono text-xs tabular-nums">
                    <div className="flex justify-between">
                      <span className="text-slate-400">MSE:</span>
                      <span className="font-bold text-white">{model.trainMetrics.mse}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">MAE:</span>
                      <span className="text-slate-300">{model.trainMetrics.mae}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">R²:</span>
                      <span className="font-bold text-emerald-400">
                        {model.trainMetrics.r2 !== null ? model.trainMetrics.r2 : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Testing Set Card (Held-Out) */}
                <div className="p-4 rounded-2xl bg-[#111722] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      TEST
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {model.testMetrics.count} PTS
                    </span>
                  </div>
                  <div className="space-y-1.5 font-mono text-xs tabular-nums">
                    <div className="flex justify-between">
                      <span className="text-slate-400">MSE:</span>
                      <span className="font-bold text-white">{model.testMetrics.mse}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">MAE:</span>
                      <span className="text-slate-300">{model.testMetrics.mae}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">R²:</span>
                      <span className="font-bold text-amber-300">
                        {model.testMetrics.r2 !== null ? model.testMetrics.r2 : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Single Metric Summary when Split is Disabled */
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-[#111722] border border-white/10">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">MSE</span>
                  <span className="font-mono text-xl font-bold text-white tabular-nums mt-1 block">
                    {model.totalMetrics.mse}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-[#111722] border border-white/10">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">MAE</span>
                  <span className="font-mono text-xl font-bold text-white tabular-nums mt-1 block">
                    {model.totalMetrics.mae}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-[#111722] border border-white/10">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">R² Score</span>
                  <span className="font-mono text-xl font-bold text-emerald-400 tabular-nums mt-1 block">
                    {model.totalMetrics.r2 !== null ? model.totalMetrics.r2 : "N/A"}
                  </span>
                </div>
              </div>
            )}

            {/* Derived Mathematical Observations */}
            <div className="space-y-2 pt-3 border-t border-white/5">
              {observations.map((obs, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-[#111722] border border-white/10 text-xs font-mono text-slate-300 leading-relaxed flex items-start gap-2.5"
                >
                  <TrendingUp className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span>{obs}</span>
                </div>
              ))}
            </div>
          </div>

          {/* R² Zero-Variance Definition Note */}
          <div className="p-6 rounded-3xl bg-[#0A0E17] border border-white/10 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-sky-400 font-mono font-bold text-xs uppercase tracking-wider">
              <Info className="w-4 h-4 shrink-0" />
              <span>04 // Statistical Rigor: Zero-Variance Target Behavior</span>
            </div>
            <p className="text-xs text-slate-400 font-mono leading-relaxed">
              R² = 1 − (SS_res / SS_tot). If all target values are identical, total variance SS_tot = ∑(y_i − ȳ)² = 0.
            </p>
            <p className="text-xs text-slate-400 font-mono leading-relaxed">
              In this degenerate edge case, dividing by zero renders R² mathematically undefined. ThinkViz explicitly reports <code className="text-white font-mono bg-[#111722] px-1.5 py-0.5 rounded border border-white/10">N/A</code> rather than silently outputting misleading finite numbers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
