"use client";

import React from "react";
import { Individual } from "@/types/optimization";

interface PopulationTableProps {
  individuals: Individual[];
  hoveredId: string | null;
  onHoverIndividual: (id: string | null) => void;
  maxFitness?: number;
  minFitness?: number;
}

export function PopulationTable({
  individuals,
  hoveredId,
  onHoverIndividual,
  maxFitness = 10,
  minFitness = 0,
}: PopulationTableProps) {
  const getRoleBadge = (role: Individual["role"]) => {
    switch (role) {
      case "elite":
        return <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">Elite</span>;
      case "parent":
        return <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">Parent</span>;
      case "mutated":
        return <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30">Mutated</span>;
      case "offspring":
        return <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">Offspring</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#1B1F25] text-[#A7AFBB] border border-[#292E36]">Active</span>;
    }
  };

  const range = maxFitness - minFitness || 1;

  return (
    <div className="w-full bg-[#0D0F12] border border-[#292E36] rounded-xl overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#292E36] bg-[#15181D]">
        <div>
          <h4 className="text-xs font-semibold text-[#F1F3F5]">Population Leaderboard</h4>
          <p className="text-[11px] text-[#737C89] mt-0.5">
            Ranked by fitness score • Hover row to highlight candidate on landscape
          </p>
        </div>
        <span className="text-xs font-mono text-[#A7AFBB] bg-[#1B1F25] px-2 py-0.5 rounded border border-[#292E36]">
          {individuals.length} Individuals
        </span>
      </div>

      <div className="max-h-[260px] overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#15181D]/80 sticky top-0 text-[10px] font-semibold text-[#737C89] uppercase tracking-wider border-b border-[#292E36]">
            <tr>
              <th className="py-2 px-3">Rank</th>
              <th className="py-2 px-3">Individual</th>
              <th className="py-2 px-3">Role</th>
              <th className="py-2 px-3 font-mono">16-Bit Genotype</th>
              <th className="py-2 px-3 font-mono">x</th>
              <th className="py-2 px-3">Fitness</th>
              <th className="py-2 px-3">Sel. %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1B1F25]">
            {individuals.map((ind) => {
              const isHovered = hoveredId === ind.id;
              const fitPct = Math.max(0, Math.min(100, ((ind.fitness - minFitness) / range) * 100));

              // Format chromosome into 4 groups of 4 bits
              const formattedChrom = `${ind.chromosome.slice(0, 4)} ${ind.chromosome.slice(4, 8)} ${ind.chromosome.slice(8, 12)} ${ind.chromosome.slice(12, 16)}`;

              return (
                <tr
                  key={ind.id}
                  onMouseEnter={() => onHoverIndividual(ind.id)}
                  onMouseLeave={() => onHoverIndividual(null)}
                  className={`cursor-pointer transition-colors ${
                    isHovered
                      ? "bg-[#263352]/40 text-[#F1F3F5]"
                      : "hover:bg-[#15181D] text-[#A7AFBB]"
                  }`}
                >
                  <td className="py-2 px-3 font-mono text-xs font-semibold">
                    {ind.rank === 1 ? (
                      <span className="text-amber-400 flex items-center gap-1">
                        👑 #1
                      </span>
                    ) : (
                      `#${ind.rank}`
                    )}
                  </td>
                  <td className="py-2 px-3 font-mono text-[11px] text-[#F1F3F5]">
                    {ind.id}
                  </td>
                  <td className="py-2 px-3">{getRoleBadge(ind.role)}</td>
                  <td className="py-2 px-3 font-mono text-[11px] text-[#737C89]">
                    <span className="text-[#A7AFBB]">{formattedChrom}</span>
                  </td>
                  <td className="py-2 px-3 font-mono text-xs text-[#F1F3F5]">
                    {ind.x.toFixed(2)}
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-[#10B981] font-medium w-10">
                        {ind.fitness.toFixed(2)}
                      </span>
                      <div className="w-16 h-1.5 bg-[#1B1F25] rounded-full overflow-hidden hidden sm:block">
                        <div
                          className="h-full bg-[#10B981] rounded-full"
                          style={{ width: `${fitPct}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-3 font-mono text-[11px] text-[#6C8CFF]">
                    {ind.selectionProb.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
