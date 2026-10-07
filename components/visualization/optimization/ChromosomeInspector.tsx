"use client";

import React from "react";
import { CrossoverEvent, MutationEvent, Individual } from "@/types/optimization";

interface ChromosomeInspectorProps {
  activeCrossover?: CrossoverEvent | null;
  activeMutation?: MutationEvent | null;
  activeParents?: [Individual, Individual];
  champion?: Individual | null;
  globalBest?: { x: number; fitness: number; generation: number; chromosome: string };
  phase?: string;
}

export function ChromosomeInspector({
  activeCrossover,
  activeMutation,
  activeParents,
  champion,
  globalBest,
  phase,
}: ChromosomeInspectorProps) {
  // Helper to render colored bit chips
  const renderBitString = (bits: string, highlightLocus?: number, splitIndex?: number, headColor?: string, tailColor?: string) => {
    return (
      <div className="flex flex-wrap items-center font-mono text-xs gap-1">
        {bits.split("").map((b, i) => {
          const isSplitBefore = splitIndex !== undefined && i === splitIndex;
          const isMutated = highlightLocus !== undefined && i === highlightLocus;
          
          let bitColor = "bg-[#1B1F25] text-[#F1F3F5] border-[#292E36]";
          if (isMutated) {
            bitColor = "bg-rose-500/20 text-rose-300 border-rose-500 font-bold shadow-[0_0_8px_rgba(244,63,94,0.5)]";
          } else if (splitIndex !== undefined) {
            if (i < splitIndex) {
              bitColor = headColor || "bg-purple-500/15 text-purple-300 border-purple-500/30";
            } else {
              bitColor = tailColor || "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";
            }
          }

          return (
            <React.Fragment key={i}>
              {isSplitBefore && (
                <div className="w-[2px] h-6 bg-amber-400 mx-0.5 rounded shadow-[0_0_6px_rgba(245,158,11,0.8)]" title={`Crossover locus: ${splitIndex}`} />
              )}
              <span
                className={`w-5 h-6 rounded flex items-center justify-center border text-[11px] select-none transition-all ${bitColor}`}
              >
                {b}
              </span>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full bg-[#0D0F12] border border-[#292E36] rounded-xl p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#292E36] pb-2.5">
        <div>
          <h4 className="text-xs font-semibold text-[#F1F3F5] flex items-center gap-2">
            <span>Genotype & Genetic Operator Inspector</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#1B1F25] text-[#6C8CFF] font-mono border border-[#292E36]">
              16-Bit Chromosome
            </span>
          </h4>
          <p className="text-[11px] text-[#737C89] mt-0.5">
            Decodes 16 binary alleles into continuous phenotype search coordinate x
          </p>
        </div>
      </div>

      {/* Case 1: Active Crossover */}
      {phase === "crossover" && activeCrossover ? (
        <div className="flex flex-col gap-3 p-3.5 rounded-lg bg-[#15181D] border border-purple-500/30">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-purple-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              Single-Point Crossover (Locus {activeCrossover.crossoverPoint})
            </span>
            <span className="text-[11px] text-[#A7AFBB]">
              Splicing parents at bit index {activeCrossover.crossoverPoint}
            </span>
          </div>

          {/* Parent 1 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded bg-[#0D0F12] border border-[#292E36]">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-medium text-purple-400 font-mono">{activeCrossover.parent1Id}:</span>
              <span className="text-[#A7AFBB] text-[11px]">Head Donor</span>
            </div>
            {renderBitString(activeCrossover.parent1Chromosome, undefined, activeCrossover.crossoverPoint, "bg-purple-500/25 text-purple-200 border-purple-400", "bg-[#1B1F25] text-[#737C89] border-[#292E36]")}
          </div>

          {/* Parent 2 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded bg-[#0D0F12] border border-[#292E36]">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-medium text-cyan-400 font-mono">{activeCrossover.parent2Id}:</span>
              <span className="text-[#A7AFBB] text-[11px]">Tail Donor</span>
            </div>
            {renderBitString(activeCrossover.parent2Chromosome, undefined, activeCrossover.crossoverPoint, "bg-[#1B1F25] text-[#737C89] border-[#292E36]", "bg-cyan-500/25 text-cyan-200 border-cyan-400")}
          </div>

          {/* Resulting Offspring */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded bg-[#1B1F25] border border-amber-500/40">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-amber-300 font-mono">Offspring:</span>
              <span className="text-[#A7AFBB] text-[11px]">
                x = {activeCrossover.offspringX.toFixed(2)} | f = {activeCrossover.offspringFitness.toFixed(2)}
              </span>
            </div>
            {renderBitString(activeCrossover.offspringChromosome, undefined, activeCrossover.crossoverPoint, "bg-purple-500/25 text-purple-200 border-purple-400", "bg-cyan-500/25 text-cyan-200 border-cyan-400")}
          </div>
        </div>
      ) : null}

      {/* Case 2: Active Mutation */}
      {phase === "mutation" && activeMutation ? (
        <div className="flex flex-col gap-3 p-3.5 rounded-lg bg-[#15181D] border border-rose-500/30">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-rose-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              Mutation Event (Locus {activeMutation.flippedBit})
            </span>
            <span className="text-[11px] text-[#A7AFBB]">
              Bit flip caused phenotype shift: Δx = {(activeMutation.newX - activeMutation.oldX).toFixed(2)}
            </span>
          </div>

          {/* Before */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded bg-[#0D0F12] border border-[#292E36]">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#737C89] text-[11px]">Before Mutation:</span>
              <span className="font-mono text-xs text-[#A7AFBB]">x = {activeMutation.oldX.toFixed(2)}</span>
            </div>
            {renderBitString(activeMutation.beforeChromosome)}
          </div>

          {/* After */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded bg-[#1B1F25] border border-rose-500/40">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-rose-400 font-semibold text-xs">Mutated Offspring:</span>
              <span className="font-mono text-xs text-rose-200">
                x = {activeMutation.newX.toFixed(2)} (f = {activeMutation.newFitness.toFixed(2)})
              </span>
            </div>
            {renderBitString(activeMutation.afterChromosome, activeMutation.flippedBit)}
          </div>
        </div>
      ) : null}

      {/* Case 3: Selection Details */}
      {phase === "selection" && activeParents ? (
        <div className="flex flex-col gap-3 p-3.5 rounded-lg bg-[#15181D] border border-[#6C8CFF]/30">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#6C8CFF]">Mating Pair Selected</span>
            <span className="text-[11px] text-[#A7AFBB]">Ready for recombination</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-2.5 rounded bg-[#0D0F12] border border-[#292E36] flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-purple-300 font-semibold">{activeParents[0].id}</span>
                <span className="text-[11px] text-[#A7AFBB]">Rank #{activeParents[0].rank}</span>
              </div>
              <div className="text-[11px] text-[#A7AFBB]">
                x = {activeParents[0].x.toFixed(2)} | Fitness = {activeParents[0].fitness.toFixed(2)}
              </div>
              {renderBitString(activeParents[0].chromosome)}
            </div>
            <div className="p-2.5 rounded bg-[#0D0F12] border border-[#292E36] flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-cyan-300 font-semibold">{activeParents[1].id}</span>
                <span className="text-[11px] text-[#A7AFBB]">Rank #{activeParents[1].rank}</span>
              </div>
              <div className="text-[11px] text-[#A7AFBB]">
                x = {activeParents[1].x.toFixed(2)} | Fitness = {activeParents[1].fitness.toFixed(2)}
              </div>
              {renderBitString(activeParents[1].chromosome)}
            </div>
          </div>
        </div>
      ) : null}

      {/* Default Champion Card */}
      {champion && (
        <div className="p-3.5 rounded-lg bg-[#15181D] border border-emerald-500/30 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
              Current Generation Champion ({champion.id})
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
              Rank #{champion.rank} • f(x) = {champion.fitness.toFixed(2)}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-xs text-[#A7AFBB]">
              Phenotype: <span className="font-mono font-medium text-[#F1F3F5]">x = {champion.x.toFixed(2)}</span>
            </div>
            {renderBitString(champion.chromosome)}
          </div>
        </div>
      )}

      {/* Global Maximum Champion */}
      {globalBest && (
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#1B1F25] border border-amber-500/30 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-amber-400">👑</span>
            <span className="text-[#A7AFBB]">All-Time Summit Found:</span>
            <span className="font-mono text-[#F1F3F5] font-semibold">
              x* = {globalBest.x.toFixed(2)} (f* = {globalBest.fitness.toFixed(2)})
            </span>
          </div>
          <span className="text-[11px] text-[#737C89] font-mono">Found in Gen {globalBest.generation}</span>
        </div>
      )}
    </div>
  );
}
