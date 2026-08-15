import Link from "next/link";

export function CallToAction() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="rounded-2xl bg-[#15181D] border border-[#292E36] p-8 sm:p-12 text-center">
        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#F1F3F5] mb-4">
          Start exploring AI algorithms
        </h2>
        <p className="mx-auto max-w-xl text-sm text-[#A7AFBB] mb-8 leading-relaxed">
          Step through search and optimization algorithms interactively. Build intuitive understanding for coursework and exams.
        </p>

        <div className="flex justify-center">
          <Link
            href="/algorithms"
            className="inline-flex items-center gap-2 rounded-lg bg-[#6C8CFF] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#5A7BEF]"
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
