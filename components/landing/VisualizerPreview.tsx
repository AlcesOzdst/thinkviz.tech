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
      <div className="rounded-xl border border-[#292E36] bg-[#15181D] overflow-hidden">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-[#292E36] bg-[#1B1F25] px-4 py-3 text-xs text-[#A7AFBB] gap-2">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#6C8CFF]" />
            <span className="text-[#F1F3F5] font-medium">A* Search Visualization</span>
          </div>

          <div className="text-xs text-[#737C89]">
            Step {currentStep} of 24
          </div>
        </div>

        {/* Workspace Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-[#292E36]">
          {/* Visualization Canvas Area */}
          <div className="lg:col-span-2 p-6 bg-[#0D0F12] flex flex-col justify-between min-h-[360px]">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-[#737C89] font-medium">Interactive visualization</span>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#A7AFBB]">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded bg-[#55B89A]" /> Start / Goal
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded bg-[#263352]" /> Visited
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded bg-[#6C8CFF]" /> Frontier
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded bg-[#55B89A]" /> Path
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded bg-[#292E36]" /> Obstacle
                  </span>
                </div>
              </div>

              {/* Grid Illustration */}
              <div className="grid grid-cols-7 gap-2 p-4 rounded-lg bg-[#15181D] border border-[#292E36] max-w-xl mx-auto">
                {gridCells.flatMap((row, rIdx) =>
                  row.map((cell, cIdx) => {
                    let cellClass = "bg-[#0D0F12] border-[#292E36] text-[#737C89]";
                    let label = "";

                    if (cell === "S") {
                      cellClass = "bg-[#55B89A]/15 border-[#55B89A] text-[#55B89A] font-semibold";
                      label = "Start";
                    } else if (cell === "G") {
                      cellClass = "bg-[#55B89A]/15 border-[#55B89A] text-[#55B89A] font-semibold";
                      label = "Goal";
                    } else if (cell === "W") {
                      cellClass = "bg-[#292E36] border-[#3B424E] text-[#737C89]";
                    } else if (cell === "V") {
                      cellClass = "bg-[#263352]/60 border-[#6C8CFF]/30 text-[#A7AFBB]";
                    } else if (cell === "F") {
                      cellClass = "bg-[#6C8CFF]/20 border-[#6C8CFF] text-white";
                    } else if (cell === "P") {
                      cellClass = "bg-[#55B89A]/20 border-[#55B89A] text-[#55B89A] font-semibold";
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
            <div className="mt-6 grid grid-cols-3 gap-3 p-3 rounded-lg bg-[#15181D] border border-[#292E36] text-center">
              <div>
                <span className="block text-xs text-[#737C89]">Nodes explored</span>
                <span className="text-base font-semibold text-[#F1F3F5] font-mono">{currentStep}</span>
              </div>
              <div>
                <span className="block text-xs text-[#737C89]">Current cost g(n)</span>
                <span className="text-base font-semibold text-[#6C8CFF] font-mono">6.41</span>
              </div>
              <div>
                <span className="block text-xs text-[#737C89]">Estimated total f(n)</span>
                <span className="text-base font-semibold text-[#F1F3F5] font-mono">8.82</span>
              </div>
            </div>
          </div>

          {/* Explanation & Pseudocode Panel */}
          <div className="p-6 bg-[#15181D] flex flex-col justify-between space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-[#A7AFBB] mb-3">
                Explanation & Pseudocode
              </h3>

              {/* Narrative description */}
              <div className="p-3 rounded-lg bg-[#1B1F25] border border-[#292E36] text-xs text-[#A7AFBB] space-y-1 mb-4">
                <span className="text-[#6C8CFF] font-medium">Step {currentStep}:</span>
                <p>
                  Evaluating node <code className="text-[#F1F3F5] font-mono">(2, 3)</code> with minimum estimated cost f(n) = 8.82. Checking adjacent unvisited neighbors.
                </p>
              </div>

              {/* Pseudocode snippet */}
              <div className="rounded-lg bg-[#0D0F12] border border-[#292E36] p-3 font-mono text-[11px] leading-relaxed text-[#737C89]">
                <div className="text-[#737C89] mb-1">// A* Search main loop</div>
                <div className="px-1 py-0.5 rounded">1. openSet = PriorityQueue()</div>
                <div className="px-1 py-0.5 rounded">2. openSet.push(startNode, f=0)</div>
                <div className="px-1 py-0.5 rounded bg-[#263352] text-[#F1F3F5]">
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
            <div className="space-y-2 pt-4 border-t border-[#292E36]">
              <div className="flex items-center justify-between text-xs text-[#737C89]">
                <span>Playback controls</span>
                <span>Speed: 1x</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="p-2 rounded bg-[#1B1F25] hover:bg-[#292E36] text-[#F1F3F5] text-xs transition-colors"
                  title="Reset"
                >
                  ⏮
                </button>
                <button
                  onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                  className="p-2 rounded bg-[#1B1F25] hover:bg-[#292E36] text-[#F1F3F5] text-xs transition-colors"
                  title="Step backward"
                >
                  ◀
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex-1 py-2 rounded bg-[#6C8CFF] hover:bg-[#5A7BEF] text-white font-medium text-xs transition-colors flex items-center justify-center gap-1"
                >
                  {isPlaying ? "Pause" : "Play"}
                </button>
                <button
                  onClick={() => setCurrentStep((prev) => Math.min(24, prev + 1))}
                  className="p-2 rounded bg-[#1B1F25] hover:bg-[#292E36] text-[#F1F3F5] text-xs transition-colors"
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
