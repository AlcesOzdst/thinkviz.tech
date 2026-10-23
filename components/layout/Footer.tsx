"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

  // On interactive algorithm visualizer workbenches, hide marketing footer to give full viewport to the canvas
  if (pathname && /^\/algorithms\/[^\/]+$/.test(pathname)) {
    return null;
  }

  return (
    <footer className="border-t border-white/10 bg-[#070A0F] text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/logo.jpg" alt="ThinkViz Logo" className="h-8 w-8 object-contain rounded-lg border border-white/10" />
              <span className="text-lg font-bold tracking-tight text-white font-mono">
                Think<span className="text-sky-400">Viz</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              An interactive educational project designed to help students master AI algorithms through step-by-step visual exploration.
            </p>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#111722] border border-white/10 text-[11px] font-mono text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              PLATFORM // STABLE v2.4
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase mb-4">
              01 // Algorithms
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/algorithms/bfs" className="hover:text-white transition-colors">
                  Breadth-First Search
                </Link>
              </li>
              <li>
                <Link href="/algorithms/dfs" className="hover:text-white transition-colors">
                  Depth-First Search
                </Link>
              </li>
              <li>
                <Link href="/algorithms/a-star" className="hover:text-white transition-colors">
                  A* Search Algorithm
                </Link>
              </li>
              <li>
                <Link href="/algorithms/hill-climbing" className="hover:text-white transition-colors">
                  Hill Climbing
                </Link>
              </li>
              <li>
                <Link href="/algorithms/minimax" className="hover:text-white transition-colors">
                  Minimax
                </Link>
              </li>
            </ul>
          </div>

          {/* Machine Learning */}
          <div>
            <h3 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase mb-4">
              02 // Machine Learning
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/machine-learning" className="hover:text-white transition-colors flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                  ML Overview
                </Link>
              </li>
              <li>
                <Link href="/machine-learning/k-means" className="hover:text-white transition-colors">
                  K-Means Visualizer
                </Link>
              </li>
              <li>
                <Link href="/machine-learning/regression" className="hover:text-white transition-colors">
                  Regression Playground
                </Link>
              </li>
              <li>
                <Link href="/machine-learning/confusion-matrix" className="hover:text-white transition-colors">
                  Confusion Matrix
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase mb-4">
              03 // Categories
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/algorithms?category=Uninformed+Search" className="hover:text-white transition-colors">
                  Uninformed Search
                </Link>
              </li>
              <li>
                <Link href="/algorithms?category=Informed+Search" className="hover:text-white transition-colors">
                  Informed Search
                </Link>
              </li>
              <li>
                <Link href="/algorithms?category=Local+Search" className="hover:text-white transition-colors">
                  Local Search
                </Link>
              </li>
              <li>
                <Link href="/algorithms?category=Adversarial+Search" className="hover:text-white transition-colors">
                  Adversarial Search
                </Link>
              </li>
            </ul>
          </div>

          {/* Educational Purpose Notice */}
          <div>
            <h3 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase mb-4">
              04 // Creators
            </h3>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex flex-col space-y-1">
                <span className="font-semibold text-slate-200">Parth Doshi</span>
                <div className="flex flex-wrap items-center gap-2">
                  <a href="mailto:1262252384@mitwp.edu.in" className="hover:text-sky-400 transition-colors">Email</a>
                  <span>&bull;</span>
                  <a href="https://github.com/AlcesOzdst" target="_blank" rel="noopener noreferrer" className="hover:text-sky-400 transition-colors">GitHub</a>
                  <span>&bull;</span>
                  <a href="https://parthdoshi.me" target="_blank" rel="noopener noreferrer" className="hover:text-sky-400 transition-colors">Website</a>
                </div>
              </li>
              <li className="flex flex-col space-y-1">
                <span className="font-semibold text-slate-200">Shaunak Apte</span>
              </li>
              <li className="flex flex-col space-y-1">
                <span className="font-semibold text-slate-200">Arya Inamdar</span>
                <div className="flex flex-wrap items-center gap-2">
                  <a href="mailto:1262243732@mitwpu.edu.in" className="hover:text-sky-400 transition-colors">Email</a>
                  <span>&bull;</span>
                  <a href="https://github.com/AIelecwala" target="_blank" rel="noopener noreferrer" className="hover:text-sky-400 transition-colors">GitHub</a>
                </div>
              </li>
              <li className="flex flex-col space-y-1">
                <span className="font-semibold text-slate-200">Param Gadiya</span>
                <div className="flex flex-wrap items-center gap-2">
                  <a href="mailto:1262243350@mitwpu.edu.in" className="hover:text-sky-400 transition-colors">Email</a>
                  <span>&bull;</span>
                  <a href="https://github.com/paramgadiya" target="_blank" rel="noopener noreferrer" className="hover:text-sky-400 transition-colors">GitHub</a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Telemetry Ribbon */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-400 gap-3">
          <div>
            © {new Date().getFullYear()} ThinkViz (thinkviz.tech). Architectural AI Visualizer Platform.
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SYSTEM TELEMETRY NOMINAL
            </span>
            <span>•</span>
            <span className="text-slate-400">BUILD 2026.10</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
