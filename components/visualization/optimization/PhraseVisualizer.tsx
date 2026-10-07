"use client";

import React from "react";
import { PhraseIndividual, PhraseCrossoverEvent, PhraseMutationEvent } from "@/types/optimization";

interface PhraseVisualizerProps {
  target: string;
  individuals: PhraseIndividual[];
  activeCrossover?: PhraseCrossoverEvent | null;
  activeMutation?: PhraseMutationEvent | null;
  phase?: string;
  generation: number;
  maxGenerations: number;
}

export function PhraseVisualizer({
  target,
  individuals,
  activeCrossover,
  activeMutation,
  phase,
  generation,
  maxGenerations,
}: PhraseVisualizerProps) {
  const champion = individuals[0] || null;
  const bestPhrase = champion ? champion.phrase : "";
  const accuracy = champion ? champion.accuracy : 0;
  const matches = champion ? champion.matches : 0;

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Top Accuracy & Status Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-[#0D0F12] border border-[#292E36] flex flex-col justify-between">
          <span className="text-[10px] text-[#737C89] uppercase tracking-wider font-semibold">
            Match Accuracy
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold font-mono text-[#10B981]">
              {accuracy}%
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#0D0F12] border border-[#292E36] flex flex-col justify-between">
          <span className="text-[10px] text-[#737C89] uppercase tracking-wider font-semibold">
            Solved Loci
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold font-mono text-[#6C8CFF]">
              {matches}
            </span>
            <span className="text-[11px] font-mono text-[#737C89]">/ {target.length} characters</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#0D0F12] border border-[#292E36] flex flex-col justify-between">
          <span className="text-[10px] text-[#737C89] uppercase tracking-wider font-semibold">
            Generation
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold font-mono text-[#F1F3F5]">
              {generation}
            </span>
            <span className="text-[11px] font-mono text-[#737C89]">/ {maxGenerations}</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#0D0F12] border border-[#292E36] flex flex-col justify-between">
          <span className="text-[10px] text-[#737C89] uppercase tracking-wider font-semibold">
            Status
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span
              className={`text-sm font-bold font-mono ${
                accuracy === 100 ? "text-[#10B981]" : "text-amber-400"
              }`}
            >
              {accuracy === 100 ? "100% Solved! 🎯" : "Evolving Swarm..."}
            </span>
          </div>
        </div>
      </div>

      {/* Main Target vs Evolved Chromosome Arena */}
      <div className="p-5 rounded-xl bg-[#0D0F12] border border-[#292E36] flex flex-col gap-6">
        {/* Target Phrase Row */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#737C89] font-medium uppercase tracking-wider text-[10px]">
              🎯 Objective Target Sequence
            </span>
            <span className="text-[11px] font-mono text-[#A7AFBB]">{target.length} Alleles</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {target.split("").map((ch, idx) => (
              <div
                key={`target-${idx}`}
                className="w-9 h-11 sm:w-11 sm:h-13 rounded-lg bg-[#15181D] border border-[#292E36] flex flex-col items-center justify-center font-mono font-bold text-base sm:text-lg text-[#F1F3F5] shadow-inner"
              >
                <span>{ch === " " ? "␣" : ch}</span>
                <span className="text-[8px] text-[#737C89] font-normal">{idx}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Current Champion Chromosome Row */}
        <div className="flex flex-col gap-2 pt-4 border-t border-[#1B1F25]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#10B981] font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              Evolving Generation Champion ({champion?.id || "-"})
            </span>
            <span className="text-[11px] font-mono text-[#10B981]">{accuracy}% Match</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {target.split("").map((targetChar, idx) => {
              const currentChar = bestPhrase[idx] || " ";
              const isMatch = currentChar === targetChar;
              const isMutated =
                phase === "mutation" && activeMutation?.mutatedIndex === idx;

              let style =
                "bg-[#1B1F25] border-[#292E36] text-[#737C89]"; // Muted non-match
              if (isMatch) {
                style =
                  "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.4)]";
              }
              if (isMutated) {
                style =
                  "bg-rose-500/25 border-rose-500 text-rose-300 font-bold shadow-[0_0_12px_rgba(244,63,94,0.6)] animate-bounce";
              }

              return (
                <div
                  key={`best-${idx}`}
                  className={`w-9 h-11 sm:w-11 sm:h-13 rounded-lg border flex flex-col items-center justify-center font-mono font-bold text-base sm:text-lg transition-all duration-300 ${style}`}
                >
                  <span>{currentChar === " " ? "␣" : currentChar}</span>
                  <span className="text-[8px] font-normal">
                    {isMatch ? "✓" : isMutated ? "⚡" : "×"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Operator Recombination & Candidate Leaderboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Active Crossover & Mutation Details */}
        <div className="p-4 rounded-xl bg-[#0D0F12] border border-[#292E36] flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-[#292E36] pb-2 text-xs">
            <span className="font-semibold text-[#F1F3F5]">🧬 Live Operator Execution</span>
            <span className="font-mono text-[10px] text-[#A7AFBB] px-2 py-0.5 rounded bg-[#1B1F25] border border-[#292E36]">
              Character Splicing
            </span>
          </div>

          {phase === "crossover" && activeCrossover ? (
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-[#15181D] border border-purple-500/30">
                <span className="text-purple-300 font-mono font-medium">Parent 1:</span>
                <span className="font-mono text-purple-200">
                  <span className="underline decoration-purple-400 font-bold">
                    {activeCrossover.parent1Phrase.slice(0, activeCrossover.splitPoint)}
                  </span>
                  <span className="text-[#737C89]">
                    {activeCrossover.parent1Phrase.slice(activeCrossover.splitPoint)}
                  </span>
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-[#15181D] border border-cyan-500/30">
                <span className="text-cyan-300 font-mono font-medium">Parent 2:</span>
                <span className="font-mono text-cyan-200">
                  <span className="text-[#737C89]">
                    {activeCrossover.parent2Phrase.slice(0, activeCrossover.splitPoint)}
                  </span>
                  <span className="underline decoration-cyan-400 font-bold">
                    {activeCrossover.parent2Phrase.slice(activeCrossover.splitPoint)}
                  </span>
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-[#1B1F25] border border-amber-500/40">
                <span className="text-amber-300 font-mono font-semibold">Child Spliced:</span>
                <span className="font-mono text-amber-200 font-bold">
                  "{activeCrossover.childPhrase}"
                </span>
              </div>
            </div>
          ) : phase === "mutation" && activeMutation ? (
            <div className="p-2.5 rounded bg-[#15181D] border border-rose-500/40 flex flex-col gap-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-rose-300">Allele Mutation Triggered</span>
                <span className="font-mono text-rose-200">
                  Index {activeMutation.mutatedIndex} ('{activeMutation.oldChar}' → '
                  {activeMutation.newChar}')
                </span>
              </div>
              <p className="text-[11px] text-[#A7AFBB] leading-relaxed">
                Random substitution flipped locus {activeMutation.mutatedIndex}. Child updated to "
                {activeMutation.afterPhrase}".
              </p>
            </div>
          ) : (
            <div className="p-3 rounded bg-[#15181D] border border-[#292E36] text-xs text-[#A7AFBB] leading-relaxed">
              <p>
                In string evolution, <strong className="text-[#F1F3F5]">Crossover</strong> combines
                proven sub-words from two fit parents, while{" "}
                <strong className="text-[#F1F3F5]">Mutation</strong> randomly explores the alphabet to
                discover missing letters.
              </p>
            </div>
          )}
        </div>

        {/* Population Phrase Leaderboard */}
        <div className="p-4 rounded-xl bg-[#0D0F12] border border-[#292E36] flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-[#292E36] pb-2 text-xs">
            <span className="font-semibold text-[#F1F3F5]">🏆 Population Phrase Pool</span>
            <span className="text-[11px] font-mono text-[#737C89]">
              {individuals.length} strings
            </span>
          </div>

          <div className="max-h-[140px] overflow-y-auto space-y-1.5 text-xs font-mono">
            {individuals.slice(0, 5).map((ind, idx) => (
              <div
                key={ind.id}
                className={`flex items-center justify-between p-1.5 rounded transition-colors ${
                  idx === 0
                    ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-semibold"
                    : "bg-[#15181D] text-[#A7AFBB] border border-[#292E36]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] w-4">{idx === 0 ? "👑" : `#${idx + 1}`}</span>
                  <span className="text-[11px] text-[#F1F3F5]">{ind.id}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#F1F3F5]">"{ind.phrase}"</span>
                  <span className="text-xs text-[#10B981]">{ind.accuracy}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
