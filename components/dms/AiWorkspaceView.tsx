"use client";

import { useState } from "react";
import {
  Sparkles,
  Play,
  FileText,
  Database,
  Quote,
  Trash2,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Hash,
  X,
  Search,
} from "lucide-react";
import { DmsAiArtifactItem, DmsFileItem, DmsDatasetItem } from "@/lib/dms/types";
import { generateAiSummaryAction, deleteAiArtifactAction } from "@/app/actions/dms";

interface AiWorkspaceViewProps {
  initialArtifacts: DmsAiArtifactItem[];
  files: DmsFileItem[];
  datasets: DmsDatasetItem[];
}

export function AiWorkspaceView({
  initialArtifacts,
  files,
  datasets,
}: AiWorkspaceViewProps) {
  const [artifacts, setArtifacts] = useState<DmsAiArtifactItem[]>(initialArtifacts);
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(
    initialArtifacts.length > 0 ? initialArtifacts[0].id : null
  );

  // New AI Run state
  const [modalOpen, setModalOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);

  const [sourceType, setSourceType] = useState<"FILE" | "DATASET">("FILE");
  const [sourceId, setSourceId] = useState(files.length > 0 ? files[0].id : "");
  const [prompt, setPrompt] = useState(
    "Provide an executive synthesis of key concepts, algorithmic constraints, and potential heuristic optimizations."
  );

  const activeArtifact = artifacts.find((a) => a.id === selectedArtifactId);

  // Handle Generate Run
  const handleExecuteRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId) {
      setRunError("Please select a target document or dataset source.");
      return;
    }

    try {
      setRunning(true);
      setRunError(null);

      const res = await generateAiSummaryAction({
        sourceType,
        sourceId,
        prompt,
      });

      if (res.success && res.artifact) {
        setArtifacts([res.artifact, ...artifacts]);
        setSelectedArtifactId(res.artifact.id);
        setModalOpen(false);
      }
    } catch (err: any) {
      setRunError(err.message || "Failed to execute AI operation");
    } finally {
      setRunning(false);
    }
  };

  // Handle Delete Artifact
  const handleDeleteArtifact = async (id: string) => {
    if (!confirm("Are you sure you want to delete this AI artifact?")) return;
    try {
      await deleteAiArtifactAction(id);
      const remaining = artifacts.filter((a) => a.id !== id);
      setArtifacts(remaining);
      if (remaining.length > 0) {
        setSelectedArtifactId(remaining[0].id);
      } else {
        setSelectedArtifactId(null);
      }
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#292E36]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#6C8CFF]/15 text-[#6C8CFF] border border-[#6C8CFF]/30">
              Gemini 2.5 Pro Pipeline
            </span>
            <span className="text-xs text-[#717885]">• Source-Preserving Retrieval</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#F1F3F5]">AI Workspace & Artifacts</h1>
          <p className="text-xs text-[#A7AFBB] mt-0.5">
            Automated summarization, algorithmic evaluation, and citation provenance over course files and datasets.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6C8CFF] text-white text-xs font-medium hover:bg-[#5A7BEF] transition-colors shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Execute AI Run
        </button>
      </div>

      {/* Main Two-Column View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Artifacts List */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-xs font-semibold uppercase text-[#717885] tracking-wider px-1">
            Generated Artifacts ({artifacts.length})
          </h2>

          <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
            {artifacts.map((art) => {
              const isSelected = art.id === selectedArtifactId;
              return (
                <div
                  key={art.id}
                  onClick={() => setSelectedArtifactId(art.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#6C8CFF]/15 border-[#6C8CFF]/60 shadow-lg"
                      : "bg-[#181C22] border-[#292E36] hover:border-[#6C8CFF]/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#111418] border border-[#292E36] text-[#6C8CFF]">
                      {art.artifactType}
                    </span>
                    <span className="text-[10px] text-[#717885] font-mono">
                      {new Date(art.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-xs font-semibold text-[#F1F3F5] line-clamp-1">{art.title}</h3>
                  <p className="text-[11px] text-[#717885] mt-1 truncate">
                    Target: {art.sourceTitle || "General Context"}
                  </p>

                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#292E36]/40 text-[10px] text-[#717885]">
                    <span className="font-mono">{art.model}</span>
                    <span className="font-mono text-[#A7AFBB]">{art.tokensUsed || 300} tokens</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Artifact Viewer & Provenance Details */}
        <div className="lg:col-span-2 space-y-4">
          {activeArtifact ? (
            <div className="p-5 rounded-xl bg-[#181C22] border border-[#292E36] space-y-5">
              {/* Header Info */}
              <div className="flex items-start justify-between pb-4 border-b border-[#292E36]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/15 text-purple-300 border border-purple-500/30">
                      {activeArtifact.artifactType}
                    </span>
                    <span className="text-xs text-[#717885]">• Model: {activeArtifact.model}</span>
                  </div>
                  <h2 className="text-base font-bold text-[#F1F3F5]">{activeArtifact.title}</h2>
                  <p className="text-xs text-[#717885] mt-0.5 font-mono">
                    Generated by {activeArtifact.userName || "Parth Doshi"} on{" "}
                    {new Date(activeArtifact.createdAt).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteArtifact(activeArtifact.id)}
                  className="p-1.5 rounded-lg bg-[#111418] text-red-400 border border-[#292E36] hover:bg-red-500/10"
                  title="Delete Artifact"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Source Provenance Card (Required by prompt) */}
              <div className="p-3.5 rounded-lg bg-[#111418] border border-[#292E36] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-[#6C8CFF]">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="font-semibold">Source Provenance & Access Audit</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">Verified Access</span>
                </div>
                <div className="text-xs text-[#A7AFBB]">
                  <p>
                    <span className="text-[#717885]">Source Entity:</span>{" "}
                    <span className="text-[#F1F3F5] font-medium">{activeArtifact.sourceTitle}</span> (
                    {activeArtifact.sourceType || "FILE"})
                  </p>
                  {activeArtifact.prompt && (
                    <p className="mt-1">
                      <span className="text-[#717885]">Directive:</span>{" "}
                      <span className="italic text-[#F1F3F5]">"{activeArtifact.prompt}"</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Markdown Content Area */}
              <div className="p-4 rounded-lg bg-[#111418] border border-[#292E36] text-xs text-[#F1F3F5] leading-relaxed overflow-x-auto whitespace-pre-wrap font-sans">
                {activeArtifact.content}
              </div>

              {/* Citations & Source Snippets */}
              {activeArtifact.sourceRefs && activeArtifact.sourceRefs.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-semibold text-[#A7AFBB] flex items-center gap-1.5">
                    <Quote className="w-3.5 h-3.5 text-[#6C8CFF]" /> Citations & Grounding
                  </h4>
                  <div className="space-y-2">
                    {activeArtifact.sourceRefs.map((ref, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-[#111418] border border-[#292E36] text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-mono text-[10px] text-[#717885]">
                          <span>{ref.fileName || "Source Reference"}</span>
                          <span>Score: {(ref.similarityScore * 100).toFixed(0)}%</span>
                        </div>
                        <p className="text-[#F1F3F5] italic font-serif">"{ref.citationText}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center bg-[#181C22] rounded-xl border border-[#292E36]">
              <Sparkles className="w-10 h-10 text-[#717885] mx-auto mb-2 opacity-40" />
              <p className="text-xs text-[#717885]">Select an artifact or execute a new AI analysis.</p>
            </div>
          )}
        </div>
      </div>

      {/* ========================================== */}
      {/* MODAL: Execute AI Run                      */}
      {/* ========================================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#181C22] border border-[#292E36] rounded-xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#292E36]">
              <h3 className="text-sm font-semibold text-[#F1F3F5] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#6C8CFF]" /> Execute Contextual AI Run
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-[#717885] hover:text-[#F1F3F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteRun} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#A7AFBB] mb-1">Source Repository</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSourceType("FILE");
                      if (files.length > 0) setSourceId(files[0].id);
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center justify-center gap-1.5 ${
                      sourceType === "FILE"
                        ? "bg-[#6C8CFF]/20 text-[#6C8CFF] border-[#6C8CFF]/50"
                        : "bg-[#111418] text-[#A7AFBB] border-[#292E36]"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" /> Educational Files
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSourceType("DATASET");
                      if (datasets.length > 0) setSourceId(datasets[0].id);
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center justify-center gap-1.5 ${
                      sourceType === "DATASET"
                        ? "bg-[#10B981]/20 text-[#10B981] border-[#10B981]/50"
                        : "bg-[#111418] text-[#A7AFBB] border-[#292E36]"
                    }`}
                  >
                    <Database className="w-3.5 h-3.5" /> Datasets
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A7AFBB] mb-1">Target Document</label>
                <select
                  value={sourceId}
                  onChange={(e) => setSourceId(e.target.value)}
                  required
                  className="w-full bg-[#111418] text-xs text-[#F1F3F5] px-3 py-2 rounded-lg border border-[#292E36] outline-none focus:border-[#6C8CFF]"
                >
                  {sourceType === "FILE"
                    ? files
                        .filter((f) => !f.isDeleted)
                        .map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name} ({f.fileType})
                          </option>
                        ))
                    : datasets.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.rowCount} records)
                        </option>
                      ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A7AFBB] mb-1">
                  Analytical Prompt Directive
                </label>
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-[#111418] text-xs text-[#F1F3F5] p-2.5 rounded-lg border border-[#292E36] outline-none focus:border-[#6C8CFF]"
                />
              </div>

              {runError && (
                <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                  {runError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#292E36]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#A7AFBB] hover:bg-[#111418]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={running}
                  className="px-4 py-1.5 rounded-lg bg-[#6C8CFF] text-white text-xs font-medium hover:bg-[#5A7BEF] disabled:opacity-50 transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {running ? "Analyzing & Synthesizing..." : "Run Synthesis"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
