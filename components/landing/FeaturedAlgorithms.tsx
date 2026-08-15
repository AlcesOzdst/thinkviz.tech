import Link from "next/link";
import { ALGORITHMS } from "@/data/algorithms";

export function FeaturedAlgorithms() {
  const featured = ALGORITHMS.filter((a) => a.featured);

  return (
    <section id="featured" className="py-16 bg-[#0D0F12] border-t border-[#292E36]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-xs font-semibold text-[#6C8CFF] mb-2">
              Featured Algorithms
            </h2>
            <p className="text-3xl font-bold tracking-tight text-[#F1F3F5]">
              Core topics
            </p>
          </div>
          <Link
            href="/algorithms"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6C8CFF] hover:text-[#5A7BEF] transition-colors"
          >
            <span>View all algorithms ({ALGORITHMS.length})</span>
            <span>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featured.map((algo) => (
            <div
              key={algo.id}
              className="flex flex-col justify-between rounded-xl bg-[#15181D] border border-[#292E36] p-6 hover:border-[#3B424E] transition-all group"
            >
              <div>
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="rounded bg-[#1B1F25] px-2.5 py-0.5 text-xs text-[#A7AFBB]">
                    {algo.category}
                  </span>
                  <span className="text-xs text-[#737C89]">
                    {algo.difficulty}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-[#F1F3F5] group-hover:text-[#6C8CFF] transition-colors mb-2">
                  {algo.name} <span className="text-xs text-[#737C89]">({algo.shortName})</span>
                </h3>

                <p className="text-xs text-[#A7AFBB] leading-relaxed mb-6">
                  {algo.description}
                </p>

                {/* Complexities */}
                <div className="grid grid-cols-2 gap-2 mb-6 text-xs font-mono">
                  <div className="p-2 rounded bg-[#0D0F12] border border-[#292E36]">
                    <span className="text-[#737C89] block text-[10px] font-sans">TIME</span>
                    <span className="text-[#F1F3F5]">{algo.timeComplexity}</span>
                  </div>
                  <div className="p-2 rounded bg-[#0D0F12] border border-[#292E36]">
                    <span className="text-[#737C89] block text-[10px] font-sans">SPACE</span>
                    <span className="text-[#F1F3F5]">{algo.spaceComplexity}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Link
                href={`/algorithms/${algo.id}`}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#1B1F25] py-2.5 text-xs font-medium text-[#F1F3F5] hover:bg-[#6C8CFF] hover:text-white transition-all"
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
