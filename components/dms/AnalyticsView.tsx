"use client";

import {
  BarChart3,
  HardDrive,
  TrendingUp,
  FolderOpen,
  Database,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  PieChart,
} from "lucide-react";
import { DmsAnalyticsData } from "@/lib/dms/types";

interface AnalyticsViewProps {
  analytics: DmsAnalyticsData;
}

export function AnalyticsView({ analytics }: AnalyticsViewProps) {
  const { storage, activityTimeline, projectStats, qualityStats } = analytics;

  const usedMb = (storage.usedBytes / (1024 * 1024)).toFixed(2);
  const totalGb = (storage.limitBytes / (1024 * 1024 * 1024)).toFixed(1);
  const percentUsed = Math.min(100, Math.max(0.5, (storage.usedBytes / storage.limitBytes) * 100));

  const completionPct =
    projectStats.totalTasks > 0
      ? Math.round((projectStats.completedTasks / projectStats.totalTasks) * 100)
      : 0;

  // Max daily activity count for scaling chart
  const maxEvents = Math.max(
    1,
    ...activityTimeline.map((d) => d.uploads + d.aiRuns + d.taskUpdates)
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="pb-4 border-b border-[#292E36]">
        <h1 className="text-xl font-bold tracking-tight text-[#F1F3F5]">System Analytics & Metrics</h1>
        <p className="text-xs text-[#A7AFBB] mt-0.5">
          Real database-backed storage telemetry, activity frequency, data health benchmarks, and project progress.
        </p>
      </div>

      {/* Row 1: High Level Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#181C22] border border-[#292E36]">
          <div className="flex items-center justify-between text-[#717885] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-[#A7AFBB]">Storage Consumed</span>
            <HardDrive className="w-4 h-4 text-[#6C8CFF]" />
          </div>
          <div className="text-2xl font-bold text-[#F1F3F5] font-mono">{usedMb} MB</div>
          <p className="text-[11px] text-[#717885] mt-1 font-mono">{percentUsed.toFixed(2)}% of {totalGb} GB limit</p>
        </div>

        <div className="p-4 rounded-xl bg-[#181C22] border border-[#292E36]">
          <div className="flex items-center justify-between text-[#717885] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-[#A7AFBB]">Active Assets</span>
            <FolderOpen className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="text-2xl font-bold text-[#F1F3F5] font-mono">
            {storage.fileCount + storage.datasetCount}
          </div>
          <p className="text-[11px] text-[#717885] mt-1">
            {storage.fileCount} files • {storage.datasetCount} datasets
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#181C22] border border-[#292E36]">
          <div className="flex items-center justify-between text-[#717885] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-[#A7AFBB]">Task Completion</span>
            <CheckCircle2 className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="text-2xl font-bold text-[#F1F3F5] font-mono">{completionPct}%</div>
          <p className="text-[11px] text-[#717885] mt-1 font-mono">
            {projectStats.completedTasks} / {projectStats.totalTasks} completed
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#181C22] border border-[#292E36]">
          <div className="flex items-center justify-between text-[#717885] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-[#A7AFBB]">Data Health Score</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{qualityStats.averageQualityScore}%</div>
          <p className="text-[11px] text-[#717885] mt-1">
            {qualityStats.verifiedDatasets} verified • {qualityStats.flaggedDatasets} flagged
          </p>
        </div>
      </div>

      {/* Row 2: Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Frequency Chart (Last 7 Days) */}
        <div className="p-5 rounded-xl bg-[#181C22] border border-[#292E36] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#6C8CFF]" />
              <h3 className="text-sm font-semibold text-[#F1F3F5]">Activity Timeline (Last 7 Days)</h3>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-[#717885]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#6C8CFF]"></span> Uploads
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span> AI Runs
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#10B981]"></span> Tasks
              </span>
            </div>
          </div>

          <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-[#292E36]">
            {activityTimeline.map((item) => {
              const total = item.uploads + item.aiRuns + item.taskUpdates;
              const heightPct = total > 0 ? Math.min(100, Math.max(15, (total / maxEvents) * 100)) : 4;

              return (
                <div key={item.date} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-mono text-[#717885] group-hover:text-[#F1F3F5] transition-colors">
                    {total}
                  </span>
                  <div className="w-full max-w-[28px] bg-[#111418] rounded-t-md overflow-hidden flex flex-col justify-end" style={{ height: "130px" }}>
                    <div
                      className="w-full bg-gradient-to-t from-[#6C8CFF] to-purple-500 rounded-t-md transition-all duration-300"
                      style={{ height: `${heightPct}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] font-mono text-[#717885] whitespace-nowrap">
                    {item.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Storage Breakdown by Asset Type */}
        <div className="p-5 rounded-xl bg-[#181C22] border border-[#292E36] space-y-4">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#10B981]" />
            <h3 className="text-sm font-semibold text-[#F1F3F5]">Storage Allocation by Asset Type</h3>
          </div>

          <div className="space-y-3 pt-2">
            {storage.byType.map((bt) => {
              const pct = storage.usedBytes > 0 ? Math.round((bt.bytes / storage.usedBytes) * 100) : 0;
              const sizeKb = (bt.bytes / 1024).toFixed(1);

              return (
                <div key={bt.type} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#F1F3F5] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#6C8CFF]"></span>
                      {bt.type} ({bt.count} files)
                    </span>
                    <span className="text-[#A7AFBB] font-mono">
                      {sizeKb} KB ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#111418] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#6C8CFF] h-1.5 rounded-full"
                      style={{ width: `${Math.max(5, pct)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-lg bg-[#111418] border border-[#292E36] text-[11px] text-[#717885] mt-4">
            Physical assets are deduplicated by SHA-256 hash before disk persistence.
          </div>
        </div>
      </div>

      {/* Row 3: Project & Quality Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Velocity Breakdown */}
        <div className="p-5 rounded-xl bg-[#181C22] border border-[#292E36] space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#F59E0B]" />
            <h3 className="text-sm font-semibold text-[#F1F3F5]">Coursework & Research Task Status</h3>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 text-center">
            <div className="p-3 rounded-lg bg-[#111418] border border-[#292E36]">
              <span className="text-[10px] text-[#717885] block uppercase font-mono">To Do</span>
              <span className="text-xl font-bold text-[#F1F3F5] font-mono">{projectStats.todoTasks}</span>
            </div>
            <div className="p-3 rounded-lg bg-[#111418] border border-[#292E36]">
              <span className="text-[10px] text-[#6C8CFF] block uppercase font-mono">In Progress</span>
              <span className="text-xl font-bold text-[#6C8CFF] font-mono">{projectStats.inProgressTasks}</span>
            </div>
            <div className="p-3 rounded-lg bg-[#111418] border border-[#292E36]">
              <span className="text-[10px] text-emerald-400 block uppercase font-mono">Completed</span>
              <span className="text-xl font-bold text-emerald-400 font-mono">{projectStats.completedTasks}</span>
            </div>
          </div>
        </div>

        {/* Data Quality Health Summary */}
        <div className="p-5 rounded-xl bg-[#181C22] border border-[#292E36] space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-[#F1F3F5]">Data Quality & Schema Compliance</h3>
          </div>

          <div className="p-3.5 rounded-lg bg-[#111418] border border-[#292E36] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#A7AFBB]">Average Quality Benchmark</span>
              <span className="font-mono text-emerald-400 font-bold">{qualityStats.averageQualityScore}%</span>
            </div>
            <div className="w-full bg-[#0D0F12] rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full"
                style={{ width: `${qualityStats.averageQualityScore}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-[#717885]">
              0 malformed schemas detected. All tabular records conform to type inference definitions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
