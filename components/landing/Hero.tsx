import Link from "next/link";

export function Hero() {
  return (
    <section className="relative pt-16 pb-14 md:pt-24 md:pb-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Project Tagline Badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-[#263352] px-3.5 py-1 text-xs font-medium text-[#6C8CFF] mb-6">
          Interactive AI Algorithm Visualizer
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#F1F3F5] mb-6 leading-[1.15]">
          Visualize. Understand. <br className="hidden sm:inline" />
          <span className="text-[#6C8CFF]">Think like AI.</span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto max-w-2xl text-base sm:text-lg text-[#A7AFBB] font-normal leading-relaxed mb-8">
          Explore AI search algorithms, game decision trees, and optimization methods step-by-step with real-time state metrics and pseudocode tracking.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14">
          <Link
            href="/algorithms"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#6C8CFF] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#5A7BEF]"
          >
            <span>Explore Algorithms</span>
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </Link>

          <a
            href="#how-it-works"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-[#292E36] bg-[#15181D] px-6 py-3 text-sm font-medium text-[#F1F3F5] transition-colors hover:bg-[#1B1F25]"
          >
            <span>See How It Works</span>
            <svg
              className="h-4 w-4 text-[#737C89]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </a>
        </div>

        {/* Highlight Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 border-t border-[#292E36] text-left">
          <div className="p-3.5 rounded-lg bg-[#15181D] border border-[#292E36]">
            <div className="text-xs text-[#737C89]">Step-by-step</div>
            <div className="text-sm font-medium text-[#F1F3F5] mt-0.5">Playback Controls</div>
          </div>
          <div className="p-3.5 rounded-lg bg-[#15181D] border border-[#292E36]">
            <div className="text-xs text-[#737C89]">Real-time</div>
            <div className="text-sm font-medium text-[#F1F3F5] mt-0.5">Algorithm Metrics</div>
          </div>
          <div className="p-3.5 rounded-lg bg-[#15181D] border border-[#292E36]">
            <div className="text-xs text-[#737C89]">Explanation</div>
            <div className="text-sm font-medium text-[#F1F3F5] mt-0.5">Pseudocode Highlights</div>
          </div>
          <div className="p-3.5 rounded-lg bg-[#15181D] border border-[#292E36]">
            <div className="text-xs text-[#737C89]">Educational</div>
            <div className="text-sm font-medium text-[#F1F3F5] mt-0.5">Zero External Friction</div>
          </div>
        </div>
      </div>
    </section>
  );
}
