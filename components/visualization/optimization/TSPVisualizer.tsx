"use client";

import React from "react";
import { TSPCity, TSPIndividual, TSPCrossoverEvent, TSPMutationEvent } from "@/types/optimization";

interface TSPVisualizerProps {
  cities: TSPCity[];
  individuals: TSPIndividual[];
  bestTour: number[];
  initialDistance: number;
  bestDistance: number;
  activeCrossover?: TSPCrossoverEvent | null;
  activeMutation?: TSPMutationEvent | null;
  phase?: string;
  generation: number;
  maxGenerations: number;
}

export function TSPVisualizer({
  cities,
  individuals,
  bestTour,
  initialDistance,
  bestDistance,
  activeCrossover,
  activeMutation,
  phase,
  generation,
  maxGenerations,
}: TSPVisualizerProps) {
  const width = 680;
  const height = 360;

  // Build SVG path data for a tour
  const buildTourPath = (tour: number[]) => {
    if (!tour || tour.length === 0) return "";
    let d = "";
    tour.forEach((cityIdx, i) => {
      const city = cities[cityIdx];
      if (!city) return;
      if (i === 0) d += `M ${city.x},${city.y} `;
      else d += `L ${city.x},${city.y} `;
    });
    // Close the loop
    const firstCity = cities[tour[0]];
    if (firstCity) d += `L ${firstCity.x},${firstCity.y} Z`;
    return d;
  };

  const currentTourPath = buildTourPath(bestTour);
  const improvementPct = initialDistance > 0 
    ? Math.max(0, (((initialDistance - bestDistance) / initialDistance) * 100)).toFixed(1)
    : "0.0";

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Top TSP Status Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-[#0D0F12] border border-[#292E36] flex flex-col justify-between">
          <span className="text-[10px] text-[#737C89] uppercase tracking-wider font-semibold">
            Current Best Distance
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold font-mono text-[#10B981]">
              {bestDistance.toFixed(1)}
            </span>
            <span className="text-[11px] font-mono text-[#737C89]">px</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#0D0F12] border border-[#292E36] flex flex-col justify-between">
          <span className="text-[10px] text-[#737C89] uppercase tracking-wider font-semibold">
            Initial Tangled Tour
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold font-mono text-[#A7AFBB]">
              {initialDistance.toFixed(1)}
            </span>
            <span className="text-[11px] font-mono text-[#737C89]">px</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#0D0F12] border border-[#292E36] flex flex-col justify-between">
          <span className="text-[10px] text-[#737C89] uppercase tracking-wider font-semibold">
            Route Optimization
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold font-mono text-[#6C8CFF]">
              -{improvementPct}%
            </span>
            <span className="text-[11px] text-[#10B981] font-semibold">shorter</span>
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
      </div>

      {/* Main 2D City Map Canvas */}
      <div className="w-full relative bg-[#0D0F12] rounded-xl border border-[#292E36] p-4 flex flex-col items-center overflow-hidden">
        <div className="w-full flex items-center justify-between mb-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#F1F3F5] flex items-center gap-1.5">
              <span>📍 2D Euclidean City Map</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#1B1F25] text-[#A7AFBB] border border-[#292E36]">
                {cities.length} Cities
              </span>
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-[#10B981]">
              <span className="w-2.5 h-0.5 bg-[#10B981] inline-block" /> Evolved Best Circuit
            </span>
            {phase === "crossover" && (
              <span className="flex items-center gap-1.5 text-purple-400">
                <span className="w-2.5 h-0.5 bg-purple-400 inline-block" /> Order Crossover Slice
              </span>
            )}
            {phase === "mutation" && (
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-0.5 bg-rose-400 inline-block" /> 2-Opt Inverted Road
              </span>
            )}
          </div>
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[380px] overflow-visible">
          <defs>
            <linearGradient id="tourGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
            <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Dotted Grid Background */}
          {Array.from({ length: 9 }).map((_, r) => (
            <line
              key={`h-grid-${r}`}
              x1="30"
              y1={40 * r + 20}
              x2={width - 30}
              y2={40 * r + 20}
              stroke="#1B1F25"
              strokeDasharray="2 4"
            />
          ))}
          {Array.from({ length: 16 }).map((_, c) => (
            <line
              key={`v-grid-${c}`}
              x1={40 * c + 40}
              y1="20"
              x2={40 * c + 40}
              y2={height - 20}
              stroke="#1B1F25"
              strokeDasharray="2 4"
            />
          ))}

          {/* Current Best Tour Closed-Loop Lines */}
          {currentTourPath && (
            <path
              d={currentTourPath}
              fill="none"
              stroke="url(#tourGrad)"
              strokeWidth="3.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              className="drop-shadow-[0_0_8px_rgba(16,185,129,0.6)] transition-all duration-300"
            />
          )}

          {/* Active Crossover Overlay: Highlight Parent 1 slice */}
          {phase === "crossover" && activeCrossover && (
            <g>
              {(() => {
                const sliceCities = activeCrossover.childTour.slice(
                  activeCrossover.cutStart,
                  activeCrossover.cutEnd + 1
                );
                if (sliceCities.length < 2) return null;
                let d = "";
                sliceCities.forEach((cIdx, i) => {
                  const c = cities[cIdx];
                  if (i === 0) d += `M ${c.x},${c.y} `;
                  else d += `L ${c.x},${c.y} `;
                });
                return (
                  <path
                    d={d}
                    fill="none"
                    stroke="#A855F7"
                    strokeWidth="5"
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]"
                  />
                );
              })()}
            </g>
          )}

          {/* Active Mutation Overlay: Highlight Inverted road */}
          {phase === "mutation" && activeMutation && (
            <g>
              {(() => {
                const i1 = activeMutation.swappedIdx1;
                const i2 = activeMutation.swappedIdx2;
                const slice = activeMutation.afterTour.slice(i1, i2 + 1);
                if (slice.length < 2) return null;
                let d = "";
                slice.forEach((cIdx, i) => {
                  const c = cities[cIdx];
                  if (i === 0) d += `M ${c.x},${c.y} `;
                  else d += `L ${c.x},${c.y} `;
                });
                return (
                  <path
                    d={d}
                    fill="none"
                    stroke="#F43F5E"
                    strokeWidth="5"
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_12px_rgba(244,63,94,0.9)]"
                  />
                );
              })()}
            </g>
          )}

          {/* City Nodes */}
          {cities.map((city) => {
            // Find visit sequence order in best tour
            const visitOrder = bestTour.indexOf(city.id) + 1;
            const isFirst = bestTour[0] === city.id;

            return (
              <g key={`city-${city.id}`} className="transition-all duration-300">
                {/* Outer Glow Ring */}
                <circle
                  cx={city.x}
                  cy={city.y}
                  r="14"
                  fill="#15181D"
                  stroke={isFirst ? "#F59E0B" : "#292E36"}
                  strokeWidth="2"
                  className="shadow-md"
                />

                {/* Inner Core */}
                <circle
                  cx={city.x}
                  cy={city.y}
                  r="7"
                  fill={isFirst ? "#F59E0B" : "#6C8CFF"}
                  style={{
                    filter: isFirst
                      ? "drop-shadow(0 0 6px rgba(245,158,11,0.8))"
                      : "drop-shadow(0 0 4px rgba(108,140,255,0.6))",
                  }}
                />

                {/* City Label */}
                <text
                  x={city.x}
                  y={city.y - 18}
                  textAnchor="middle"
                  fill="#F1F3F5"
                  className="text-[11px] font-bold font-mono select-none"
                >
                  {city.label}
                </text>

                {/* Visit Sequence Order Tag */}
                <text
                  x={city.x}
                  y={city.y + 3}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  className="text-[9px] font-mono font-bold select-none"
                >
                  {visitOrder}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Operator Inspector & Recombination Flow */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Active Crossover & Mutation Details */}
        <div className="p-4 rounded-xl bg-[#0D0F12] border border-[#292E36] flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-[#292E36] pb-2 text-xs">
            <span className="font-semibold text-[#F1F3F5]">🧬 Genetic Recombination Stage</span>
            <span className="font-mono text-[10px] text-[#A7AFBB] px-2 py-0.5 rounded bg-[#1B1F25] border border-[#292E36]">
              Order Crossover (OX) + 2-Opt
            </span>
          </div>

          {phase === "crossover" && activeCrossover ? (
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-[#15181D] border border-purple-500/30">
                <span className="font-medium text-purple-300 font-mono">
                  Parent 1 ({activeCrossover.parent1Id}):
                </span>
                <span className="font-mono text-[#A7AFBB] text-[11px]">
                  [
                  {activeCrossover.parent1Tour.map((c, i) => (
                    <span
                      key={i}
                      className={
                        i >= activeCrossover.cutStart && i <= activeCrossover.cutEnd
                          ? "text-purple-300 font-bold"
                          : "text-[#737C89]"
                      }
                    >
                      {cities[c]?.label || c}{" "}
                    </span>
                  ))}
                  ]
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-[#15181D] border border-[#292E36]">
                <span className="font-medium text-cyan-300 font-mono">
                  Parent 2 ({activeCrossover.parent2Id}):
                </span>
                <span className="font-mono text-[#737C89] text-[11px]">
                  [{activeCrossover.parent2Tour.map((c) => cities[c]?.label || c).join(" ")}]
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-[#1B1F25] border border-amber-500/40">
                <span className="font-semibold text-amber-300 font-mono">Child Tour:</span>
                <span className="font-mono text-amber-200 text-[11px]">
                  [{activeCrossover.childTour.map((c) => cities[c]?.label || c).join(" ")}] (
                  {activeCrossover.childDistance.toFixed(1)} px)
                </span>
              </div>
            </div>
          ) : phase === "mutation" && activeMutation ? (
            <div className="flex flex-col gap-2 text-xs">
              <div className="p-2.5 rounded bg-[#15181D] border border-rose-500/40 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-rose-300 flex items-center gap-1">
                    <span>✂️ 2-Opt Inversion Mutation</span>
                  </span>
                  <span className="font-mono text-xs text-rose-200">
                    {activeMutation.oldDistance.toFixed(1)} px → {activeMutation.newDistance.toFixed(1)} px
                  </span>
                </div>
                <p className="text-[11px] text-[#A7AFBB] leading-relaxed">
                  Reversed segment indices [{activeMutation.swappedIdx1}..{activeMutation.swappedIdx2}],
                  successfully uncrossing colliding road segments.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded bg-[#15181D] border border-[#292E36] text-xs text-[#A7AFBB] leading-relaxed">
              <p>
                <strong className="text-[#F1F3F5]">Order Crossover (OX)</strong> preserves clean local
                loops from Parent 1 while maintaining overall city visit ordering from Parent 2.
              </p>
              <p className="mt-1.5 text-[11px] text-[#737C89]">
                <strong className="text-[#F1F3F5]">2-Opt Mutation</strong> flips road directions between
                two cities to untangle intersecting highway links.
              </p>
            </div>
          )}
        </div>

        {/* Population Tour Leaderboard */}
        <div className="p-4 rounded-xl bg-[#0D0F12] border border-[#292E36] flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-[#292E36] pb-2 text-xs">
            <span className="font-semibold text-[#F1F3F5]">🏆 Top Candidate Tours</span>
            <span className="text-[11px] font-mono text-[#737C89]">
              {individuals.length} in population
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
                  <span className="text-[10px] text-[#737C89]">
                    [{ind.tour.slice(0, 6).map((c) => cities[c]?.label || c).join("")}...]
                  </span>
                  <span className="font-bold text-xs">{ind.distance.toFixed(1)} px</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
