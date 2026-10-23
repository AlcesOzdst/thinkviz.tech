import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CallToAction() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="rounded-3xl bg-[#0A0E17] border border-white/10 p-10 sm:p-16 text-center shadow-2xl relative overflow-hidden">
        {/* Corner Crosshairs */}
        <div className="absolute top-4 left-4 text-xs font-mono text-white/20 select-none">+</div>
        <div className="absolute top-4 right-4 text-xs font-mono text-white/20 select-none">+</div>
        <div className="absolute bottom-4 left-4 text-xs font-mono text-white/20 select-none">+</div>
        <div className="absolute bottom-4 right-4 text-xs font-mono text-white/20 select-none">+</div>

        <div className="text-xs font-mono font-bold text-sky-400 mb-3 uppercase tracking-widest">
          05 // SYSTEM INITIATIVE
        </div>
        <h2 className="text-3xl sm:text-5xl font-mono font-bold tracking-tight text-white mb-4">
          Start exploring AI algorithms
        </h2>
        <p className="mx-auto max-w-2xl text-xs sm:text-sm font-mono text-slate-400 mb-8 leading-relaxed">
          Step through search, heuristic optimization, game trees, and machine learning simulators interactively. Build genuine mathematical intuition with deterministic zero-latency visual engines.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/algorithms"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-7 py-3.5 text-xs font-mono font-bold uppercase tracking-wider text-white transition-all hover:from-sky-400 hover:to-blue-500 shadow-xl shadow-sky-950/40 active:scale-[0.98]"
          >
            <span>Explore All Algorithms</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/machine-learning"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#111722] hover:bg-[#1A2230] border border-white/10 px-6 py-3.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-all active:scale-[0.98]"
          >
            <span>Interactive ML Lab</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
