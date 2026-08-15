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
      <div className="flex flex-wrap items-center justify-center gap-4 mb-4 text-xs text-[#A7AFBB]">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-[#55B89A] bg-[#55B89A]/20" /> Start / Goal
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-[#292E36] bg-[#292E36]" /> Wall
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-[#263352] bg-[#263352]" /> Visited
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-[#6C8CFF] bg-[#6C8CFF]/20" /> Frontier
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-[#55B89A] bg-[#55B89A]/30" /> Path
        </span>
      </div>

      {/* Grid Container */}
      <div
        className="grid gap-1 p-3 rounded-xl bg-[#15181D] border border-[#292E36] max-w-full overflow-x-auto shadow-inner"
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
              "bg-[#0D0F12] border-[#292E36] text-[#737C89] hover:border-[#3B424E]";
            let label = "";

            if (isStart) {
              cellStyles =
                "bg-[#55B89A]/20 border-[#55B89A] text-[#55B89A] font-bold shadow-sm";
              label = "S";
            } else if (isGoal) {
              cellStyles =
                "bg-[#55B89A]/20 border-[#55B89A] text-[#55B89A] font-bold shadow-sm";
              label = "G";
            } else if (isWall) {
              cellStyles = "bg-[#292E36] border-[#3B424E] text-[#737C89]";
            } else if (isPath) {
              cellStyles =
                "bg-[#55B89A]/30 border-[#55B89A] text-[#55B89A] font-semibold";
              label = "✓";
            } else if (isCurrent) {
              cellStyles =
                "bg-[#6C8CFF] border-white text-white font-bold scale-105 shadow-md z-10";
              label = "•";
            } else if (isNeighbor) {
              cellStyles =
                "bg-[#6C8CFF]/30 border-[#6C8CFF] text-[#F1F3F5]";
            } else if (isFrontier) {
              cellStyles =
                "bg-[#6C8CFF]/20 border-[#6C8CFF]/70 text-[#F1F3F5]";
            } else if (isVisited) {
              cellStyles =
                "bg-[#263352]/70 border-[#6C8CFF]/30 text-[#A7AFBB]";
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
