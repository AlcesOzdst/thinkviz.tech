import Link from "next/link";
import { getCurrentUser } from "@/lib/dms/auth";
import { getUserSavedGrids } from "@/app/actions/grids";
import { getUserProgress } from "@/app/actions/progress";
import { SavedGridsList } from "@/components/dashboard/SavedGridsList";
import { ProgressCards } from "@/components/dashboard/ProgressCards";
import { Grid, Award, LogIn, Shield, Sparkles } from "lucide-react";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  const result = await getUserSavedGrids();
  const grids = result.success ? result.grids || [] : [];

  const progressResult = await getUserProgress();
  const progressRecords = progressResult.success ? progressResult.progress || [] : [];

  return (
    <div className="container mx-auto px-4 py-10 sm:py-14 max-w-7xl space-y-10 font-mono">
      {/* Header Deck */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-sky-400 mb-2 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>01 // PERSONAL WORKSPACE &amp; METRICS</span>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl sm:text-5xl font-mono font-bold tracking-tight text-white">
              {user ? `${user.name}'s Dashboard` : "Algorithmic Workspace"}
            </h1>
            {user && (
              <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase font-bold bg-sky-500/10 text-sky-300 border border-sky-500/30">
                {user.role}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm font-mono text-slate-400 max-w-2xl leading-relaxed">
            {user
              ? "Manage your custom algorithm obstacle courses, simulation runs, and learning velocity."
              : "Viewing local browser session. Sign in to synchronize your custom mazes and benchmarks across devices."}
          </p>
        </div>

        {!user && (
          <Link
            href="/login?callbackUrl=/dashboard"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-mono font-bold uppercase tracking-wider shadow-lg shadow-sky-950/40 transition-all self-start md:self-auto active:scale-[0.98]"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In to Save Progress</span>
          </Link>
        )}
      </div>

      {!user && (
        <div className="p-5 rounded-3xl bg-[#0A0E17] border border-white/10 flex items-center justify-between gap-4 text-xs font-mono relative overflow-hidden">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-2xl bg-[#111722] border border-white/10 flex items-center justify-center text-sky-400 shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white uppercase tracking-wider">Guest Privacy Active</span>
              <p className="text-slate-400 mt-0.5 text-xs">
                Your mazes and progress are isolated to this browser session and never shared with other users.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-12">
        {/* Saved Mazes Section */}
        <section className="p-7 sm:p-8 rounded-3xl bg-[#0A0E17] border border-white/10 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Corner Crosshairs */}
          <div className="absolute top-3 right-3 text-xs font-mono text-white/20 select-none">+</div>
          <div className="absolute bottom-3 right-3 text-xs font-mono text-white/20 select-none">+</div>

          <div className="flex items-center gap-3 pb-5 border-b border-white/5">
            <div className="p-2.5 rounded-2xl bg-[#111722] border border-white/10 text-sky-400">
              <Grid size={20} />
            </div>
            <div>
              <h2 className="text-lg font-mono font-bold text-white uppercase tracking-wider">02 // Your Custom Mazes</h2>
              <p className="text-xs text-slate-400 mt-0.5">Obstacle courses you designed in the Grid Visualizer.</p>
            </div>
          </div>
          
          <SavedGridsList grids={grids} />
        </section>
        
        {/* Progress Section */}
        <section className="p-7 sm:p-8 rounded-3xl bg-[#0A0E17] border border-white/10 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Corner Crosshairs */}
          <div className="absolute top-3 right-3 text-xs font-mono text-white/20 select-none">+</div>
          <div className="absolute bottom-3 right-3 text-xs font-mono text-white/20 select-none">+</div>

          <div className="flex items-center gap-3 pb-5 border-b border-white/5">
            <div className="p-2.5 rounded-2xl bg-[#111722] border border-white/10 text-emerald-400">
              <Award size={20} />
            </div>
            <div>
              <h2 className="text-lg font-mono font-bold text-white uppercase tracking-wider">03 // Algorithm Progress</h2>
              <p className="text-xs text-slate-400 mt-0.5">Algorithms you have fully completed visualizing.</p>
            </div>
          </div>
          
          <ProgressCards progressRecords={progressRecords} />
        </section>
      </div>
    </div>
  );
}
