import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserSavedGrids } from "@/app/actions/grids";
import { getUserProgress } from "@/app/actions/progress";
import { SavedGridsList } from "@/components/dashboard/SavedGridsList";
import { ProgressCards } from "@/components/dashboard/ProgressCards";
import { Grid, Award } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/api/auth/signin?callbackUrl=/dashboard");
  }

  const result = await getUserSavedGrids();
  const grids = result.success ? result.grids || [] : [];

  const progressResult = await getUserProgress();
  const progressRecords = progressResult.success ? progressResult.progress || [] : [];

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-7xl">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[#F1F3F5] mb-2">
          Student Dashboard
        </h1>
        <p className="text-[#A7AFBB]">
          Welcome back, {session.user.name || "Student"}. Manage your saved algorithmic scenarios.
        </p>
      </div>

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
