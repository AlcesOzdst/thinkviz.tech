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
    <div className="w-full relative overflow-hidden pt-10 pb-20 lg:pt-16 lg:pb-28 border-b border-white/10 bg-[#070A0F]">
      {/* Background Architectural Grid Subtle Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(56,189,248,0.06),rgba(255,255,255,0))] pointer-events-none" />

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Asymmetric Split Layout: Left Content (45%) / Right Interactive Engine (55%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column (Left-Aligned, Anti-Center Bias) */}
          <div className="lg:col-span-5 space-y-7 text-left">
            {/* Live System Beacon */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#111722] border border-white/10 text-xs font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-slate-300 font-bold tracking-wider">SYS // ONLINE</span>
              <span className="text-white/20">|</span>
              <span className="text-sky-400 font-semibold tracking-wider">11 DETERMINISTIC SOLVERS</span>
            </div>

            {/* Display Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.08]">
                Step into the mind <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-300">
                  of the algorithm.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-400 font-mono text-sm leading-relaxed max-w-[50ch]">
                Inspect decision boundaries, priority queues, and line-by-line state machines in real time. Built for AI engineers, researchers, and students.
              </p>
            </div>

            {/* Tactile Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/algorithms"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-sky-900/30 active:scale-[0.98]"
              >
                <span>Launch Interactive Explorer</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/machine-learning"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-[#111722] hover:bg-[#1A2230] border border-white/10 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-all active:scale-[0.98]"
              >
                <span>ML Lab Hub</span>
              </Link>
            </div>

            {/* High-Density Telemetry (Dividers, Anti-Card Overuse) */}
            <div className="pt-6 border-t border-white/10 grid grid-cols-3 divide-x divide-white/10 text-left font-mono">
              <div className="pr-4">
                <span className="text-[10px] text-slate-400 block font-mono font-bold uppercase tracking-widest">
                  Latency
                </span>
                <span className="text-base font-bold text-white tabular-nums mt-0.5 block">
                  &lt; 0.2ms
                </span>
              </div>
              <div className="px-4">
                <span className="text-[10px] text-slate-400 block font-mono font-bold uppercase tracking-widest">
                  Execution
                </span>
                <span className="text-base font-bold text-emerald-400 tabular-nums mt-0.5 block">
                  100% Pure
                </span>
              </div>
              <div className="pl-4">
                <span className="text-[10px] text-slate-400 block font-mono font-bold uppercase tracking-widest">
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
            <div className="rounded-3xl border border-white/10 bg-[#0A0E17] shadow-2xl overflow-hidden relative">
              {/* Corner Crosshairs */}
              <div className="absolute top-3 left-3 text-xs font-mono text-white/20 select-none z-20">+</div>
              <div className="absolute top-3 right-3 text-xs font-mono text-white/20 select-none z-20">+</div>

              {/* Terminal Window Header Bar */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-[#111722] text-xs font-mono">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-slate-300 font-bold pl-2 flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-sky-400" />
                    <span>01 // a_star_heuristic_search.ts</span>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-sky-300 font-mono bg-sky-500/10 border border-sky-500/30 px-2.5 py-0.5 rounded-full">
                    STEP {stepIndex + 1} / {SIMULATION_STEPS.length}
                  </span>
                </div>
              </div>

              {/* Workspace Body: Interactive Grid & Live Telemetry Panel */}
              <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-white/10">
                {/* 6x8 Visual Grid Canvas (7 Cols on desktop) */}
                <div className="md:col-span-7 p-6 bg-[#070A0F] flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                      <span className="uppercase text-[10px] tracking-widest font-bold">STATE MATRIX: 6×8</span>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="flex items-center gap-1 text-emerald-400">
                          <span className="w-2 h-2 rounded bg-emerald-500" /> S
                        </span>
                        <span className="flex items-center gap-1 text-rose-400">
                          <span className="w-2 h-2 rounded bg-rose-500" /> G
                        </span>
                        <span className="flex items-center gap-1 text-amber-300">
                          <span className="w-2 h-2 rounded bg-amber-400" /> F
                        </span>
                        <span className="flex items-center gap-1 text-emerald-300">
                          <span className="w-2 h-2 rounded bg-[#34D399]" /> Path
                        </span>
                      </div>
                    </div>

                    {/* Matrix Grid */}
                    <div className="grid grid-cols-8 gap-1.5 p-3.5 rounded-2xl bg-[#111722] border border-white/10 select-none">
                      {Array.from({ length: ROWS }).map((_, r) =>
                        Array.from({ length: COLS }).map((_, c) => {
                          const wall = isWall(r, c);
                          const start = isStart(r, c);
                          const goal = isGoal(r, c);
                          const path = isPath(r, c);
                          const active = isCurrent(r, c);
                          const frontier = isFrontier(r, c);
                          const visited = isVisited(r, c);

                          let cellStyle = "bg-[#0A0E17] border-white/5 text-slate-500";
                          let badge = "";

                          if (wall) {
                            cellStyle = "bg-[#1E2638] border-white/10";
                          } else if (start) {
                            cellStyle = "bg-emerald-500/25 border-2 border-emerald-500 text-emerald-300 font-bold shadow-[0_0_8px_rgba(16,185,129,0.35)]";
                            badge = "S";
                          } else if (goal) {
                            cellStyle = "bg-rose-500/25 border-2 border-rose-500 text-rose-300 font-bold shadow-[0_0_8px_rgba(244,63,94,0.35)]";
                            badge = "G";
                          } else if (active) {
                            cellStyle = "bg-sky-500 border-sky-300 text-white font-bold ring-2 ring-sky-400/50 scale-105 shadow-[0_0_12px_rgba(56,189,248,0.7)] z-10";
                            badge = "●";
                          } else if (path) {
                            cellStyle = "bg-[#10B981]/30 border-[#34D399] text-[#34D399] font-bold shadow-[0_0_10px_rgba(52,211,153,0.45)]";
                            badge = "✓";
                          } else if (frontier) {
                            cellStyle = "bg-amber-500/20 border-amber-400 text-amber-300";
                            badge = "○";
                          } else if (visited) {
                            cellStyle = "bg-[#131B28] border-white/5 text-slate-400";
                            badge = "•";
                          }

                          return (
                            <div
                              key={`${r}-${c}`}
                              className={`aspect-square rounded-lg border flex items-center justify-center text-[10px] font-mono transition-all duration-200 ${cellStyle}`}
                            >
                              {badge}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Playback Mini Controls */}
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/5 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold text-white transition-all ${
                          isPlaying
                            ? "bg-amber-600 hover:bg-amber-500"
                            : "bg-sky-500 hover:bg-sky-400"
                        }`}
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="w-3.5 h-3.5 fill-current" />
                            <span>PAUSE</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>RUN</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsPlaying(false);
                          setStepIndex((prev) => (prev >= SIMULATION_STEPS.length - 1 ? 0 : prev + 1));
                        }}
                        className="p-2 rounded-xl bg-[#111722] border border-white/10 text-slate-300 hover:text-white transition-colors"
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
                        className="p-2 rounded-xl bg-[#111722] border border-white/10 text-slate-300 hover:text-white transition-colors"
                        title="Reset"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-[11px] font-mono text-slate-400">
                      TARGET: <strong className="text-white">(4, 6)</strong>
                    </div>
                  </div>
                </div>

                {/* Live Formula & Code Inspector (5 Cols on desktop) */}
                <div className="md:col-span-5 p-5 bg-[#0A0E17] flex flex-col justify-between space-y-4 font-mono text-xs">
                  {/* Live Cost Computation HUD */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest block">
                      Cost: f(n) = g(n) + h(n)
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2.5 rounded-xl bg-[#111722] border border-white/10 text-center">
                        <span className="text-[9px] text-slate-400 block font-mono">g(n) Cost</span>
                        <span className="font-bold text-sky-400 tabular-nums">
                          {currentStep.g.toFixed(1)}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#111722] border border-white/10 text-center">
                        <span className="text-[9px] text-slate-400 block font-mono">h(n) Heuristic</span>
                        <span className="font-bold text-amber-400 tabular-nums">
                          {currentStep.h.toFixed(1)}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#111722] border border-white/10 text-center">
                        <span className="text-[9px] text-slate-400 block font-mono">f(n) Total</span>
                        <span className="font-bold text-emerald-400 tabular-nums">
                          {currentStep.f.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Synchronized Pseudocode Stream */}
                  <div className="rounded-2xl bg-[#070A0F] border border-white/10 p-3 text-[11px] leading-relaxed space-y-1 font-mono">
                    <div className="text-slate-500 text-[10px] mb-1">// A* State Logic</div>
                    <div className={`px-2 py-0.5 rounded transition-colors ${currentStep.codeLine === 2 ? "bg-sky-500/20 text-sky-300 font-bold" : "text-slate-400"}`}>
                      1. openSet.insert(start, f=h(s))
                    </div>
                    <div className={`px-2 py-0.5 rounded transition-colors ${currentStep.codeLine === 3 ? "bg-sky-500/20 text-sky-300 font-bold" : "text-slate-400"}`}>
                      2. current = openSet.extractMin()
                    </div>
                    <div className={`px-2 py-0.5 rounded transition-colors ${currentStep.codeLine === 4 ? "bg-emerald-500/20 text-emerald-300 font-bold" : "text-slate-400"}`}>
                      3. if current == goal: return path
                    </div>
                    <div className={`px-2 py-0.5 rounded transition-colors ${currentStep.codeLine === 5 ? "bg-amber-500/20 text-amber-300 font-bold" : "text-slate-400"}`}>
                      4. for neighbor in neighbors(curr):
                    </div>
                    <div className="px-2 py-0.5 pl-4 text-slate-500">
                      tentative_g = g[curr] + d
                    </div>
                  </div>

                  {/* Active Node Memory Status */}
                  <div className="p-3 rounded-2xl bg-[#111722] border border-white/10 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">ACTIVE COORD:</span>
                    <span className="text-white font-bold tabular-nums">
                      ({currentStep.current[0]}, {currentStep.current[1]})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bento 2.0 Architectural Engine */}
        <div id="bento-methodology" className="pt-24 lg:pt-32 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <div className="text-xs font-mono font-bold text-sky-400 uppercase tracking-widest mb-2">
                02 // CORE ENGINE ARCHITECTURE
              </div>
              <h2 className="text-2xl sm:text-4xl font-mono font-bold tracking-tight text-white">
                How ThinkViz models intelligence.
              </h2>
            </div>
            <p className="text-xs font-mono text-slate-400 max-w-md leading-relaxed">
              Moving beyond static animations. Pure decoupled mathematical engines executing step-by-step state machines.
            </p>
          </div>

          {/* Asymmetric Bento Grid (Row 1: 7fr / 5fr | Row 2: 5fr / 7fr) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Bento 1: Wide Intelligent State Scrubber (7 Cols) */}
            <div className="lg:col-span-7 p-7 rounded-3xl bg-[#0A0E17] border border-white/10 flex flex-col justify-between space-y-5 hover:border-sky-500/40 transition-all relative overflow-hidden group shadow-xl">
              <div className="absolute top-3 right-3 text-xs font-mono text-white/20 select-none">+</div>
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#111722] border border-white/10 flex items-center justify-center text-sky-400">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-mono font-bold text-white">01 // Deterministic Graph Search</h3>
                    <span className="text-xs text-slate-400 font-mono">A*, BFS, DFS &amp; Dijkstra</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono uppercase px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30">
                  Priority Queues
                </span>
              </div>

              <p className="text-xs font-mono text-slate-300 leading-relaxed">
                Watch admissible heuristics guide search rays through complex labyrinth networks. Every state expansion recalculates open/closed lists without black-box approximations.
              </p>

              <div className="p-3.5 rounded-2xl bg-[#111722] border border-white/10 font-mono text-xs flex items-center justify-between">
                <span className="text-slate-400">Frontier Resolution:</span>
                <span className="text-emerald-400 font-bold">Admissible &amp; Consistent</span>
              </div>
            </div>

            {/* Bento 2: Telemetry & Memory Stream (5 Cols) */}
            <div className="lg:col-span-5 p-7 rounded-3xl bg-[#0A0E17] border border-white/10 flex flex-col justify-between space-y-5 hover:border-emerald-500/40 transition-all relative overflow-hidden group shadow-xl">
              <div className="absolute top-3 right-3 text-xs font-mono text-white/20 select-none">+</div>
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#111722] border border-white/10 flex items-center justify-center text-emerald-400">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-mono font-bold text-white">02 // Live Metric Telemetry</h3>
                    <span className="text-xs text-slate-400 font-mono">Microsecond Benchmarks</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono uppercase px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Zero Jitter
                </span>
              </div>

              <p className="text-xs font-mono text-slate-300 leading-relaxed">
                Quantify memory consumption, path cost ratios, and search tree depth frame-by-frame with tabular numeric precision.
              </p>

              <div className="p-3.5 rounded-2xl bg-[#111722] border border-white/10 font-mono text-xs flex items-center justify-between">
                <span className="text-slate-400">Search Overhead:</span>
                <span className="text-sky-400 font-bold">O(b^d) Monitored</span>
              </div>
            </div>

            {/* Bento 3: Adversarial Game Trees (5 Cols) */}
            <div className="lg:col-span-5 p-7 rounded-3xl bg-[#0A0E17] border border-white/10 flex flex-col justify-between space-y-5 hover:border-amber-500/40 transition-all relative overflow-hidden group shadow-xl">
              <div className="absolute top-3 right-3 text-xs font-mono text-white/20 select-none">+</div>
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#111722] border border-white/10 flex items-center justify-center text-amber-400">
                    <GitBranch className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-mono font-bold text-white">03 // Adversarial Game Decision</h3>
                    <span className="text-xs text-slate-400 font-mono">Minimax &amp; Alpha-Beta</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono uppercase px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Pruning Trees
                </span>
              </div>

              <p className="text-xs font-mono text-slate-300 leading-relaxed">
                Visualize multi-agent zero-sum games. Watch alpha-beta pruning sever suboptimal decision branches before evaluation.
              </p>

              <div className="p-3.5 rounded-2xl bg-[#111722] border border-white/10 font-mono text-xs flex items-center justify-between">
                <span className="text-slate-400">Pruning Efficiency:</span>
                <span className="text-amber-400 font-bold">~60% Branch Cut</span>
              </div>
            </div>

            {/* Bento 4: Heuristic Optimization (7 Cols) */}
            <div className="lg:col-span-7 p-7 rounded-3xl bg-[#0A0E17] border border-white/10 flex flex-col justify-between space-y-5 hover:border-indigo-500/40 transition-all relative overflow-hidden group shadow-xl">
              <div className="absolute top-3 right-3 text-xs font-mono text-white/20 select-none">+</div>
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#111722] border border-white/10 flex items-center justify-center text-indigo-400">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-mono font-bold text-white">04 // Fitness Topography</h3>
                    <span className="text-xs text-slate-400 font-mono">Simulated Annealing &amp; Genetic TSP</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono uppercase px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  Convergence
                </span>
              </div>

              <p className="text-xs font-mono text-slate-300 leading-relaxed">
                Explore fitness landscapes, thermal annealing schedules, and genetic crossover operators solving NP-hard combinatorial optimization challenges.
              </p>

              <div className="p-3.5 rounded-2xl bg-[#111722] border border-white/10 font-mono text-xs flex items-center justify-between">
                <span className="text-slate-400">Heuristic Engine:</span>
                <span className="text-indigo-300 font-bold">Boltzmann Probability &amp; Elitism</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
