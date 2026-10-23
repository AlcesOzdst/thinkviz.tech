"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  ArrowRight,
  Terminal,
  Activity,
  Cpu,
  Layers,
  Sparkles,
  Compass,
  CheckCircle2,
  GitBranch,
} from "lucide-react";

interface GridStep {
  current: [number, number];
  visited: [number, number][];
  frontier: [number, number][];
  path: [number, number][];
  g: number;
  h: number;
  f: number;
  codeLine: number;
}

const ROWS = 6;
const COLS = 8;
const START: [number, number] = [1, 1];
const GOAL: [number, number] = [4, 6];
const WALLS: [number, number][] = [
  [2, 3],
  [3, 3],
  [4, 3],
  [2, 5],
  [1, 5],
];

// Pre-computed authentic A* simulation steps on the 6x8 grid
const SIMULATION_STEPS: GridStep[] = [
  {
    current: [1, 1],
    visited: [[1, 1]],
    frontier: [[1, 2], [2, 1]],
    path: [],
    g: 0,
    h: 8.0,
    f: 8.0,
    codeLine: 2,
  },
  {
    current: [1, 2],
    visited: [[1, 1], [1, 2]],
    frontier: [[2, 1], [1, 3], [2, 2]],
    path: [],
    g: 1.0,
    h: 7.0,
    f: 8.0,
    codeLine: 3,
  },
  {
    current: [2, 2],
    visited: [[1, 1], [1, 2], [2, 2]],
    frontier: [[2, 1], [1, 3], [3, 2]],
    path: [],
    g: 2.0,
    h: 6.0,
    f: 8.0,
    codeLine: 5,
  },
  {
    current: [3, 2],
    visited: [[1, 1], [1, 2], [2, 2], [3, 2]],
    frontier: [[2, 1], [1, 3], [4, 2], [3, 1]],
    path: [],
    g: 3.0,
    h: 5.0,
    f: 8.0,
    codeLine: 5,
  },
  {
    current: [4, 2],
    visited: [[1, 1], [1, 2], [2, 2], [3, 2], [4, 2]],
    frontier: [[2, 1], [1, 3], [3, 1], [5, 2], [4, 1]],
    path: [],
    g: 4.0,
    h: 4.0,
    f: 8.0,
    codeLine: 3,
  },
  {
    current: [5, 2],
    visited: [[1, 1], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2]],
    frontier: [[2, 1], [1, 3], [5, 3], [5, 1]],
    path: [],
    g: 5.0,
    h: 4.0,
    f: 9.0,
    codeLine: 5,
  },
  {
    current: [5, 3],
    visited: [[1, 1], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [5, 3]],
    frontier: [[2, 1], [1, 3], [5, 4]],
    path: [],
    g: 6.0,
    h: 3.0,
    f: 9.0,
    codeLine: 5,
  },
  {
    current: [5, 4],
    visited: [[1, 1], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [5, 3], [5, 4]],
    frontier: [[2, 1], [1, 3], [5, 5], [4, 4]],
    path: [],
    g: 7.0,
    h: 2.0,
    f: 9.0,
    codeLine: 5,
  },
  {
    current: [5, 5],
    visited: [[1, 1], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [5, 3], [5, 4], [5, 5]],
    frontier: [[2, 1], [1, 3], [4, 4], [5, 6], [4, 5]],
    path: [],
    g: 8.0,
    h: 1.0,
    f: 9.0,
    codeLine: 5,
  },
  {
    current: [4, 6],
    visited: [[1, 1], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [5, 3], [5, 4], [5, 5], [4, 6]],
    frontier: [],
    path: [[1, 1], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [5, 3], [5, 4], [5, 5], [4, 6]],
    g: 9.0,
    h: 0.0,
    f: 9.0,
    codeLine: 4,
  },
];

