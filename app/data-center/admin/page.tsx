import { getAdminDataAction, getCurrentUserAction } from "@/app/actions/dms";
import { AdminView } from "@/components/dms/AdminView";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin Console, Data Center, ThinkViz",
  description: "Administrative console for user roles, security audit streams, and system governance.",
};

export default async function DataCenterAdminPage() {
  const currentUser = await getCurrentUserAction();
  if (!currentUser) {
    redirect("/login?callbackUrl=/data-center/admin");
  }

  // If not admin, we can still load current user and pass empty admin data so AdminView renders the forbidden guard
  if (currentUser.role !== "ADMIN") {
    return (
      <AdminView
        initialUsers={[]}
        analytics={{
          storage: { totalBytes: 0, usedBytes: 0, limitBytes: 0, fileCount: 0, datasetCount: 0, byType: [] },
          activityTimeline: [],
          projectStats: { totalProjects: 0, totalTasks: 0, completedTasks: 0, inProgressTasks: 0, todoTasks: 0 },
          qualityStats: { averageQualityScore: 0, verifiedDatasets: 0, flaggedDatasets: 0 },
        }}
        auditLogs={[]}
        currentUser={currentUser}
      />
    );
  }

  const { users, analytics, auditLogs } = await getAdminDataAction();

  return (
    <AdminView
      initialUsers={users}
      analytics={analytics}
      auditLogs={auditLogs}
      currentUser={currentUser}
    />
  );
}
