import { getDatasetsAction, getDatasetDetailsAction } from "@/app/actions/dms";
import { DatasetsView } from "@/components/dms/DatasetsView";
import { DmsDatasetRecordItem } from "@/lib/dms/types";

export const metadata = {
  title: "Datasets, Data Center, ThinkViz",
  description:
    "Structured heuristic benchmark datasets, test scenario matrices, and tabular algorithm verification records.",
};

export default async function DataCenterDatasetsPage() {
  const datasets = await getDatasetsAction();
  let initialRecords: DmsDatasetRecordItem[] = [];
  let initialTotal = 0;

  if (datasets.length > 0) {
    const details = await getDatasetDetailsAction(datasets[0].id, 15, 0);
    initialRecords = details.records;
    initialTotal = details.total;
  }

  return (
    <DatasetsView
      initialDatasets={datasets}
      initialRecords={initialRecords}
      initialTotal={initialTotal}
    />
  );
}
