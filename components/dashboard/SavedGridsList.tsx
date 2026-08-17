"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

interface SavedGridsListProps {
  grids: any[]; 
}

export function SavedGridsList({ grids }: SavedGridsListProps) {
  if (!grids || grids.length === 0) {
    return (
      <div className="w-full p-12 rounded-xl bg-[#15181D] border border-[#292E36] text-center flex flex-col items-center justify-center min-h-[300px]">
        <h3 className="text-lg font-semibold text-[#F1F3F5] mb-2">No Saved Mazes</h3>
        <p className="text-[#A7AFBB] text-sm mb-6 max-w-sm">
          You haven't saved any custom obstacle courses yet. Head over to any grid-based algorithm to design and save your first maze!
        </p>
        <Link 
          href="/algorithms/a-star"
          className="inline-block px-5 py-2.5 rounded-lg bg-[#6C8CFF] hover:bg-[#5A7BEF] text-white font-medium text-sm transition-colors"
        >
          Create a Maze
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {grids.map((grid) => {
        const rows = grid.gridData?.rows || 12;
        const cols = grid.gridData?.cols || 22;
        const wallCount = grid.gridData?.walls?.length || 0;

        return (
          <div key={grid.id} className="p-6 rounded-xl bg-[#15181D] border border-[#292E36] flex flex-col hover:border-[#6C8CFF]/50 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-[#F1F3F5] text-lg truncate pr-4" title={grid.name}>
                {grid.name}
              </h3>
            </div>
            
            <div className="space-y-1 text-sm text-[#A7AFBB] mb-8">
              <div className="flex justify-between">
                <span>Dimensions:</span>
                <span className="font-mono text-[#F1F3F5]">{cols}x{rows}</span>
              </div>
              <div className="flex justify-between">
                <span>Wall Blocks:</span>
                <span className="font-mono text-[#F1F3F5]">{wallCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Saved On:</span>
                <span className="text-[#F1F3F5]">{new Date(grid.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="mt-auto">
              <Link 
                href={`/algorithms/a-star?gridId=${grid.id}`}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#263352] hover:bg-[#344168] text-[#6C8CFF] font-medium text-sm transition-colors"
              >
                <ExternalLink size={16} />
                Open in Visualizer
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
