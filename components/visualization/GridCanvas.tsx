"use client";

import React, { useState, useMemo, useCallback } from "react";
import { GridState, Position } from "@/types/grid";
import { Flag, Target, Check, Circle } from "lucide-react";

export interface GridCanvasProps {
  gridState: GridState;
  onToggleWall?: (pos: Position) => void;
  onMoveStart?: (pos: Position) => void;
  onMoveGoal?: (pos: Position) => void;
  isInteractive?: boolean;
}

export function GridCanvas({
  gridState,
  onToggleWall,
  onMoveStart,
  onMoveGoal,
  isInteractive = true,
}: GridCanvasProps) {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragMode, setDragMode] = useState<
    "wall" | "erase-wall" | "move-start" | "move-goal" | null
  >(null);

  const {
    grid,
    startPos,
    goalPos,
    currentNode,
    openSetPositions,
    closedSetPositions,
    pathPositions,
    consideredNeighbors,
  } = gridState;

  // O(1) position lookup tables
  const openSetKeys = useMemo(
    () => new Set(openSetPositions.map((p) => `${p.row},${p.col}`)),
    [openSetPositions]
  );
  const closedSetKeys = useMemo(
    () => new Set(closedSetPositions.map((p) => `${p.row},${p.col}`)),
    [closedSetPositions]
  );
  const pathSetKeys = useMemo(
    () => new Set(pathPositions.map((p) => `${p.row},${p.col}`)),
    [pathPositions]
  );
  const neighborKeys = useMemo(
    () => new Set(consideredNeighbors.map((p) => `${p.row},${p.col}`)),
    [consideredNeighbors]
  );

  const handleMouseDown = useCallback(
    (row: number, col: number) => {
      if (!isInteractive) return;
      setIsMouseDown(true);

      const isStart = row === startPos.row && col === startPos.col;
      const isGoal = row === goalPos.row && col === goalPos.col;
      const cell = grid[row]?.[col];

      if (isStart) {
        setDragMode("move-start");
      } else if (isGoal) {
        setDragMode("move-goal");
      } else if (cell?.type === "wall") {
        setDragMode("erase-wall");
        onToggleWall?.({ row, col });
      } else {
        setDragMode("wall");
        onToggleWall?.({ row, col });
      }
    },
    [isInteractive, startPos, goalPos, grid, onToggleWall]
  );

  const handleMouseEnter = useCallback(
    (row: number, col: number) => {
      if (!isInteractive || !isMouseDown || !dragMode) return;

      const isStart = row === startPos.row && col === startPos.col;
      const isGoal = row === goalPos.row && col === goalPos.col;
      const cell = grid[row]?.[col];

      if (dragMode === "move-start") {
        if (!isGoal && cell?.type !== "wall") {
          onMoveStart?.({ row, col });
        }
      } else if (dragMode === "move-goal") {
        if (!isStart && cell?.type !== "wall") {
          onMoveGoal?.({ row, col });
        }
      } else if (dragMode === "wall") {
        if (!isStart && !isGoal && cell?.type !== "wall") {
          onToggleWall?.({ row, col });
        }
      } else if (dragMode === "erase-wall") {
        if (cell?.type === "wall") {
          onToggleWall?.({ row, col });
        }
      }
    },
    [isInteractive, isMouseDown, dragMode, startPos, goalPos, grid, onMoveStart, onMoveGoal, onToggleWall]
  );

  const handleMouseUp = useCallback(() => {
    setIsMouseDown(false);
    setDragMode(null);
  }, []);

  const numCols = grid[0]?.length || 1;

  return (
    <div
      className="w-full flex flex-col items-center justify-center select-none"
      onMouseLeave={handleMouseUp}
      onMouseUp={handleMouseUp}
    >
      {/* Grid Matrix Container */}
      <div
        className="grid gap-1.5 sm:gap-2 p-3 sm:p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-2xl transition-all duration-200"
        style={{
          gridTemplateColumns: `repeat(${numCols}, minmax(0, 1fr))`,
        }}
      >
        {grid.map((rowNodes, rIdx) =>
          rowNodes.map((node, cIdx) => {
            const posKey = `${rIdx},${cIdx}`;
            const isStart = rIdx === startPos.row && cIdx === startPos.col;
            const isGoal = rIdx === goalPos.row && cIdx === goalPos.col;
            const isCurrent =
              currentNode?.row === rIdx && currentNode?.col === cIdx;
            const isPath = pathSetKeys.has(posKey);
            const isFrontier = openSetKeys.has(posKey);
            const isVisited = closedSetKeys.has(posKey);
            const isNeighbor = neighborKeys.has(posKey);
            const isWall = node.type === "wall";

            let cellClass =
              "bg-[var(--grid-node-unvisited-bg)] border-[var(--grid-node-unvisited-border)] text-[var(--text-muted)] hover:border-[var(--border-hover)]";
            let IconComponent: React.ReactNode = null;

            if (isStart) {
              cellClass =
                "bg-[var(--grid-node-start-bg)] border-[var(--grid-node-start-border)] text-[var(--grid-node-start-text)] shadow-[0_0_12px_rgba(108,140,255,0.4)] z-10 scale-[1.04]";
              IconComponent = <Flag className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />;
            } else if (isGoal) {
              cellClass =
                "bg-[var(--grid-node-goal-bg)] border-[var(--grid-node-goal-border)] text-[var(--grid-node-goal-text)] shadow-[0_0_12px_rgba(224,82,99,0.4)] z-10 scale-[1.04]";
              IconComponent = <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />;
            } else if (isWall) {
              cellClass =
                "bg-[var(--grid-node-wall-bg)] border-[var(--grid-node-wall-border)] shadow-inner";
            } else if (isPath) {
              cellClass =
                "bg-[var(--grid-node-path-bg)] border-[var(--grid-node-path-border)] text-[var(--grid-node-path-text)] shadow-[0_0_14px_rgba(85,184,154,0.5)] z-10 font-bold scale-[1.02]";
              IconComponent = <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />;
            } else if (isCurrent) {
              cellClass =
                "bg-[var(--primitive-blue-500)] border-white text-white scale-110 shadow-[0_0_16px_rgba(108,140,255,0.8)] z-20";
              IconComponent = <Circle className="w-2.5 h-2.5 fill-current" />;
            } else if (isNeighbor) {
              cellClass =
                "bg-[var(--grid-node-frontier-bg)] border-[var(--grid-node-frontier-border)] text-[var(--grid-node-frontier-text)] scale-105";
            } else if (isFrontier) {
              cellClass =
                "bg-[var(--grid-node-frontier-bg)] border-[var(--grid-node-frontier-border)] text-[var(--grid-node-frontier-text)]";
            } else if (isVisited) {
              // Calibrated low-saturation visited state (Josef Albers simultaneous contrast preservation)
              cellClass =
                "bg-[var(--grid-node-visited-bg)] border-[var(--grid-node-visited-border)] text-[var(--text-muted)]";
            }

            return (
              <div
                key={posKey}
                onMouseDown={() => handleMouseDown(rIdx, cIdx)}
                onMouseEnter={() => handleMouseEnter(rIdx, cIdx)}
                className={`w-full aspect-square min-w-[24px] sm:min-w-[28px] md:min-w-[32px] lg:min-w-[36px] xl:min-w-[40px] max-w-[48px] flex items-center justify-center rounded-[6px] border text-xs cursor-pointer transition-colors duration-150 active:scale-[0.98] ${cellClass}`}
                title={`Cell (${rIdx}, ${cIdx}) • g: ${
                  node.gCost === Infinity ? "∞" : node.gCost
                } • h: ${
                  node.hCost === Infinity ? "∞" : node.hCost.toFixed(1)
                } • f: ${node.fCost === Infinity ? "∞" : node.fCost.toFixed(1)}`}
              >
                {IconComponent}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
