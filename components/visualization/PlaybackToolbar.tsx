"use client";

import React from "react";
import { PlaybackControls } from "@/hooks/useVisualizerPlayback";
import { RotateCcw, ChevronLeft, ChevronRight, Play, Pause, Gauge } from "lucide-react";

export interface PlaybackToolbarProps<TState> {
  playback: PlaybackControls<TState>;
  disabled?: boolean;
  hasGenerated?: boolean;
  onExecute?: () => void;
}

export function PlaybackToolbar<TState>({
  playback,
  disabled = false,
  hasGenerated = false,
  onExecute,
}: PlaybackToolbarProps<TState>) {
  const {
    currentStepIndex,
    totalSteps,
    isPlaying,
    speedMs,
    togglePlay,
    stepForward,
    stepBackward,
    reset,
    jumpToStep,
    setSpeedMs,
  } = playback;

  const isAtStart = currentStepIndex === 0;
  const isAtEnd = totalSteps === 0 || currentStepIndex === totalSteps - 1;
  const isControlsDisabled = disabled || totalSteps === 0;

  const speedPresets = [
    { label: "Slow", valueMs: 400 },
    { label: "1x", valueMs: 180 },
    { label: "2x", valueMs: 70 },
    { label: "Max", valueMs: 20 },
  ];

  const handleMainAction = () => {
    if (!hasGenerated && onExecute) {
      onExecute();
      return;
    }
    togglePlay();
  };

  return (
    <div className="w-full max-w-4xl px-4 py-2.5 rounded-xl bg-[var(--workbench-dock-bg)] backdrop-blur-md border border-[var(--workbench-dock-border)] flex flex-col sm:flex-row items-center justify-between gap-3 select-none shadow-2xl transition-all">
      {/* Control Buttons Group */}
      <div className="flex items-center gap-1.5">
        {/* Reset Button */}
        <button
          onClick={reset}
          disabled={isControlsDisabled || isAtStart}
          className="p-2 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-default)] transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
          title="Reset to initial step"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Previous Step Button */}
        <button
          onClick={stepBackward}
          disabled={isControlsDisabled || isAtStart}
          className="p-2 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-default)] transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
          title="Step backward"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Play / Pause / Execute Toggle Button */}
        <button
          onClick={handleMainAction}
          disabled={hasGenerated && isAtEnd && !isPlaying}
          className={`px-4 py-2 rounded-lg font-medium text-xs transition-all flex items-center justify-center gap-2 min-w-[100px] active:scale-[0.98] ${
            isPlaying
              ? "bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border border-[var(--color-accent)]/50 shadow-[0_0_12px_rgba(108,140,255,0.2)]"
              : "bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white shadow-md"
          } disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause</span>
            </>
          ) : hasGenerated && isAtEnd && totalSteps > 0 ? (
            <span>Finished</span>
          ) : hasGenerated ? (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Resume</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Execute</span>
            </>
          )}
        </button>

        {/* Next Step Button */}
        <button
          onClick={stepForward}
          disabled={isControlsDisabled || isAtEnd}
          className="p-2 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-default)] transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
          title="Step forward"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Slider & Step Counter with Monospace Tabular Figures */}
      <div className="flex-1 w-full sm:w-auto flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={Math.max(0, totalSteps - 1)}
          value={totalSteps === 0 ? 0 : currentStepIndex}
          onChange={(e) => jumpToStep(Number(e.target.value))}
          disabled={isControlsDisabled || totalSteps <= 1}
          className="w-full h-1.5 bg-[var(--bg-elevated)] rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)] disabled:opacity-30 disabled:cursor-not-allowed"
        />
        <div className="text-xs font-mono tabular-nums text-[var(--text-secondary)] whitespace-nowrap min-w-[76px] text-right font-medium">
          <span className="text-[var(--text-primary)] font-bold">
            {totalSteps > 0 ? currentStepIndex + 1 : 0}
          </span>
          <span className="text-[var(--text-muted)] mx-1">/</span>
          <span>{totalSteps}</span>
        </div>
      </div>

      {/* Speed Presets */}
      <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
        <Gauge className="w-3.5 h-3.5 mr-0.5 text-[var(--text-muted)]" />
        {speedPresets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => setSpeedMs(preset.valueMs)}
            disabled={disabled && !hasGenerated}
            className={`px-2 py-1 rounded-md text-[11px] font-mono tabular-nums font-medium transition-all active:scale-[0.96] ${
              speedMs === preset.valueMs
                ? "bg-[var(--color-accent)] text-white shadow-sm"
                : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] border border-[var(--border-subtle)]"
            } disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
