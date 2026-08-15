"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AlgorithmStep } from "@/types/visualizer";

export interface PlaybackControls<TState> {
  currentStep: AlgorithmStep<TState> | null;
  currentStepIndex: number;
  totalSteps: number;
  isPlaying: boolean;
  speedMs: number;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  reset: () => void;
  jumpToStep: (index: number) => void;
  setSpeedMs: (speed: number) => void;
}

export function useVisualizerPlayback<TState>(
  steps: AlgorithmStep<TState>[]
): PlaybackControls<TState> {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(250);

  const stepsRef = useRef(steps);
  stepsRef.current = steps;

  // Reset to step 0 whenever steps array changes
  useEffect(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [steps]);

  const stepForward = useCallback(() => {
    setCurrentStepIndex((prevIndex) => {
      if (prevIndex < stepsRef.current.length - 1) {
        return prevIndex + 1;
      }
      setIsPlaying(false);
      return prevIndex;
    });
  }, []);

  const stepBackward = useCallback(() => {
    setCurrentStepIndex((prevIndex) => Math.max(0, prevIndex - 1));
  }, []);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  }, []);

  const play = useCallback(() => {
    if (stepsRef.current.length === 0) return;
    if (currentStepIndex >= stepsRef.current.length - 1) {
      setCurrentStepIndex(0);
    }
    setIsPlaying(true);
  }, [currentStepIndex]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const jumpToStep = useCallback((index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, stepsRef.current.length - 1));
    setCurrentStepIndex(clampedIndex);
  }, []);

  // Timer loop for automatic step playback
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentStepIndex((prevIndex) => {
        if (prevIndex >= stepsRef.current.length - 1) {
          setIsPlaying(false);
          return prevIndex;
        }
        return prevIndex + 1;
      });
    }, speedMs);

    return () => clearInterval(timer);
  }, [isPlaying, speedMs]);

  const currentStep = steps[currentStepIndex] || null;

  return {
    currentStep,
    currentStepIndex,
    totalSteps: steps.length,
    isPlaying,
    speedMs,
    play,
    pause,
    togglePlay,
    stepForward,
    stepBackward,
    reset,
    jumpToStep,
    setSpeedMs,
  };
}
