import { getFilesAction } from "@/app/actions/dms";
import { FilesView } from "@/components/dms/FilesView";

export const metadata = {
  title: "My Files, Data Center, ThinkViz",
  description: "Educational files, course slides, lecture proofs, and benchmark datasets repository.",
};

export default async function DataCenterFilesPage() {
  const { files, collections } = await getFilesAction({ includeDeleted: true });

  return <FilesView initialFiles={files} initialCollections={collections} />;
}
