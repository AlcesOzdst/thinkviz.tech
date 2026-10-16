import {
  getAiArtifactsAction,
  getFilesAction,
  getDatasetsAction,
} from "@/app/actions/dms";
import { AiWorkspaceView } from "@/components/dms/AiWorkspaceView";

export const metadata = {
  title: "AI Workspace, Data Center, ThinkViz",
  description:
    "Contextual AI document summarization, heuristic evaluation, and source provenance intelligence hub.",
};

export default async function DataCenterAiWorkspacePage() {
  const [artifacts, { files }, datasets] = await Promise.all([
    getAiArtifactsAction(),
    getFilesAction({ includeDeleted: false }),
    getDatasetsAction(),
  ]);

  return (
    <AiWorkspaceView
      initialArtifacts={artifacts}
      files={files}
      datasets={datasets}
    />
  );
}
