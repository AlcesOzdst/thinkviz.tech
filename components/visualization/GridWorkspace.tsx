"use client";

import React, { useState, useMemo, useCallback } from "react";
import { GridCanvas } from "@/components/visualization/GridCanvas";
import { PlaybackToolbar } from "@/components/visualization/PlaybackToolbar";
import { StepExplanation } from "@/components/visualization/StepExplanation";
import { MetricsPanel } from "@/components/visualization/MetricsPanel";
import { Position, GridState } from "@/types/grid";
import { createInitialGrid, generateAStarSteps } from "@/lib/algorithms/aStar";
import { useVisualizerPlayback } from "@/hooks/useVisualizerPlayback";
import { AlgorithmStep } from "@/types/visualizer";

export function GridWorkspace() {
  const rows = 12;
  const cols = 22;

  // Persistent user grid configuration (preserved across search resets)
  const [startPos, setStartPos] = useState<Position>({ row: 5, col: 3 });
  const [goalPos, setGoalPos] = useState<Position>({ row: 5, col: 18 });
  const [walls, setWalls] = useState<Position[]>([]);

  // Generated algorithm visualization steps
  const [steps, setSteps] = useState<AlgorithmStep<GridState>[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Playback controller hook
  const playback = useVisualizerPlayback(steps);

  // Re-build editable grid state based on user's current start, goal, and walls
  const editableGridState = useMemo<GridState>(() => {
    const grid = createInitialGrid(rows, cols, startPos, goalPos, walls);
    return {
      grid,
      startPos,
      goalPos,
      currentNode: null,
      openSetPositions: [],
      closedSetPositions: [],
      pathPositions: [],
      consideredNeighbors: [],
    };
  }, [rows, cols, startPos, goalPos, walls]);

  // Active display state: shows playback step snapshot when visualizing, or editableGridState when editing
  const activeGridState =
    hasGenerated && playback.currentStep
      ? playback.currentStep.state
      : editableGridState;

  // Active metrics snapshot
  const activeMetrics = playback.currentStep ? playback.currentStep.metrics : null;

  // Generate A* step traces from user's current grid setup
  const handleVisualize = () => {
    const initialGrid = createInitialGrid(rows, cols, startPos, goalPos, walls);
    const generatedSteps = generateAStarSteps(initialGrid, startPos, goalPos);
    setSteps(generatedSteps);
    setHasGenerated(true);
    playback.reset();
  };

  // Reset search: exits visualization mode and returns to editable grid mode,
  // STRICTLY PRESERVING user's walls, startPos, and goalPos.
  const handleResetSearch = () => {
    playback.reset();
    setSteps([]);
    setHasGenerated(false);
  };

  // Clear grid walls entirely
  const handleClearWalls = () => {
    playback.reset();
    setWalls([]);
    setSteps([]);
    setHasGenerated(false);
  };

  // Reset entire grid to initial factory defaults
  const handleResetEntireGrid = () => {
    playback.reset();
    setStartPos({ row: 5, col: 3 });
    setGoalPos({ row: 5, col: 18 });
    setWalls([]);
    setSteps([]);
    setHasGenerated(false);
  };

  // Interactive wall toggle handler (disabled during active visualization)
  const handleToggleWall = useCallback(
    (pos: Position) => {
      if (hasGenerated) return;
      setWalls((prevWalls) => {
        const exists = prevWalls.some(
          (w) => w.row === pos.row && w.col === pos.col
        );
        if (exists) {
          return prevWalls.filter(
            (w) => !(w.row === pos.row && w.col === pos.col)
          );
        } else {
          return [...prevWalls, pos];
        }
      });
    },
    [hasGenerated]
  );

  // Interactive Start movement handler
  const handleMoveStart = useCallback(
    (pos: Position) => {
      if (hasGenerated) return;
      setStartPos(pos);
    },
    [hasGenerated]
  );

  // Interactive Goal movement handler
  const handleMoveGoal = useCallback(
    (pos: Position) => {
      if (hasGenerated) return;
      setGoalPos(pos);
    },
    [hasGenerated]
  );

  return (
    <div className="w-full flex flex-col items-center space-y-4">
      {/* Action Control Toolbar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#15181D] border border-[#292E36]">
        <div className="flex items-center gap-2 text-xs text-[#A7AFBB]">
          <span className="h-2 w-2 rounded-full bg-[#6C8CFF]" />
          <span>
            {hasGenerated
              ? `Step ${playback.currentStepIndex + 1} of ${playback.totalSteps}`
              : "Edit mode: Click/drag to draw walls, drag Start (S) or Goal (G)"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!hasGenerated ? (
            <>
              <button
                onClick={handleClearWalls}
                disabled={walls.length === 0}
                className="px-3 py-1.5 rounded-lg bg-[#1B1F25] hover:bg-[#292E36] text-[#A7AFBB] border border-[#292E36] font-medium text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Clear Walls
              </button>
              <button
                onClick={handleVisualize}
                className="px-4 py-1.5 rounded-lg bg-[#6C8CFF] hover:bg-[#5A7BEF] text-white font-medium text-xs transition-colors"
              >
                Visualize A*
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleResetSearch}
                className="px-4 py-1.5 rounded-lg bg-[#1B1F25] hover:bg-[#292E36] text-[#F1F3F5] border border-[#292E36] font-medium text-xs transition-colors"
              >
                Reset & Edit Grid
              </button>
              <button
                onClick={handleResetEntireGrid}
                className="px-3 py-1.5 rounded-lg bg-[#1B1F25] hover:bg-[#292E36] text-[#A7AFBB] border border-[#292E36] font-medium text-xs transition-colors"
              >
                Clear Grid
              </button>
            </>
          )}
        </div>
      </div>

      {/* Grid Canvas Component */}
      <GridCanvas
        gridState={activeGridState}
        onToggleWall={handleToggleWall}
        onMoveStart={handleMoveStart}
        onMoveGoal={handleMoveGoal}
        isInteractive={!hasGenerated}
      />

      {/* Playback Control Toolbar Component */}
      <PlaybackToolbar
        playback={playback}
        disabled={!hasGenerated}
      />

      {/* Real-time Algorithm Metrics Panel */}
      <MetricsPanel metrics={activeMetrics} />

      {/* Step Narrative & Pseudocode Explanation Component */}
      <StepExplanation step={playback.currentStep} />
    </div>
  );
}
