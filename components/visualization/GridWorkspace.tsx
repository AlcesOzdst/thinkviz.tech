"use client";

import React, { useState, useMemo, useCallback } from "react";
import { GridCanvas } from "@/components/visualization/GridCanvas";
import { PlaybackToolbar } from "@/components/visualization/PlaybackToolbar";
import { StepExplanation } from "@/components/visualization/StepExplanation";
import { Position, GridNode, GridState } from "@/types/grid";
import { createInitialGrid, generateAStarSteps } from "@/lib/algorithms/aStar";
import { generateBFSSteps } from "@/lib/algorithms/bfs";
import { useVisualizerPlayback } from "@/hooks/useVisualizerPlayback";
import { AlgorithmStep } from "@/types/visualizer";

export interface GridWorkspaceProps {
  algorithmId?: string;
}

const STEP_GENERATORS: Record<
  string,
  (
    initialGrid: GridNode[][],
    startPos: Position,
    goalPos: Position
  ) => AlgorithmStep<GridState>[]
> = {
  "a-star": generateAStarSteps,
  bfs: generateBFSSteps,
};

export function GridWorkspace({ algorithmId = "a-star" }: GridWorkspaceProps) {
  const rows = 12;
  const cols = 22;

  const isBFS = algorithmId === "bfs";
  const algorithmDisplayName = isBFS ? "BFS" : "A*";

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

  // Generate algorithm step traces from user's current grid setup
  const handleVisualize = () => {
    const initialGrid = createInitialGrid(rows, cols, startPos, goalPos, walls);
    const generator = STEP_GENERATORS[algorithmId] || generateAStarSteps;
    const generatedSteps = generator(initialGrid, startPos, goalPos);
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
    <div className="w-full">
      {/* 2-Column Desktop Grid Layout / Stacking on Mobile & Tablet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Visual Focal Point (Grid Canvas + Single Playback Toolbar below) */}
        <div className="lg:col-span-7 xl:col-span-7 flex flex-col space-y-3">
          {/* Action Control Toolbar */}
          <div className="w-full flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#15181D] border border-[#292E36]">
            <div className="flex items-center gap-2 text-xs text-[#A7AFBB]">
              <span
                className={`h-2 w-2 rounded-full ${
                  hasGenerated ? "bg-[#55B89A]" : "bg-[#6C8CFF]"
                }`}
              />
              <span className="font-medium">
                {hasGenerated
                  ? `${algorithmDisplayName} Visualization Active`
                  : "Interactive Edit Mode: Draw walls, drag S or G"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {!hasGenerated ? (
                <>
                  <button
                    onClick={handleClearWalls}
                    disabled={walls.length === 0}
                    className="px-3 py-1.5 rounded-lg bg-[#1B1F25] hover:bg-[#292E36] text-[#A7AFBB] hover:text-[#F1F3F5] border border-[#292E36] font-medium text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Clear Walls
                  </button>
                  <button
                    onClick={handleVisualize}
                    className="px-4 py-1.5 rounded-lg bg-[#6C8CFF] hover:bg-[#5A7BEF] text-white font-medium text-xs transition-colors shadow-sm"
                  >
                    Visualize {algorithmDisplayName}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleResetSearch}
                    className="px-3 py-1.5 rounded-lg bg-[#1B1F25] hover:bg-[#292E36] text-[#F1F3F5] border border-[#292E36] font-medium text-xs transition-colors"
                  >
                    Reset & Edit Grid
                  </button>
                  <button
                    onClick={handleResetEntireGrid}
                    className="px-3 py-1.5 rounded-lg bg-[#1B1F25] hover:bg-[#292E36] text-[#A7AFBB] hover:text-[#F1F3F5] border border-[#292E36] font-medium text-xs transition-colors"
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

          {/* Playback Control Toolbar Component - directly below grid */}
          <PlaybackToolbar playback={playback} disabled={!hasGenerated} />
        </div>

        {/* Right Column: Unified Learning Panel (Step Narrative, g/h/f Cost Breakdown, Metrics, Pseudocode) */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col">
          <StepExplanation
            step={playback.currentStep}
            algorithmId={algorithmId}
          />
        </div>
      </div>
    </div>
  );
}


