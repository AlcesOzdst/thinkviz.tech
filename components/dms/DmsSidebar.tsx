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
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { switchUserAction, logoutAction } from "@/app/actions/dms";

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
  { href: "/data-center", label: "01 // OVERVIEW", icon: LayoutDashboard, exact: true },
  { href: "/data-center/files", label: "02 // MY FILES", icon: FolderOpen },
  { href: "/data-center/datasets", label: "03 // DATASETS", icon: Database },
  { href: "/data-center/projects", label: "04 // PROJECTS & TASKS", icon: CheckSquare },
  { href: "/data-center/ai-workspace", label: "05 // AI WORKSPACE", icon: Sparkles },
  { href: "/data-center/activity", label: "06 // ACTIVITY HISTORY", icon: History },
  { href: "/data-center/analytics", label: "07 // MY ANALYTICS", icon: BarChart3 },
  { href: "/data-center/admin", label: "08 // ADMIN CONSOLE", icon: Shield, adminOnly: true },
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
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0A0E17] border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-sky-400"></span>
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Data Center Menu</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-[#111722] hover:text-white"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0A0E17] border border-white/10 flex flex-col transition-transform duration-200 lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)] lg:translate-x-0 lg:rounded-3xl shadow-2xl shrink-0 font-mono relative overflow-hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Header / Context */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#111722] border border-white/10 flex items-center justify-center">
                <Database className="w-4 h-4 text-sky-400" />
              </div>
              <div>
                <h2 className="text-xs font-mono font-bold text-white tracking-widest uppercase">Data Center</h2>
                <p className="text-[10px] text-sky-400 font-mono">SYS // v2.0</p>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Active User Persona Banner */}
          <div className="mt-4 p-3 rounded-2xl bg-[#111722] border border-white/10 space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/40 flex items-center justify-center text-xs font-bold font-mono shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
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

            {/* User Session & Sign Out Controls */}
            <div className="pt-2 border-t border-white/5 space-y-2">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span className="truncate max-w-[120px]" title={currentUser.email}>
                  {currentUser.email}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 text-[10px] text-rose-400 hover:text-rose-300 font-bold transition-colors"
                  title="Sign Out of Data Center"
                >
                  <LogOut className="w-3 h-3" />
                  EXIT
                </button>
              </div>

              {currentUser.role === "ADMIN" && (
                <div className="pt-2 border-t border-white/5">
                  <span className="block text-[8px] uppercase text-slate-400 mb-1 font-mono tracking-widest font-bold">
                    Switch Test Persona
                  </span>
                  <select
                    value={currentUser.id}
                    onChange={(e) => handleSwitchUser(e.target.value)}
                    disabled={switchingUser}
                    aria-label="Simulate Persona"
                    className="w-full text-[10px] font-mono bg-[#0A0E17] text-white rounded-xl border border-white/10 px-2 py-1 outline-none focus:border-sky-400/60"
                  >
                    <option value="user-admin-1">Parth Doshi (Admin)</option>
                    <option value="user-educator-1">Prof. Jenkins (Educator)</option>
                    <option value="user-student-1">Alex Rivera (Student)</option>
                    <option value="user-researcher-1">Dr. Rostova (Researcher)</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
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
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono transition-all ${
                  isActive
                    ? "bg-[#1A2230] text-sky-400 border border-sky-400/40 font-bold"
                    : "text-slate-400 hover:bg-[#111722] hover:text-white border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-sky-400" : "text-slate-500"}`} />
                  <span className="tracking-wider">{item.label}</span>
                </div>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>}
              </Link>
            );
          })}
        </nav>

        {/* Storage Usage Widget */}
        <div className="p-3 border-t border-white/10">
          <div className="p-3.5 rounded-2xl bg-[#111722] border border-white/10 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-1.5 text-slate-400">
                <HardDrive className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Storage</span>
              </div>
              <span className="text-[10px] text-white font-bold tabular-nums">
                {usedMb}MB / {totalGb}GB
              </span>
            </div>
            <div className="w-full bg-[#0A0E17] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-sky-400 to-emerald-400 h-1.5 rounded-full"
                style={{ width: `${percentUsed}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono">
              <span>Local Volumes</span>
              <span className="text-slate-400 font-bold">{percentUsed.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-xs lg:hidden"
        ></div>
      )}
    </>
  );
}