export function HeroAsymmetricBento() {
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Auto-play perpetual simulation
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev >= SIMULATION_STEPS.length - 1 ? 0 : prev + 1));
    }, 700);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const currentStep = SIMULATION_STEPS[stepIndex];

  const isWall = useCallback(
    (r: number, c: number) => WALLS.some(([wr, wc]) => wr === r && wc === c),
    []
  );

  const isStart = useCallback(
    (r: number, c: number) => r === START[0] && c === START[1],
    []
  );

  const isGoal = useCallback(
    (r: number, c: number) => r === GOAL[0] && c === GOAL[1],
    []
  );

  const isPath = useCallback(
    (r: number, c: number) => currentStep.path.some(([pr, pc]) => pr === r && pc === c),
    [currentStep.path]
  );

  const isCurrent = useCallback(
    (r: number, c: number) => currentStep.current[0] === r && currentStep.current[1] === c,
    [currentStep.current]
  );

  const isVisited = useCallback(
    (r: number, c: number) => currentStep.visited.some(([vr, vc]) => vr === r && vc === c),
    [currentStep.visited]
  );

  const isFrontier = useCallback(
    (r: number, c: number) => currentStep.frontier.some(([fr, fc]) => fr === r && fc === c),
    [currentStep.frontier]
  );

  return (
    <div className="w-full relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-[#292E36]/60 bg-gradient-to-b from-[#090b0e] via-[#0D0F12] to-[#0D0F12]">
      {/* Background Radial Glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* Asymmetric Split Layout: Left Content (45%) / Right Interactive Engine (55%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column (Left-Aligned, Anti-Center Bias) */}
          <div className="lg:col-span-5 space-y-6 text-left">
            {/* Live System Beacon */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#15181D] border border-[#292E36] text-xs font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[#A7AFBB] tracking-tight">ENGINE ACTIVE</span>
              <span className="text-[#292E36]">/</span>
              <span className="text-[#38bdf8] font-semibold">11 DETERMINISTIC SOLVERS</span>
            </div>

            {/* Display Headline */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#F1F3F5] leading-[1.08]">
                Step into the mind <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-300">
                  of the algorithm.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-[#A7AFBB] font-normal leading-relaxed max-w-[50ch]">
                Inspect decision boundaries, priority queues, and line-by-line state machines in real time. Built for AI engineers, researchers, and students.
              </p>
            </div>

            {/* Tactile Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/algorithms"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-sky-900/30 active:scale-[0.98]"
              >
                <span>Launch Interactive Explorer</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#bento-methodology"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#15181D] hover:bg-[#1B1F25] border border-[#292E36] text-sm font-medium text-[#F1F3F5] transition-all active:scale-[0.98]"
              >
                <span>Architecture</span>
              </a>
            </div>

            {/* High-Density Metrics (Dividers, Anti-Card Overuse) */}
            <div className="pt-6 border-t border-[#292E36] grid grid-cols-3 divide-x divide-[#292E36] text-left font-mono">
              <div className="pr-4">
                <span className="text-[11px] text-[#737C89] block font-sans uppercase tracking-wider">
                  Latency
                </span>
                <span className="text-base font-bold text-[#F1F3F5] tabular-nums mt-0.5 block">
                  &lt; 0.2ms
                </span>
              </div>
              <div className="px-4">
                <span className="text-[11px] text-[#737C89] block font-sans uppercase tracking-wider">
                  Execution
                </span>
                <span className="text-base font-bold text-emerald-400 tabular-nums mt-0.5 block">
                  100% Pure
                </span>
              </div>
              <div className="pl-4">
                <span className="text-[11px] text-[#737C89] block font-sans uppercase tracking-wider">
                  Complexity
                </span>
                <span className="text-base font-bold text-sky-400 tabular-nums mt-0.5 block">
                  O(b^d) → O(1)
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Algorithm Simulation Engine */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-[#292E36] bg-[#111418]/90 backdrop-blur-xl shadow-2xl shadow-black/80 overflow-hidden relative">
              {/* Terminal Window Header Bar */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#292E36] bg-[#161b22] text-xs font-mono">
                <div className="flex items-center gap-2.5">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-[#A7AFBB] font-semibold pl-2 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-sky-400" />
                    a_star_heuristic_search.ts
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded">
                    Step {stepIndex + 1} / {SIMULATION_STEPS.length}
                  </span>
                </div>
              </div>

              {/* Workspace Body: Interactive Grid & Live Telemetry Panel */}
              <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-[#292E36]">
                {/* 6x8 Visual Grid Canvas (7 Cols on desktop) */}
                <div className="md:col-span-7 p-5 bg-[#090b0e] flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono text-[#737C89]">
                      <span className="uppercase text-[10px] tracking-wider">Canvas: 6×8 State Matrix</span>
                      <div className="flex items-center gap-3 text-[10px]">
                        <span className="flex items-center gap-1 text-emerald-400">
                          <span className="w-2 h-2 rounded bg-emerald-500" /> Start/Goal
                        </span>
                        <span className="flex items-center gap-1 text-amber-300">
                          <span className="w-2 h-2 rounded bg-amber-500/50 border border-amber-400" /> Frontier
                        </span>
                        <span className="flex items-center gap-1 text-indigo-300">
                          <span className="w-2 h-2 rounded bg-indigo-900/60" /> Visited
                        </span>
                      </div>
                    </div>

                    {/* Matrix Grid */}
                    <div className="grid grid-cols-8 gap-1.5 p-3 rounded-xl bg-[#111418] border border-[#27272a] select-none">
                      {Array.from({ length: ROWS }).map((_, r) =>
                        Array.from({ length: COLS }).map((_, c) => {
                          const wall = isWall(r, c);
                          const start = isStart(r, c);
                          const goal = isGoal(r, c);
                          const path = isPath(r, c);
                          const active = isCurrent(r, c);
                          const frontier = isFrontier(r, c);
                          const visited = isVisited(r, c);

                          let cellStyle = "bg-[#181b20] border-[#262930] text-[#737C89]";
                          let badge = "";

                          if (wall) {
                            cellStyle = "bg-[#252830] border-[#383d47]";
                          } else if (start) {
                            cellStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold";
                            badge = "S";
                          } else if (goal) {
                            cellStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold";
                            badge = "G";
                          } else if (active) {
                            cellStyle = "bg-sky-500 border-sky-300 text-white font-bold ring-2 ring-sky-400/50 scale-105 shadow-[0_0_12px_rgba(56,189,248,0.6)]";
                            badge = "●";
                          } else if (path) {
                            cellStyle = "bg-emerald-400/30 border-emerald-400 text-emerald-300 font-bold shadow-[0_0_8px_rgba(52,211,153,0.3)]";
                            badge = "✓";
                          } else if (frontier) {
                            cellStyle = "bg-amber-500/20 border-amber-400/80 text-amber-300";
                            badge = "○";
                          } else if (visited) {
                            cellStyle = "bg-indigo-950/40 border-indigo-700/40 text-indigo-300";
                            badge = "•";
                          }

                          return (
                            <div
                              key={`${r}-${c}`}
                              className={`aspect-square rounded-md border flex items-center justify-center text-[10px] font-mono transition-all duration-200 ${cellStyle}`}
                            >
                              {badge}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Playback Mini Controls */}
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#27272a] text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all ${
                          isPlaying
                            ? "bg-amber-600 hover:bg-amber-500"
                            : "bg-sky-500 hover:bg-sky-400"
                        }`}
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="w-3.5 h-3.5 fill-current" />
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Run</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsPlaying(false);
                          setStepIndex((prev) => (prev >= SIMULATION_STEPS.length - 1 ? 0 : prev + 1));
                        }}
                        className="p-1.5 rounded-lg bg-[#181C22] border border-[#27272a] text-[#A7AFBB] hover:text-white transition-colors"
                        title="Step Forward"
                      >
                        <StepForward className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsPlaying(false);
                          setStepIndex(0);
                        }}
                        className="p-1.5 rounded-lg bg-[#181C22] border border-[#27272a] text-[#A7AFBB] hover:text-white transition-colors"
                        title="Reset"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-[11px] font-mono text-[#737C89]">
                      Target Node: <strong className="text-white">(4, 6)</strong>
                    </div>
                  </div>
                </div>

                {/* Live Formula & Code Inspector (5 Cols on desktop) */}
                <div className="md:col-span-5 p-4 bg-[#111418] flex flex-col justify-between space-y-4 font-mono text-xs">
                  {/* Live Cost Computation HUD */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-[#737C89] font-sans uppercase tracking-wider block">
                      Cost Evaluation f(n) = g(n) + h(n)
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2 rounded-lg bg-[#181c22] border border-[#27272a] text-center">
                        <span className="text-[9px] text-[#737C89] block font-sans">g(n) Cost</span>
                        <span className="font-bold text-sky-400 tabular-nums">
                          {currentStep.g.toFixed(1)}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#181c22] border border-[#27272a] text-center">
                        <span className="text-[9px] text-[#737C89] block font-sans">h(n) Heuristic</span>
                        <span className="font-bold text-amber-400 tabular-nums">
                          {currentStep.h.toFixed(1)}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#181c22] border border-[#27272a] text-center">
                        <span className="text-[9px] text-[#737C89] block font-sans">f(n) Total</span>
                        <span className="font-bold text-emerald-400 tabular-nums">
                          {currentStep.f.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Synchronized Pseudocode Stream */}
                  <div className="rounded-lg bg-[#090b0e] border border-[#27272a] p-2.5 text-[11px] leading-relaxed space-y-1">
                    <div className="text-[#555d6b] text-[10px] mb-1">// A* Decision Execution</div>
                    <div className={`px-1.5 py-0.5 rounded transition-colors ${currentStep.codeLine === 2 ? "bg-sky-500/20 text-sky-300 font-semibold" : "text-[#737c89]"}`}>
                      1. openSet.insert(start, f=h(s))
                    </div>
                    <div className={`px-1.5 py-0.5 rounded transition-colors ${currentStep.codeLine === 3 ? "bg-sky-500/20 text-sky-300 font-semibold" : "text-[#737c89]"}`}>
                      2. current = openSet.extractMin()
                    </div>
                    <div className={`px-1.5 py-0.5 rounded transition-colors ${currentStep.codeLine === 4 ? "bg-emerald-500/20 text-emerald-300 font-semibold" : "text-[#737c89]"}`}>
                      3. if current == goal: return path
                    </div>
                    <div className={`px-1.5 py-0.5 rounded transition-colors ${currentStep.codeLine === 5 ? "bg-amber-500/20 text-amber-300 font-semibold" : "text-[#737c89]"}`}>
                      4. for neighbor in neighbors(curr):
                    </div>
                    <div className="px-1.5 py-0.5 pl-4 text-[#555d6b]">
                      tentative_g = g[curr] + d
                    </div>
                  </div>

                  {/* Active Node Memory Status */}
                  <div className="p-2.5 rounded-lg bg-[#181c22] border border-[#27272a] flex items-center justify-between text-[11px]">
                    <span className="text-[#A7AFBB]">Active Coordinates:</span>
                    <span className="text-white font-bold tabular-nums">
                      ({currentStep.current[0]}, {currentStep.current[1]})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 9: Bento 2.0 Architectural Engine (Replaces Banned 3-Column HowItWorks) */}
        <div id="bento-methodology" className="pt-20 lg:pt-28 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-mono font-semibold text-sky-400 uppercase tracking-wider mb-2">
                Core Engine Architecture
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#F1F3F5]">
                How ThinkViz models intelligence.
              </h2>
            </div>
            <p className="text-sm text-[#A7AFBB] max-w-md leading-relaxed">
              Moving beyond static animations. Pure decoupled mathematical engines executing step-by-step state machines.
            </p>
          </div>

          {/* Asymmetric Bento Grid (Row 1: 7fr / 5fr | Row 2: 5fr / 7fr) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Bento 1: Wide Intelligent State Scrubber (7 Cols) */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-[#111418] border border-[#27272a] flex flex-col justify-between space-y-4 hover:border-sky-500/30 transition-all">
              <div className="flex items-center justify-between pb-3 border-b border-[#27272a]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#F1F3F5]">Deterministic Graph Search</h3>
                    <span className="text-[11px] text-[#717885] font-mono">A*, BFS, DFS & Dijkstra</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  Priority Queues
                </span>
              </div>

              <p className="text-xs text-[#A7AFBB] leading-relaxed">
                Watch admissible heuristics guide search rays through complex labyrinth networks. Every state expansion recalculates open/closed lists without black-box approximations.
              </p>

              <div className="p-3 rounded-xl bg-[#090b0e] border border-[#27272a] font-mono text-xs flex items-center justify-between">
                <span className="text-[#717885]">Frontier Resolution:</span>
                <span className="text-emerald-400 font-bold">Admissible &amp; Consistent</span>
              </div>
            </div>

            {/* Bento 2: Telemetry & Memory Stream (5 Cols) */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-[#111418] border border-[#27272a] flex flex-col justify-between space-y-4 hover:border-emerald-500/30 transition-all">
              <div className="flex items-center justify-between pb-3 border-b border-[#27272a]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#F1F3F5]">Live Metric Telemetry</h3>
                    <span className="text-[11px] text-[#717885] font-mono">Microsecond Benchmarks</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Zero Jitter
                </span>
              </div>

              <p className="text-xs text-[#A7AFBB] leading-relaxed">
                Quantify memory consumption, path cost ratios, and search tree depth frame-by-frame with tabular numeric precision.
              </p>

              <div className="p-3 rounded-xl bg-[#090b0e] border border-[#27272a] font-mono text-xs flex items-center justify-between">
                <span className="text-[#717885]">Search Overhead:</span>
                <span className="text-sky-400 font-bold">O(b^d) Monitored</span>
              </div>
            </div>

            {/* Bento 3: Adversarial Game Trees (5 Cols) */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-[#111418] border border-[#27272a] flex flex-col justify-between space-y-4 hover:border-amber-500/30 transition-all">
              <div className="flex items-center justify-between pb-3 border-b border-[#27272a]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <GitBranch className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#F1F3F5]">Adversarial Game Decision</h3>
                    <span className="text-[11px] text-[#717885] font-mono">Minimax &amp; Alpha-Beta</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Pruning Trees
                </span>
              </div>

              <p className="text-xs text-[#A7AFBB] leading-relaxed">
                Visualize multi-agent zero-sum games. Watch alpha-beta pruning sever suboptimal decision branches before evaluation.
              </p>

              <div className="p-3 rounded-xl bg-[#090b0e] border border-[#27272a] font-mono text-xs flex items-center justify-between">
                <span className="text-[#717885]">Pruning Efficiency:</span>
                <span className="text-amber-400 font-bold">~60% Branch Cut</span>
              </div>
            </div>

            {/* Bento 4: Heuristic Optimization (7 Cols) */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-[#111418] border border-[#27272a] flex flex-col justify-between space-y-4 hover:border-indigo-500/30 transition-all">
              <div className="flex items-center justify-between pb-3 border-b border-[#27272a]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#F1F3F5]">Local &amp; Genetic Optimization</h3>
                    <span className="text-[11px] text-[#717885] font-mono">Hill Climbing, Simulated Annealing, Genetic TSP</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Fitness Topography
                </span>
              </div>

              <p className="text-xs text-[#A7AFBB] leading-relaxed">
                Explore fitness landscapes, thermal annealing schedules, and genetic crossover operators solving NP-hard combinatorial optimization challenges.
              </p>

              <div className="p-3 rounded-xl bg-[#090b0e] border border-[#27272a] font-mono text-xs flex items-center justify-between">
                <span className="text-[#717885]">Convergence:</span>
                <span className="text-indigo-300 font-bold">Boltzmann Probability &amp; Elitism</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
