"use client";

import React, { useState, useMemo } from "react";
import { PlaybackToolbar } from "@/components/visualization/PlaybackToolbar";
import { MetricsPanel } from "@/components/visualization/MetricsPanel";
import { useVisualizerPlayback } from "@/hooks/useVisualizerPlayback";
import { 
  getLandscapeY, 
  OPTIMIZATION_DOMAIN, 
  OPTIMIZATION_RESOLUTION,
  generateHillClimbingSteps
} from "@/lib/algorithms/hillClimbing";
import { OptimizationState } from "@/types/optimization";
import { AlgorithmStep } from "@/types/visualizer";

interface OptimizationWorkspaceProps {
  algorithmId: string;
}

export function OptimizationWorkspace({ algorithmId }: OptimizationWorkspaceProps) {
  const [initialX, setInitialX] = useState<number>(2); // A starting point
  const [steps, setSteps] = useState<AlgorithmStep<OptimizationState>[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  const playback = useVisualizerPlayback(steps, algorithmId);

  const handleGenerate = () => {
    // If we're already generated, reset back to edit mode
    if (hasGenerated) {
      setSteps([]);
      setHasGenerated(false);
      playback.reset();
      return;
    }

    let newSteps: AlgorithmStep<OptimizationState>[] = [];
    if (algorithmId === "hill-climbing") {
      newSteps = generateHillClimbingSteps(initialX, 0.5);
    }
    setSteps(newSteps);
    setHasGenerated(true);
    playback.reset();
  };

  const activeState = playback.currentStep ? (playback.currentStep.state as OptimizationState) : null;
  const activeMetrics = playback.currentStep ? playback.currentStep.metrics : null;

  // SVG Setup
  const svgWidth = 800;
  const svgHeight = 400;
  const margin = { top: 60, right: 40, bottom: 60, left: 40 };
  const innerWidth = svgWidth - margin.left - margin.right;
  const innerHeight = svgHeight - margin.top - margin.bottom;

  // We need to scale X and Y to fit the SVG.
  // We precalculate the min/max Y to normalize the graph height dynamically.
  const { pathData, minY, maxY } = useMemo(() => {
    let d = "";
    let localMinY = Infinity;
    let localMaxY = -Infinity;
    
    // First pass to find min/max Y bounds
    for (let i = 0; i <= OPTIMIZATION_RESOLUTION; i++) {
      const x = OPTIMIZATION_DOMAIN.minX + (i / OPTIMIZATION_RESOLUTION) * (OPTIMIZATION_DOMAIN.maxX - OPTIMIZATION_DOMAIN.minX);
      const y = getLandscapeY(x);
      if (y < localMinY) localMinY = y;
      if (y > localMaxY) localMaxY = y;
    }
    
    // Add visual padding to Y bounds
    localMinY -= 0.5;
    localMaxY += 0.5;
    
    // Second pass to build SVG path
    for (let i = 0; i <= OPTIMIZATION_RESOLUTION; i++) {
      const mathX = OPTIMIZATION_DOMAIN.minX + (i / OPTIMIZATION_RESOLUTION) * (OPTIMIZATION_DOMAIN.maxX - OPTIMIZATION_DOMAIN.minX);
      const mathY = getLandscapeY(mathX);
      
      const svgX = margin.left + ((mathX - OPTIMIZATION_DOMAIN.minX) / (OPTIMIZATION_DOMAIN.maxX - OPTIMIZATION_DOMAIN.minX)) * innerWidth;
      const svgY = margin.top + innerHeight - ((mathY - localMinY) / (localMaxY - localMinY)) * innerHeight;
      
      if (i === 0) d += `M ${svgX},${svgY} `;
      else d += `L ${svgX},${svgY} `;
    }
    
    return { pathData: d, minY: localMinY, maxY: localMaxY };
  }, [margin.left, margin.top, innerWidth, innerHeight]);

  const mapXToSvg = (mathX: number) => margin.left + ((mathX - OPTIMIZATION_DOMAIN.minX) / (OPTIMIZATION_DOMAIN.maxX - OPTIMIZATION_DOMAIN.minX)) * innerWidth;
  const mapYToSvg = (mathY: number) => margin.top + innerHeight - ((mathY - minY) / (maxY - minY)) * innerHeight;

  // The active position to draw
  const currentMathX = activeState ? activeState.currentX : initialX;
  const currentMathY = activeState ? activeState.currentY : getLandscapeY(initialX);
  
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Canvas */}
        <div className="flex-1 bg-[#15181D] rounded-xl border border-[#292E36] p-6 min-h-[500px] flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-sm font-semibold text-[#F1F3F5]">Optimization Landscape</h2>
              <p className="text-xs text-[#A7AFBB] mt-1">
                Drag the slider to set initial starting point. Hill Climbing will only move uphill!
              </p>
            </div>
            <div className="flex gap-4 items-center">
              {!hasGenerated && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#A7AFBB]">Start:</span>
                  <input 
                    type="range" 
                    min={OPTIMIZATION_DOMAIN.minX} 
                    max={OPTIMIZATION_DOMAIN.maxX} 
                    step="0.5"
                    value={initialX}
                    onChange={(e) => setInitialX(parseFloat(e.target.value))}
                    className="cursor-pointer accent-[#6C8CFF]"
                  />
                </div>
              )}
              <button
                onClick={handleGenerate}
                className="px-4 py-1.5 rounded-lg bg-[#6C8CFF] hover:bg-[#5A7BEF] text-white font-medium text-xs transition-colors"
              >
                {hasGenerated ? "Reset Landscape" : "Start Hill Climbing"}
              </button>
            </div>
          </div>
          
          <div className="flex-1 flex justify-center items-center overflow-hidden w-full relative bg-[#0D0F12] rounded-lg border border-[#292E36] p-4">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
              
              {/* Axes / Grid Lines (Decorative) */}
              <line x1={margin.left} y1={margin.top + innerHeight} x2={svgWidth - margin.right} y2={margin.top + innerHeight} stroke="#292E36" strokeWidth="2" strokeDasharray="4 4" />
              <line x1={margin.left} y1={margin.top} x2={margin.left} y2={margin.top + innerHeight} stroke="#292E36" strokeWidth="2" strokeDasharray="4 4" />

              {/* Draw Landscape Curve */}
              <path 
                d={pathData} 
                fill="none" 
                stroke="#263352" 
                strokeWidth="4" 
                className="drop-shadow-lg"
              />
              
              {/* Draw Path History (line connecting visited points) */}
              {activeState && activeState.visitedX.length > 0 && (
                <path
                  d={`M ${activeState.visitedX.map(vx => `${mapXToSvg(vx)},${mapYToSvg(getLandscapeY(vx))}`).join(' L ')}`}
                  fill="none"
                  stroke="#FF5A5A"
                  strokeWidth="2"
                  opacity="0.8"
                />
              )}

              {/* Draw Considered Neighbors (ghost points) */}
              {activeState?.consideredX.map((nx, i) => (
                <circle 
                  key={i}
                  cx={mapXToSvg(nx)} 
                  cy={mapYToSvg(getLandscapeY(nx))} 
                  r="5" 
                  fill="transparent" 
                  stroke="#A7AFBB"
                  strokeWidth="2"
                  opacity="0.6"
                />
              ))}

              {/* Draw Climber */}
              <circle 
                cx={mapXToSvg(currentMathX)} 
                cy={mapYToSvg(currentMathY)} 
                r="8" 
                fill="#6C8CFF" 
                className="transition-all duration-300"
                style={{ filter: "drop-shadow(0px 0px 8px rgba(108,140,255,0.8))" }}
              />
              
              {/* Value Label */}
              <text 
                x={mapXToSvg(currentMathX)} 
                y={mapYToSvg(currentMathY) - 15} 
                textAnchor="middle" 
                fill="#F1F3F5"
                className="text-xs font-mono font-bold transition-all duration-300"
              >
                {currentMathY.toFixed(2)}
              </text>
            </svg>
          </div>
        </div>

        {/* Right: Controls & Metrics */}
        <div className="w-full lg:w-80 flex flex-col gap-6">
          <PlaybackToolbar
            playback={playback}
            disabled={!hasGenerated}
          />
          <MetricsPanel metrics={activeMetrics} />
        </div>
      </div>
    </div>
  );
}
