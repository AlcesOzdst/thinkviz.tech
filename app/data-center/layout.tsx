import { getCurrentUser } from "@/lib/dms/auth";
import { redirect } from "next/navigation";
import { dmsStore } from "@/lib/dms/store";
import { DmsSidebar } from "@/components/dms/DmsSidebar";

export const metadata = {
  title: "Data Center | ThinkViz",
  description:
    "Centralized Data Management System for ThinkViz educational documents, heuristic datasets, AI artifacts, projects, and system analytics.",
};

export default async function DataCenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?callbackUrl=/data-center");
  }

  const analytics = dmsStore.getAnalytics();

  return (
    <div className="min-h-full bg-[#070A0F] text-slate-200 flex flex-col font-mono">
      {/* Main DMS Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
        {/* Sub-Navigation Sidebar */}
        <DmsSidebar
          currentUser={currentUser}
          storageUsedBytes={analytics.storage.usedBytes}
          storageLimitBytes={analytics.storage.limitBytes}
        />

        {/* Dynamic Page Content View */}
        <main className="flex-1 min-w-0 bg-[#0A0E17] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Corner Crosshairs */}
          <div className="absolute top-3 right-3 text-xs font-mono text-white/20 select-none">+</div>
          <div className="absolute bottom-3 right-3 text-xs font-mono text-white/20 select-none">+</div>
          {children}
        </main>
      </div>
    </div>
  );
}
