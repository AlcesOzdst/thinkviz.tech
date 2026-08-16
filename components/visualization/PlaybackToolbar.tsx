"use client";

import React from "react";
import { PlaybackControls } from "@/hooks/useVisualizerPlayback";

export interface PlaybackToolbarProps<TState> {
  playback: PlaybackControls<TState>;
  disabled?: boolean;
}

export function PlaybackToolbar<TState>({
  playback,
  disabled = false,
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
    { label: "0.5x", valueMs: 500 },
    { label: "1.0x", valueMs: 250 },
    { label: "2.0x", valueMs: 80 },
  ];

  return (
    <div className="w-full p-3 rounded-xl bg-[#15181D] border border-[#292E36] flex flex-col sm:flex-row items-center justify-between gap-3 select-none">
      {/* Control Buttons Group */}
      <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-start">
        {/* Reset Button */}
        <button
          onClick={reset}
          disabled={isControlsDisabled || isAtStart}
          className="px-2.5 py-1.5 rounded-lg bg-[#1B1F25] hover:bg-[#292E36] text-[#A7AFBB] hover:text-[#F1F3F5] border border-[#292E36] transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-xs font-medium"
          title="Reset to Step 0"
        >
          ⏮ Reset
        </button>

        {/* Previous Step Button */}
        <button
          onClick={stepBackward}
          disabled={isControlsDisabled || isAtStart}
          className="px-2.5 py-1.5 rounded-lg bg-[#1B1F25] hover:bg-[#292E36] text-[#A7AFBB] hover:text-[#F1F3F5] border border-[#292E36] transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-xs font-medium"
          title="Previous Step"
        >
          ◀ Prev
        </button>

        {/* Play / Pause Toggle Button */}
        <button
          onClick={togglePlay}
          disabled={isControlsDisabled || (isAtEnd && !isPlaying)}
          className={`px-4 py-1.5 rounded-lg font-medium text-xs transition-colors flex items-center justify-center gap-1.5 min-w-[90px] ${
            isPlaying
              ? "bg-[#263352] text-[#6C8CFF] border border-[#6C8CFF]/50"
              : "bg-[#6C8CFF] hover:bg-[#5A7BEF] text-white"
          } disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          {isPlaying ? (
            <>
              <span>⏸</span>
              <span>Pause</span>
            </>
          ) : isAtEnd && totalSteps > 0 ? (
            <span>Completed</span>
          ) : (
            <>
              <span>▶</span>
              <span>Play</span>
            </>
          )}
        </button>

        {/* Next Step Button */}
        <button
          onClick={stepForward}
          disabled={isControlsDisabled || isAtEnd}
          className="px-2.5 py-1.5 rounded-lg bg-[#1B1F25] hover:bg-[#292E36] text-[#A7AFBB] hover:text-[#F1F3F5] border border-[#292E36] transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-xs font-medium"
          title="Next Step"
        >
          Next ▶
        </button>
      </div>

      {/* Progress Slider & Step Counter */}
      <div className="flex-1 w-full sm:w-auto flex items-center gap-2.5 min-w-[140px]">
        <input
          type="range"
          min={0}
          max={Math.max(0, totalSteps - 1)}
          value={totalSteps === 0 ? 0 : currentStepIndex}
          onChange={(e) => jumpToStep(Number(e.target.value))}
          disabled={isControlsDisabled || totalSteps <= 1}
          className="w-full h-1.5 bg-[#0D0F12] border border-[#292E36] rounded-lg appearance-none cursor-pointer accent-[#6C8CFF] disabled:opacity-30 disabled:cursor-not-allowed"
        />
        <span className="text-[11px] font-mono text-[#A7AFBB] whitespace-nowrap min-w-[55px] text-right">
          {totalSteps > 0 ? currentStepIndex + 1 : 0}/{totalSteps}
        </span>
      </div>

      {/* Speed Presets */}
      <div className="flex items-center gap-1 text-xs text-[#A7AFBB] w-full sm:w-auto justify-end">
        <span className="mr-1 text-[11px] text-[#737C89]">Speed:</span>
        <div className="inline-flex rounded-lg bg-[#0D0F12] p-0.5 border border-[#292E36]">
          {speedPresets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => setSpeedMs(preset.valueMs)}
              disabled={disabled}
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium transition-all ${
                speedMs === preset.valueMs
                  ? "bg-[#6C8CFF] text-white"
                  : "text-[#A7AFBB] hover:text-[#F1F3F5]"
              } disabled:opacity-30 disabled:cursor-not-allowed`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

