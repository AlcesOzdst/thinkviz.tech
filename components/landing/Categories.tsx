import Link from "next/link";
import { CATEGORIES } from "@/data/algorithms";

export function Categories() {
  return (
    <section id="categories" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 border-b border-white/10 pb-6">
        <div>
          <div className="text-xs font-mono font-bold text-sky-400 uppercase tracking-widest mb-2">
            03 // ALGORITHM DOMAINS
          </div>
          <h2 className="text-3xl sm:text-4xl font-mono font-bold tracking-tight text-white">
            Explore by category
          </h2>
        </div>
        <p className="text-xs font-mono text-slate-400 max-w-md leading-relaxed">
          Structured computational modules covering classical search, heuristic pathfinding, game trees, and machine learning.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORIES.map((cat, idx) => (
          <Link
            key={cat.name}
            href={`/algorithms?category=${encodeURIComponent(cat.name)}`}
            className="p-7 rounded-3xl bg-[#0A0E17] border border-white/10 hover:border-sky-500/40 transition-all flex flex-col justify-between group shadow-xl relative overflow-hidden"
          >
            {/* Corner Crosshair */}
            <div className="absolute top-3 right-3 text-xs font-mono text-white/20 select-none">+</div>

            <div>
              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                <span className="text-xs font-mono font-bold text-sky-400">
                  {`0${idx + 1}`} // MODULE
                </span>
                <span className="inline-flex items-center rounded-full bg-[#111722] border border-white/10 px-3 py-0.5 text-[10px] font-mono font-bold text-slate-300">
                  {cat.algorithmCount} {cat.algorithmCount === 1 ? "SOLVER" : "SOLVERS"}
                </span>
              </div>
              <h3 className="text-lg font-mono font-bold text-white group-hover:text-sky-300 transition-colors mb-2">
                {cat.name}
              </h3>
              <p className="text-xs font-mono text-slate-400 leading-relaxed">
                {cat.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-slate-400 group-hover:text-sky-400 transition-colors">
              <span>EXPLORE MODULE</span>
              <span className="text-sm transition-transform group-hover:translate-x-1">→</span>
            </div>
          </Link>
        ))}

        {/* 6th Card: Machine Learning Interactive Suite */}
        <Link
          href="/machine-learning"
          className="p-7 rounded-3xl bg-[#0A0E17] border border-sky-500/30 hover:border-sky-500/60 transition-all flex flex-col justify-between group shadow-xl relative overflow-hidden"
        >
          {/* Corner Crosshair */}
          <div className="absolute top-3 right-3 text-xs font-mono text-sky-400/40 select-none">+</div>

          <div>
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
              <span className="text-xs font-mono font-bold text-sky-400">
                06 // ML LAB SUITE
              </span>
              <span className="inline-flex items-center rounded-full bg-sky-500/10 border border-sky-500/30 px-3 py-0.5 text-[10px] font-mono font-bold text-sky-300">
                3 INTERACTIVE TOOLS
              </span>
            </div>
            <h3 className="text-lg font-mono font-bold text-white group-hover:text-sky-300 transition-colors mb-2">
              Machine Learning Suite
            </h3>
            <p className="text-xs font-mono text-slate-400 leading-relaxed">
              Explore K-Means clustering, analytical least-squares polynomial regression, and confusion matrix diagnostic simulators.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-sky-400 font-bold">
            <span>LAUNCH ML LAB</span>
            <span className="text-sm transition-transform group-hover:translate-x-1">→</span>
          </div>
        </Link>
      </div>
    </section>
  );
}
