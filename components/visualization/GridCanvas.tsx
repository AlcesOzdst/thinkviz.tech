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
      className="w-full flex items-center justify-center select-none overflow-x-auto py-2"
      onMouseLeave={handleMouseUp}
      onMouseUp={handleMouseUp}
    >
      {/* Grid Matrix Container */}
      <div
        className="w-fit mx-auto grid gap-1 sm:gap-1.5 p-3 sm:p-5 rounded-2xl bg-[#090D14] border border-[#1E2638] shadow-2xl transition-all duration-200"
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
              "bg-[#0D121D] border-[#1C2538] text-[var(--text-muted)] hover:border-[#3B82F6] hover:bg-[#151E32]";
            let IconComponent: React.ReactNode = null;

            if (isStart) {
              cellClass =
                "bg-[#2563EB] border-2 border-[#93C5FD] text-white shadow-[0_0_16px_rgba(37,99,235,0.7)] z-10 scale-[1.05]";
              IconComponent = <Flag className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />;
            } else if (isGoal) {
              cellClass =
                "bg-[#E11D48] border-2 border-[#FDA4AF] text-white shadow-[0_0_16px_rgba(225,29,72,0.7)] z-10 scale-[1.05]";
              IconComponent = <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />;
            } else if (isWall) {
              cellClass =
                "bg-[#222B3D] border-[#32405A] shadow-inner";
            } else if (isPath) {
              cellClass =
                "bg-[#059669] border border-[#34D399] text-white shadow-[0_0_16px_rgba(52,211,153,0.6)] z-10 font-bold scale-[1.03]";
              IconComponent = <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />;
            } else if (isCurrent) {
              cellClass =
                "bg-[#06B6D4] border-2 border-white text-white scale-110 shadow-[0_0_20px_rgba(6,182,212,0.9)] z-20";
              IconComponent = <Circle className="w-2.5 h-2.5 fill-current" />;
            } else if (isNeighbor) {
              cellClass =
                "bg-[#D97706]/25 border border-[#F59E0B] text-[#FDE68A] scale-105";
            } else if (isFrontier) {
              cellClass =
                "bg-[#D97706]/20 border border-[#F59E0B] text-[#FDE68A] shadow-[0_0_8px_rgba(245,158,11,0.25)]";
            } else if (isVisited) {
              cellClass =
                "bg-[#131B2C] border border-[#222E46] text-[#64748B]";
            }

            return (
              <div
                key={posKey}
                onMouseDown={() => handleMouseDown(rIdx, cIdx)}
                onMouseEnter={() => handleMouseEnter(rIdx, cIdx)}
                className={`aspect-square w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 xl:w-11 xl:h-11 flex items-center justify-center rounded-[5px] border text-xs cursor-pointer select-none transition-all duration-150 active:scale-[0.96] ${cellClass}`}
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
