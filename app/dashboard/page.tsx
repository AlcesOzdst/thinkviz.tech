import Link from "next/link";
import { getCurrentUser } from "@/lib/dms/auth";
import { getUserSavedGrids } from "@/app/actions/grids";
import { getUserProgress } from "@/app/actions/progress";
import { SavedGridsList } from "@/components/dashboard/SavedGridsList";
import { ProgressCards } from "@/components/dashboard/ProgressCards";
import { Grid, Award, LogIn, Shield } from "lucide-react";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  const result = await getUserSavedGrids();
  const grids = result.success ? result.grids || [] : [];

  const progressResult = await getUserProgress();
  const progressRecords = progressResult.success ? progressResult.progress || [] : [];

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-7xl">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-3xl font-bold text-[#F1F3F5]">
              {user ? `${user.name}'s Dashboard` : "Algorithmic Workspace"}
            </h1>
            {user && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold bg-[#6C8CFF]/15 text-[#6C8CFF] border border-[#6C8CFF]/30">
                {user.role}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#A7AFBB]">
            {user
              ? `Manage your custom algorithm obstacle courses and learning velocity.`
              : `Viewing local browser session. Sign in to sync your custom mazes across devices.`}
          </p>
        </div>

        {!user && (
          <Link
            href="/login?callbackUrl=/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#6C8CFF] hover:bg-[#5A7BEF] text-white text-xs font-semibold shadow-sm transition-colors self-start md:self-auto"
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign In to Save Progress
          </Link>
        )}
      </div>

      {!user && (
        <div className="mb-8 p-4 rounded-xl bg-[#181C22] border border-[#292E36] flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#111418] border border-[#292E36] flex items-center justify-center text-[#6C8CFF] shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-[#F1F3F5]">Guest Privacy Active</span>
              <p className="text-[#717885] mt-0.5 text-[11px]">
                Your mazes and progress are isolated to this browser session and never shared with other users.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-12">
        {/* Saved Mazes Section */}
        <section>
          <div className="flex items-center gap-3 mb-6 border-b border-[#292E36] pb-4">
            <div className="p-2 rounded-lg bg-[#263352] text-[#6C8CFF]">
              <Grid size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#F1F3F5]">Your Custom Mazes</h2>
              <p className="text-xs text-[#A7AFBB] mt-1">Obstacle courses you designed in the Grid Visualizer.</p>
            </div>
          </div>
          
          <SavedGridsList grids={grids} />
        </section>
        
        {/* Progress Section */}
        <section>
           <div className="flex items-center gap-3 mb-6 border-b border-[#292E36] pb-4">
             <div className="p-2 rounded-lg bg-[#20C997]/20 text-[#20C997]">
               <Award size={20} />
             </div>
             <div>
               <h2 className="text-xl font-semibold text-[#F1F3F5]">Algorithm Progress</h2>
               <p className="text-xs text-[#A7AFBB] mt-1">Algorithms you have fully completed visualizing.</p>
             </div>
           </div>
           
           <ProgressCards progressRecords={progressRecords} />
        </section>
      </div>
    </div>
  );
}
