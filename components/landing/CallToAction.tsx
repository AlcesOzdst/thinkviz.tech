import Link from "next/link";

export function CallToAction() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="rounded-2xl bg-[#12161D] border border-[#232B36] p-8 sm:p-12 text-center shadow-sm">
        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#F8FAFC] mb-4">
          Start exploring AI algorithms
        </h2>
        <p className="mx-auto max-w-xl text-sm text-[#94A3B8] mb-8 leading-relaxed">
          Step through search and optimization algorithms interactively. Build intuitive understanding for coursework and exams.
        </p>

        <div className="flex justify-center">
          <Link
            href="/algorithms"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:from-sky-400 hover:to-blue-500 shadow-md shadow-sky-950/40 active:scale-[0.98]"
          >
            <span>Explore All Algorithms</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
