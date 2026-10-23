import Link from "next/link";
import { notFound } from "next/navigation";
import { ALGORITHMS } from "@/data/algorithms";
import { GridWorkspace } from "@/components/visualization/GridWorkspace";
import { GameTreeWorkspace } from "@/components/visualization/GameTreeWorkspace";
import { OptimizationWorkspace } from "@/components/visualization/OptimizationWorkspace";
import { RuleWorkspace } from "@/components/visualization/RuleWorkspace";
import { loadGrid } from "@/app/actions/grids";

interface PageProps {
  params: Promise<{
    algorithmId: string;
  }>;
  searchParams: Promise<{
    gridId?: string;
  }>;
}

export default async function AlgorithmDetailPage({ params, searchParams }: PageProps) {
  const { algorithmId } = await params;
  const { gridId } = await searchParams;
  const algo = ALGORITHMS.find((a) => a.id === algorithmId);

  if (!algo) {
    notFound();
  }

  let initialGridData = null;
  if (gridId && algo.visualizerType === "grid") {
    const res = await loadGrid(gridId);
    if (res.success && res.grid) {
      initialGridData = res.grid.gridData;
    }
  }

  // Flagship 3-Column Desktop Workbench for Grid Algorithms
  if (algo.visualizerType === "grid") {
    return <GridWorkspace algorithmId={algo.id} initialGridData={initialGridData} />;
  }

  // Workspaces for Game-Tree, Optimization, and Rule-Based Algorithms
  return (
    <div className="w-full min-h-[100dvh] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 bg-[var(--bg-primary)]">
      {/* Top Breadcrumb */}
      <div>
        <Link
          href="/algorithms"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors font-medium"
        >
          <span>← Back to Explorer</span>
        </Link>
      </div>

      {/* Algorithm Header */}
      <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            {algo.name}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-3xl leading-relaxed">
            {algo.longDescription}
          </p>
        </div>

        {/* Compact Metadata Row with Monospace Complexities */}
        <div className="flex flex-wrap items-center gap-4 text-xs pt-3 border-t border-[var(--border-subtle)] text-[var(--text-secondary)]">
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--text-muted)]">Category:</span>
            <span className="font-medium text-[var(--text-primary)]">{algo.category}</span>
          </div>

          <span className="text-[var(--border-default)]">•</span>

          <div className="flex items-center gap-1.5">
            <span className="text-[var(--text-muted)]">Difficulty:</span>
            <span className="font-medium text-[var(--text-primary)]">{algo.difficulty}</span>
          </div>

          <span className="text-[var(--border-default)]">•</span>

          <div className="flex items-center gap-1.5">
            <span className="text-[var(--text-muted)]">Time complexity:</span>
            <span className="font-mono tabular-nums text-[var(--text-primary)]">{algo.timeComplexity}</span>
          </div>

          <span className="text-[var(--border-default)]">•</span>

          <div className="flex items-center gap-1.5">
            <span className="text-[var(--text-muted)]">Space complexity:</span>
            <span className="font-mono tabular-nums text-[var(--text-primary)]">{algo.spaceComplexity}</span>
          </div>
        </div>
      </div>

      {/* Dedicated Workspace Container */}
      <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-3 text-xs text-[var(--text-secondary)]">
          <span className="text-[var(--text-primary)] font-medium">Interactive Visualization</span>
          <span className="text-[var(--text-muted)]">{algo.shortName} Visualizer</span>
        </div>

        <div className="p-4 sm:p-6 bg-[var(--bg-primary)] w-full">
          {algo.visualizerType === "game-tree" ? (
            <GameTreeWorkspace algorithmId={algo.id} />
          ) : algo.visualizerType === "optimization" ? (
            <OptimizationWorkspace algorithmId={algo.id} />
          ) : algo.visualizerType === "rule-based" ? (
            <RuleWorkspace algorithmId={algo.id} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
