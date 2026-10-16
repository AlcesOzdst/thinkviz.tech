import Link from "next/link";
import { getDmsOverviewAction } from "@/app/actions/dms";
import { DmsHeader } from "@/components/dms/DmsHeader";
import {
  FolderOpen,
  Database,
  CheckSquare,
  Sparkles,
  HardDrive,
  ShieldCheck,
  ArrowRight,
  UploadCloud,
  Activity,
  Layers,
  ChevronRight,
  Compass,
} from "lucide-react";

export default async function DataCenterOverviewPage() {
  const { user, stats, recentActivities, recentFiles } = await getDmsOverviewAction();

  const usedMb = (stats.storageUsedBytes / (1024 * 1024)).toFixed(1);
  const totalGb = (stats.storageLimitBytes / (1024 * 1024 * 1024)).toFixed(1);
  const percentUsed = Math.min(100, Math.max(1, (stats.storageUsedBytes / stats.storageLimitBytes) * 100));

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Release Transition Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#15181D] via-[#1B2234] to-[#15181D] border border-[#292E36] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#6C8CFF]/15 border border-[#6C8CFF]/30 flex items-center justify-center text-[#6C8CFF] shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#6C8CFF]/20 text-[#6C8CFF] border border-[#6C8CFF]/30">
                Release 2.0
              </span>
              <span className="text-xs font-semibold text-[#F1F3F5]">Enterprise Data Center</span>
            </div>
            <p className="text-xs text-[#A7AFBB] mt-0.5">
              Unified governance, structured benchmark datasets, Kanban coursework boards, and AI synthesis.
            </p>
          </div>
        </div>

        <Link
          href="/algorithms"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#111418] hover:bg-[#1F242D] border border-[#292E36] text-xs text-[#A7AFBB] hover:text-white transition-colors shrink-0 self-start md:self-auto"
        >
          <Compass className="w-3.5 h-3.5 text-[#6C8CFF]" />
          <span>Switch to Release 1.0 (Core Visualizers)</span>
          <ArrowRight className="w-3 h-3 text-[#717885]" />
        </Link>
      </div>

      <DmsHeader
        title="Data Center Overview"
        description="Curate curriculum documents, analyze benchmark datasets, and coordinate learning tasks with role-based access control."
        actions={
          <div className="flex items-center gap-2.5">
            <Link
              href="/data-center/files"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#6C8CFF] text-white text-xs font-medium hover:bg-[#5A7BEF] transition-all shadow-md shadow-[#6C8CFF]/10"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Upload Document
            </Link>
            <Link
              href="/data-center/datasets"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#181C22] border border-[#292E36] text-[#F1F3F5] text-xs font-medium hover:bg-[#20252E] hover:border-[#6C8CFF]/40 transition-all"
            >
              <Database className="w-3.5 h-3.5 text-[#10B981]" />
              Import Dataset
            </Link>
            <Link
              href="/data-center/projects"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#181C22] border border-[#292E36] text-[#F1F3F5] text-xs font-medium hover:bg-[#20252E] hover:border-[#6C8CFF]/40 transition-all"
            >
              <CheckSquare className="w-3.5 h-3.5 text-[#F59E0B]" />
              New Project
            </Link>
          </div>
        }
      />

      {/* 4 Core Pillars */}
      <div>
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-semibold text-[#A7AFBB] uppercase tracking-wider text-[11px]">Core Workspaces</span>
          <span className="text-[#717885]">Everything sorted and structured for effortless control</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pillar 1: Files */}
          <Link
            href="/data-center/files"
            className="group p-5 rounded-2xl bg-[#15181D] border border-[#292E36] hover:border-[#6C8CFF]/60 transition-all hover:bg-[#181C22] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-[#6C8CFF]/10 text-[#6C8CFF] flex items-center justify-center">
                  <FolderOpen className="w-4 h-4" />
                </div>
                <span className="text-xl font-bold font-mono text-[#F1F3F5]">{stats.totalFiles}</span>
              </div>
              <h3 className="text-sm font-semibold text-[#F1F3F5] group-hover:text-[#6C8CFF] transition-colors">
                Educational Files
              </h3>
              <p className="text-xs text-[#717885] mt-1 leading-relaxed">
                Lecture notes, curriculum syllabi, and algorithm proofs with version control.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#292E36]/60 flex items-center justify-between text-xs text-[#6C8CFF]">
              <span>Manage documents</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Pillar 2: Datasets */}
          <Link
            href="/data-center/datasets"
            className="group p-5 rounded-2xl bg-[#15181D] border border-[#292E36] hover:border-[#10B981]/60 transition-all hover:bg-[#181C22] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
                <span className="text-xl font-bold font-mono text-[#F1F3F5]">{stats.totalDatasets}</span>
              </div>
              <h3 className="text-sm font-semibold text-[#F1F3F5] group-hover:text-[#10B981] transition-colors">
                Benchmark Datasets
              </h3>
              <p className="text-xs text-[#717885] mt-1 leading-relaxed">
                Structured CSV/JSON datasets with automated schema detection and quality scoring.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#292E36]/60 flex items-center justify-between text-xs text-[#10B981]">
              <span>Query datasets</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Pillar 3: Projects & Kanban */}
          <Link
            href="/data-center/projects"
            className="group p-5 rounded-2xl bg-[#15181D] border border-[#292E36] hover:border-[#F59E0B]/60 transition-all hover:bg-[#181C22] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <span className="text-xl font-bold font-mono text-[#F1F3F5]">{stats.totalProjects}</span>
              </div>
              <h3 className="text-sm font-semibold text-[#F1F3F5] group-hover:text-[#F59E0B] transition-colors">
                Projects & Tasks
              </h3>
              <p className="text-xs text-[#717885] mt-1 leading-relaxed">
                Kanban workflow boards for assignments, milestones, and student problem sets.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#292E36]/60 flex items-center justify-between text-xs text-[#F59E0B]">
              <span>{stats.activeTasks} active tasks</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Pillar 4: AI Workspace */}
          <Link
            href="/data-center/ai-workspace"
            className="group p-5 rounded-2xl bg-[#15181D] border border-[#292E36] hover:border-[#8B5CF6]/60 transition-all hover:bg-[#181C22] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-xl font-bold font-mono text-[#F1F3F5]">{stats.totalAiArtifacts}</span>
              </div>
              <h3 className="text-sm font-semibold text-[#F1F3F5] group-hover:text-[#8B5CF6] transition-colors">
                AI Synthesis Workspace
              </h3>
              <p className="text-xs text-[#717885] mt-1 leading-relaxed">
                Context-aware semantic Q&A and RAG summaries with strict provenance citations.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#292E36]/60 flex items-center justify-between text-xs text-[#8B5CF6]">
              <span>Launch workspace</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Two-Column Working Space */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Recent Files */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl bg-[#15181D] border border-[#292E36]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#292E36]">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-[#6C8CFF]" />
                <h3 className="text-sm font-semibold text-[#F1F3F5]">Recent Educational Documents</h3>
              </div>
              <Link
                href="/data-center/files"
                className="text-xs text-[#6C8CFF] hover:underline flex items-center gap-1 font-medium"
              >
                Browse all files <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentFiles.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#717885]">
                No files uploaded yet. Click "Upload Document" to add coursework materials.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#292E36]/80 text-[#717885] uppercase tracking-wider text-[10px]">
                      <th className="pb-2 font-medium">Document</th>
                      <th className="pb-2 font-medium">Type</th>
                      <th className="pb-2 font-medium">Size</th>
                      <th className="pb-2 font-medium">Version</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#292E36]/40">
                    {recentFiles.map((file) => (
                      <tr key={file.id} className="hover:bg-[#1B1F26] transition-colors">
                        <td className="py-2.5 font-medium text-[#F1F3F5] max-w-[220px] truncate">
                          <Link href="/data-center/files" className="hover:text-[#6C8CFF] truncate block">
                            {file.name}
                          </Link>
                        </td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#111418] border border-[#292E36] text-[#A7AFBB]">
                            {file.fileType}
                          </span>
                        </td>
                        <td className="py-2.5 text-[#717885] font-mono">
                          {(file.sizeBytes / 1024).toFixed(0)} KB
                        </td>
                        <td className="py-2.5 text-[#717885] font-mono">v{file.version}</td>
                        <td className="py-2.5">
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            {file.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right (1 col): System Health & Live Audit */}
        <div className="space-y-6">
          {/* Storage & Health Snapshot */}
          <div className="p-5 rounded-2xl bg-[#15181D] border border-[#292E36] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#292E36]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-[#F1F3F5]">System Health</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                Operational
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex items-center justify-between text-[#A7AFBB] mb-1">
                  <span>Storage Quota</span>
                  <span className="font-mono text-[#F1F3F5]">{usedMb} MB / {totalGb} GB</span>
                </div>
                <div className="w-full bg-[#111418] rounded-full h-1.5 overflow-hidden border border-[#292E36]">
                  <div
                    className="bg-[#6C8CFF] h-1.5 rounded-full"
                    style={{ width: `${percentUsed}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#292E36]/40 text-[#A7AFBB]">
                <span>Data Quality Validation</span>
                <span className="font-mono font-medium text-emerald-400">{stats.averageQualityScore}% Verified</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#292E36]/40 text-[#A7AFBB]">
                <span>Active Persona</span>
                <span className="font-mono text-[#6C8CFF]">{user?.role || "GUEST"}</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="p-5 rounded-2xl bg-[#15181D] border border-[#292E36]">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#292E36]">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#F59E0B]" />
                <h3 className="text-sm font-semibold text-[#F1F3F5]">Recent Activity</h3>
              </div>
              <Link
                href="/data-center/activity"
                className="text-xs text-[#6C8CFF] hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {recentActivities.slice(0, 5).map((act) => (
                <div key={act.id} className="flex items-start gap-2.5 text-xs">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#6C8CFF] shrink-0"></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[#F1F3F5] truncate text-[11px]">
                      <span className="font-medium">{act.userName}</span>{" "}
                      <span className="text-[#717885]">{act.action.toLowerCase().replace(/_/g, " ")}:</span>{" "}
                      <span className="text-[#6C8CFF]">{act.resourceName}</span>
                    </p>
                    <span className="text-[10px] text-[#717885] font-mono">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
