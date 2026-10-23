"use client";

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GridCanvas } from "@/components/visualization/GridCanvas";
import { PlaybackToolbar } from "@/components/visualization/PlaybackToolbar";
import { StepExplanation } from "@/components/visualization/StepExplanation";
import { MetricsPanel } from "@/components/visualization/MetricsPanel";
import { Position, GridState } from "@/types/grid";
import { createInitialGrid, generateAStarSteps } from "@/lib/algorithms/aStar";
import { generateBfsSteps } from "@/lib/algorithms/bfs";
import { generateDfsSteps } from "@/lib/algorithms/dfs";
import { generateUcsSteps } from "@/lib/algorithms/ucs";
import { generateGreedyBfsSteps } from "@/lib/algorithms/greedyBfs";
import { manhattanDistance, euclideanDistance, chebyshevDistance, HeuristicFunction } from "@/lib/heuristics";
import { useVisualizerPlayback } from "@/hooks/useVisualizerPlayback";
import { AlgorithmStep } from "@/types/visualizer";
import { saveGrid } from "@/app/actions/grids";
import { ALGORITHMS } from "@/data/algorithms";
import {
  Play,
  RotateCcw,
  Sparkles,
  Sliders,
  Shuffle,
  Grid,
  Trash2,
  Bookmark,
  ChevronRight,
  ShieldAlert,
  Flame,
  CheckCircle2,
} from "lucide-react";

interface GridWorkspaceProps {
  algorithmId: string;
  initialGridData?: any;
}

