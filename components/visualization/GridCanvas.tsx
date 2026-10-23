"use client";

import React, { useState, useMemo, useCallback } from "react";
import { GridState, Position } from "@/types/grid";

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

  // Fast O(1) position lookup sets
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
      {/* Legend Header */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-4 text-xs text-[#94A3B8]">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-[#10B981] bg-[#10B981]/25" /> Start
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-[#F43F5E] bg-[#F43F5E]/25" /> Goal
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-[#333E50] bg-[#222A36]" /> Wall
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-[#1E2A3C] bg-[#131B28]" /> Visited
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-[#F59E0B] bg-[#F59E0B]/20" /> Frontier
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-[#34D399] bg-[#10B981]/30 shadow-[0_0_8px_rgba(52,211,153,0.35)]" /> Optimal Path
        </span>
      </div>

      {/* Grid Container */}
      <div
        className="grid gap-1 p-3 rounded-xl bg-[#12161D] border border-[#232B36] max-w-full overflow-x-auto shadow-inner"
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

            let cellStyles =
              "bg-[#0D1015] border-[#1B222C] text-[#828E9E] hover:border-[#333E50]";
            let label = "";

            if (isStart) {
              cellStyles =
                "bg-[#10B981]/25 border-2 border-[#10B981] text-[#34D399] font-bold shadow-[0_0_8px_rgba(16,185,129,0.35)]";
              label = "S";
            } else if (isGoal) {
              cellStyles =
                "bg-[#F43F5E]/25 border-2 border-[#F43F5E] text-[#FDA4AF] font-bold shadow-[0_0_8px_rgba(244,63,94,0.35)]";
              label = "G";
            } else if (isWall) {
              cellStyles = "bg-[#222A36] border-[#333E50] text-[#64748B]";
            } else if (isPath) {
              cellStyles =
                "bg-[#10B981]/30 border-[#34D399] text-[#34D399] font-bold shadow-[0_0_10px_rgba(52,211,153,0.45)]";
              label = "✓";
            } else if (isCurrent) {
              cellStyles =
                "bg-[#38BDF8] border-white text-white font-bold scale-105 shadow-[0_0_12px_rgba(56,189,248,0.7)] z-10";
              label = "•";
            } else if (isNeighbor) {
              cellStyles =
                "bg-[#F59E0B]/25 border-[#F59E0B] text-[#FDE68A]";
            } else if (isFrontier) {
              cellStyles =
                "bg-[#F59E0B]/15 border-[#F59E0B]/80 text-[#FDE68A]";
            } else if (isVisited) {
              cellStyles =
                "bg-[#131B28] border-[#1E2A3C] text-[#64748B]";
            }

            return (
              <div
                key={posKey}
                onMouseDown={() => handleMouseDown(rIdx, cIdx)}
                onMouseEnter={() => handleMouseEnter(rIdx, cIdx)}
                className={`w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center rounded border text-xs cursor-pointer transition-all duration-150 ${cellStyles}`}
                title={`Cell (${rIdx}, ${cIdx}) - g:${
                  node.gCost === Infinity ? "∞" : node.gCost
                } h:${
                  node.hCost === Infinity ? "∞" : node.hCost.toFixed(1)
                } f:${node.fCost === Infinity ? "∞" : node.fCost.toFixed(1)}`}
              >
                {label}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
