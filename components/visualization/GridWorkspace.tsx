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
  Shuffle,
  Trash2,
  Bookmark,
  ChevronRight,
  Code2,
  X,
  Gauge,
  SlidersHorizontal,
} from "lucide-react";

interface GridWorkspaceProps {
  algorithmId: string;
  initialGridData?: any;
}

export function GridWorkspace({ algorithmId, initialGridData }: GridWorkspaceProps) {
  const router = useRouter();
  
  // Spacious studio dimensions (11 rows x 22 columns)
  const rows = 11;
  const cols = 22;

  // Active algorithm metadata
  const currentAlgo = ALGORITHMS.find((a) => a.id === algorithmId) || ALGORITHMS[0];
  const gridAlgorithms = ALGORITHMS.filter((a) => a.visualizerType === "grid");

  // Persistent user grid configuration (preserved across resets)
  const [startPos, setStartPos] = useState<Position>(
    initialGridData?.startPos || { row: 5, col: 2 }
  );
  const [goalPos, setGoalPos] = useState<Position>(
    initialGridData?.goalPos || { row: 5, col: 19 }
  );
  const [walls, setWalls] = useState<Position[]>(initialGridData?.walls || []);

  // Heuristic Selection (for A* and Greedy BFS)
  const [heuristicType, setHeuristicType] = useState<"manhattan" | "euclidean" | "chebyshev">("manhattan");

  // Collapsible inspector drawer state
  const [showInspector, setShowInspector] = useState(false);

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
    // Wall 2 at col 11 with opening at row 7 and 8
    for (let r = 0; r < rows; r++) {
      if (r !== 7 && r !== 8) newWalls.push({ row: r, col: 11 });
    }
    // Wall 3 at col 16 with opening at row 3 and 4
    for (let r = 0; r < rows; r++) {
      if (r !== 3 && r !== 4) newWalls.push({ row: r, col: 16 });
    }
    setWalls(newWalls);
  };

  // Preset 3: Factory Reset
  const handleResetEntireGrid = () => {
    playback.reset();
    setStartPos({ row: 5, col: 2 });
    setGoalPos({ row: 5, col: 19 });
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
        sub: "Canvas Ready",
        colorClass: "bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-default)]",
        dotClass: "bg-[var(--text-muted)]",
      };
    }
    if (playback.isPlaying) {
      return {
        label: "Executing",
        sub: `Step ${playback.currentStepIndex + 1}/${playback.totalSteps}`,
        colorClass: "bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border-[var(--color-accent)]/40",
        dotClass: "bg-[var(--color-accent)] animate-pulse",
      };
    }
    if (playback.currentStepIndex === playback.totalSteps - 1 && playback.totalSteps > 0) {
      const reachedGoal = playback.currentStep?.state.pathPositions.length ?? 0;
      if (reachedGoal > 0) {
        return {
          label: "Converged",
          sub: `Optimal Path: ${reachedGoal} nodes`,
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
      sub: `Step ${playback.currentStepIndex + 1}/${playback.totalSteps}`,
      colorClass: "bg-[rgba(217,164,65,0.16)] text-[var(--color-frontier)] border-[var(--color-frontier)]/40",
      dotClass: "bg-[var(--color-frontier)]",
    };
  }, [hasGenerated, playback.isPlaying, playback.currentStepIndex, playback.totalSteps, playback.currentStep]);

  return (
    <div className="w-full h-[calc(100dvh-64px)] flex flex-col bg-[#070A0F] text-[#F8FAFC] relative select-none overflow-hidden">
      {/* =========================================================================
          TOP STUDIO CONTROL BAR: Algorithm Tabs, Presets, Heuristics, Inspector
          ========================================================================= */}
      <header className="shrink-0 w-full border-b border-[#1A2230] bg-[#0B0F17] px-4 sm:px-6 py-2 z-30 shadow-md">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Algorithm Navigator Tabs (Segmented Clean Pills) */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <Link
              href="/algorithms"
              className="text-xs text-[#828E9E] hover:text-[#F8FAFC] transition-colors mr-2 font-medium flex items-center gap-1 shrink-0"
            >
              <span>←</span>
              <span>Explorer</span>
            </Link>

            <div className="flex items-center gap-1 bg-[#070A0F] p-0.5 rounded-lg border border-[#1A2230]">
              {gridAlgorithms.map((algo) => {
                const isActive = algo.id === algorithmId;
                return (
                  <button
                    key={algo.id}
                    onClick={() => {
                      if (!isActive) router.push(`/algorithms/${algo.id}`);
                    }}
                    className={`px-3 py-1.5 rounded-md text-xs transition-all active:scale-[0.97] whitespace-nowrap ${
                      isActive
                        ? "bg-[#6C8CFF]/20 text-[#6C8CFF] border border-[#6C8CFF]/50 shadow-xs font-semibold"
                        : "text-[#828E9E] hover:text-[#F8FAFC] hover:bg-[#12161D]"
                    }`}
                  >
                    <span className="font-mono text-xs">{algo.shortName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Studio Controls: Heuristic, Maze Presets, Inspector */}
          <div className="flex items-center gap-2">
            {/* Heuristic Selector (for A* / Greedy) */}
            {(algorithmId === "a-star" || algorithmId === "greedy-bfs") && (
              <div className="hidden sm:flex items-center gap-1 bg-[#070A0F] p-1 rounded-lg border border-[#1A2230] text-xs">
                <span className="text-[10px] font-mono uppercase text-[#828E9E] px-1.5">Heuristic:</span>
                {(["manhattan", "euclidean", "chebyshev"] as const).map((h) => (
                  <button
                    key={h}
                    onClick={() => {
                      setHeuristicType(h);
                      if (hasGenerated) handleResetSearch();
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono capitalize transition-all ${
                      heuristicType === h
                        ? "bg-[#6C8CFF] text-white font-semibold shadow-xs"
                        : "text-[#828E9E] hover:text-[#F8FAFC]"
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            )}

            {/* Maze Presets */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleGenerateRandomMaze}
                disabled={hasGenerated}
                className="px-2.5 py-1.5 rounded-lg bg-[#12161D] hover:bg-[#1A2230] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#232B36] text-xs font-medium flex items-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
                title="Generate 28% Random Wall Density"
              >
                <Shuffle className="w-3.5 h-3.5 text-[#828E9E]" />
                <span className="hidden sm:inline">Random Maze</span>
              </button>

              <button
                onClick={handleGenerateCorridorPreset}
                disabled={hasGenerated}
                className="px-2.5 py-1.5 rounded-lg bg-[#12161D] hover:bg-[#1A2230] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#232B36] text-xs font-medium flex items-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
                title="Generate Corridor Barrier Labyrinth"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#828E9E]" />
                <span className="hidden sm:inline">Corridors</span>
              </button>

              <button
                onClick={handleClearWalls}
                disabled={walls.length === 0 || hasGenerated}
                className="p-1.5 rounded-lg bg-[#12161D] hover:bg-[#1A2230] text-[#828E9E] hover:text-red-400 border border-[#232B36] text-xs transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
                title="Clear all walls"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Inspector Drawer Toggle Button */}
            <button
              onClick={() => setShowInspector(!showInspector)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all active:scale-[0.98] flex items-center gap-1.5 ${
                showInspector
                  ? "bg-[#6C8CFF]/20 text-[#6C8CFF] border-[#6C8CFF]/50"
                  : "bg-[#12161D] text-[#94A3B8] hover:text-[#F8FAFC] border-[#232B36]"
              }`}
              title="Toggle Code Tracer & Specs"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs">Tracer & Specs</span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          HORIZONTAL TELEMETRY & STATUS STRIP (Directly Above the Canvas)
          ========================================================================= */}
      <section className="shrink-0 w-full border-b border-[#161D2A] bg-[#090D14] px-4 sm:px-6 py-2">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
          
          {/* Status Badge */}
          <div className={`px-2.5 py-1 rounded-full border text-xs flex items-center gap-2 font-medium ${statusBadge.colorClass}`}>
            <span className={`h-2 w-2 rounded-full ${statusBadge.dotClass}`} />
            <span className="font-semibold">{statusBadge.label}</span>
            <span className="text-[11px] font-mono tabular-nums opacity-85">
              • {statusBadge.sub}
            </span>
          </div>

          {/* Interactive Legend (Start, Goal, Wall, Visited, Frontier, Solution) */}
          <div className="hidden md:flex items-center gap-3.5 text-[11px] text-[#828E9E]">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-[3px] border border-[#93C5FD] bg-[#2563EB] shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
              <span className="text-[#F8FAFC]">Start</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-[3px] border border-[#FDA4AF] bg-[#E11D48] shadow-[0_0_8px_rgba(225,29,72,0.4)]" />
              <span className="text-[#F8FAFC]">Goal</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-[3px] border border-[#32405A] bg-[#222B3D]" />
              <span>Wall</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-[3px] border border-[#222E46] bg-[#131B2C]" />
              <span>Visited</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-[3px] border border-[#F59E0B] bg-[#D97706]/20" />
              <span className="text-amber-300">Frontier</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-[3px] border border-[#34D399] bg-[#059669] shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
              <span className="text-emerald-400 font-semibold">Solution</span>
            </span>
          </div>

          {/* Horizontal Telemetry Numbers */}
          <MetricsPanel
            metrics={activeMetrics}
            currentNode={activeNodeInfo}
            variant="horizontal"
          />
        </div>
      </section>

      {/* =========================================================================
          THE CANVAS HERO: Full-Width, Expansive, Breathing Grid Stage
          ========================================================================= */}
      <main className="flex-1 min-h-0 w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-2 flex items-center justify-center overflow-auto">
        <GridCanvas
          gridState={activeGridState}
          onToggleWall={handleToggleWall}
          onMoveStart={handleMoveStart}
          onMoveGoal={handleMoveGoal}
          isInteractive={!hasGenerated}
        />
      </main>

      {/* =========================================================================
          PINNED BOTTOM CONTROL DOCK: Zero Overlap with Canvas
          ========================================================================= */}
      <footer className="shrink-0 w-full border-t border-[#1A2230] bg-[#0B0F17] px-4 py-2.5 flex justify-center z-20 shadow-xl">
        <PlaybackToolbar
          playback={playback}
          disabled={false}
          hasGenerated={hasGenerated}
          onExecute={handleVisualize}
        />
      </footer>

      {/* =========================================================================
          COLLAPSIBLE SLIDE-OUT INSPECTOR DRAWER (Pedagogical Pseudocode & Specs)
          ========================================================================= */}
      {showInspector && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#0D121B] border-l border-[#232B3C] shadow-2xl flex flex-col p-5 space-y-4 overflow-y-auto animate-in slide-in-from-right duration-200">
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-[#1A2230] pb-3">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[#6C8CFF]" />
              <h3 className="text-sm font-bold text-[#F8FAFC]">
                {currentAlgo.name} Inspector
              </h3>
            </div>
            <button
              onClick={() => setShowInspector(false)}
              className="p-1 rounded-lg hover:bg-[#1A2230] text-[#828E9E] hover:text-[#F8FAFC] transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Complexity Specs */}
          <div className="p-3 rounded-xl bg-[#12161D] border border-[#232B36] text-xs space-y-2">
            <span className="text-[11px] font-semibold text-[#F8FAFC] block">
              Complexity Profile
            </span>
            <div className="space-y-1 text-[11px] text-[#828E9E]">
              <div className="flex justify-between py-0.5 border-b border-[#1A2230]">
                <span>Time Complexity:</span>
                <span className="font-mono tabular-nums text-[#F8FAFC] font-medium">
                  {currentAlgo.timeComplexity}
                </span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-[#1A2230]">
                <span>Space Complexity:</span>
                <span className="font-mono tabular-nums text-[#F8FAFC] font-medium">
                  {currentAlgo.spaceComplexity}
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>Shortest Path:</span>
                <span className="font-medium text-emerald-400">
                  {algorithmId === "bfs" || algorithmId === "ucs" || algorithmId === "a-star"
                    ? "Guaranteed Optimal"
                    : "Heuristic Dependent"}
                </span>
              </div>
            </div>
          </div>

          {/* Live Pseudocode Execution Tracer */}
          <StepExplanation step={playback.currentStep} />
        </div>
      )}
    </div>
  );
}

