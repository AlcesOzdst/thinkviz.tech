"use client";

import { useState } from "react";

export function VisualizerPreview() {
  const [currentStep, setCurrentStep] = useState(14);
  const [isPlaying, setIsPlaying] = useState(false);

  // Grid cell states: S=Start, G=Goal, W=Wall, V=Visited, F=Frontier, P=Optimal Path, E=Empty
  const gridCells = [
    ["E", "E", "E", "E", "E", "E", "E"],
    ["S", "V", "V", "F", "W", "E", "E"],
    ["E", "V", "P", "P", "P", "G", "E"],
    ["E", "V", "P", "W", "F", "E", "E"],
    ["E", "E", "F", "E", "E", "E", "E"],
  ];

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="rounded-xl border border-[#232B36] bg-[#12161D] overflow-hidden">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-[#232B36] bg-[#1A202A] px-4 py-3 text-xs text-[#94A3B8] gap-2">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#6C8CFF]" />
            <span className="text-[#F8FAFC] font-medium">A* Search Visualization</span>
          </div>

          <div className="text-xs text-[#828E9E]">
            Step {currentStep} of 24
          </div>
        </div>

        {/* Workspace Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-[#232B36]">
          {/* Visualization Canvas Area */}
          <div className="lg:col-span-2 p-6 bg-[#090B0E] flex flex-col justify-between min-h-[360px]">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-[#828E9E] font-medium">Interactive visualization</span>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#94A3B8]">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded bg-[#10B981]" /> Start
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded bg-[#F43F5E]" /> Goal
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded bg-[#131B28] border border-[#1E2A3C]" /> Visited
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded bg-[#F59E0B]" /> Frontier
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded bg-[#34D399]" /> Path
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded bg-[#222A36] border border-[#333E50]" /> Obstacle
                  </span>
                </div>
              </div>

              {/* Grid Illustration */}
              <div className="grid grid-cols-7 gap-2 p-4 rounded-lg bg-[#12161D] border border-[#232B36] max-w-xl mx-auto">
                {gridCells.flatMap((row, rIdx) =>
                  row.map((cell, cIdx) => {
                    let cellClass = "bg-[#0D1015] border-[#1B222C] text-[#828E9E]";
                    let label = "";

                    if (cell === "S") {
                      cellClass = "bg-[#10B981]/25 border-2 border-[#10B981] text-[#34D399] font-semibold";
                      label = "Start";
                    } else if (cell === "G") {
                      cellClass = "bg-[#F43F5E]/25 border-2 border-[#F43F5E] text-[#FDA4AF] font-semibold";
                      label = "Goal";
                    } else if (cell === "W") {
                      cellClass = "bg-[#222A36] border-[#333E50] text-[#64748B]";
                    } else if (cell === "V") {
                      cellClass = "bg-[#131B28] border-[#1E2A3C] text-[#64748B]";
                    } else if (cell === "F") {
                      cellClass = "bg-[#F59E0B]/20 border-[#F59E0B] text-[#FDE68A]";
                    } else if (cell === "P") {
                      cellClass = "bg-[#10B981]/30 border-[#34D399] text-[#34D399] font-bold shadow-[0_0_8px_rgba(52,211,153,0.35)]";
                    }

                    return (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        className={`aspect-square flex items-center justify-center rounded border text-xs transition-all ${cellClass}`}
                      >
                        {label || (cell === "W" ? "" : cell === "V" ? "•" : cell === "F" ? "○" : cell === "P" ? "✓" : "")}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Metrics Panel Bar */}
            <div className="mt-6 grid grid-cols-3 gap-3 p-3 rounded-lg bg-[#12161D] border border-[#232B36] text-center">
              <div>
                <span className="block text-xs text-[#828E9E]">Nodes explored</span>
                <span className="text-base font-semibold text-[#F8FAFC] font-mono">{currentStep}</span>
              </div>
              <div>
                <span className="block text-xs text-[#828E9E]">Current cost g(n)</span>
                <span className="text-base font-semibold text-[#6C8CFF] font-mono">6.41</span>
              </div>
              <div>
                <span className="block text-xs text-[#828E9E]">Estimated total f(n)</span>
                <span className="text-base font-semibold text-[#F8FAFC] font-mono">8.82</span>
              </div>
            </div>
          </div>

          {/* Explanation & Pseudocode Panel */}
          <div className="p-6 bg-[#12161D] flex flex-col justify-between space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-[#94A3B8] mb-3">
                Explanation & Pseudocode
              </h3>

              {/* Narrative description */}
              <div className="p-3 rounded-lg bg-[#1A202A] border border-[#232B36] text-xs text-[#94A3B8] space-y-1 mb-4">
                <span className="text-[#6C8CFF] font-medium">Step {currentStep}:</span>
                <p>
                  Evaluating node <code className="text-[#F8FAFC] font-mono">(2, 3)</code> with minimum estimated cost f(n) = 8.82. Checking adjacent unvisited neighbors.
                </p>
              </div>

              {/* Pseudocode snippet */}
              <div className="rounded-lg bg-[#090B0E] border border-[#232B36] p-3 font-mono text-[11px] leading-relaxed text-[#828E9E]">
                <div className="text-[#828E9E] mb-1">// A* Search main loop</div>
                <div className="px-1 py-0.5 rounded">1. openSet = PriorityQueue()</div>
                <div className="px-1 py-0.5 rounded">2. openSet.push(startNode, f=0)</div>
                <div className="px-1 py-0.5 rounded bg-[#1E293B] text-[#F8FAFC] border-l-2 border-[#6C8CFF]">
                  3. current = openSet.popMin()
                </div>
                <div className="px-1 py-0.5 rounded">4. if current == goal: return reconstructPath()</div>
                <div className="px-1 py-0.5 rounded">5. for neighbor in current.getNeighbors():</div>
                <div className="px-1 py-0.5 rounded pl-4">tentative_g = g[current] + cost</div>
                <div className="px-1 py-0.5 rounded pl-4">if tentative_g &lt; g[neighbor]:</div>
                <div className="px-1 py-0.5 rounded pl-6">updateCostsAndPriority(neighbor)</div>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="space-y-2 pt-4 border-t border-[#232B36]">
              <div className="flex items-center justify-between text-xs text-[#828E9E]">
                <span>Playback controls</span>
                <span>Speed: 1x</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="p-2 rounded bg-[#1A202A] hover:bg-[#222A36] text-[#F8FAFC] border border-[#232B36] text-xs transition-colors"
                  title="Reset"
                >
                  ⏮
                </button>
                <button
                  onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                  className="p-2 rounded bg-[#1A202A] hover:bg-[#222A36] text-[#F8FAFC] border border-[#232B36] text-xs transition-colors"
                  title="Step backward"
                >
                  ◀
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex-1 py-2 rounded bg-[#6C8CFF] hover:bg-[#5A7BEF] text-white font-medium text-xs transition-colors flex items-center justify-center gap-1 shadow-sm"
                >
                  {isPlaying ? "Pause" : "Play"}
                </button>
                <button
                  onClick={() => setCurrentStep((prev) => Math.min(24, prev + 1))}
                  className="p-2 rounded bg-[#1A202A] hover:bg-[#222A36] text-[#F8FAFC] border border-[#232B36] text-xs transition-colors"
                  title="Step forward"
                >
                  ▶
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
