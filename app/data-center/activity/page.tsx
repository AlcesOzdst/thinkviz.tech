import { getActivitiesAction } from "@/app/actions/dms";
import { ActivityView } from "@/components/dms/ActivityView";

export const metadata = {
  title: "Activity History, Data Center, ThinkViz",
  description: "Audit trail, resource modifications, and user security event history.",
};

export default async function DataCenterActivityPage() {
  const activities = await getActivitiesAction();

  return <ActivityView initialActivities={activities} />;
}
