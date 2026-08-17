import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserSavedGrids } from "@/app/actions/grids";
import { SavedGridsList } from "@/components/dashboard/SavedGridsList";
import { Grid } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/api/auth/signin?callbackUrl=/dashboard");
  }

  const result = await getUserSavedGrids();
  const grids = result.success ? result.grids || [] : [];

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
        
        {/* Progress Section (Coming Soon) */}
        <section>
           <div className="w-full p-10 rounded-xl bg-[#15181D]/50 border border-[#292E36] border-dashed text-center">
             <h3 className="text-lg font-medium text-[#737C89] mb-2">Algorithm Progress Tracking</h3>
             <p className="text-[#737C89] text-sm max-w-md mx-auto">
               In the future, you will be able to track your completion rates, quiz scores, and time spent learning each algorithm.
             </p>
           </div>
        </section>
      </div>
    </div>
  );
}
