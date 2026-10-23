import Link from "next/link";
import { ALGORITHMS } from "@/data/algorithms";

export function FeaturedAlgorithms() {
  const featured = ALGORITHMS.filter((a) => a.featured);

  return (
    <section id="featured" className="py-20 bg-[#070A0F] border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4 border-b border-white/10 pb-6">
          <div>
            <h2 className="text-xs font-mono font-bold text-sky-400 mb-2 uppercase tracking-widest">
              04 // BENCHMARKED ALGORITHM KERNELS
            </h2>
            <p className="text-3xl sm:text-4xl font-mono font-bold tracking-tight text-white">
              Featured Algorithms
            </p>
          </div>
          <Link
            href="/algorithms"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-sky-400 hover:text-sky-300 transition-colors uppercase tracking-wider"
          >
            <span>View All Algorithms ({ALGORITHMS.length})</span>
            <span>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((algo) => (
            <div
              key={algo.id}
              className="flex flex-col justify-between rounded-3xl bg-[#0A0E17] border border-white/10 p-7 hover:border-white/20 transition-all group shadow-xl relative overflow-hidden"
            >
              {/* Corner Crosshair */}
              <div className="absolute top-3 right-3 text-xs font-mono text-white/20 select-none">+</div>

              <div>
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2 mb-4 border-b border-white/5 pb-3">
                  <span className="rounded-full bg-[#111722] border border-white/10 px-3 py-1 text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                    {algo.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    {algo.difficulty}
                  </span>
                </div>

                <h3 className="text-lg font-mono font-bold text-white group-hover:text-sky-300 transition-colors mb-2">
                  {algo.name} <span className="text-xs text-slate-400 font-normal">({algo.shortName})</span>
                </h3>

                <p className="text-xs font-mono text-slate-400 leading-relaxed mb-6">
                  {algo.description}
                </p>

                {/* Complexities */}
                <div className="grid grid-cols-2 gap-2.5 mb-6 text-xs font-mono">
                  <div className="p-3 rounded-2xl bg-[#111722] border border-white/10">
                    <span className="text-slate-400 block text-[9px] font-mono font-bold uppercase tracking-widest">TIME</span>
                    <span className="text-white font-bold mt-0.5 block">{algo.timeComplexity}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#111722] border border-white/10">
                    <span className="text-slate-400 block text-[9px] font-mono font-bold uppercase tracking-widest">SPACE</span>
                    <span className="text-white font-bold mt-0.5 block">{algo.spaceComplexity}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Link
                href={`/algorithms/${algo.id}`}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#111722] hover:bg-sky-500 hover:text-white border border-white/10 py-3 text-xs font-mono font-bold text-slate-300 transition-all uppercase tracking-wider shadow-sm active:scale-[0.98]"
              >
                <span>Launch Visualization</span>
                <span>→</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
