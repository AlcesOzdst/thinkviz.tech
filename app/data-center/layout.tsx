import { getCurrentUser } from "@/lib/dms/auth";
import { redirect } from "next/navigation";
import { dmsStore } from "@/lib/dms/store";
import { DmsSidebar } from "@/components/dms/DmsSidebar";

export const metadata = {
  title: "Data Center, ThinkViz",
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
    <div className="min-h-full bg-[#0D0F12] text-[#F1F3F5] flex flex-col font-sans">
      {/* Main DMS Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Sub-Navigation Sidebar */}
        <DmsSidebar
          currentUser={currentUser}
          storageUsedBytes={analytics.storage.usedBytes}
          storageLimitBytes={analytics.storage.limitBytes}
        />

        {/* Dynamic Page Content View */}
        <main className="flex-1 min-w-0 bg-[#15181D] border border-[#292E36] rounded-xl p-5 sm:p-7 shadow-xl">
          {children}
        </main>
      </div>
    </div>
  );
}
