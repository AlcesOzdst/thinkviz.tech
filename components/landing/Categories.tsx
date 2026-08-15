import Link from "next/link";
import { CATEGORIES } from "@/data/algorithms";

export function Categories() {
  return (
    <section id="categories" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-xs font-semibold text-[#6C8CFF] mb-2">
          Algorithm Domains
        </h2>
        <p className="text-3xl font-bold tracking-tight text-[#F1F3F5]">
          Explore by category
        </p>
        <p className="mt-3 text-sm text-[#A7AFBB] leading-relaxed">
          Structured modules covering classical search, heuristic pathfinding, and game trees.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.name}
            href={`/algorithms?category=${encodeURIComponent(cat.name)}`}
            className="p-6 rounded-xl bg-[#15181D] border border-[#292E36] hover:border-[#6C8CFF]/50 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center rounded-md bg-[#263352] px-2.5 py-1 text-xs font-medium text-[#6C8CFF]">
                  {cat.algorithmCount} {cat.algorithmCount === 1 ? "Algorithm" : "Algorithms"}
                </span>
                <span className="text-[#737C89] group-hover:text-[#6C8CFF] transition-colors text-sm">
                  →
                </span>
              </div>
              <h3 className="text-lg font-semibold text-[#F1F3F5] group-hover:text-[#6C8CFF] transition-colors mb-2">
                {cat.name}
              </h3>
              <p className="text-xs text-[#A7AFBB] leading-relaxed">
                {cat.description}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#292E36] flex items-center justify-between text-xs text-[#737C89]">
              <span>Browse module</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
