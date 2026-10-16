"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  Database,
  CheckSquare,
  Sparkles,
  History,
  BarChart3,
  Shield,
  HardDrive,
  UserCheck,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { switchUserAction, logoutAction } from "@/app/actions/dms";
import { LogOut } from "lucide-react";

interface DmsSidebarProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "EDUCATOR" | "STUDENT" | "RESEARCHER";
  };
  storageUsedBytes: number;
  storageLimitBytes: number;
}

const NAV_ITEMS = [
  { href: "/data-center", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/data-center/files", label: "My Files", icon: FolderOpen },
  { href: "/data-center/datasets", label: "Datasets", icon: Database },
  { href: "/data-center/projects", label: "Projects & Tasks", icon: CheckSquare },
  { href: "/data-center/ai-workspace", label: "AI Workspace", icon: Sparkles },
  { href: "/data-center/activity", label: "Activity History", icon: History },
  { href: "/data-center/analytics", label: "My Analytics", icon: BarChart3 },
  { href: "/data-center/admin", label: "Admin Console", icon: Shield, adminOnly: true },
];

export function DmsSidebar({ currentUser, storageUsedBytes, storageLimitBytes }: DmsSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [switchingUser, setSwitchingUser] = useState(false);

  const usedMb = (storageUsedBytes / (1024 * 1024)).toFixed(1);
  const totalGb = (storageLimitBytes / (1024 * 1024 * 1024)).toFixed(1);
  const percentUsed = Math.min(100, Math.max(1, (storageUsedBytes / storageLimitBytes) * 100));

  const handleSwitchUser = async (userId: string) => {
    try {
      setSwitchingUser(true);
      await switchUserAction(userId);
      window.location.reload();
    } finally {
      setSwitchingUser(false);
    }
  };

  const handleLogout = async () => {
    try {
      setSwitchingUser(true);
      await logoutAction();
      window.location.href = "/login";
    } catch (err: any) {
      alert("Sign out failed: " + err.message);
      setSwitchingUser(false);
    }
  };

  return (
    <>
      {/* Mobile Toggle Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#15181D] border-b border-[#292E36]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#6C8CFF]"></span>
          <span className="text-sm font-semibold text-[#F1F3F5]">Data Center Navigation</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-md text-[#A7AFBB] hover:bg-[#1B1F25] hover:text-[#F1F3F5]"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#111418] border-r border-[#292E36] flex flex-col transition-transform duration-200 lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] lg:translate-x-0 lg:border lg:rounded-xl shadow-xl shrink-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Header / Context */}
        <div className="p-4 border-b border-[#292E36]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#6C8CFF]/15 border border-[#6C8CFF]/30 flex items-center justify-center">
                <Database className="w-4 h-4 text-[#6C8CFF]" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#F1F3F5] tracking-tight">Data Center</h2>
                <p className="text-[11px] text-[#6C8CFF] font-mono">Release 2 (v2.0)</p>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-[#A7AFBB] hover:text-[#F1F3F5]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Active User Persona Banner */}
          <div className="mt-3.5 p-2.5 rounded-lg bg-[#181C22] border border-[#292E36]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <div className="w-7 h-7 rounded-full bg-[#6C8CFF] flex items-center justify-center text-xs font-semibold text-white">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="truncate">
                  <p className="text-xs font-medium text-[#F1F3F5] truncate">{currentUser.name}</p>
                  <span
                    className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-mono uppercase tracking-wider ${
                      currentUser.role === "ADMIN"
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : currentUser.role === "EDUCATOR"
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        : currentUser.role === "RESEARCHER"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {currentUser.role}
                  </span>
                </div>
              </div>
            </div>

            {/* User Session & Sign Out Controls */}
            <div className="mt-2.5 pt-2 border-t border-[#292E36]/60 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-[#717885]">
                <span className="truncate max-w-[130px] font-mono" title={currentUser.email}>
                  {currentUser.email}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 font-medium transition-colors"
                  title="Sign Out of Data Center"
                >
                  <LogOut className="w-3 h-3" />
                  Sign Out
                </button>
              </div>

              {currentUser.role === "ADMIN" && (
                <div className="pt-2 border-t border-[#292E36]/40">
                  <span className="block text-[9px] uppercase text-[#717885] mb-1 font-mono tracking-wider">
                    Admin Test Persona
                  </span>
                  <select
                    value={currentUser.id}
                    onChange={(e) => handleSwitchUser(e.target.value)}
                    disabled={switchingUser}
                    aria-label="Simulate Persona"
                    className="w-full text-[11px] bg-[#111418] text-[#F1F3F5] rounded border border-[#292E36] px-2 py-1 outline-none focus:border-[#6C8CFF]"
                  >
                    <option value="user-admin-1">Parth Doshi (Admin)</option>
                    <option value="user-educator-1">Prof. S. Jenkins (Educator)</option>
                    <option value="user-student-1">Alex Rivera (Student)</option>
                    <option value="user-researcher-1">Dr. Elena Rostova (Researcher)</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname?.startsWith(item.href + "/");

            if (item.adminOnly && currentUser.role !== "ADMIN") {
              return null;
            }

            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#6C8CFF]/15 text-[#6C8CFF] border border-[#6C8CFF]/30 font-semibold"
                    : "text-[#A7AFBB] hover:bg-[#181C22] hover:text-[#F1F3F5]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#6C8CFF]" : "text-[#717885]"}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#6C8CFF]"></span>}
              </Link>
            );
          })}
        </nav>

        {/* Storage Usage Widget */}
        <div className="p-3 border-t border-[#292E36]">
          <div className="p-3 rounded-lg bg-[#181C22] border border-[#292E36]/80">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-1.5 text-[#A7AFBB]">
                <HardDrive className="w-3.5 h-3.5 text-[#6C8CFF]" />
                <span className="font-medium text-[11px]">Storage</span>
              </div>
              <span className="text-[11px] text-[#F1F3F5] font-mono">
                {usedMb} MB / {totalGb} GB
              </span>
            </div>
            <div className="w-full bg-[#111418] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#6C8CFF] to-[#10B981] h-1.5 rounded-full"
                style={{ width: `${percentUsed}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between mt-2 text-[10px] text-[#717885]">
              <span>Physical files & datasets</span>
              <span className="font-mono">{percentUsed.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs lg:hidden"
        ></div>
      )}
    </>
  );
}
