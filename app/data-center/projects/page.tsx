import { getProjectsAction, getTasksAction } from "@/app/actions/dms";
import { ProjectsView } from "@/components/dms/ProjectsView";

export const metadata = {
  title: "Projects & Tasks, Data Center, ThinkViz",
  description:
    "Coursework project management, research milestones, visualizer algorithm tasks, and collaboration board.",
};

export default async function DataCenterProjectsPage() {
  const [projects, tasks] = await Promise.all([getProjectsAction(), getTasksAction()]);

  return <ProjectsView initialProjects={projects} initialTasks={tasks} />;
}
