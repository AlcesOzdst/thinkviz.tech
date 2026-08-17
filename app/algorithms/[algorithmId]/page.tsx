import Link from "next/link";
import { notFound } from "next/navigation";
import { ALGORITHMS } from "@/data/algorithms";
import { GridWorkspace } from "@/components/visualization/GridWorkspace";
import { GameTreeWorkspace } from "@/components/visualization/GameTreeWorkspace";
import { OptimizationWorkspace } from "@/components/visualization/OptimizationWorkspace";

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
        {/* Workspace Header */}
        <div className="flex items-center justify-between border-b border-[#292E36] bg-[#1B1F25] px-4 py-3 text-xs text-[#A7AFBB]">
          <span className="text-[#F1F3F5] font-medium">Interactive visualization</span>
          <span className="text-[#737C89]">{algo.shortName} Visualizer</span>
        </div>

        {/* Visualizer Container */}
        <div className="p-4 sm:p-6 bg-[#0D0F12] w-full">
          {algo.visualizerType === "grid" ? (
            <GridWorkspace algorithmId={algo.id} />
          ) : algo.visualizerType === "game-tree" ? (
            <GameTreeWorkspace algorithmId={algo.id} />
          ) : algo.visualizerType === "optimization" ? (
            <OptimizationWorkspace algorithmId={algo.id} />
          ) : (
            <div className="max-w-md mx-auto my-12 p-6 rounded-xl bg-[#15181D] border border-[#292E36] text-center space-y-3">
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
                Interactive visualizer for <strong className="text-[#F1F3F5]">{algo.name}</strong> will render here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
