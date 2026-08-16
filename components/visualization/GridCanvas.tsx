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
      className="w-full flex flex-col items-center select-none space-y-3"
      onMouseLeave={handleMouseUp}
      onMouseUp={handleMouseUp}
    >
      {/* Legend Header */}
      <div className="w-full flex flex-wrap items-center justify-center sm:justify-between gap-2.5 px-3 py-2 rounded-lg bg-[#15181D] border border-[#292E36] text-[11px] text-[#A7AFBB]">
        <div className="flex items-center gap-1.5 font-medium text-[#F1F3F5]">
          <span>Legend:</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded border border-[#55B89A] bg-[#55B89A]/20" /> Start (S)
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded border border-[#55B89A] bg-[#55B89A]/20" /> Goal (G)
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded border border-[#3B424E] bg-[#292E36]" /> Wall
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded border border-[#6C8CFF]/60 bg-[#6C8CFF]/20" /> Frontier
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded border border-[#292E36] bg-[#263352]/70" /> Visited
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded border border-[#55B89A] bg-[#55B89A]/30" /> Path
          </span>
        </div>
      </div>

      {/* Grid Canvas Wrapper */}
      <div className="w-full p-2.5 sm:p-3 rounded-xl bg-[#15181D] border border-[#292E36] flex justify-center overflow-x-auto">
        <div
          className="grid gap-1 min-w-max"
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
                  "bg-[#55B89A]/20 border-[#55B89A] text-[#55B89A] font-bold";
                label = "S";
              } else if (isGoal) {
                cellStyles =
                  "bg-[#55B89A]/20 border-[#55B89A] text-[#55B89A] font-bold";
                label = "G";
              } else if (isWall) {
                cellStyles = "bg-[#292E36] border-[#3B424E] text-[#737C89]";
              } else if (isPath) {
                cellStyles =
                  "bg-[#55B89A]/30 border-[#55B89A] text-[#55B89A] font-semibold";
                label = "✓";
              } else if (isCurrent) {
                cellStyles =
                  "bg-[#6C8CFF] border-white text-white font-bold scale-105 shadow-sm z-10";
                label = "•";
              } else if (isNeighbor) {
                cellStyles =
                  "bg-[#6C8CFF]/30 border-[#6C8CFF] text-[#F1F3F5]";
              } else if (isFrontier) {
                cellStyles =
                  "bg-[#6C8CFF]/20 border-[#6C8CFF]/60 text-[#F1F3F5]";
              } else if (isVisited) {
                cellStyles =
                  "bg-[#263352]/70 border-[#292E36] text-[#A7AFBB]";
              }

              return (
                <div
                  key={posKey}
                  onMouseDown={() => handleMouseDown(rIdx, cIdx)}
                  onMouseEnter={() => handleMouseEnter(rIdx, cIdx)}
                  className={`w-6 h-6 sm:w-7 sm:h-7 xl:w-7.5 xl:h-7.5 flex items-center justify-center rounded border text-[10px] sm:text-xs cursor-pointer transition-all duration-150 ${cellStyles}`}
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
    </div>
  );
}

