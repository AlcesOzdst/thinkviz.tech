"use client";

import { useState } from "react";
import {
  History,
  ShieldAlert,
  Search,
  Filter,
  Activity,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Tag,
} from "lucide-react";
import { DmsActivityItem } from "@/lib/dms/types";

interface ActivityViewProps {
  initialActivities: DmsActivityItem[];
}

export function ActivityView({ initialActivities }: ActivityViewProps) {
  const [activities] = useState<DmsActivityItem[]>(initialActivities);
  const [filterAction, setFilterAction] = useState<string>("ALL");
  const [filterResource, setFilterResource] = useState<string>("ALL");
  const [onlySecurityAudit, setOnlySecurityAudit] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = activities.filter((act) => {
    if (onlySecurityAudit && !act.isSecurityAudit) return false;
    if (filterAction !== "ALL" && act.action !== filterAction) return false;
    if (filterResource !== "ALL" && act.resourceType !== filterResource) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const resName = act.resourceName.toLowerCase();
      const uName = act.userName.toLowerCase();
      const detailsStr = typeof act.details === "string" ? act.details.toLowerCase() : "";
      return resName.includes(q) || uName.includes(q) || detailsStr.includes(q);
    }
    return true;
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case "UPLOAD":
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-500/15 text-blue-300">UPLOAD</span>;
      case "CREATE":
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-300">CREATE</span>;
      case "UPDATE":
      case "TASK_UPDATE":
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/15 text-amber-300">UPDATE</span>;
      case "DELETE":
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-red-500/15 text-red-300">DELETE</span>;
      case "AI_RUN":
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-500/15 text-purple-300">AI RUN</span>;
      case "ROLE_CHANGE":
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-rose-500/15 text-rose-300">ROLE CHG</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#111418] text-[#A7AFBB]">{action}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#292E36]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#F1F3F5]">Activity & Security Audit History</h1>
          <p className="text-xs text-[#A7AFBB] mt-0.5">
            Immutable chronological timeline of resource modifications, user role changes, and file transactions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOnlySecurityAudit(!onlySecurityAudit)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              onlySecurityAudit
                ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                : "bg-[#181C22] text-[#A7AFBB] border-[#292E36] hover:text-[#F1F3F5]"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            {onlySecurityAudit ? "Showing Security Audits" : "Security Audits Only"}
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#181C22] p-3 rounded-lg border border-[#292E36]">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#717885]" />
          <input
            type="text"
            placeholder="Search activities or user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111418] text-xs text-[#F1F3F5] pl-8 pr-3 py-1.5 rounded-md border border-[#292E36] outline-none focus:border-[#6C8CFF]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            aria-label="Filter by action"
            className="bg-[#111418] text-xs text-[#F1F3F5] px-2.5 py-1.5 rounded-md border border-[#292E36] outline-none focus:border-[#6C8CFF]"
          >
            <option value="ALL">All Actions</option>
            <option value="UPLOAD">Upload</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="TASK_UPDATE">Task Update</option>
            <option value="AI_RUN">AI Run</option>
            <option value="ROLE_CHANGE">Role Change</option>
          </select>

          <select
            value={filterResource}
            onChange={(e) => setFilterResource(e.target.value)}
            aria-label="Filter by resource type"
            className="bg-[#111418] text-xs text-[#F1F3F5] px-2.5 py-1.5 rounded-md border border-[#292E36] outline-none focus:border-[#6C8CFF]"
          >
            <option value="ALL">All Resources</option>
            <option value="FILE">File</option>
            <option value="DATASET">Dataset</option>
            <option value="PROJECT">Project</option>
            <option value="TASK">Task</option>
            <option value="AI_ARTIFACT">AI Artifact</option>
            <option value="USER">User / Role</option>
          </select>

          <span className="text-xs text-[#717885] font-mono ml-1">
            {filtered.length} events
          </span>
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="rounded-xl border border-[#292E36] bg-[#181C22] p-5">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#717885]">
            No activity matches the selected criteria.
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#292E36]">
            {filtered.map((act) => (
              <div key={act.id} className="relative group">
                {/* Node icon / indicator */}
                <span
                  className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full ring-4 ring-[#181C22] ${
                    act.isSecurityAudit
                      ? "bg-rose-400"
                      : act.action === "UPLOAD"
                      ? "bg-blue-400"
                      : act.action === "DELETE"
                      ? "bg-red-400"
                      : "bg-[#6C8CFF]"
                  }`}
                ></span>

                {/* Event Card */}
                <div className="p-3.5 rounded-lg bg-[#111418] border border-[#292E36] hover:border-[#6C8CFF]/40 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getActionBadge(act.action)}
                      <span className="text-xs font-semibold text-[#F1F3F5]">{act.resourceName}</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#181C22] text-[#717885] border border-[#292E36]">
                        {act.resourceType}
                      </span>
                      {act.isSecurityAudit && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          AUDIT
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#717885] font-mono shrink-0">
                      {new Date(act.timestamp).toLocaleString()}
                    </span>
                  </div>

                  {typeof act.details === "string" ? (
                    <p className="text-xs text-[#A7AFBB] leading-relaxed">{act.details}</p>
                  ) : act.details ? (
                    <pre className="text-[11px] text-[#A7AFBB] font-mono mt-1 p-2 bg-[#0D0F12] rounded">
                      {JSON.stringify(act.details, null, 2)}
                    </pre>
                  ) : null}

                  <div className="mt-2 pt-2 border-t border-[#292E36]/40 flex items-center justify-between text-[10px] text-[#717885]">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-[#6C8CFF]" /> Executed by {act.userName}
                    </span>
                    <span className="font-mono">ID: {act.id.slice(0, 14)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
