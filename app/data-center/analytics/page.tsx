import { getAnalyticsAction } from "@/app/actions/dms";
import { AnalyticsView } from "@/components/dms/AnalyticsView";

export const metadata = {
  title: "My Analytics, Data Center, ThinkViz",
  description: "Storage telemetry, activity velocity, document processing metrics, and project analytics.",
};

export default async function DataCenterAnalyticsPage() {
  const analytics = await getAnalyticsAction();

  return <AnalyticsView analytics={analytics} />;
}
