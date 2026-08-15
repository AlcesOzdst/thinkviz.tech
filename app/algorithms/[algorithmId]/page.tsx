import Link from "next/link";
import { notFound } from "next/navigation";
import { ALGORITHMS } from "@/data/algorithms";

interface PageProps {
  params: Promise<{
    algorithmId: string;
  }>;
}

export default async function AlgorithmDetailPage({ params }: PageProps) {
  const { algorithmId } = await params;
  const algo = ALGORITHMS.find((a) => a.id === algorithmId);

  if (!algo) {
    notFound();
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Top Breadcrumb */}
      <div>
        <Link
          href="/algorithms"
          className="inline-flex items-center gap-1.5 text-xs text-[#A7AFBB] hover:text-[#F1F3F5] transition-colors"
        >
          <span>← Back to Explorer</span>
        </Link>
      </div>

      {/* Algorithm Header */}
      <div className="p-6 rounded-xl bg-[#15181D] border border-[#292E36] space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F1F3F5]">
            {algo.name}
          </h1>
          <p className="text-sm text-[#A7AFBB] mt-2 max-w-3xl leading-relaxed">
            {algo.longDescription}
          </p>
        </div>

        {/* Compact Metadata Row */}
        <div className="flex flex-wrap items-center gap-4 text-xs pt-3 border-t border-[#292E36] text-[#A7AFBB]">
          <div className="flex items-center gap-1.5">
            <span className="text-[#737C89]">Category:</span>
            <span className="font-medium text-[#F1F3F5]">{algo.category}</span>
          </div>

          <span className="text-[#292E36]">•</span>

          <div className="flex items-center gap-1.5">
            <span className="text-[#737C89]">Difficulty:</span>
            <span className="font-medium text-[#F1F3F5]">{algo.difficulty}</span>
          </div>

          <span className="text-[#292E36]">•</span>

          <div className="flex items-center gap-1.5">
            <span className="text-[#737C89]">Time complexity:</span>
            <span className="font-mono text-[#F1F3F5]">{algo.timeComplexity}</span>
          </div>

          <span className="text-[#292E36]">•</span>

          <div className="flex items-center gap-1.5">
            <span className="text-[#737C89]">Space complexity:</span>
            <span className="font-mono text-[#F1F3F5]">{algo.spaceComplexity}</span>
          </div>
        </div>
      </div>

      {/* Visualization Workspace */}
      <div className="rounded-xl border border-[#292E36] bg-[#15181D] overflow-hidden">
        {/* Workspace Toolbar Header */}
        <div className="flex items-center justify-between border-b border-[#292E36] bg-[#1B1F25] px-4 py-3 text-xs text-[#A7AFBB]">
          <span className="text-[#F1F3F5] font-medium">Interactive visualization</span>
          <span className="text-[#737C89]">Visualization preview</span>
        </div>

        {/* Workspace Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-[#292E36] min-h-[420px]">
          {/* Main Visualizer Canvas Area */}
          <div className="lg:col-span-2 p-8 flex flex-col items-center justify-center text-center bg-[#0D0F12]">
            <div className="max-w-md p-6 rounded-xl bg-[#15181D] border border-[#292E36] space-y-3">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-[#263352] text-[#6C8CFF]">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <h3 className="text-base font-semibold text-[#F1F3F5]">
                {algo.shortName} Visualization
              </h3>

              <p className="text-xs text-[#A7AFBB] leading-relaxed">
                Step-by-step interactive canvas for <strong className="text-[#F1F3F5]">{algo.name}</strong> will render here.
              </p>
            </div>
          </div>

          {/* Explanation & Metrics Side Panel */}
          <div className="p-6 bg-[#15181D] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-[#A7AFBB]">
                Explanation & Step Trace
              </h3>

              <div className="p-3 rounded-lg bg-[#1B1F25] border border-[#292E36] text-xs text-[#A7AFBB] space-y-1">
                <div className="text-[#737C89]">Step trace output</div>
                <div>Status: Ready for execution</div>
                <div>Active node: None</div>
              </div>

              <h3 className="text-xs font-semibold text-[#A7AFBB] pt-2">
                Algorithm Metrics
              </h3>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-3 rounded-lg bg-[#1B1F25] border border-[#292E36]">
                  <span className="text-[#737C89] text-[10px] font-sans block">Nodes explored</span>
                  <span className="text-[#F1F3F5] font-semibold">0</span>
                </div>
                <div className="p-3 rounded-lg bg-[#1B1F25] border border-[#292E36]">
                  <span className="text-[#737C89] text-[10px] font-sans block">Path cost</span>
                  <span className="text-[#F1F3F5] font-semibold">0.00</span>
                </div>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="pt-4 border-t border-[#292E36] space-y-2">
              <span className="text-xs text-[#737C89] block">Playback controls</span>
              <div className="flex items-center gap-2 opacity-60">
                <button disabled className="p-2 rounded bg-[#1B1F25] text-[#737C89] text-xs cursor-not-allowed">⏮</button>
                <button disabled className="p-2 rounded bg-[#1B1F25] text-[#737C89] text-xs cursor-not-allowed">◀</button>
                <button disabled className="flex-1 py-2 rounded bg-[#6C8CFF] text-white font-medium text-xs cursor-not-allowed">Play</button>
                <button disabled className="p-2 rounded bg-[#1B1F25] text-[#737C89] text-xs cursor-not-allowed">▶</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
