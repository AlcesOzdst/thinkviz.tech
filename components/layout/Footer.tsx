import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[#292E36] bg-[#0D0F12] text-[#A7AFBB]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="ThinkViz Logo" className="h-8 w-8 object-contain" />
              <span className="text-lg font-semibold tracking-tight text-[#F1F3F5]">
                Think<span className="text-[#6C8CFF]">Viz</span>
              </span>
            </Link>
            <p className="text-sm text-[#737C89] leading-relaxed">
              An interactive educational project designed to help students master AI algorithms through step-by-step visual exploration.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold text-[#F1F3F5] mb-4">
              Algorithms
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/algorithms/bfs" className="hover:text-[#F1F3F5] transition-colors">
                  Breadth-First Search
                </Link>
              </li>
              <li>
                <Link href="/algorithms/dfs" className="hover:text-[#F1F3F5] transition-colors">
                  Depth-First Search
                </Link>
              </li>
              <li>
                <Link href="/algorithms/a-star" className="hover:text-[#F1F3F5] transition-colors">
                  A* Search Algorithm
                </Link>
              </li>
              <li>
                <Link href="/algorithms/hill-climbing" className="hover:text-[#F1F3F5] transition-colors">
                  Hill Climbing
                </Link>
              </li>
              <li>
                <Link href="/algorithms/minimax" className="hover:text-[#F1F3F5] transition-colors">
                  Minimax
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs font-semibold text-[#F1F3F5] mb-4">
              Categories
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/algorithms?category=Uninformed+Search" className="hover:text-[#F1F3F5] transition-colors">
                  Uninformed Search
                </Link>
              </li>
              <li>
                <Link href="/algorithms?category=Informed+Search" className="hover:text-[#F1F3F5] transition-colors">
                  Informed Search
                </Link>
              </li>
              <li>
                <Link href="/algorithms?category=Local+Search" className="hover:text-[#F1F3F5] transition-colors">
                  Local Search
                </Link>
              </li>
              <li>
                <Link href="/algorithms?category=Adversarial+Search" className="hover:text-[#F1F3F5] transition-colors">
                  Adversarial Search
                </Link>
              </li>
            </ul>
          </div>

          {/* Educational Purpose Notice */}
          <div>
            <h3 className="text-xs font-semibold text-[#F1F3F5] mb-4">
              Created By
            </h3>
            <ul className="space-y-3 text-xs text-[#737C89]">
              <li className="flex flex-col">
                <span className="font-medium text-[#A7AFBB]">Parth Doshi</span>
                <span>1262252384@mitwp.edu.in</span>
              </li>
              <li className="flex flex-col">
                <span className="font-medium text-[#A7AFBB]">Arya Inamdar</span>
                <span>1262243732@mitwpu.edu.in</span>
              </li>
              <li className="flex flex-col">
                <span className="font-medium text-[#A7AFBB]">Param Gadiya</span>
                <span>1262243350@mitwpu.edu.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-[#1B1F25] pt-8 text-xs text-[#737C89]">
          <p>© {new Date().getFullYear()} ThinkViz (thinkviz.tech). Built for AI Education.</p>
          <p className="mt-2 sm:mt-0">Visualize. Understand. Think like AI.</p>
        </div>
      </div>
    </footer>
  );
}
