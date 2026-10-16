"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Users,
  HardDrive,
  AlertTriangle,
  CheckCircle2,
  Lock,
  RotateCw,
  FileText,
  Clock,
  Settings,
  ShieldCheck,
  Search,
} from "lucide-react";
import { DmsUser, DmsAnalyticsData, DmsActivityItem, UserRole } from "@/lib/dms/types";
import { updateUserRoleAction } from "@/app/actions/dms";

interface AdminViewProps {
  initialUsers: DmsUser[];
  analytics: DmsAnalyticsData;
  auditLogs: DmsActivityItem[];
  currentUser: DmsUser;
}

export function AdminView({
  initialUsers,
  analytics,
  auditLogs,
  currentUser,
}: AdminViewProps) {
  const [users, setUsers] = useState<DmsUser[]>(initialUsers);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [auditSearch, setAuditSearch] = useState("");

  // Role update handler
  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      setUpdatingUserId(userId);
      const res = await updateUserRoleAction(userId, newRole);
      if (res.success) {
        setUsers(
          users.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        alert(`Successfully updated role for ${userId} to ${newRole}`);
      }
    } catch (err: any) {
      alert("Role update failed: " + err.message);
    } finally {
      setUpdatingUserId(null);
    }
  };

  // RBAC Access Guard: If not ADMIN, display clean forbidden gate
  if (currentUser.role !== "ADMIN") {
    return (
      <div className="p-12 text-center bg-[#181C22] rounded-xl border border-red-500/30 space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-[#F1F3F5]">Administrative Console Restricted</h2>
        <p className="text-xs text-[#A7AFBB] max-w-md mx-auto">
          You are currently signed in as <span className="font-semibold text-white">{currentUser.name}</span> with the{" "}
          <span className="font-mono text-amber-300 font-semibold">{currentUser.role}</span> role. Access to user permissions, system configuration, and raw audit streams requires <span className="font-mono text-purple-300">ADMIN</span> privileges.
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600/20 text-purple-300 border border-purple-500/40 hover:bg-purple-600/30 text-xs font-medium transition-colors"
          >
            Sign In with Administrator Account
          </Link>
        </div>
      </div>
    );
  }

  const filteredAudits = auditLogs.filter((log) => {
    if (!auditSearch.trim()) return true;
    const q = auditSearch.toLowerCase();
    const detailsStr = typeof log.details === "string" ? log.details.toLowerCase() : "";
    return (
      log.resourceName.toLowerCase().includes(q) ||
      log.userName.toLowerCase().includes(q) ||
      detailsStr.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#292E36]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-purple-500/15 text-purple-300 border border-purple-500/30">
              Admin Governance Tier
            </span>
            <span className="text-xs text-[#717885]">• Server Authorization Enforced</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#F1F3F5]">Admin Management & Governance</h1>
          <p className="text-xs text-[#A7AFBB] mt-0.5">
            Role-based access control, security audit logs, data retention policies, and pipeline monitoring.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" /> System Healthy
          </span>
        </div>
      </div>

      {/* Section 1: User & Role Permissions */}
      <div className="p-5 rounded-xl bg-[#181C22] border border-[#292E36] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#6C8CFF]" />
            <h3 className="text-sm font-semibold text-[#F1F3F5]">User & Role Assignments</h3>
          </div>
          <span className="text-xs text-[#717885] font-mono">{users.length} Registered Accounts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111418] text-[#717885] uppercase tracking-wider text-[10px] border-b border-[#292E36]">
              <tr>
                <th className="py-2.5 px-3 font-semibold">User Name</th>
                <th className="py-2.5 px-3 font-semibold">Email</th>
                <th className="py-2.5 px-3 font-semibold">Current Role</th>
                <th className="py-2.5 px-3 font-semibold">Access Permissions</th>
                <th className="py-2.5 px-3 font-semibold text-right">Modify Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#292E36]/40">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#1F242D]/40 transition-colors">
                  <td className="py-3 px-3 font-medium text-[#F1F3F5]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#6C8CFF]/20 text-[#6C8CFF] flex items-center justify-center font-bold text-[10px]">
                        {u.name.charAt(0)}
                      </div>
                      <span>{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-[#A7AFBB] font-mono text-[11px]">{u.email}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${
                        u.role === "ADMIN"
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : u.role === "EDUCATOR"
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          : u.role === "RESEARCHER"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[11px] text-[#717885]">
                    {u.role === "ADMIN" && "Full administrative control, audit logs, purge"}
                    {u.role === "EDUCATOR" && "Upload files, import datasets, review student tasks"}
                    {u.role === "RESEARCHER" && "Execute AI runs, download datasets, publish benchmarks"}
                    {u.role === "STUDENT" && "View course materials, execute assigned algorithm tasks"}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                      disabled={updatingUserId === u.id}
                      aria-label={`Modify role for ${u.name}`}
                      className="bg-[#111418] text-xs text-[#F1F3F5] px-2 py-1 rounded border border-[#292E36] outline-none focus:border-[#6C8CFF]"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="EDUCATOR">EDUCATOR</option>
                      <option value="STUDENT">STUDENT</option>
                      <option value="RESEARCHER">RESEARCHER</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Storage Governance & System Policies */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-4 rounded-xl bg-[#181C22] border border-[#292E36] space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#F1F3F5]">
            <HardDrive className="w-4 h-4 text-[#6C8CFF]" /> Physical Storage Quota
          </div>
          <div className="text-xl font-bold font-mono text-[#F1F3F5]">
            {(analytics.storage.usedBytes / (1024 * 1024)).toFixed(1)} MB / 5.0 GB
          </div>
          <p className="text-[11px] text-[#717885]">
            Local disk persistence in <code>.data/storage/files</code>. Automatic SHA-256 deduplication.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#181C22] border border-[#292E36] space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#F1F3F5]">
            <Clock className="w-4 h-4 text-[#10B981]" /> Retention & Soft Deletion
          </div>
          <div className="text-xl font-bold font-mono text-[#F1F3F5]">90 Days Grace</div>
          <p className="text-[11px] text-[#717885]">
            Soft-deleted files can be restored by owners within 90 days prior to permanent purge.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#181C22] border border-[#292E36] space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#F1F3F5]">
            <Settings className="w-4 h-4 text-[#F59E0B]" /> File Upload Constraints
          </div>
          <div className="text-xl font-bold font-mono text-[#F1F3F5]">50 MB Max Limit</div>
          <p className="text-[11px] text-[#717885]">
            Strict file-type MIME validation prevents unauthorized script execution.
          </p>
        </div>
      </div>

      {/* Section 3: Audit Log Explorer */}
      <div className="p-5 rounded-xl bg-[#181C22] border border-[#292E36] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-[#F1F3F5]">Security Audit Log Explorer</h3>
          </div>
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#717885]" />
            <input
              type="text"
              placeholder="Search audit trail..."
              value={auditSearch}
              onChange={(e) => setAuditSearch(e.target.value)}
              className="w-full bg-[#111418] text-xs text-[#F1F3F5] pl-8 pr-3 py-1.5 rounded-lg border border-[#292E36] outline-none focus:border-[#6C8CFF]"
            />
          </div>
        </div>

        <div className="overflow-x-auto max-h-[360px]">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#111418] text-[#717885] uppercase tracking-wider text-[10px] border-b border-[#292E36] sticky top-0">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Target Entity</th>
                <th className="py-2.5 px-3">Executed By</th>
                <th className="py-2.5 px-3">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#292E36]/40">
              {filteredAudits.map((log) => (
                <tr key={log.id} className="hover:bg-[#1F242D]/40 transition-colors">
                  <td className="py-2.5 px-3 text-[#717885] whitespace-nowrap text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-rose-300 font-semibold">{log.action}</td>
                  <td className="py-2.5 px-3 text-[#F1F3F5]">{log.resourceName}</td>
                  <td className="py-2.5 px-3 text-[#A7AFBB]">{log.userName}</td>
                  <td className="py-2.5 px-3 text-[#717885] truncate max-w-xs">
                    {typeof log.details === "string" ? log.details : JSON.stringify(log.details)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
