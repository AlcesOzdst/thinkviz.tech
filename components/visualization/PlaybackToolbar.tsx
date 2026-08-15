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
    { label: "Slow", valueMs: 500 },
    { label: "Normal", valueMs: 250 },
    { label: "Fast", valueMs: 80 },
  ];

  return (
    <div className="w-full p-3.5 rounded-xl bg-[#15181D] border border-[#292E36] flex flex-col md:flex-row items-center justify-between gap-4 select-none">
      {/* Control Buttons Group */}
      <div className="flex items-center gap-2">
        {/* Reset Button */}
        <button
          onClick={reset}
          disabled={isControlsDisabled || isAtStart}
          className="p-2 rounded-lg bg-[#1B1F25] hover:bg-[#292E36] text-[#F1F3F5] border border-[#292E36] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium"
          title="Reset to Step 0"
        >
          ⏮ Reset
        </button>

        {/* Previous Step Button */}
        <button
          onClick={stepBackward}
          disabled={isControlsDisabled || isAtStart}
          className="p-2 rounded-lg bg-[#1B1F25] hover:bg-[#292E36] text-[#F1F3F5] border border-[#292E36] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium"
          title="Previous Step"
        >
          ◀ Prev
        </button>

        {/* Play / Pause Toggle Button */}
        <button
          onClick={togglePlay}
          disabled={isControlsDisabled || (isAtEnd && !isPlaying)}
          className={`px-4 py-2 rounded-lg font-medium text-xs transition-colors flex items-center justify-center gap-1.5 min-w-[95px] ${
            isPlaying
              ? "bg-[#263352] text-[#6C8CFF] border border-[#6C8CFF]/50"
              : "bg-[#6C8CFF] hover:bg-[#5A7BEF] text-white"
          } disabled:opacity-40 disabled:cursor-not-allowed`}
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
          className="p-2 rounded-lg bg-[#1B1F25] hover:bg-[#292E36] text-[#F1F3F5] border border-[#292E36] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium"
          title="Next Step"
        >
          Next ▶
        </button>
      </div>

      {/* Progress Slider & Step Counter */}
      <div className="flex-1 w-full md:w-auto flex items-center gap-3 max-w-md">
        <input
          type="range"
          min={0}
          max={Math.max(0, totalSteps - 1)}
          value={totalSteps === 0 ? 0 : currentStepIndex}
          onChange={(e) => jumpToStep(Number(e.target.value))}
          disabled={isControlsDisabled || totalSteps <= 1}
          className="w-full h-1.5 bg-[#1B1F25] rounded-lg appearance-none cursor-pointer accent-[#6C8CFF] disabled:opacity-40 disabled:cursor-not-allowed"
        />
        <span className="text-xs font-mono text-[#A7AFBB] whitespace-nowrap min-w-[70px] text-right">
          {totalSteps > 0 ? currentStepIndex + 1 : 0} / {totalSteps}
        </span>
      </div>

      {/* Speed Presets */}
      <div className="flex items-center gap-1.5 text-xs text-[#A7AFBB]">
        <span className="mr-1 text-[#737C89]">Speed:</span>
        {speedPresets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => setSpeedMs(preset.valueMs)}
            disabled={disabled}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              speedMs === preset.valueMs
                ? "bg-[#6C8CFF] text-white"
                : "bg-[#1B1F25] text-[#A7AFBB] hover:text-[#F1F3F5] hover:bg-[#292E36]"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
