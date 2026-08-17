"use client";

import React, { useState } from "react";
import { PlaybackToolbar } from "@/components/visualization/PlaybackToolbar";
import { MetricsPanel } from "@/components/visualization/MetricsPanel";
import { useVisualizerPlayback } from "@/hooks/useVisualizerPlayback";
import { generateDefaultTree, generateMinimaxSteps } from "@/lib/algorithms/minimax";
import { generateAlphaBetaSteps } from "@/lib/algorithms/alphaBeta";
import { TreeNode, TreeState } from "@/types/tree";
import { AlgorithmStep } from "@/types/visualizer";

interface GameTreeWorkspaceProps {
  algorithmId: string;
}

export function GameTreeWorkspace({ algorithmId }: GameTreeWorkspaceProps) {
  const [depth] = useState(3);
  const [initialTree, setInitialTree] = useState<TreeNode>(generateDefaultTree(3));
  const [steps, setSteps] = useState<AlgorithmStep<TreeState>[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  const playback = useVisualizerPlayback(steps, algorithmId);

  const handleGenerate = () => {
    const tree = generateDefaultTree(depth);
    setInitialTree(tree);
    
    let newSteps: AlgorithmStep<TreeState>[] = [];
    if (algorithmId === "alpha-beta") {
      newSteps = generateAlphaBetaSteps(tree);
    } else {
      newSteps = generateMinimaxSteps(tree);
    }
    
    setSteps(newSteps);
    setHasGenerated(true);
    playback.reset();
  };

  const activeState = playback.currentStep ? (playback.currentStep.state as TreeState) : null;
  const activeMetrics = playback.currentStep ? playback.currentStep.metrics : null;

  // A recursive component to render the tree using flexbox
  const TreeNodeComponent = ({ node }: { node: TreeNode }) => {
    const isCurrent = activeState?.currentNodeId === node.id;
    const evaluatedValue = activeState?.evaluatedNodes[node.id];
    const isPruned = activeState?.prunedNodes.includes(node.id) ?? false;
    
    // Display value: if evaluated, show it. Else if it has a leaf value, show it. Else "?"
    let displayValue: string | number = "?";
    if (evaluatedValue !== undefined) {
      displayValue = evaluatedValue;
    } else if (node.value !== null) {
      displayValue = node.value;
    }
    
    if (isPruned) {
      displayValue = "X";
    }

    return (
      <div className={`flex flex-col items-center ${isPruned ? 'opacity-30 grayscale transition-opacity duration-500' : ''}`}>
        {/* The Node Shape */}
        <div className="flex flex-col items-center relative">
          <div 
            className={`flex items-center justify-center w-12 h-12 mb-6 font-bold text-sm transition-all duration-300 z-10
              ${node.isMaxNode ? 'rounded-lg bg-[#263352] text-[#6C8CFF]' : 'rounded-full bg-[#3F232D] text-[#FF5A5A]'}
              ${isCurrent ? 'ring-4 ring-offset-4 ring-offset-[#15181D] ' + (node.isMaxNode ? 'ring-[#6C8CFF]' : 'ring-[#FF5A5A]') : 'border border-[#292E36]'}
            `}
          >
            {displayValue}
          </div>
          {/* Vertical line dropping down to children container if it has children */}
          {node.children.length > 0 && (
             <div className="absolute top-12 w-[1px] h-6 bg-[#292E36]"></div>
          )}
        </div>
        
        {/* Children Row */}
        {node.children.length > 0 && (
          <div className="flex gap-4 sm:gap-8 md:gap-12 relative mt-[-1px]">
            {/* Horizontal line connecting children */}
            <div className="absolute top-0 left-[25%] right-[25%] h-[1px] bg-[#292E36]"></div>
            
            {node.children.map(child => (
              <div key={child.id} className="relative pt-6">
                {/* Vertical line dropping from horizontal line to child */}
                <div className="absolute top-0 left-[50%] w-[1px] h-6 bg-[#292E36] -translate-x-[50%]"></div>
                <TreeNodeComponent node={child} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Tree Canvas */}
        <div className="flex-1 bg-[#15181D] rounded-xl border border-[#292E36] p-6 min-h-[500px] flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-sm font-semibold text-[#F1F3F5]">Minimax Game Tree</h2>
              <p className="text-xs text-[#A7AFBB] mt-1">
                Squares = MAX player. Circles = MIN player.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleGenerate}
                className="px-4 py-1.5 rounded-lg bg-[#6C8CFF] hover:bg-[#5A7BEF] text-white font-medium text-xs transition-colors"
              >
                {hasGenerated ? "Regenerate Tree" : `Visualize ${algorithmId === "alpha-beta" ? "Alpha-Beta" : "Minimax"}`}
              </button>
            </div>
          </div>
          
          <div className="flex-1 flex justify-center items-start overflow-auto">
            {/* Render the tree */}
            <div className="mt-8">
              {activeState ? (
                <TreeNodeComponent node={activeState.tree} />
              ) : (
                <TreeNodeComponent node={initialTree} />
              )}
            </div>
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
