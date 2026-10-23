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
  Sparkles,
  Percent,
  Plus,
  Minus,
  Target,
  ShieldAlert,
  BarChart3,
  Layers,
  HelpCircle,
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

  // Handle manual input change with validation
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
            <span className="text-[#6C8CFF]">Confusion Matrix Simulator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F8FAFC]">
            Confusion Matrix Simulator
          </h1>
          <p className="text-sm text-[#828E9E] mt-1 max-w-2xl">
            Interactive visual simulation of binary classification outcomes. Observe how errors affect accuracy, precision, recall, and F1-score with real-time visual feedback.
          </p>
        </div>

        {/* Global Reset Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3.5 py-1.5 rounded-lg bg-[#12161D] hover:bg-[#1A2230] text-[#F8FAFC] border border-[#232B36] text-xs font-semibold flex items-center gap-2 transition-all active:scale-[0.98]"
            title="Reset to balanced preset"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#6C8CFF]" />
            <span>Reset Matrix</span>
          </button>
        </div>
      </div>

      {/* Preset Buttons Deck */}
      <div className="p-4 rounded-2xl bg-[#090D14] border border-[#1E2638] shadow-md space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#828E9E]">
            <Sparkles className="w-3.5 h-3.5 text-[#6C8CFF]" />
            <span className="font-semibold text-[#F8FAFC]">Scenario Presets:</span>
          </div>
          <span className="text-[11px] text-[#64748B] hidden sm:inline">
            Click a preset to inspect its visual pattern
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {CONFUSION_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectPreset(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activePresetId === p.id
                  ? "bg-[#6C8CFF]/20 text-[#6C8CFF] border border-[#6C8CFF]/50 font-semibold shadow-xs"
                  : "bg-[#12161D] text-[#828E9E] hover:text-[#F8FAFC] border border-[#232B36]"
              }`}
              title={p.description}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Population Distribution Strip */}
      <div className="p-4 rounded-2xl bg-[#090D14] border border-[#1E2638] shadow-md space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#828E9E]">
            <Layers className="w-3.5 h-3.5 text-[#6C8CFF]" />
            <span className="font-semibold text-[#F8FAFC]">Dataset Population Proportion</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono tabular-nums">
            <span className="text-emerald-400">
              Actual Positives: <strong>{metrics.actualPositive}</strong> ({actualPosPct.toFixed(1)}%)
            </span>
            <span className="text-slate-400">
              Actual Negatives: <strong>{metrics.actualNegative}</strong> ({actualNegPct.toFixed(1)}%)
            </span>
            <span className="text-[#6C8CFF]">
              Total: <strong>{total.toLocaleString()}</strong>
            </span>
          </div>
        </div>

        {/* Multi-segment horizontal bar */}
        <div className="w-full h-4 rounded-full overflow-hidden bg-[#070A0F] border border-[#1A2230] flex shadow-inner">
          <div
            style={{ width: `${tpPct}%` }}
            className="h-full bg-emerald-500 transition-all duration-300 relative group"
            title={`True Positives (TP): ${counts.tp} (${tpPct.toFixed(1)}%)`}
          />
          <div
            style={{ width: `${fnPct}%` }}
            className="h-full bg-rose-500 transition-all duration-300 relative group"
            title={`False Negatives (FN): ${counts.fn} (${fnPct.toFixed(1)}%)`}
          />
          <div
            style={{ width: `${fpPct}%` }}
            className="h-full bg-amber-500 transition-all duration-300 relative group"
            title={`False Positives (FP): ${counts.fp} (${fpPct.toFixed(1)}%)`}
          />
          <div
            style={{ width: `${tnPct}%` }}
            className="h-full bg-sky-600 transition-all duration-300 relative group"
            title={`True Negatives (TN): ${counts.tn} (${tnPct.toFixed(1)}%)`}
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between text-[11px] text-[#828E9E] pt-1">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              TP ({counts.tp})
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              FN ({counts.fn})
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              FP ({counts.fp})
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
              TN ({counts.tn})
            </span>
          </div>
          <span className="text-[10px] text-[#64748B]">
            Hover any metric on the right to highlight its contributing cells
          </span>
        </div>
      </div>

      {/* Main Grid: Interactive 2x2 Matrix (Left) & Visual Metrics (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ===================================================================
            LEFT / MAIN: 2x2 Visual Heatmap Matrix
            =================================================================== */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="w-full rounded-2xl bg-[#090D14] border border-[#1E2638] p-5 sm:p-6 shadow-2xl flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#161D2A] text-xs">
              <div className="flex items-center gap-2">
                <Grid className="w-4 h-4 text-[#6C8CFF]" />
                <span className="font-semibold text-[#F8FAFC] text-sm">2 × 2 Classification Grid</span>
              </div>
              <span className="font-mono text-[#828E9E] text-xs tabular-nums">
                Heatmap density indicates sample count
              </span>
            </div>

            {/* Matrix Frame */}
            <div className="w-full overflow-x-auto">
              <div className="min-w-[480px] flex flex-col space-y-2">

                {/* Column Headers: PREDICTED */}
                <div className="grid grid-cols-12 gap-2 text-xs">
                  <div className="col-span-3" />
                  <div className="col-span-4 py-2 px-3 rounded-xl bg-[#12161D] border border-[#1E2638] text-center font-bold text-sky-400 flex items-center justify-center gap-1.5">
                    <span>Predicted Positive (+)</span>
                  </div>
                  <div className="col-span-4 py-2 px-3 rounded-xl bg-[#12161D] border border-[#1E2638] text-center font-bold text-slate-300 flex items-center justify-center gap-1.5">
                    <span>Predicted Negative (−)</span>
                  </div>
                  <div className="col-span-1 text-center py-2 text-[10px] text-[#64748B] flex items-center justify-center">
                    Total
                  </div>
                </div>

                {/* ROW 1: ACTUAL POSITIVE */}
                <div className="grid grid-cols-12 gap-2">
                  
                  {/* Row Header */}
                  <div className="col-span-3 p-3 rounded-xl bg-[#12161D] border border-[#1E2638] flex flex-col justify-center text-xs">
                    <span className="font-bold text-emerald-400">Actual Positive (+)</span>
                    <span className="text-[10px] text-[#828E9E]">Ground Truth</span>
                  </div>

                  {/* CELL 1: True Positive (TP) */}
                  <div
                    style={{
                      backgroundColor: `rgba(16, 185, 129, ${0.06 + 0.22 * (counts.tp / maxCount)})`,
                    }}
                    className={`col-span-4 p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                      hoveredMetric && isCellActive("tp")
                        ? "border-emerald-400 ring-2 ring-emerald-400/50 shadow-lg scale-[1.01]"
                        : hoveredMetric && !isCellActive("tp")
                        ? "opacity-30 border-[#1E2638]"
                        : "border-emerald-500/40 hover:border-emerald-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        True Positive (TP)
                      </span>
                      <span className="text-[10px] font-mono text-emerald-300/80">
                        {tpPct.toFixed(1)}%
                      </span>
                    </div>

                    {/* Stepper & Number */}
                    <div className="my-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => adjustCount("tp", -10)}
                          className="w-6 h-6 rounded bg-[#070A0F] border border-[#1E2638] text-[10px] text-[#828E9E] hover:text-[#F8FAFC] hover:bg-[#1A2230] transition-colors"
                          title="-10"
                        >
                          -10
                        </button>
                        <button
                          onClick={() => adjustCount("tp", -1)}
                          className="w-6 h-6 rounded bg-[#070A0F] border border-[#1E2638] flex items-center justify-center text-[#828E9E] hover:text-[#F8FAFC] hover:bg-[#1A2230] transition-colors"
                          title="-1"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                      </div>

                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={inputStrings.tp}
                        onChange={(e) => handleInputChange("tp", e.target.value)}
                        className="w-20 text-center bg-[#070A0F]/90 border border-emerald-500/50 rounded-lg py-1 text-lg font-mono font-extrabold text-emerald-300 focus:outline-none focus:border-emerald-400"
                      />

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => adjustCount("tp", 1)}
                          className="w-6 h-6 rounded bg-[#070A0F] border border-[#1E2638] flex items-center justify-center text-[#828E9E] hover:text-[#F8FAFC] hover:bg-[#1A2230] transition-colors"
                          title="+1"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => adjustCount("tp", 10)}
                          className="w-6 h-6 rounded bg-[#070A0F] border border-[#1E2638] text-[10px] text-[#828E9E] hover:text-[#F8FAFC] hover:bg-[#1A2230] transition-colors"
                          title="+10"
                        >
                          +10
                        </button>
                      </div>
                    </div>

                    <span className="text-[10px] text-emerald-300/70">
                      Hit: Correctly identified positive
                    </span>
                  </div>

                  {/* CELL 2: False Negative (FN) - Type II Error */}
                  <div
                    style={{
                      backgroundColor: `rgba(244, 63, 94, ${0.06 + 0.22 * (counts.fn / maxCount)})`,
                    }}
                    className={`col-span-4 p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                      hoveredMetric && isCellActive("fn")
                        ? "border-rose-400 ring-2 ring-rose-400/50 shadow-lg scale-[1.01]"
                        : hoveredMetric && !isCellActive("fn")
                        ? "opacity-30 border-[#1E2638]"
                        : "border-rose-500/40 hover:border-rose-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" />
                        False Negative (FN)
                      </span>
                      <span className="text-[10px] font-mono text-rose-300/80">
                        {fnPct.toFixed(1)}%
                      </span>
                    </div>

                    {/* Stepper & Number */}
                    <div className="my-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => adjustCount("fn", -10)}
                          className="w-6 h-6 rounded bg-[#070A0F] border border-[#1E2638] text-[10px] text-[#828E9E] hover:text-[#F8FAFC] hover:bg-[#1A2230] transition-colors"
                          title="-10"
                        >
                          -10
                        </button>
                        <button
                          onClick={() => adjustCount("fn", -1)}
                          className="w-6 h-6 rounded bg-[#070A0F] border border-[#1E2638] flex items-center justify-center text-[#828E9E] hover:text-[#F8FAFC] hover:bg-[#1A2230] transition-colors"
                          title="-1"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                      </div>

                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={inputStrings.fn}
                        onChange={(e) => handleInputChange("fn", e.target.value)}
                        className="w-20 text-center bg-[#070A0F]/90 border border-rose-500/50 rounded-lg py-1 text-lg font-mono font-extrabold text-rose-300 focus:outline-none focus:border-rose-400"
                      />

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => adjustCount("fn", 1)}
                          className="w-6 h-6 rounded bg-[#070A0F] border border-[#1E2638] flex items-center justify-center text-[#828E9E] hover:text-[#F8FAFC] hover:bg-[#1A2230] transition-colors"
                          title="+1"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => adjustCount("fn", 10)}
                          className="w-6 h-6 rounded bg-[#070A0F] border border-[#1E2638] text-[10px] text-[#828E9E] hover:text-[#F8FAFC] hover:bg-[#1A2230] transition-colors"
                          title="+10"
                        >
                          +10
                        </button>
                      </div>
                    </div>

                    <span className="text-[10px] text-rose-300/80">
                      Type II Error: Missed positive case
                    </span>
                  </div>

                  {/* Row Total */}
                  <div className="col-span-1 p-2 rounded-xl bg-[#0F1420] border border-[#1E2638] flex flex-col items-center justify-center font-mono">
                    <span className="text-xs font-bold text-[#F8FAFC]">{metrics.actualPositive}</span>
                  </div>
                </div>

                {/* ROW 2: ACTUAL NEGATIVE */}
                <div className="grid grid-cols-12 gap-2">
                  
                  {/* Row Header */}
                  <div className="col-span-3 p-3 rounded-xl bg-[#12161D] border border-[#1E2638] flex flex-col justify-center text-xs">
                    <span className="font-bold text-slate-300">Actual Negative (−)</span>
                    <span className="text-[10px] text-[#828E9E]">Ground Truth</span>
                  </div>

                  {/* CELL 3: False Positive (FP) - Type I Error */}
                  <div
                    style={{
                      backgroundColor: `rgba(245, 158, 11, ${0.06 + 0.22 * (counts.fp / maxCount)})`,
                    }}
                    className={`col-span-4 p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                      hoveredMetric && isCellActive("fp")
                        ? "border-amber-400 ring-2 ring-amber-400/50 shadow-lg scale-[1.01]"
                        : hoveredMetric && !isCellActive("fp")
                        ? "opacity-30 border-[#1E2638]"
                        : "border-amber-500/40 hover:border-amber-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        False Positive (FP)
                      </span>
                      <span className="text-[10px] font-mono text-amber-300/80">
                        {fpPct.toFixed(1)}%
                      </span>
                    </div>

                    {/* Stepper & Number */}
                    <div className="my-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => adjustCount("fp", -10)}
                          className="w-6 h-6 rounded bg-[#070A0F] border border-[#1E2638] text-[10px] text-[#828E9E] hover:text-[#F8FAFC] hover:bg-[#1A2230] transition-colors"
                          title="-10"
                        >
                          -10
                        </button>
                        <button
                          onClick={() => adjustCount("fp", -1)}
                          className="w-6 h-6 rounded bg-[#070A0F] border border-[#1E2638] flex items-center justify-center text-[#828E9E] hover:text-[#F8FAFC] hover:bg-[#1A2230] transition-colors"
                          title="-1"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                      </div>

                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={inputStrings.fp}
                        onChange={(e) => handleInputChange("fp", e.target.value)}
                        className="w-20 text-center bg-[#070A0F]/90 border border-amber-500/50 rounded-lg py-1 text-lg font-mono font-extrabold text-amber-300 focus:outline-none focus:border-amber-400"
                      />

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => adjustCount("fp", 1)}
                          className="w-6 h-6 rounded bg-[#070A0F] border border-[#1E2638] flex items-center justify-center text-[#828E9E] hover:text-[#F8FAFC] hover:bg-[#1A2230] transition-colors"
                          title="+1"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => adjustCount("fp", 10)}
                          className="w-6 h-6 rounded bg-[#070A0F] border border-[#1E2638] text-[10px] text-[#828E9E] hover:text-[#F8FAFC] hover:bg-[#1A2230] transition-colors"
                          title="+10"
                        >
                          +10
                        </button>
                      </div>
                    </div>

                    <span className="text-[10px] text-amber-300/80">
                      Type I Error: False alarm
                    </span>
                  </div>

                  {/* CELL 4: True Negative (TN) */}
                  <div
                    style={{
                      backgroundColor: `rgba(56, 189, 248, ${0.06 + 0.22 * (counts.tn / maxCount)})`,
                    }}
                    className={`col-span-4 p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                      hoveredMetric && isCellActive("tn")
                        ? "border-sky-400 ring-2 ring-sky-400/50 shadow-lg scale-[1.01]"
                        : hoveredMetric && !isCellActive("tn")
                        ? "opacity-30 border-[#1E2638]"
                        : "border-sky-500/40 hover:border-sky-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-sky-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        True Negative (TN)
                      </span>
                      <span className="text-[10px] font-mono text-sky-300/80">
                        {tnPct.toFixed(1)}%
                      </span>
                    </div>

                    {/* Stepper & Number */}
                    <div className="my-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => adjustCount("tn", -10)}
                          className="w-6 h-6 rounded bg-[#070A0F] border border-[#1E2638] text-[10px] text-[#828E9E] hover:text-[#F8FAFC] hover:bg-[#1A2230] transition-colors"
                          title="-10"
                        >
                          -10
                        </button>
                        <button
                          onClick={() => adjustCount("tn", -1)}
                          className="w-6 h-6 rounded bg-[#070A0F] border border-[#1E2638] flex items-center justify-center text-[#828E9E] hover:text-[#F8FAFC] hover:bg-[#1A2230] transition-colors"
                          title="-1"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                      </div>

                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={inputStrings.tn}
                        onChange={(e) => handleInputChange("tn", e.target.value)}
                        className="w-20 text-center bg-[#070A0F]/90 border border-sky-500/50 rounded-lg py-1 text-lg font-mono font-extrabold text-sky-300 focus:outline-none focus:border-sky-400"
                      />

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => adjustCount("tn", 1)}
                          className="w-6 h-6 rounded bg-[#070A0F] border border-[#1E2638] flex items-center justify-center text-[#828E9E] hover:text-[#F8FAFC] hover:bg-[#1A2230] transition-colors"
                          title="+1"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => adjustCount("tn", 10)}
                          className="w-6 h-6 rounded bg-[#070A0F] border border-[#1E2638] text-[10px] text-[#828E9E] hover:text-[#F8FAFC] hover:bg-[#1A2230] transition-colors"
                          title="+10"
                        >
                          +10
                        </button>
                      </div>
                    </div>

                    <span className="text-[10px] text-sky-300/80">
                      Correct rejection of negative
                    </span>
                  </div>

                  {/* Row Total */}
                  <div className="col-span-1 p-2 rounded-xl bg-[#0F1420] border border-[#1E2638] flex flex-col items-center justify-center font-mono">
                    <span className="text-xs font-bold text-[#F8FAFC]">{metrics.actualNegative}</span>
                  </div>
                </div>

                {/* Column Totals Footer */}
                <div className="grid grid-cols-12 gap-2 pt-1 text-xs font-mono">
                  <div className="col-span-3 text-right pr-2 text-[#64748B] text-[11px] flex items-center justify-end font-sans">
                    Pred. Total:
                  </div>
                  <div className="col-span-4 p-2 rounded-xl bg-[#0F1420] border border-[#1E2638] text-center font-bold text-sky-400">
                    {metrics.predictedPositive}
                  </div>
                  <div className="col-span-4 p-2 rounded-xl bg-[#0F1420] border border-[#1E2638] text-center font-bold text-slate-300">
                    {metrics.predictedNegative}
                  </div>
                  <div className="col-span-1 p-2 rounded-xl bg-[#161D2E] border border-[#6C8CFF]/50 text-center font-bold text-[#6C8CFF]">
                    {total}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* ===================================================================
            RIGHT: Visual Metrics with Progress Bars & Interactive Highlighting
            =================================================================== */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          
          {/* Classification Metrics Dashboard */}
          <div className="p-5 rounded-2xl bg-[#090D14] border border-[#1E2638] shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#161D2A]">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#6C8CFF]" />
                <span className="font-semibold text-[#F8FAFC] text-sm">Classification Metrics</span>
              </div>
              <span className="text-[10px] font-mono text-[#828E9E]">Hover card to trace formula</span>
            </div>

            <div className="space-y-3">
              
              {/* Metric 1: Accuracy */}
              <div
                onMouseEnter={() => setHoveredMetric("accuracy")}
                onMouseLeave={() => setHoveredMetric(null)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  hoveredMetric === "accuracy"
                    ? "bg-[#141B2B] border-[#6C8CFF] shadow-md ring-1 ring-[#6C8CFF]"
                    : "bg-[#0F1420] border-[#1E2638] hover:border-[#2C384E]"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#F8FAFC] text-xs">Accuracy</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#070A0F] text-[#828E9E] border border-[#1A2230]">
                      (TP + TN) / Total
                    </span>
                  </div>
                  <span className="font-mono text-base font-extrabold text-[#F8FAFC] tabular-nums">
                    {formatPct(metrics.accuracy)}
                  </span>
                </div>
                {/* Visual bar */}
                <div className="w-full h-2 rounded-full bg-[#070A0F] border border-[#1E2638] overflow-hidden">
                  <div
                    style={{ width: `${(metrics.accuracy ?? 0) * 100}%` }}
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
                  />
                </div>
              </div>

              {/* Metric 2: Precision */}
              <div
                onMouseEnter={() => setHoveredMetric("precision")}
                onMouseLeave={() => setHoveredMetric(null)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  hoveredMetric === "precision"
                    ? "bg-[#141B2B] border-sky-400 shadow-md ring-1 ring-sky-400"
                    : "bg-[#0F1420] border-[#1E2638] hover:border-[#2C384E]"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sky-400 text-xs">Precision</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#070A0F] text-[#828E9E] border border-[#1A2230]">
                      TP / (TP + FP)
                    </span>
                  </div>
                  <span className="font-mono text-base font-extrabold text-sky-400 tabular-nums">
                    {formatPct(metrics.precision)}
                  </span>
                </div>
                {/* Visual bar */}
                <div className="w-full h-2 rounded-full bg-[#070A0F] border border-[#1E2638] overflow-hidden">
                  <div
                    style={{ width: `${(metrics.precision ?? 0) * 100}%` }}
                    className="h-full bg-sky-400 rounded-full transition-all duration-300"
                  />
                </div>
              </div>

              {/* Metric 3: Recall / Sensitivity */}
              <div
                onMouseEnter={() => setHoveredMetric("recall")}
                onMouseLeave={() => setHoveredMetric(null)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  hoveredMetric === "recall"
                    ? "bg-[#141B2B] border-emerald-400 shadow-md ring-1 ring-emerald-400"
                    : "bg-[#0F1420] border-[#1E2638] hover:border-[#2C384E]"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-emerald-400 text-xs">Recall / Sensitivity</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#070A0F] text-[#828E9E] border border-[#1A2230]">
                      TP / (TP + FN)
                    </span>
                  </div>
                  <span className="font-mono text-base font-extrabold text-emerald-400 tabular-nums">
                    {formatPct(metrics.recall)}
                  </span>
                </div>
                {/* Visual bar */}
                <div className="w-full h-2 rounded-full bg-[#070A0F] border border-[#1E2638] overflow-hidden">
                  <div
                    style={{ width: `${(metrics.recall ?? 0) * 100}%` }}
                    className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                  />
                </div>
              </div>

              {/* Metric 4: Specificity */}
              <div
                onMouseEnter={() => setHoveredMetric("specificity")}
                onMouseLeave={() => setHoveredMetric(null)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  hoveredMetric === "specificity"
                    ? "bg-[#141B2B] border-slate-300 shadow-md ring-1 ring-slate-300"
                    : "bg-[#0F1420] border-[#1E2638] hover:border-[#2C384E]"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-300 text-xs">Specificity</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#070A0F] text-[#828E9E] border border-[#1A2230]">
                      TN / (TN + FP)
                    </span>
                  </div>
                  <span className="font-mono text-base font-extrabold text-slate-300 tabular-nums">
                    {formatPct(metrics.specificity)}
                  </span>
                </div>
                {/* Visual bar */}
                <div className="w-full h-2 rounded-full bg-[#070A0F] border border-[#1E2638] overflow-hidden">
                  <div
                    style={{ width: `${(metrics.specificity ?? 0) * 100}%` }}
                    className="h-full bg-slate-400 rounded-full transition-all duration-300"
                  />
                </div>
              </div>

              {/* Metric 5: F1-Score */}
              <div
                onMouseEnter={() => setHoveredMetric("f1Score")}
                onMouseLeave={() => setHoveredMetric(null)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  hoveredMetric === "f1Score"
                    ? "bg-[#141B2B] border-amber-400 shadow-md ring-1 ring-amber-400"
                    : "bg-[#0F1420] border-[#1E2638] hover:border-[#2C384E]"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-amber-400 text-xs">F1-Score</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#070A0F] text-[#828E9E] border border-[#1A2230]">
                      2·P·R / (P + R)
                    </span>
                  </div>
                  <span className="font-mono text-base font-extrabold text-amber-300 tabular-nums">
                    {formatPct(metrics.f1Score)}
                  </span>
                </div>
                {/* Visual bar */}
                <div className="w-full h-2 rounded-full bg-[#070A0F] border border-[#1E2638] overflow-hidden">
                  <div
                    style={{ width: `${(metrics.f1Score ?? 0) * 100}%` }}
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-300"
                  />
                </div>
              </div>

            </div>

            {/* Zero-Denominator Safety Notice */}
            {(metrics.precision === null || metrics.recall === null || metrics.accuracy === null) && (
              <div className="p-3 rounded-xl bg-[rgba(245,158,11,0.08)] border border-amber-500/30 text-[11px] text-amber-300 flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>
                  Undefined Metric: Denominator is 0. ThinkViz explicitly outputs <strong className="font-mono">N/A</strong> rather than misleading numbers.
                </span>
              </div>
            )}
          </div>

          {/* Derived Pedagogical Insights */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#090D14] border border-[#1E2638] shadow-xl space-y-2.5 text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-[#161D2A]">
              <Info className="w-4 h-4 text-[#6C8CFF]" />
              <h3 className="font-semibold text-[#F8FAFC] text-sm">Key Takeaway</h3>
            </div>

            <div className="space-y-2">
              {observations.map((obs, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#070A0F] border border-[#1A2230] text-[11px] text-[#A7AFBB] leading-relaxed"
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