export function GridWorkspace({ algorithmId, initialGridData }: GridWorkspaceProps) {
  const router = useRouter();
  const rows = 11;
  const cols = 20;

  // Active algorithm metadata
  const currentAlgo = ALGORITHMS.find((a) => a.id === algorithmId) || ALGORITHMS[0];
  const gridAlgorithms = ALGORITHMS.filter((a) => a.visualizerType === "grid");

  // Persistent user grid configuration (preserved across resets)
  const [startPos, setStartPos] = useState<Position>(
    initialGridData?.startPos || { row: 5, col: 2 }
  );
  const [goalPos, setGoalPos] = useState<Position>(
    initialGridData?.goalPos || { row: 5, col: 17 }
  );
  const [walls, setWalls] = useState<Position[]>(initialGridData?.walls || []);

  // Heuristic Selection (for A* and Greedy BFS)
  const [heuristicType, setHeuristicType] = useState<"manhattan" | "euclidean" | "chebyshev">("manhattan");

  // Generated algorithm visualization steps
  const [steps, setSteps] = useState<AlgorithmStep<GridState>[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Playback controller hook
  const playback = useVisualizerPlayback(steps, algorithmId);

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

  // Active display state: playback snapshot during execution, or editableGridState during editing
  const activeGridState =
    hasGenerated && playback.currentStep
      ? playback.currentStep.state
      : editableGridState;

  // Active metrics snapshot
  const activeMetrics = playback.currentStep ? playback.currentStep.metrics : null;

  // Active node coordinates for telemetry HUD
  const activeNodeInfo = useMemo(() => {
    if (!playback.currentStep || !playback.currentStep.state.currentNode) return null;
    const cur = playback.currentStep.state.currentNode;
    const node = playback.currentStep.state.grid[cur.row]?.[cur.col];
    if (!node) return null;
    return {
      row: cur.row,
      col: cur.col,
      gCost: node.gCost,
      hCost: node.hCost,
      fCost: node.fCost,
    };
  }, [playback.currentStep]);

  // Selected heuristic function reference
  const selectedHeuristic: HeuristicFunction = useMemo(() => {
    if (heuristicType === "euclidean") return euclideanDistance;
    if (heuristicType === "chebyshev") return chebyshevDistance;
    return manhattanDistance;
  }, [heuristicType]);

  // Generate step traces dynamically
  const handleVisualize = () => {
    const initialGrid = createInitialGrid(rows, cols, startPos, goalPos, walls);

    let generatedSteps: AlgorithmStep<GridState>[] = [];
    if (algorithmId === "bfs") {
      generatedSteps = generateBfsSteps(initialGrid, startPos, goalPos);
    } else if (algorithmId === "dfs") {
      generatedSteps = generateDfsSteps(initialGrid, startPos, goalPos);
    } else if (algorithmId === "ucs") {
      generatedSteps = generateUcsSteps(initialGrid, startPos, goalPos);
    } else if (algorithmId === "greedy-bfs") {
      generatedSteps = generateGreedyBfsSteps(initialGrid, startPos, goalPos, selectedHeuristic);
    } else {
      // Default to A* Search
      generatedSteps = generateAStarSteps(initialGrid, startPos, goalPos, selectedHeuristic);
    }

    setSteps(generatedSteps);
    setHasGenerated(true);
    playback.reset();
  };

  // Reset search: exits visualization mode, strictly PRESERVING user walls, startPos, and goalPos
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

  // Preset 1: Random Maze (approx 28% density)
  const handleGenerateRandomMaze = () => {
    handleResetSearch();
    const newWalls: Position[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isStart = r === startPos.row && c === startPos.col;
        const isGoal = r === goalPos.row && c === goalPos.col;
        if (!isStart && !isGoal && Math.random() < 0.28) {
          newWalls.push({ row: r, col: c });
        }
      }
    }
    setWalls(newWalls);
  };

  // Preset 2: Recursive Corridors / Slit Barrier
  const handleGenerateCorridorPreset = () => {
    handleResetSearch();
    const newWalls: Position[] = [];
    // Wall 1 at col 5 with opening at row 3 and 4
    for (let r = 0; r < rows; r++) {
      if (r !== 3 && r !== 4) newWalls.push({ row: r, col: 5 });
    }
    // Wall 2 at col 10 with opening at row 7 and 8
    for (let r = 0; r < rows; r++) {
      if (r !== 7 && r !== 8) newWalls.push({ row: r, col: 10 });
    }
    // Wall 3 at col 15 with opening at row 3 and 4
    for (let r = 0; r < rows; r++) {
      if (r !== 3 && r !== 4) newWalls.push({ row: r, col: 15 });
    }
    setWalls(newWalls);
  };

  // Preset 3: Factory Reset
  const handleResetEntireGrid = () => {
    playback.reset();
    setStartPos({ row: 5, col: 2 });
    setGoalPos({ row: 5, col: 17 });
    setWalls([]);
    setSteps([]);
    setHasGenerated(false);
  };

  // Save current maze configuration to persistent user store
  const handleSaveMaze = async () => {
    setIsSaving(true);
    const gridData = { startPos, goalPos, walls, rows, cols };
    const res = await saveGrid(gridData, `${currentAlgo.shortName} Custom Maze`);
    setIsSaving(false);
    if (res.success) {
      alert(`Maze successfully saved! ID: ${res.gridId}`);
    } else {
      alert("Failed to save maze. Please verify session state.");
    }
  };

  // Interactive wall toggle handler
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

  // Calculate execution state label & color
  const statusBadge = useMemo(() => {
    if (!hasGenerated) {
      return {
        label: "Edit Mode",
        sub: "Interactive Canvas Ready",
        colorClass: "bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-default)]",
        dotClass: "bg-[var(--text-muted)]",
      };
    }
    if (playback.isPlaying) {
      return {
        label: "Executing",
        sub: `Step ${playback.currentStepIndex + 1} / ${playback.totalSteps}`,
        colorClass: "bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border-[var(--color-accent)]/40",
        dotClass: "bg-[var(--color-accent)] animate-pulse",
      };
    }
    if (playback.currentStepIndex === playback.totalSteps - 1 && playback.totalSteps > 0) {
      const reachedGoal = playback.currentStep?.state.pathPositions.length ?? 0;
      if (reachedGoal > 0) {
        return {
          label: "Converged",
          sub: `Optimal Path Length: ${reachedGoal}`,
          colorClass: "bg-[rgba(85,184,154,0.18)] text-[var(--color-path)] border-[var(--color-path)]/40",
          dotClass: "bg-[var(--color-path)]",
        };
      }
      return {
        label: "Exhausted",
        sub: "No Reachable Path",
        colorClass: "bg-[rgba(224,82,99,0.18)] text-[var(--color-goal)] border-[var(--color-goal)]/40",
        dotClass: "bg-[var(--color-goal)]",
      };
    }
    return {
      label: "Paused",
      sub: `Step ${playback.currentStepIndex + 1} of ${playback.totalSteps}`,
      colorClass: "bg-[rgba(217,164,65,0.16)] text-[var(--color-frontier)] border-[var(--color-frontier)]/40",
      dotClass: "bg-[var(--color-frontier)]",
    };
  }, [hasGenerated, playback.isPlaying, playback.currentStepIndex, playback.totalSteps, playback.currentStep]);

  return (
    <div className="w-full min-h-[100dvh] flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* =========================================================================
          WORKBENCH TOP HEADER STRIP: Minimal, Non-Jitter, Clean Navigation
          ========================================================================= */}
      <header className="w-full border-b border-[var(--border-default)] bg-[var(--bg-surface)] px-4 sm:px-6 py-3">
        <div className="max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Breadcrumb & Algorithm Identity */}
          <div className="flex items-center gap-3">
            <Link
              href="/algorithms"
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1 font-medium"
            >
              <span>Algorithms</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-[var(--text-primary)] tracking-tight">
                {currentAlgo.name}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border border-[var(--color-accent)]/30 font-semibold">
                {currentAlgo.category}
              </span>
            </div>
          </div>

          {/* Status & Telemetry Pill */}
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full border text-xs flex items-center gap-2 font-medium ${statusBadge.colorClass}`}>
              <span className={`h-2 w-2 rounded-full ${statusBadge.dotClass}`} />
              <span className="font-semibold">{statusBadge.label}</span>
              <span className="text-[11px] font-mono tabular-nums opacity-85">
                • {statusBadge.sub}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================================
          3-COLUMN FIXED DESKTOP WORKBENCH: Left Rail (3) | Center Stage (6) | Right Rail (3)
          Falls back to single column on viewports < 1024px (Mobile Override)
          ========================================================================= */}
      <main className="flex-1 w-full max-w-[1780px] mx-auto p-3 sm:p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-[250px_1fr_290px] xl:grid-cols-[265px_1fr_315px] gap-5 items-start">
        
        {/* =======================================================================
            LEFT RAIL: Algorithm Switcher, Parameters, & Presets
            ======================================================================= */}
        <aside className="w-full flex flex-col gap-4">
          
          {/* Algorithm Navigator Section */}
          <div className="rounded-xl bg-[var(--workbench-rail-bg)] border border-[var(--border-default)] p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-medium">
              <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Grid className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                Grid Algorithms
              </span>
              <span className="text-[10px] font-mono tabular-nums">
                5 Solvers
              </span>
            </div>

            <div className="flex flex-col gap-1">
              {gridAlgorithms.map((algo) => {
                const isActive = algo.id === algorithmId;
                return (
                  <button
                    key={algo.id}
                    onClick={() => {
                      if (!isActive) {
                        router.push(`/algorithms/${algo.id}`);
                      }
                    }}
                    className={`w-full px-3 py-2 rounded-lg text-left text-xs transition-all flex items-center justify-between active:scale-[0.98] ${
                      isActive
                        ? "bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border border-[var(--color-accent)]/40 font-semibold"
                        : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] border border-[var(--border-subtle)]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold opacity-80">
                        {algo.shortName}
                      </span>
                      <span className="truncate max-w-[140px] text-[11px]">
                        {algo.name}
                      </span>
                    </div>
                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Parameter Controls Section */}
          <div className="rounded-xl bg-[var(--workbench-rail-bg)] border border-[var(--border-default)] p-3.5 space-y-3.5">
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-primary)] font-semibold border-b border-[var(--border-subtle)] pb-2">
              <Sliders className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              <span>Parameter Controls</span>
            </div>

            {/* Heuristic Distance Selector (for A* / Greedy) */}
            {(algorithmId === "a-star" || algorithmId === "greedy-bfs") && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-[var(--text-secondary)] flex items-center justify-between">
                  <span>Heuristic Metric h(n)</span>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">
                    {heuristicType === "manhattan" ? "L1 Norm" : heuristicType === "euclidean" ? "L2 Norm" : "L∞ Norm"}
                  </span>
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {(["manhattan", "euclidean", "chebyshev"] as const).map((h) => (
                    <button
                      key={h}
                      onClick={() => {
                        setHeuristicType(h);
                        if (hasGenerated) handleResetSearch();
                      }}
                      className={`px-2 py-1.5 rounded-md text-[10px] font-mono capitalize transition-all active:scale-[0.96] ${
                        heuristicType === h
                          ? "bg-[var(--color-accent)] text-white font-bold shadow-sm"
                          : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Maze Topology Presets */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-[var(--text-secondary)] flex items-center justify-between">
                <span>Obstacle Presets</span>
                <span className="text-[10px] font-mono tabular-nums text-[var(--text-muted)]">
                  {walls.length} walls active
                </span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={handleGenerateRandomMaze}
                  disabled={hasGenerated}
                  className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] text-[11px] flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Shuffle className="w-3 h-3 text-[var(--text-muted)]" />
                  <span>Random (30%)</span>
                </button>
                <button
                  onClick={handleGenerateCorridorPreset}
                  disabled={hasGenerated}
                  className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] text-[11px] flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-3 h-3 text-[var(--text-muted)]" />
                  <span>Corridors</span>
                </button>
              </div>
            </div>

            {/* Grid Editing Actions */}
            <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
              {!hasGenerated ? (
                <button
                  onClick={handleVisualize}
                  className="w-full py-2.5 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute {currentAlgo.shortName} Search</span>
                </button>
              ) : (
                <button
                  onClick={handleResetSearch}
                  className="w-full py-2 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-overlay)] text-[var(--text-primary)] border border-[var(--border-default)] text-xs font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Return to Grid Edit Mode</span>
                </button>
              )}

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={handleClearWalls}
                  disabled={walls.length === 0}
                  className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] text-[11px] flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-3 h-3 text-[var(--text-muted)]" />
                  <span>Clear Walls</span>
                </button>

                <button
                  onClick={handleSaveMaze}
                  disabled={isSaving}
                  className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] text-[11px] flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Bookmark className="w-3 h-3 text-[var(--text-muted)]" />
                  <span>{isSaving ? "Saving..." : "Save Maze"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Algorithm Complexity Card */}
          <div className="rounded-xl bg-[var(--workbench-rail-bg)] border border-[var(--border-default)] p-3.5 text-xs space-y-2">
            <span className="text-[11px] font-semibold text-[var(--text-primary)] block">
              Complexity Profile
            </span>
            <div className="space-y-1 text-[11px] text-[var(--text-secondary)]">
              <div className="flex justify-between py-0.5 border-b border-[var(--border-subtle)]">
                <span className="text-[var(--text-muted)]">Time Complexity:</span>
                <span className="font-mono tabular-nums text-[var(--text-primary)] font-medium">
                  {currentAlgo.timeComplexity}
                </span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-[var(--border-subtle)]">
                <span className="text-[var(--text-muted)]">Space Complexity:</span>
                <span className="font-mono tabular-nums text-[var(--text-primary)] font-medium">
                  {currentAlgo.spaceComplexity}
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-[var(--text-muted)]">Shortest Path:</span>
                <span className="font-medium text-[var(--color-path)]">
                  {algorithmId === "bfs" || algorithmId === "ucs" || algorithmId === "a-star"
                    ? "Guaranteed Optimal"
                    : "Heuristic Dependent"}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* =======================================================================
            CENTER STAGE (1fr): Edge-to-Edge Canvas + Pinned Playback Dock
            ======================================================================= */}
        <section className="w-full min-w-0 flex-1 flex flex-col items-center justify-between gap-4 relative">
          
          {/* Legend Banner Strip (No Emojis, Calibrated Josef Albers States) */}
          <div className="w-full px-4 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--text-secondary)]">
            <div className="flex flex-wrap items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-[3px] border border-[var(--grid-node-start-border)] bg-[var(--grid-node-start-bg)]" />
                <span className="text-[var(--text-primary)]">Start (S)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-[3px] border border-[var(--grid-node-goal-border)] bg-[var(--grid-node-goal-bg)]" />
                <span className="text-[var(--text-primary)]">Goal (G)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-[3px] border border-[var(--grid-node-wall-border)] bg-[var(--grid-node-wall-bg)]" />
                <span>Wall</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-[3px] border border-[var(--grid-node-visited-border)] bg-[var(--grid-node-visited-bg)]" />
                <span>Visited</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-[3px] border border-[var(--grid-node-frontier-border)] bg-[var(--grid-node-frontier-bg)]" />
                <span className="text-[var(--primitive-gold-300)]">Frontier</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-[3px] border border-[var(--grid-node-path-border)] bg-[var(--grid-node-path-bg)] shadow-[0_0_8px_rgba(85,184,154,0.35)]" />
                <span className="text-[var(--primitive-teal-300)] font-semibold">Solution</span>
              </span>
            </div>

            <div className="text-[11px] font-mono tabular-nums text-[var(--text-muted)]">
              {rows}×{cols} Matrix
            </div>
          </div>

          {/* Interactive Edge-to-Edge Grid Canvas with Generous Breathing Room */}
          <div className="w-full flex-1 flex items-center justify-center p-3 sm:p-5 lg:p-6 rounded-2xl bg-[var(--bg-surface)]/50 border border-[var(--border-subtle)] overflow-x-auto shadow-inner backdrop-blur-sm">
            <GridCanvas
              gridState={activeGridState}
              onToggleWall={handleToggleWall}
              onMoveStart={handleMoveStart}
              onMoveGoal={handleMoveGoal}
              isInteractive={!hasGenerated}
            />
          </div>

          {/* Pinned Bottom Playback Dock (Sticky at Bottom of Stage) */}
          <div className="w-full sticky bottom-3 z-20 flex justify-center pt-2">
            <PlaybackToolbar
              playback={playback}
              disabled={false}
              hasGenerated={hasGenerated}
              onExecute={handleVisualize}
            />
          </div>
        </section>

        {/* =======================================================================
            RIGHT RAIL: Real-time Telemetry HUD & Execution Tracer
            ======================================================================= */}
        <aside className="w-full flex flex-col gap-4">
          {/* Real-time Telemetry HUD (Anti-Slop: Linear Dividers with tabular figures) */}
          <MetricsPanel
            metrics={activeMetrics}
            currentNode={activeNodeInfo}
          />

          {/* Live Pseudocode Execution Tracer */}
          <StepExplanation
            step={playback.currentStep}
          />
        </aside>

      </main>
    </div>
  );
}
