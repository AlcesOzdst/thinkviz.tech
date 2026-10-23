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
  SlidersHorizontal,
} from "lucide-react";

export function ConfusionMatrixSimulator() {
  // Input Counts State
  const [counts, setCounts] = useState<ConfusionCounts>({
    tp: 45,
    fp: 10,
    tn: 40,
    fn: 5,
  });

  // String buffer for inputs so user can type freely without NaN locking
  const [inputStrings, setInputStrings] = useState<Record<keyof ConfusionCounts, string>>({
    tp: "45",
    fp: "10",
    tn: "40",
    fn: "5",
  });

  const [inputErrors, setInputErrors] = useState<Partial<Record<keyof ConfusionCounts, string>>>({});
  const [activePresetId, setActivePresetId] = useState<string>("balanced");

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
            Explore binary classification outcomes and observe how accuracy, precision, recall, specificity, and F1-score are derived from real sample counts.
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

      {/* Main Grid: Confusion Matrix Table (Left) & Metrics/Pedagogical Insights (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ===================================================================
            LEFT / MAIN: 2x2 Matrix Grid & Preset Picker
            =================================================================== */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          
          {/* Preset Buttons Deck */}
          <div className="p-4 rounded-2xl bg-[#090D14] border border-[#1E2638] shadow-md space-y-2.5">
            <div className="flex items-center gap-2 text-xs text-[#828E9E]">
              <Sparkles className="w-3.5 h-3.5 text-[#6C8CFF]" />
              <span className="font-semibold text-[#F8FAFC]">Scenario Presets:</span>
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

          {/* 2x2 Interactive Confusion Matrix */}
          <div className="w-full rounded-2xl bg-[#090D14] border border-[#1E2638] p-5 sm:p-6 shadow-2xl flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#161D2A] text-xs">
              <div className="flex items-center gap-2">
                <Grid className="w-4 h-4 text-[#6C8CFF]" />
                <span className="font-semibold text-[#F8FAFC] text-sm">2 × 2 Classification Grid</span>
              </div>
              <span className="font-mono text-[#828E9E] text-xs tabular-nums">
                Total Sample Size: <strong className="text-[#F8FAFC]">{total.toLocaleString()}</strong>
              </span>
            </div>

            {/* Matrix Table with Margins */}
            <div className="w-full overflow-x-auto">
              <div className="min-w-[440px] grid grid-cols-12 gap-2 text-xs">
                
                {/* Column Headers */}
                <div className="col-span-4" />
                <div className="col-span-3 text-center py-1.5 px-2 rounded-lg bg-[#12161D] border border-[#1E2638] font-bold text-[#6C8CFF]">
                  Predicted Positive
                </div>
                <div className="col-span-3 text-center py-1.5 px-2 rounded-lg bg-[#12161D] border border-[#1E2638] font-bold text-[#828E9E]">
                  Predicted Negative
                </div>
                <div className="col-span-2 text-center py-1.5 px-2 rounded-lg bg-[#0F1420] border border-[#1E2638] font-semibold text-[#64748B]">
                  Row Total
                </div>

                {/* Row 1: Actual Positive */}
                <div className="col-span-4 flex items-center justify-end pr-3 font-bold text-[#6C8CFF]">
                  Actual Positive
                </div>

                {/* Cell 1: True Positive (TP) */}
                <div className="col-span-3 p-3 rounded-xl bg-[rgba(16,185,129,0.08)] border border-emerald-500/30 flex flex-col space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-400">TP (True Pos)</span>
                    <span className="text-[10px] font-mono text-[#828E9E]">
                      {total > 0 ? `${((counts.tp / total) * 100).toFixed(1)}%` : "0%"}
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={inputStrings.tp}
                    onChange={(e) => handleInputChange("tp", e.target.value)}
                    className="w-full bg-[#070A0F] border border-emerald-500/40 rounded-lg px-2.5 py-1 text-sm font-mono font-bold text-emerald-300 focus:outline-none focus:border-emerald-400"
                  />
                  {inputErrors.tp && <span className="text-[10px] text-rose-400">{inputErrors.tp}</span>}
                  <span className="text-[10px] text-[#64748B]">Hit / Correct detection</span>
                </div>

                {/* Cell 2: False Negative (FN) - Type II Error */}
                <div className="col-span-3 p-3 rounded-xl bg-[rgba(239,68,68,0.08)] border border-rose-500/30 flex flex-col space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-rose-400">FN (False Neg)</span>
                    <span className="text-[10px] font-mono text-[#828E9E]">
                      {total > 0 ? `${((counts.fn / total) * 100).toFixed(1)}%` : "0%"}
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={inputStrings.fn}
                    onChange={(e) => handleInputChange("fn", e.target.value)}
                    className="w-full bg-[#070A0F] border border-rose-500/40 rounded-lg px-2.5 py-1 text-sm font-mono font-bold text-rose-300 focus:outline-none focus:border-rose-400"
                  />
                  {inputErrors.fn && <span className="text-[10px] text-rose-400">{inputErrors.fn}</span>}
                  <span className="text-[10px] text-rose-400/80">Type II Error (Miss)</span>
                </div>

                {/* Row 1 Margin: Actual Positive Total */}
                <div className="col-span-2 p-3 rounded-xl bg-[#0F1420] border border-[#1E2638] flex flex-col items-center justify-center font-mono">
                  <span className="text-sm font-bold text-[#F8FAFC]">{metrics.actualPositive}</span>
                  <span className="text-[10px] text-[#828E9E]">P = TP + FN</span>
                </div>

                {/* Row 2: Actual Negative */}
                <div className="col-span-4 flex items-center justify-end pr-3 font-bold text-[#828E9E]">
                  Actual Negative
                </div>

                {/* Cell 3: False Positive (FP) - Type I Error */}
                <div className="col-span-3 p-3 rounded-xl bg-[rgba(245,158,11,0.08)] border border-amber-500/30 flex flex-col space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-400">FP (False Pos)</span>
                    <span className="text-[10px] font-mono text-[#828E9E]">
                      {total > 0 ? `${((counts.fp / total) * 100).toFixed(1)}%` : "0%"}
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={inputStrings.fp}
                    onChange={(e) => handleInputChange("fp", e.target.value)}
                    className="w-full bg-[#070A0F] border border-amber-500/40 rounded-lg px-2.5 py-1 text-sm font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                  />
                  {inputErrors.fp && <span className="text-[10px] text-rose-400">{inputErrors.fp}</span>}
                  <span className="text-[10px] text-amber-400/80">Type I Error (False Alarm)</span>
                </div>

                {/* Cell 4: True Negative (TN) */}
                <div className="col-span-3 p-3 rounded-xl bg-[rgba(100,116,139,0.08)] border border-slate-600/30 flex flex-col space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300">TN (True Neg)</span>
                    <span className="text-[10px] font-mono text-[#828E9E]">
                      {total > 0 ? `${((counts.tn / total) * 100).toFixed(1)}%` : "0%"}
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={inputStrings.tn}
                    onChange={(e) => handleInputChange("tn", e.target.value)}
                    className="w-full bg-[#070A0F] border border-slate-600/40 rounded-lg px-2.5 py-1 text-sm font-mono font-bold text-slate-200 focus:outline-none focus:border-slate-400"
                  />
                  {inputErrors.tn && <span className="text-[10px] text-rose-400">{inputErrors.tn}</span>}
                  <span className="text-[10px] text-[#64748B]">Correct rejection</span>
                </div>

                {/* Row 2 Margin: Actual Negative Total */}
                <div className="col-span-2 p-3 rounded-xl bg-[#0F1420] border border-[#1E2638] flex flex-col items-center justify-center font-mono">
                  <span className="text-sm font-bold text-[#F8FAFC]">{metrics.actualNegative}</span>
                  <span className="text-[10px] text-[#828E9E]">N_neg = TN + FP</span>
                </div>

                {/* Column Totals Margin */}
                <div className="col-span-4 flex items-center justify-end pr-3 font-semibold text-[#64748B]">
                  Column Total
                </div>
                <div className="col-span-3 p-2 rounded-lg bg-[#0F1420] border border-[#1E2638] text-center font-mono">
                  <span className="text-xs font-bold text-[#F8FAFC] block">{metrics.predictedPositive}</span>
                  <span className="text-[9px] text-[#828E9E]">Pred Pos = TP + FP</span>
                </div>
                <div className="col-span-3 p-2 rounded-lg bg-[#0F1420] border border-[#1E2638] text-center font-mono">
                  <span className="text-xs font-bold text-[#F8FAFC] block">{metrics.predictedNegative}</span>
                  <span className="text-[9px] text-[#828E9E]">Pred Neg = TN + FN</span>
                </div>
                <div className="col-span-2 p-2 rounded-lg bg-[#161D2E] border border-[#6C8CFF]/40 text-center font-mono">
                  <span className="text-xs font-bold text-[#6C8CFF] block">{total}</span>
                  <span className="text-[9px] text-[#828E9E]">Grand Total</span>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* ===================================================================
            RIGHT: Derived Classification Metrics & Pedagogical Observations
            =================================================================== */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          
          {/* Classification Metrics Grid */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#090D14] border border-[#1E2638] shadow-xl space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#161D2A]">
              <span className="font-semibold text-[#F8FAFC] text-sm">Classification Metrics</span>
              <span className="text-[10px] font-mono text-[#828E9E]">Derived From Counts</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              
              {/* Metric 1: Accuracy */}
              <div className="p-3 rounded-xl bg-[#0F1420] border border-[#1E2638] space-y-1">
                <span className="text-[10px] font-medium text-[#828E9E] uppercase tracking-wider block">
                  Accuracy
                </span>
                <span className="font-mono text-lg font-bold text-[#F8FAFC] tabular-nums block">
                  {formatPct(metrics.accuracy)}
                </span>
                <span className="text-[9px] font-mono text-[#64748B] block">
                  (TP + TN) / Total
                </span>
              </div>

              {/* Metric 2: Precision */}
              <div className="p-3 rounded-xl bg-[#0F1420] border border-[#1E2638] space-y-1">
                <span className="text-[10px] font-medium text-[#828E9E] uppercase tracking-wider block">
                  Precision
                </span>
                <span className="font-mono text-lg font-bold text-[#6C8CFF] tabular-nums block">
                  {formatPct(metrics.precision)}
                </span>
                <span className="text-[9px] font-mono text-[#64748B] block">
                  TP / (TP + FP)
                </span>
              </div>

              {/* Metric 3: Recall / Sensitivity */}
              <div className="p-3 rounded-xl bg-[#0F1420] border border-[#1E2638] space-y-1">
                <span className="text-[10px] font-medium text-[#828E9E] uppercase tracking-wider block">
                  Recall
                </span>
                <span className="font-mono text-lg font-bold text-emerald-400 tabular-nums block">
                  {formatPct(metrics.recall)}
                </span>
                <span className="text-[9px] font-mono text-[#64748B] block">
                  TP / (TP + FN)
                </span>
              </div>

              {/* Metric 4: Specificity */}
              <div className="p-3 rounded-xl bg-[#0F1420] border border-[#1E2638] space-y-1">
                <span className="text-[10px] font-medium text-[#828E9E] uppercase tracking-wider block">
                  Specificity
                </span>
                <span className="font-mono text-lg font-bold text-slate-300 tabular-nums block">
                  {formatPct(metrics.specificity)}
                </span>
                <span className="text-[9px] font-mono text-[#64748B] block">
                  TN / (TN + FP)
                </span>
              </div>

              {/* Metric 5: F1-Score */}
              <div className="p-3 rounded-xl bg-[#0F1420] border border-[#1E2638] space-y-1 col-span-2 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium text-[#828E9E] uppercase tracking-wider">
                    F1-Score (Harmonic Mean)
                  </span>
                  <span className="text-[10px] font-mono text-[#6C8CFF]">2 · P · R / (P + R)</span>
                </div>
                <span className="font-mono text-lg font-bold text-amber-300 tabular-nums block">
                  {formatPct(metrics.f1Score)}
                </span>
                <span className="text-[9px] text-[#64748B] block">
                  Balances Precision and Recall equally without class bias
                </span>
              </div>
            </div>

            {/* Zero-Denominator Safety Notice */}
            {(metrics.precision === null || metrics.recall === null || metrics.accuracy === null) && (
              <div className="p-3 rounded-xl bg-[rgba(245,158,11,0.08)] border border-amber-500/30 text-[11px] text-amber-300 flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>
                  Zero Denominator Handled: Metric is mathematically undefined (division by zero). ThinkViz displays <strong className="font-mono">N/A</strong> rather than silently substituting zero.
                </span>
              </div>
            )}
          </div>

          {/* Derived Pedagogical Insights */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#090D14] border border-[#1E2638] shadow-xl space-y-2.5 text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-[#161D2A]">
              <Info className="w-4 h-4 text-[#6C8CFF]" />
              <h3 className="font-semibold text-[#F8FAFC] text-sm">Mathematically Grounded Insights</h3>
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
