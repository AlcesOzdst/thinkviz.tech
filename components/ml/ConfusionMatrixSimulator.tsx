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
          1. HEADER: Architectural Glass Header with Crosshair Accents
          =================================================================== */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-[#0A0E17] border border-white/10 shadow-2xl overflow-hidden">
        {/* Decorative corner crosshairs */}
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
          4. WORKBENCH: Unified 2x2 Matrix Instrument & Performance Telemetry
          =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* =================================================================
            LEFT: Unified Architectural 2x2 Matrix
            ================================================================= */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="rounded-3xl bg-[#0A0E17] border border-white/10 shadow-2xl p-6 sm:p-8 space-y-6">
            
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

            {/* Matrix Frame */}
            <div className="w-full overflow-x-auto">
              <div className="min-w-[520px] flex flex-col space-y-4">
                
                {/* Column Headers (Predictions) */}
                <div className="grid grid-cols-12 gap-4 text-xs sm:text-sm font-semibold">
                  <div className="col-span-3" />
                  <div className="col-span-4 p-3.5 rounded-2xl bg-[#111722] border border-sky-400/30 text-center text-sky-300 font-mono tracking-wider">
                    PREDICTED POSITIVE (+)
                  </div>
                  <div className="col-span-4 p-3.5 rounded-2xl bg-[#111722] border border-slate-600/30 text-center text-slate-300 font-mono tracking-wider">
                    PREDICTED NEGATIVE (−)
                  </div>
                  <div className="col-span-1 p-3.5 rounded-2xl bg-[#0E131E] border border-white/5 text-center text-slate-400 font-mono text-xs flex items-center justify-center">
                    TOTAL
                  </div>
                </div>

                {/* ROW 1: ACTUAL POSITIVE */}
                <div className="grid grid-cols-12 gap-4">
                  {/* Row Header */}
                  <div className="col-span-3 p-5 rounded-2xl bg-[#111722] border border-emerald-500/30 flex flex-col justify-center">
                    <span className="text-xs sm:text-sm font-bold text-emerald-400 font-mono tracking-wider">
                      ACTUAL POSITIVE (+)
                    </span>
                    <span className="text-xs text-slate-400 mt-1">Ground Truth</span>
                  </div>

                  {/* QUADRANT 1: True Positive (TP) */}
                  <div
                    style={{
                      backgroundColor: `rgba(16, 185, 129, ${0.08 + 0.28 * (counts.tp / maxCount)})`,
                    }}
                    className={`col-span-4 p-6 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                      hoveredMetric && isCellActive("tp")
                        ? "border-emerald-400 ring-4 ring-emerald-400/40 shadow-2xl scale-[1.02]"
                        : hoveredMetric && !isCellActive("tp")
                        ? "opacity-25 border-white/5"
                        : "border-emerald-500/30 hover:border-emerald-400/70"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold text-emerald-400 flex items-center gap-1.5 font-mono">
                        <CheckCircle2 className="w-4 h-4" />
                        TP // True Positive
                      </span>
                      <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-lg bg-[#070A0F] text-emerald-300 border border-emerald-500/30">
                        {tpPct.toFixed(1)}%
                      </span>
                    </div>

                    {/* Prominent Number */}
                    <div className="my-4 flex items-center justify-between">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={inputStrings.tp}
                        onChange={(e) => handleInputChange("tp", e.target.value)}
                        className="w-32 bg-transparent text-left text-4xl sm:text-5xl font-mono font-black text-emerald-300 focus:outline-none tracking-tight"
                      />
                      <span className="text-xs text-emerald-400/80 font-mono uppercase tracking-wider">
                        Hit
                      </span>
                    </div>

                    {/* Smooth Tactile Slider + Steppers */}
                    <div className="space-y-2 pt-2 border-t border-emerald-500/20">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => adjustCount("tp", -1)}
                          className="w-7 h-7 rounded-lg bg-[#070A0F] hover:bg-[#162030] text-slate-300 hover:text-white border border-white/10 flex items-center justify-center transition-colors"
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
                          className="w-full h-2 bg-[#070A0F] rounded-lg appearance-none cursor-pointer accent-emerald-400"
                        />
                        <button
                          onClick={() => adjustCount("tp", 1)}
                          className="w-7 h-7 rounded-lg bg-[#070A0F] hover:bg-[#162030] text-slate-300 hover:text-white border border-white/10 flex items-center justify-center transition-colors"
                          title="Increment"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-200 leading-snug">
                        Correct detection of active positive cases.
                      </p>
                    </div>
                  </div>

                  {/* QUADRANT 2: False Negative (FN) */}
                  <div
                    style={{
                      backgroundColor: `rgba(244, 63, 94, ${0.08 + 0.28 * (counts.fn / maxCount)})`,
                    }}
                    className={`col-span-4 p-6 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                      hoveredMetric && isCellActive("fn")
                        ? "border-rose-400 ring-4 ring-rose-400/40 shadow-2xl scale-[1.02]"
                        : hoveredMetric && !isCellActive("fn")
                        ? "opacity-25 border-white/5"
                        : "border-rose-500/30 hover:border-rose-400/70"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold text-rose-400 flex items-center gap-1.5 font-mono">
                        <ShieldAlert className="w-4 h-4" />
                        FN // False Negative
                      </span>
                      <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-lg bg-[#070A0F] text-rose-300 border border-rose-500/30">
                        {fnPct.toFixed(1)}%
                      </span>
                    </div>

                    {/* Prominent Number */}
                    <div className="my-4 flex items-center justify-between">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={inputStrings.fn}
                        onChange={(e) => handleInputChange("fn", e.target.value)}
                        className="w-32 bg-transparent text-left text-4xl sm:text-5xl font-mono font-black text-rose-300 focus:outline-none tracking-tight"
                      />
                      <span className="text-xs text-rose-400/80 font-mono uppercase tracking-wider">
                        Miss
                      </span>
                    </div>

                    {/* Smooth Tactile Slider + Steppers */}
                    <div className="space-y-2 pt-2 border-t border-rose-500/20">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => adjustCount("fn", -1)}
                          className="w-7 h-7 rounded-lg bg-[#070A0F] hover:bg-[#162030] text-slate-300 hover:text-white border border-white/10 flex items-center justify-center transition-colors"
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
                          className="w-full h-2 bg-[#070A0F] rounded-lg appearance-none cursor-pointer accent-rose-400"
                        />
                        <button
                          onClick={() => adjustCount("fn", 1)}
                          className="w-7 h-7 rounded-lg bg-[#070A0F] hover:bg-[#162030] text-slate-300 hover:text-white border border-white/10 flex items-center justify-center transition-colors"
                          title="Increment"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-rose-200 leading-snug">
                        Type II Error: Dangerous miss of an actual positive.
                      </p>
                    </div>
                  </div>

                  {/* Row Total */}
                  <div className="col-span-1 p-3 rounded-2xl bg-[#111722] border border-white/10 flex flex-col items-center justify-center font-mono">
                    <span className="text-lg sm:text-xl font-extrabold text-white">{metrics.actualPositive}</span>
                    <span className="text-xs text-slate-400 mt-1">P</span>
                  </div>
                </div>

                {/* ROW 2: ACTUAL NEGATIVE */}
                <div className="grid grid-cols-12 gap-4">
                  {/* Row Header */}
                  <div className="col-span-3 p-5 rounded-2xl bg-[#111722] border border-slate-600/30 flex flex-col justify-center">
                    <span className="text-xs sm:text-sm font-bold text-slate-300 font-mono tracking-wider">
                      ACTUAL NEGATIVE (−)
                    </span>
                    <span className="text-xs text-slate-400 mt-1">Ground Truth</span>
                  </div>

                  {/* QUADRANT 3: False Positive (FP) */}
                  <div
                    style={{
                      backgroundColor: `rgba(245, 158, 11, ${0.08 + 0.28 * (counts.fp / maxCount)})`,
                    }}
                    className={`col-span-4 p-6 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                      hoveredMetric && isCellActive("fp")
                        ? "border-amber-400 ring-4 ring-amber-400/40 shadow-2xl scale-[1.02]"
                        : hoveredMetric && !isCellActive("fp")
                        ? "opacity-25 border-white/5"
                        : "border-amber-500/30 hover:border-amber-400/70"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold text-amber-400 flex items-center gap-1.5 font-mono">
                        <AlertTriangle className="w-4 h-4" />
                        FP // False Positive
                      </span>
                      <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-lg bg-[#070A0F] text-amber-300 border border-amber-500/30">
                        {fpPct.toFixed(1)}%
                      </span>
                    </div>

                    {/* Prominent Number */}
                    <div className="my-4 flex items-center justify-between">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={inputStrings.fp}
                        onChange={(e) => handleInputChange("fp", e.target.value)}
                        className="w-32 bg-transparent text-left text-4xl sm:text-5xl font-mono font-black text-amber-300 focus:outline-none tracking-tight"
                      />
                      <span className="text-xs text-amber-400/80 font-mono uppercase tracking-wider">
                        False Alarm
                      </span>
                    </div>

                    {/* Smooth Tactile Slider + Steppers */}
                    <div className="space-y-2 pt-2 border-t border-amber-500/20">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => adjustCount("fp", -1)}
                          className="w-7 h-7 rounded-lg bg-[#070A0F] hover:bg-[#162030] text-slate-300 hover:text-white border border-white/10 flex items-center justify-center transition-colors"
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
                          className="w-full h-2 bg-[#070A0F] rounded-lg appearance-none cursor-pointer accent-amber-400"
                        />
                        <button
                          onClick={() => adjustCount("fp", 1)}
                          className="w-7 h-7 rounded-lg bg-[#070A0F] hover:bg-[#162030] text-slate-300 hover:text-white border border-white/10 flex items-center justify-center transition-colors"
                          title="Increment"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-amber-200 leading-snug">
                        Type I Error: Benign case wrongly flagged as positive.
                      </p>
                    </div>
                  </div>

                  {/* QUADRANT 4: True Negative (TN) */}
                  <div
                    style={{
                      backgroundColor: `rgba(56, 189, 248, ${0.08 + 0.28 * (counts.tn / maxCount)})`,
                    }}
                    className={`col-span-4 p-6 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                      hoveredMetric && isCellActive("tn")
                        ? "border-sky-400 ring-4 ring-sky-400/40 shadow-2xl scale-[1.02]"
                        : hoveredMetric && !isCellActive("tn")
                        ? "opacity-25 border-white/5"
                        : "border-sky-500/30 hover:border-sky-400/70"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold text-sky-400 flex items-center gap-1.5 font-mono">
                        <CheckCircle2 className="w-4 h-4" />
                        TN // True Negative
                      </span>
                      <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-lg bg-[#070A0F] text-sky-300 border border-sky-500/30">
                        {tnPct.toFixed(1)}%
                      </span>
                    </div>

                    {/* Prominent Number */}
                    <div className="my-4 flex items-center justify-between">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={inputStrings.tn}
                        onChange={(e) => handleInputChange("tn", e.target.value)}
                        className="w-32 bg-transparent text-left text-4xl sm:text-5xl font-mono font-black text-sky-300 focus:outline-none tracking-tight"
                      />
                      <span className="text-xs text-sky-400/80 font-mono uppercase tracking-wider">
                        Rejection
                      </span>
                    </div>

                    {/* Smooth Tactile Slider + Steppers */}
                    <div className="space-y-2 pt-2 border-t border-sky-500/20">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => adjustCount("tn", -1)}
                          className="w-7 h-7 rounded-lg bg-[#070A0F] hover:bg-[#162030] text-slate-300 hover:text-white border border-white/10 flex items-center justify-center transition-colors"
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
                          className="w-full h-2 bg-[#070A0F] rounded-lg appearance-none cursor-pointer accent-sky-400"
                        />
                        <button
                          onClick={() => adjustCount("tn", 1)}
                          className="w-7 h-7 rounded-lg bg-[#070A0F] hover:bg-[#162030] text-slate-300 hover:text-white border border-white/10 flex items-center justify-center transition-colors"
                          title="Increment"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-sky-200 leading-snug">
                        Correct rejection of inactive negative cases.
                      </p>
                    </div>
                  </div>

                  {/* Row Total */}
                  <div className="col-span-1 p-3 rounded-2xl bg-[#111722] border border-white/10 flex flex-col items-center justify-center font-mono">
                    <span className="text-lg sm:text-xl font-extrabold text-white">{metrics.actualNegative}</span>
                    <span className="text-xs text-slate-400 mt-1">N</span>
                  </div>
                </div>

                {/* Column Totals Footer */}
                <div className="grid grid-cols-12 gap-4 pt-2 font-mono">
                  <div className="col-span-3 text-right pr-4 text-slate-400 text-xs sm:text-sm font-bold flex items-center justify-end font-mono">
                    PRED. TOTAL:
                  </div>
                  <div className="col-span-4 p-3.5 rounded-2xl bg-[#111722] border border-sky-400/30 text-center text-sm font-bold text-sky-300">
                    {metrics.predictedPositive}
                  </div>
                  <div className="col-span-4 p-3.5 rounded-2xl bg-[#111722] border border-slate-600/30 text-center text-sm font-bold text-slate-300">
                    {metrics.predictedNegative}
                  </div>
                  <div className="col-span-1 p-3.5 rounded-2xl bg-sky-500/20 border border-sky-400/50 text-center text-sm font-black text-sky-300">
                    {total}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* =================================================================
            RIGHT: Performance Telemetry (CoreNode AI Style)
            ================================================================= */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          
          {/* Classification Telemetry Panel */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0A0E17] border border-white/10 shadow-2xl space-y-6">
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

            <div className="space-y-4">
              
              {/* Telemetry 1: Accuracy */}
              <div
                onMouseEnter={() => setHoveredMetric("accuracy")}
                onMouseLeave={() => setHoveredMetric(null)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                  hoveredMetric === "accuracy"
                    ? "bg-[#141C2B] border-sky-400 ring-4 ring-sky-400/30 shadow-2xl"
                    : "bg-[#111722] border-white/5 hover:border-white/15"
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
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
                <div className="w-full h-3 rounded-full bg-[#070A0F] border border-white/10 overflow-hidden">
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
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                  hoveredMetric === "precision"
                    ? "bg-[#141C2B] border-sky-400 ring-4 ring-sky-400/30 shadow-2xl"
                    : "bg-[#111722] border-white/5 hover:border-white/15"
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
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
                <div className="w-full h-3 rounded-full bg-[#070A0F] border border-white/10 overflow-hidden">
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
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                  hoveredMetric === "recall"
                    ? "bg-[#141C2B] border-emerald-400 ring-4 ring-emerald-400/30 shadow-2xl"
                    : "bg-[#111722] border-white/5 hover:border-white/15"
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-400 text-sm sm:text-base">Recall (Sensitivity)</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[#070A0F] text-slate-300 border border-white/10">
                      TP / (TP + FN)
                    </span>
                  </div>
                  <span className="font-mono text-2xl sm:text-3xl font-black text-emerald-400 tabular-nums">
                    {formatPct(metrics.recall)}
                  </span>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-full h-3 rounded-full bg-[#070A0F] border border-white/10 overflow-hidden">
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
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                  hoveredMetric === "specificity"
                    ? "bg-[#141C2B] border-slate-300 ring-4 ring-slate-300/30 shadow-2xl"
                    : "bg-[#111722] border-white/5 hover:border-white/15"
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-300 text-sm sm:text-base">Specificity</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[#070A0F] text-slate-300 border border-white/10">
                      TN / (TN + FP)
                    </span>
                  </div>
                  <span className="font-mono text-2xl sm:text-3xl font-black text-slate-200 tabular-nums">
                    {formatPct(metrics.specificity)}
                  </span>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-full h-3 rounded-full bg-[#070A0F] border border-white/10 overflow-hidden">
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
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                  hoveredMetric === "f1Score"
                    ? "bg-[#141C2B] border-amber-400 ring-4 ring-amber-400/30 shadow-2xl"
                    : "bg-[#111722] border-white/5 hover:border-white/15"
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-400 text-sm sm:text-base">F1-Score</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[#070A0F] text-slate-300 border border-white/10">
                      2·P·R / (P + R)
                    </span>
                  </div>
                  <span className="font-mono text-2xl sm:text-3xl font-black text-amber-300 tabular-nums">
                    {formatPct(metrics.f1Score)}
                  </span>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-full h-3 rounded-full bg-[#070A0F] border border-white/10 overflow-hidden">
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
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
                <span className="leading-relaxed">
                  Zero Denominator State: The denominator evaluated to 0. ThinkViz explicitly reports <strong className="font-mono text-white">N/A</strong> rather than presenting misleading numerical artifacts.
                </span>
              </div>
            )}
          </div>

          {/* CoreNode AI Style Diagnostic Readout */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0A0E17] border border-white/10 shadow-2xl space-y-4">
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
