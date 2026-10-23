"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ConfusionCounts,
  ConfusionPreset,
} from "@/lib/ml/types.ts";
import {
  calculateConfusionMetrics,
  validateCount,
  generateMatrixObservations,
  CONFUSION_PRESETS,
} from "@/lib/ml/confusionMatrix.ts";
import {
  Grid,
  Info,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Plus,
  Minus,
  Layers,
  Activity,
  ShieldAlert,
} from "lucide-react";

type HighlightMetric = "accuracy" | "precision" | "recall" | "specificity" | "f1Score" | null;

export function ConfusionMatrixSimulator() {
  // Input Counts State
  const [counts, setCounts] = useState<ConfusionCounts>({
    tp: 45,
    fp: 10,
    tn: 40,
    fn: 5,
  });

  // String buffer for direct input editing
  const [inputStrings, setInputStrings] = useState<Record<keyof ConfusionCounts, string>>({
    tp: "45",
    fp: "10",
    tn: "40",
    fn: "5",
  });

  const [inputErrors, setInputErrors] = useState<Partial<Record<keyof ConfusionCounts, string>>>({});
  const [activePresetId, setActivePresetId] = useState<string>("balanced");
  const [hoveredMetric, setHoveredMetric] = useState<HighlightMetric>(null);

  // Quick increment/decrement helper
  const adjustCount = (field: keyof ConfusionCounts, delta: number) => {
    const current = counts[field];
    const nextVal = Math.max(0, current + delta);
    setCounts((prev) => ({ ...prev, [field]: nextVal }));
    setInputStrings((prev) => ({ ...prev, [field]: String(nextVal) }));
    setInputErrors((prev) => ({ ...prev, [field]: undefined }));
    setActivePresetId("custom");
  };

  // Handle direct input change
  const handleInputChange = (field: keyof ConfusionCounts, value: string) => {
    setInputStrings((prev) => ({ ...prev, [field]: value }));
    const check = validateCount(value);

    if (check.isValid) {
      setInputErrors((prev) => ({ ...prev, [field]: undefined }));
      setCounts((prev) => ({ ...prev, [field]: check.sanitized }));
      setActivePresetId("custom");
    } else {
      setInputErrors((prev) => ({ ...prev, [field]: check.error }));
    }
  };

  // Preset Selection Handler
  const handleSelectPreset = (preset: ConfusionPreset) => {
    setActivePresetId(preset.id);
    setCounts(preset.counts);
    setInputStrings({
      tp: String(preset.counts.tp),
      fp: String(preset.counts.fp),
      tn: String(preset.counts.tn),
      fn: String(preset.counts.fn),
    });
    setInputErrors({});
  };

  // Reset to default
  const handleReset = () => {
    const defaultPreset = CONFUSION_PRESETS[0];
    handleSelectPreset(defaultPreset);
  };

  // Compute Metrics from Validated Counts
  const metrics = useMemo(() => {
    return calculateConfusionMetrics(counts);
  }, [counts]);

  // Derived Pedagogical Observations
  const observations = useMemo(() => {
    return generateMatrixObservations(counts, metrics);
  }, [counts, metrics]);

  // Helper percentage formatter
  const formatPct = (val: number | null) => {
    if (val === null) return "N/A";
    return `${(val * 100).toFixed(1)}%`;
  };

  const total = metrics.total;
  const maxCount = Math.max(counts.tp, counts.fp, counts.tn, counts.fn, 1);

  // Proportions for visual breakdown bar
  const tpPct = total > 0 ? (counts.tp / total) * 100 : 0;
  const fnPct = total > 0 ? (counts.fn / total) * 100 : 0;
  const fpPct = total > 0 ? (counts.fp / total) * 100 : 0;
  const tnPct = total > 0 ? (counts.tn / total) * 100 : 0;

  const actualPosPct = total > 0 ? ((counts.tp + counts.fn) / total) * 100 : 0;
  const actualNegPct = total > 0 ? ((counts.tn + counts.fp) / total) * 100 : 0;

  // Determine whether each cell is highlighted by hovered metric
  const isCellActive = (cell: keyof ConfusionCounts) => {
    if (!hoveredMetric) return true;
    switch (hoveredMetric) {
      case "accuracy":
        return cell === "tp" || cell === "tn";
      case "precision":
        return cell === "tp" || cell === "fp";
      case "recall":
        return cell === "tp" || cell === "fn";
      case "specificity":
        return cell === "tn" || cell === "fp";
      case "f1Score":
        return cell === "tp" || cell === "fp" || cell === "fn";
      default:
        return true;
    }
  };

  // Dynamic slider upper bound
  const getSliderMax = (val: number) => Math.max(100, Math.ceil(val * 1.3));

  return (
    <div className="w-full flex flex-col space-y-8">
      {/* ===================================================================
          1. HEADER: CoreNode AI Architectural Header with Precision Accents
          =================================================================== */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-[#0A0E17] border border-white/10 shadow-2xl overflow-hidden">
        {/* Subtle decorative crosshairs */}
        <div className="absolute top-3 left-4 text-white/30 font-mono text-sm select-none">+</div>
        <div className="absolute top-3 right-4 text-white/30 font-mono text-sm select-none">+</div>
        <div className="absolute bottom-3 left-4 text-white/30 font-mono text-sm select-none">+</div>
        <div className="absolute bottom-3 right-4 text-white/30 font-mono text-sm select-none">+</div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-sky-400 uppercase">
              <Link href="/machine-learning" className="hover:text-white transition-colors">
                Machine Learning
              </Link>
              <span className="text-white/20">/</span>
              <span>Module 03</span>
              <span className="text-white/20">/</span>
              <span className="text-slate-200">Evaluation Instrument</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Confusion Matrix Simulator
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
              Real-time classification telemetry. Dial values smoothly, inspect error trade-offs, and trace how precision, recall, and F1-score are derived from ground truth samples.
            </p>
          </div>

          {/* Reset Action */}
          <button
            onClick={handleReset}
            className="self-start md:self-center px-4 py-2.5 rounded-xl bg-[#141B28] hover:bg-[#1E283C] text-white border border-white/15 text-xs sm:text-sm font-semibold tracking-wide flex items-center gap-2.5 transition-all shadow-md active:scale-[0.98]"
            title="Reset to default balanced preset"
          >
            <RotateCcw className="w-4 h-4 text-sky-400" />
            <span>Reset Matrix</span>
          </button>
        </div>
      </div>

      {/* ===================================================================
          2. PRESET BENCHMARKS: Clean Pill Navigation
          =================================================================== */}
      <div className="p-6 rounded-3xl bg-[#0A0E17] border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
              01 // Preset Benchmarks
            </span>
          </div>
          <span className="text-xs text-slate-400">
            Select a benchmark dataset to inspect real-world classification patterns
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {CONFUSION_PRESETS.map((p) => {
            const isActive = activePresetId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2.5 ${
                  isActive
                    ? "bg-sky-500/20 text-sky-300 border border-sky-400/60 shadow-lg font-semibold"
                    : "bg-[#111722] text-slate-300 hover:text-white hover:bg-[#182030] border border-white/10"
                }`}
              >
                {isActive && <span className="w-2 h-2 rounded-full bg-sky-400" />}
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===================================================================
          3. POPULATION STRIP: Clean Visual Proportion Bar
          =================================================================== */}
      <div className="p-6 rounded-3xl bg-[#0A0E17] border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
              02 // Dataset Population Breakdown
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-mono tabular-nums">
            <span className="text-emerald-400 font-semibold">
              Actual Positives: <strong>{metrics.actualPositive}</strong> ({actualPosPct.toFixed(1)}%)
            </span>
            <span className="text-white/20">•</span>
            <span className="text-sky-400 font-semibold">
              Actual Negatives: <strong>{metrics.actualNegative}</strong> ({actualNegPct.toFixed(1)}%)
            </span>
            <span className="text-white/20">•</span>
            <span className="text-white font-bold">
              Total N: <strong>{total.toLocaleString()}</strong>
            </span>
          </div>
        </div>

        {/* Multi-Segment Horizontal Distribution Bar */}
        <div className="w-full h-6 rounded-xl overflow-hidden bg-[#070A0F] border border-white/10 flex shadow-inner">
          <div
            style={{ width: `${tpPct}%` }}
            className="h-full bg-emerald-500 transition-all duration-300 hover:opacity-90"
            title={`True Positives (TP): ${counts.tp} (${tpPct.toFixed(1)}%)`}
          />
          <div
            style={{ width: `${fnPct}%` }}
            className="h-full bg-rose-500 transition-all duration-300 hover:opacity-90"
            title={`False Negatives (FN): ${counts.fn} (${fnPct.toFixed(1)}%)`}
          />
          <div
            style={{ width: `${fpPct}%` }}
            className="h-full bg-amber-500 transition-all duration-300 hover:opacity-90"
            title={`False Positives (FP): ${counts.fp} (${fpPct.toFixed(1)}%)`}
          />
          <div
            style={{ width: `${tnPct}%` }}
            className="h-full bg-sky-500 transition-all duration-300 hover:opacity-90"
            title={`True Negatives (TN): ${counts.tn} (${tnPct.toFixed(1)}%)`}
          />
        </div>

        {/* High-Contrast Legend Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#111722] border border-white/5">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-xs sm:text-sm text-slate-300 font-medium">True Positives:</span>
            <strong className="text-sm sm:text-base text-white font-mono ml-auto">{counts.tp}</strong>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#111722] border border-white/5">
            <span className="w-3.5 h-3.5 rounded-full bg-rose-500 shrink-0" />
            <span className="text-xs sm:text-sm text-slate-300 font-medium">False Negatives:</span>
            <strong className="text-sm sm:text-base text-white font-mono ml-auto">{counts.fn}</strong>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#111722] border border-white/5">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-500 shrink-0" />
            <span className="text-xs sm:text-sm text-slate-300 font-medium">False Positives:</span>
            <strong className="text-sm sm:text-base text-white font-mono ml-auto">{counts.fp}</strong>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#111722] border border-white/5">
            <span className="w-3.5 h-3.5 rounded-full bg-sky-500 shrink-0" />
            <span className="text-xs sm:text-sm text-slate-300 font-medium">True Negatives:</span>
            <strong className="text-sm sm:text-base text-white font-mono ml-auto">{counts.tn}</strong>
          </div>
        </div>
      </div>

      {/* ===================================================================
          4. WORKBENCH: Perfectly Aligned Matrix (Left) & Telemetry (Right)
          =================================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

        {/* =================================================================
            LEFT: Architectural Precision 2x2 Matrix
            ================================================================= */}
        <div className="xl:col-span-7 flex flex-col space-y-4">
          <div className="rounded-3xl bg-[#0A0E17] border border-white/10 shadow-2xl p-6 sm:p-7 space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <Grid className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
                  03 // Classification Matrix
                </span>
              </div>
              <span className="text-xs font-mono text-sky-300 bg-sky-500/10 px-3 py-1 rounded-lg border border-sky-500/30">
                Heatmap Density Active
              </span>
            </div>

            {/* Matrix Frame with Perfect Column Alignment (No clipping, No horizontal scroll) */}
            <div className="w-full flex flex-col space-y-4">
              
              {/* Column Headers (Predictions) */}
              <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm font-semibold">
                <div className="w-24 sm:w-28 shrink-0" />
                <div className="flex-1 min-w-0 py-2.5 px-3 rounded-xl bg-[#111722] border border-sky-400/30 text-center font-mono">
                  <div className="text-xs sm:text-sm font-bold text-sky-300 tracking-wider">PREDICTED (+)</div>
                  <div className="text-[10px] text-slate-400 font-medium">Model Positive</div>
                </div>
                <div className="flex-1 min-w-0 py-2.5 px-3 rounded-xl bg-[#111722] border border-slate-600/30 text-center font-mono">
                  <div className="text-xs sm:text-sm font-bold text-slate-300 tracking-wider">PREDICTED (−)</div>
                  <div className="text-[10px] text-slate-400 font-medium">Model Negative</div>
                </div>
                <div className="w-14 sm:w-16 shrink-0 py-2.5 rounded-xl bg-[#0E131E] border border-white/5 text-center font-mono flex flex-col justify-center">
                  <div className="text-xs font-bold text-slate-400 uppercase">TOTAL</div>
                  <div className="text-[10px] text-slate-500 font-medium">Row Sum</div>
                </div>
              </div>

              {/* ROW 1: ACTUAL POSITIVE */}
              <div className="flex items-stretch gap-3 sm:gap-4">
                {/* Row Header */}
                <div className="w-24 sm:w-28 shrink-0 p-3 sm:p-4 rounded-2xl bg-[#111722] border border-emerald-500/30 flex flex-col justify-between text-left">
                  <div>
                    <span className="text-[11px] sm:text-xs font-mono font-bold text-emerald-400 tracking-wider uppercase block">
                      ACTUAL (+)
                    </span>
                    <span className="text-sm sm:text-base font-bold text-white mt-1 block">
                      Positive
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">Ground Truth</span>
                  </div>
                  <div className="pt-2 border-t border-emerald-500/20 text-[10px] font-mono text-emerald-400/80 uppercase tracking-wider">
                    Condition +
                  </div>
                </div>

                {/* QUADRANT 1: True Positive (TP) */}
                <div
                  style={{
                    backgroundColor: `rgba(16, 185, 129, ${0.08 + 0.28 * (counts.tp / maxCount)})`,
                  }}
                  className={`flex-1 min-w-0 p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                    hoveredMetric && isCellActive("tp")
                      ? "border-emerald-400 ring-4 ring-emerald-400/40 shadow-2xl scale-[1.01]"
                      : hoveredMetric && !isCellActive("tp")
                      ? "opacity-25 border-white/5"
                      : "border-emerald-500/30 hover:border-emerald-400/70"
                  }`}
                >
                  {/* Top Meta Bar */}
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-xs font-extrabold border border-emerald-500/30">
                        TP
                      </span>
                      <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        Hit
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#070A0F] text-emerald-300 border border-emerald-500/30 tabular-nums">
                      {tpPct.toFixed(1)}%
                    </span>
                  </div>

                  {/* Title & Coordinate */}
                  <div className="pt-2">
                    <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                      True Positive
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Actual (+) · Pred (+)
                    </p>
                  </div>

                  {/* Prominent Number */}
                  <div className="my-2.5 flex items-baseline justify-between">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={inputStrings.tp}
                      onChange={(e) => handleInputChange("tp", e.target.value)}
                      className="w-full bg-transparent text-left text-3xl sm:text-4xl lg:text-5xl font-mono font-black text-emerald-300 focus:outline-none tracking-tight tabular-nums"
                    />
                  </div>

                  {/* Smooth Tactile Slider + Steppers */}
                  <div className="space-y-1.5 pt-2 border-t border-emerald-500/20">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => adjustCount("tp", -1)}
                        className="w-7 h-7 rounded-lg bg-[#070A0F] hover:bg-[#162030] text-slate-300 hover:text-white border border-white/10 flex items-center justify-center transition-colors shrink-0 shadow-sm"
                        title="Decrement"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="range"
                        min="0"
                        max={getSliderMax(counts.tp)}
                        value={counts.tp}
                        onChange={(e) => adjustCount("tp", Number(e.target.value) - counts.tp)}
                        className="w-full h-1.5 bg-[#070A0F] rounded-lg appearance-none cursor-pointer accent-emerald-400"
                      />
                      <button
                        onClick={() => adjustCount("tp", 1)}
                        className="w-7 h-7 rounded-lg bg-[#070A0F] hover:bg-[#162030] text-slate-300 hover:text-white border border-white/10 flex items-center justify-center transition-colors shrink-0 shadow-sm"
                        title="Increment"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      Correct detection of ground truth positive cases.
                    </p>
                  </div>
                </div>

                {/* QUADRANT 2: False Negative (FN) */}
                <div
                  style={{
                    backgroundColor: `rgba(244, 63, 94, ${0.08 + 0.28 * (counts.fn / maxCount)})`,
                  }}
                  className={`flex-1 min-w-0 p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                    hoveredMetric && isCellActive("fn")
                      ? "border-rose-400 ring-4 ring-rose-400/40 shadow-2xl scale-[1.01]"
                      : hoveredMetric && !isCellActive("fn")
                      ? "opacity-25 border-white/5"
                      : "border-rose-500/30 hover:border-rose-400/70"
                  }`}
                >
                  {/* Top Meta Bar */}
                  <div className="flex items-center justify-between border-b border-rose-500/20 pb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-mono text-xs font-extrabold border border-rose-500/30">
                        FN
                      </span>
                      <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                        Miss
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#070A0F] text-rose-300 border border-rose-500/30 tabular-nums">
                      {fnPct.toFixed(1)}%
                    </span>
                  </div>

                  {/* Title & Coordinate */}
                  <div className="pt-2">
                    <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                      False Negative
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Actual (+) · Pred (−)
                    </p>
                  </div>

                  {/* Prominent Number */}
                  <div className="my-2.5 flex items-baseline justify-between">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={inputStrings.fn}
                      onChange={(e) => handleInputChange("fn", e.target.value)}
                      className="w-full bg-transparent text-left text-3xl sm:text-4xl lg:text-5xl font-mono font-black text-rose-300 focus:outline-none tracking-tight tabular-nums"
                    />
                  </div>

                  {/* Smooth Tactile Slider + Steppers */}
                  <div className="space-y-1.5 pt-2 border-t border-rose-500/20">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => adjustCount("fn", -1)}
                        className="w-7 h-7 rounded-lg bg-[#070A0F] hover:bg-[#162030] text-slate-300 hover:text-white border border-white/10 flex items-center justify-center transition-colors shrink-0 shadow-sm"
                        title="Decrement"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="range"
                        min="0"
                        max={getSliderMax(counts.fn)}
                        value={counts.fn}
                        onChange={(e) => adjustCount("fn", Number(e.target.value) - counts.fn)}
                        className="w-full h-1.5 bg-[#070A0F] rounded-lg appearance-none cursor-pointer accent-rose-400"
                      />
                      <button
                        onClick={() => adjustCount("fn", 1)}
                        className="w-7 h-7 rounded-lg bg-[#070A0F] hover:bg-[#162030] text-slate-300 hover:text-white border border-white/10 flex items-center justify-center transition-colors shrink-0 shadow-sm"
                        title="Increment"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-rose-200 leading-snug">
                      Type II Error: Ground truth missed by model.
                    </p>
                  </div>
                </div>

                {/* Row Total */}
                <div className="w-14 sm:w-16 shrink-0 p-3 rounded-2xl bg-[#111722] border border-white/10 flex flex-col items-center justify-between font-mono text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">P Sum</span>
                  <span className="text-lg sm:text-xl font-black text-white tabular-nums my-auto">{metrics.actualPositive}</span>
                  <span className="text-[10px] text-emerald-400 font-bold">{actualPosPct.toFixed(0)}%</span>
                </div>
              </div>

              {/* ROW 2: ACTUAL NEGATIVE */}
              <div className="flex items-stretch gap-3 sm:gap-4">
                {/* Row Header */}
                <div className="w-24 sm:w-28 shrink-0 p-3 sm:p-4 rounded-2xl bg-[#111722] border border-slate-600/30 flex flex-col justify-between text-left">
                  <div>
                    <span className="text-[11px] sm:text-xs font-mono font-bold text-slate-400 tracking-wider uppercase block">
                      ACTUAL (−)
                    </span>
                    <span className="text-sm sm:text-base font-bold text-white mt-1 block">
                      Negative
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">Ground Truth</span>
                  </div>
                  <div className="pt-2 border-t border-white/10 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    Condition −
                  </div>
                </div>

                {/* QUADRANT 3: False Positive (FP) */}
                <div
                  style={{
                    backgroundColor: `rgba(245, 158, 11, ${0.08 + 0.28 * (counts.fp / maxCount)})`,
                  }}
                  className={`flex-1 min-w-0 p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                    hoveredMetric && isCellActive("fp")
                      ? "border-amber-400 ring-4 ring-amber-400/40 shadow-2xl scale-[1.01]"
                      : hoveredMetric && !isCellActive("fp")
                      ? "opacity-25 border-white/5"
                      : "border-amber-500/30 hover:border-amber-400/70"
                  }`}
                >
                  {/* Top Meta Bar */}
                  <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-xs font-extrabold border border-amber-500/30">
                        FP
                      </span>
                      <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                        Alarm
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#070A0F] text-amber-300 border border-amber-500/30 tabular-nums">
                      {fpPct.toFixed(1)}%
                    </span>
                  </div>

                  {/* Title & Coordinate */}
                  <div className="pt-2">
                    <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                      False Positive
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Actual (−) · Pred (+)
                    </p>
                  </div>

                  {/* Prominent Number */}
                  <div className="my-2.5 flex items-baseline justify-between">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={inputStrings.fp}
                      onChange={(e) => handleInputChange("fp", e.target.value)}
                      className="w-full bg-transparent text-left text-3xl sm:text-4xl lg:text-5xl font-mono font-black text-amber-300 focus:outline-none tracking-tight tabular-nums"
                    />
                  </div>

                  {/* Smooth Tactile Slider + Steppers */}
                  <div className="space-y-1.5 pt-2 border-t border-amber-500/20">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => adjustCount("fp", -1)}
                        className="w-7 h-7 rounded-lg bg-[#070A0F] hover:bg-[#162030] text-slate-300 hover:text-white border border-white/10 flex items-center justify-center transition-colors shrink-0 shadow-sm"
                        title="Decrement"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="range"
                        min="0"
                        max={getSliderMax(counts.fp)}
                        value={counts.fp}
                        onChange={(e) => adjustCount("fp", Number(e.target.value) - counts.fp)}
                        className="w-full h-1.5 bg-[#070A0F] rounded-lg appearance-none cursor-pointer accent-amber-400"
                      />
                      <button
                        onClick={() => adjustCount("fp", 1)}
                        className="w-7 h-7 rounded-lg bg-[#070A0F] hover:bg-[#162030] text-slate-300 hover:text-white border border-white/10 flex items-center justify-center transition-colors shrink-0 shadow-sm"
                        title="Increment"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-amber-200 leading-snug">
                      Type I Error: False alarm on negative sample.
                    </p>
                  </div>
                </div>

                {/* QUADRANT 4: True Negative (TN) */}
                <div
                  style={{
                    backgroundColor: `rgba(56, 189, 248, ${0.08 + 0.28 * (counts.tn / maxCount)})`,
                  }}
                  className={`flex-1 min-w-0 p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                    hoveredMetric && isCellActive("tn")
                      ? "border-sky-400 ring-4 ring-sky-400/40 shadow-2xl scale-[1.01]"
                      : hoveredMetric && !isCellActive("tn")
                      ? "opacity-25 border-white/5"
                      : "border-sky-500/30 hover:border-sky-400/70"
                  }`}
                >
                  {/* Top Meta Bar */}
                  <div className="flex items-center justify-between border-b border-sky-500/20 pb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded-md bg-sky-500/20 text-sky-300 font-mono text-xs font-extrabold border border-sky-500/30">
                        TN
                      </span>
                      <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20">
                        Reject
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#070A0F] text-sky-300 border border-sky-500/30 tabular-nums">
                      {tnPct.toFixed(1)}%
                    </span>
                  </div>

                  {/* Title & Coordinate */}
                  <div className="pt-2">
                    <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                      True Negative
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Actual (−) · Pred (−)
                    </p>
                  </div>

                  {/* Prominent Number */}
                  <div className="my-2.5 flex items-baseline justify-between">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={inputStrings.tn}
                      onChange={(e) => handleInputChange("tn", e.target.value)}
                      className="w-full bg-transparent text-left text-3xl sm:text-4xl lg:text-5xl font-mono font-black text-sky-300 focus:outline-none tracking-tight tabular-nums"
                    />
                  </div>

                  {/* Smooth Tactile Slider + Steppers */}
                  <div className="space-y-1.5 pt-2 border-t border-sky-500/20">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => adjustCount("tn", -1)}
                        className="w-7 h-7 rounded-lg bg-[#070A0F] hover:bg-[#162030] text-slate-300 hover:text-white border border-white/10 flex items-center justify-center transition-colors shrink-0 shadow-sm"
                        title="Decrement"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="range"
                        min="0"
                        max={getSliderMax(counts.tn)}
                        value={counts.tn}
                        onChange={(e) => adjustCount("tn", Number(e.target.value) - counts.tn)}
                        className="w-full h-1.5 bg-[#070A0F] rounded-lg appearance-none cursor-pointer accent-sky-400"
                      />
                      <button
                        onClick={() => adjustCount("tn", 1)}
                        className="w-7 h-7 rounded-lg bg-[#070A0F] hover:bg-[#162030] text-slate-300 hover:text-white border border-white/10 flex items-center justify-center transition-colors shrink-0 shadow-sm"
                        title="Increment"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-sky-200 leading-snug">
                      Correct rejection of inactive negative cases.
                    </p>
                  </div>
                </div>

                {/* Row Total */}
                <div className="w-14 sm:w-16 shrink-0 p-3 rounded-2xl bg-[#111722] border border-white/10 flex flex-col items-center justify-between font-mono text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">N Sum</span>
                  <span className="text-lg sm:text-xl font-black text-white tabular-nums my-auto">{metrics.actualNegative}</span>
                  <span className="text-[10px] text-sky-400 font-bold">{actualNegPct.toFixed(0)}%</span>
                </div>
              </div>

              {/* Column Totals Footer */}
              <div className="flex items-stretch gap-3 sm:gap-4 pt-1 font-mono">
                <div className="w-24 sm:w-28 shrink-0 p-3 rounded-2xl bg-[#0E131E] border border-white/5 flex flex-col justify-center text-left">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    PRED. SUM
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Marginals</span>
                </div>
                <div className="flex-1 min-w-0 p-3 sm:p-3.5 rounded-2xl bg-[#111722] border border-sky-400/30 flex items-center justify-between px-4">
                  <div>
                    <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider block">Pred (+)</span>
                    <span className="text-[10px] text-slate-400">TP + FP</span>
                  </div>
                  <span className="text-xl sm:text-2xl font-black text-sky-300 tabular-nums">
                    {metrics.predictedPositive}
                  </span>
                </div>
                <div className="flex-1 min-w-0 p-3 sm:p-3.5 rounded-2xl bg-[#111722] border border-slate-600/30 flex items-center justify-between px-4">
                  <div>
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">Pred (−)</span>
                    <span className="text-[10px] text-slate-400">FN + TN</span>
                  </div>
                  <span className="text-xl sm:text-2xl font-black text-slate-200 tabular-nums">
                    {metrics.predictedNegative}
                  </span>
                </div>
                <div className="w-14 sm:w-16 shrink-0 p-3 rounded-2xl bg-sky-500/20 border border-sky-400/50 flex flex-col items-center justify-center">
                  <span className="text-[10px] text-sky-300 font-bold uppercase">Total N</span>
                  <span className="text-base sm:text-lg font-black text-sky-200 tabular-nums mt-0.5">{total}</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* =================================================================
            RIGHT: Performance Telemetry (CoreNode AI Style)
            ================================================================= */}
        <div className="xl:col-span-5 flex flex-col space-y-6">
          
          {/* Classification Telemetry Panel */}
          <div className="p-6 sm:p-7 rounded-3xl bg-[#0A0E17] border border-white/10 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
                  04 // Performance Telemetry
                </span>
              </div>
              <span className="text-xs text-slate-400">
                Hover to trace formula
              </span>
            </div>

            <div className="space-y-3.5">
              
              {/* Telemetry 1: Accuracy */}
              <div
                onMouseEnter={() => setHoveredMetric("accuracy")}
                onMouseLeave={() => setHoveredMetric(null)}
                className={`p-4 sm:p-4.5 rounded-2xl border transition-all cursor-pointer ${
                  hoveredMetric === "accuracy"
                    ? "bg-[#141C2B] border-sky-400 ring-4 ring-sky-400/30 shadow-2xl"
                    : "bg-[#111722] border-white/5 hover:border-white/15"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm sm:text-base">Accuracy</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[#070A0F] text-slate-300 border border-white/10">
                      (TP + TN) / N
                    </span>
                  </div>
                  <span className="font-mono text-2xl sm:text-3xl font-black text-white tabular-nums">
                    {formatPct(metrics.accuracy)}
                  </span>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-full h-2.5 rounded-full bg-[#070A0F] border border-white/10 overflow-hidden">
                  <div
                    style={{ width: `${(metrics.accuracy ?? 0) * 100}%` }}
                    className="h-full bg-gradient-to-r from-blue-500 to-sky-400 rounded-full transition-all duration-300"
                  />
                </div>
              </div>

              {/* Telemetry 2: Precision */}
              <div
                onMouseEnter={() => setHoveredMetric("precision")}
                onMouseLeave={() => setHoveredMetric(null)}
                className={`p-4 sm:p-4.5 rounded-2xl border transition-all cursor-pointer ${
                  hoveredMetric === "precision"
                    ? "bg-[#141C2B] border-sky-400 ring-4 ring-sky-400/30 shadow-2xl"
                    : "bg-[#111722] border-white/5 hover:border-white/15"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sky-400 text-sm sm:text-base">Precision</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[#070A0F] text-slate-300 border border-white/10">
                      TP / (TP + FP)
                    </span>
                  </div>
                  <span className="font-mono text-2xl sm:text-3xl font-black text-sky-400 tabular-nums">
                    {formatPct(metrics.precision)}
                  </span>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-full h-2.5 rounded-full bg-[#070A0F] border border-white/10 overflow-hidden">
                  <div
                    style={{ width: `${(metrics.precision ?? 0) * 100}%` }}
                    className="h-full bg-sky-400 rounded-full transition-all duration-300"
                  />
                </div>
              </div>

              {/* Telemetry 3: Recall / Sensitivity */}
              <div
                onMouseEnter={() => setHoveredMetric("recall")}
                onMouseLeave={() => setHoveredMetric(null)}
                className={`p-4 sm:p-4.5 rounded-2xl border transition-all cursor-pointer ${
                  hoveredMetric === "recall"
                    ? "bg-[#141C2B] border-emerald-400 ring-4 ring-emerald-400/30 shadow-2xl"
                    : "bg-[#111722] border-white/5 hover:border-white/15"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-400 text-sm sm:text-base whitespace-nowrap">Recall</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[#070A0F] text-slate-300 border border-white/10">
                      TP / (TP + FN)
                    </span>
                  </div>
                  <span className="font-mono text-2xl sm:text-3xl font-black text-emerald-400 tabular-nums">
                    {formatPct(metrics.recall)}
                  </span>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-full h-2.5 rounded-full bg-[#070A0F] border border-white/10 overflow-hidden">
                  <div
                    style={{ width: `${(metrics.recall ?? 0) * 100}%` }}
                    className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                  />
                </div>
              </div>

              {/* Telemetry 4: Specificity */}
              <div
                onMouseEnter={() => setHoveredMetric("specificity")}
                onMouseLeave={() => setHoveredMetric(null)}
                className={`p-4 sm:p-4.5 rounded-2xl border transition-all cursor-pointer ${
                  hoveredMetric === "specificity"
                    ? "bg-[#141C2B] border-slate-300 ring-4 ring-slate-300/30 shadow-2xl"
                    : "bg-[#111722] border-white/5 hover:border-white/15"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-300 text-sm sm:text-base whitespace-nowrap">Specificity</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[#070A0F] text-slate-300 border border-white/10">
                      TN / (TN + FP)
                    </span>
                  </div>
                  <span className="font-mono text-2xl sm:text-3xl font-black text-slate-200 tabular-nums">
                    {formatPct(metrics.specificity)}
                  </span>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-full h-2.5 rounded-full bg-[#070A0F] border border-white/10 overflow-hidden">
                  <div
                    style={{ width: `${(metrics.specificity ?? 0) * 100}%` }}
                    className="h-full bg-slate-400 rounded-full transition-all duration-300"
                  />
                </div>
              </div>

              {/* Telemetry 5: F1-Score */}
              <div
                onMouseEnter={() => setHoveredMetric("f1Score")}
                onMouseLeave={() => setHoveredMetric(null)}
                className={`p-4 sm:p-4.5 rounded-2xl border transition-all cursor-pointer ${
                  hoveredMetric === "f1Score"
                    ? "bg-[#141C2B] border-amber-400 ring-4 ring-amber-400/30 shadow-2xl"
                    : "bg-[#111722] border-white/5 hover:border-white/15"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-400 text-sm sm:text-base whitespace-nowrap">F1-Score</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[#070A0F] text-slate-300 border border-white/10">
                      2·P·R / (P + R)
                    </span>
                  </div>
                  <span className="font-mono text-2xl sm:text-3xl font-black text-amber-300 tabular-nums">
                    {formatPct(metrics.f1Score)}
                  </span>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-full h-2.5 rounded-full bg-[#070A0F] border border-white/10 overflow-hidden">
                  <div
                    style={{ width: `${(metrics.f1Score ?? 0) * 100}%` }}
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-300"
                  />
                </div>
              </div>

            </div>

            {/* Zero-Denominator Safety Notice */}
            {(metrics.precision === null || metrics.recall === null || metrics.accuracy === null) && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs sm:text-sm text-amber-300 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <span className="leading-relaxed">
                  Zero Denominator State: The denominator evaluated to 0. ThinkViz explicitly reports <strong className="font-mono text-white">N/A</strong> rather than presenting misleading numerical artifacts.
                </span>
              </div>
            )}
          </div>

          {/* CoreNode AI Style Diagnostic Readout */}
          <div className="p-6 sm:p-7 rounded-3xl bg-[#0A0E17] border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
              <Info className="w-4 h-4 text-sky-400" />
              <h3 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
                05 // Diagnostic Analysis
              </h3>
            </div>

            <div className="space-y-3">
              {observations.map((obs, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#111722] border border-white/5 text-sm text-slate-200 leading-relaxed font-normal"
                >
                  {obs}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
