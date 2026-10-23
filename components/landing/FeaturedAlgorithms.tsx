import Link from "next/link";
import { ALGORITHMS } from "@/data/algorithms";

export function FeaturedAlgorithms() {
  const featured = ALGORITHMS.filter((a) => a.featured);

  return (
    <section id="featured" className="py-16 bg-[#090B0E] border-t border-[#232B36]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-xs font-semibold text-[#6C8CFF] mb-2 uppercase tracking-wider">
              Featured Algorithms
            </h2>
            <p className="text-3xl font-bold tracking-tight text-[#F8FAFC]">
              Core topics
            </p>
          </div>
          <Link
            href="/algorithms"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6C8CFF] hover:text-[#85A0FF] transition-colors"
          >
            <span>View all algorithms ({ALGORITHMS.length})</span>
            <span>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featured.map((algo) => (
            <div
              key={algo.id}
              className="flex flex-col justify-between rounded-xl bg-[#12161D] border border-[#232B36] p-6 hover:border-[#333E50] transition-all group shadow-sm"
            >
              <div>
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="rounded bg-[#1A202A] px-2.5 py-0.5 text-xs text-[#94A3B8]">
                    {algo.category}
                  </span>
                  <span className="text-xs text-[#828E9E]">
                    {algo.difficulty}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-[#F8FAFC] group-hover:text-[#6C8CFF] transition-colors mb-2">
                  {algo.name} <span className="text-xs text-[#828E9E]">({algo.shortName})</span>
                </h3>

                <p className="text-xs text-[#94A3B8] leading-relaxed mb-6">
                  {algo.description}
                </p>

                {/* Complexities */}
                <div className="grid grid-cols-2 gap-2 mb-6 text-xs font-mono">
                  <div className="p-2 rounded bg-[#090B0E] border border-[#232B36]">
                    <span className="text-[#828E9E] block text-[10px] font-sans">TIME</span>
                    <span className="text-[#F8FAFC]">{algo.timeComplexity}</span>
                  </div>
                  <div className="p-2 rounded bg-[#090B0E] border border-[#232B36]">
                    <span className="text-[#828E9E] block text-[10px] font-sans">SPACE</span>
                    <span className="text-[#F8FAFC]">{algo.spaceComplexity}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Link
                href={`/algorithms/${algo.id}`}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#1A202A] py-2.5 text-xs font-medium text-[#F8FAFC] hover:bg-[#6C8CFF] hover:text-white transition-all shadow-sm"
              >
                <span>Launch visualization</span>
                <span>→</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
