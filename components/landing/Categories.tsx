import Link from "next/link";
import { CATEGORIES } from "@/data/algorithms";

export function Categories() {
  return (
    <section id="categories" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-xs font-semibold text-[#6C8CFF] mb-2 uppercase tracking-wider">
          Algorithm Domains
        </h2>
        <p className="text-3xl font-bold tracking-tight text-[#F8FAFC]">
          Explore by category
        </p>
        <p className="mt-3 text-sm text-[#94A3B8] leading-relaxed">
          Structured modules covering classical search, heuristic pathfinding, and game trees.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.name}
            href={`/algorithms?category=${encodeURIComponent(cat.name)}`}
            className="p-6 rounded-xl bg-[#12161D] border border-[#232B36] hover:border-[#6C8CFF]/50 transition-all flex flex-col justify-between group shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center rounded-md bg-[#1C2536] border border-[#6C8CFF]/30 px-2.5 py-1 text-xs font-medium text-[#6C8CFF]">
                  {cat.algorithmCount} {cat.algorithmCount === 1 ? "Algorithm" : "Algorithms"}
                </span>
                <span className="text-[#828E9E] group-hover:text-[#6C8CFF] transition-colors text-sm">
                  →
                </span>
              </div>
              <h3 className="text-lg font-semibold text-[#F8FAFC] group-hover:text-[#6C8CFF] transition-colors mb-2">
                {cat.name}
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                {cat.description}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#232B36] flex items-center justify-between text-xs text-[#828E9E]">
              <span>Browse module</span>
            </div>
          </Link>
        ))}

        {/* 6th Card: Unified Explorer to complete 2x3 grid */}
        <Link
          href="/algorithms"
          className="p-6 rounded-xl bg-gradient-to-br from-[#12161D] to-[#18202C] border border-sky-500/30 hover:border-sky-500/60 transition-all flex flex-col justify-between group shadow-lg shadow-sky-950/20"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center rounded-md bg-sky-500/15 border border-sky-500/30 px-2.5 py-1 text-xs font-medium text-sky-400">
                11 Solvers
              </span>
              <span className="text-sky-400 group-hover:translate-x-1 transition-transform text-sm">
                →
              </span>
            </div>
            <h3 className="text-lg font-semibold text-[#F8FAFC] group-hover:text-sky-400 transition-colors mb-2">
              Complete Knowledge Base
            </h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Explore the entire suite of search, game trees, rule inference, and optimization algorithms in one unified catalog.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-[#232B36] flex items-center justify-between text-xs text-sky-400 font-medium">
            <span>Explore All Algorithms</span>
          </div>
        </Link>
      </div>
    </section>
  );
}
