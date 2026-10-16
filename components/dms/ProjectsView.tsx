"use client";

import { useState } from "react";
import {
  FolderKanban,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  Trash2,
  User,
  ArrowRight,
  X,
  Filter,
} from "lucide-react";
import { DmsProjectItem, DmsTaskItem, TaskPriority, TaskStatus } from "@/lib/dms/types";
import {
  createProjectAction,
  deleteProjectAction,
  createTaskAction,
  updateTaskStatusAction,
  deleteTaskAction,
} from "@/app/actions/dms";

interface ProjectsViewProps {
  initialProjects: DmsProjectItem[];
  initialTasks: DmsTaskItem[];
}

export function ProjectsView({ initialProjects, initialTasks }: ProjectsViewProps) {
  const [projects, setProjects] = useState<DmsProjectItem[]>(initialProjects);
  const [tasks, setTasks] = useState<DmsTaskItem[]>(initialTasks);
  const [selectedProjectId, setSelectedProjectId] = useState<string | "ALL">("ALL");

  // Modals
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  // Project form state
  const [newProjName, setNewProjName] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [newProjDeadline, setNewProjDeadline] = useState("");
  const [newProjColor, setNewProjColor] = useState("#6C8CFF");

  // Task form state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskProjectId, setNewTaskProjectId] = useState(
    initialProjects.length > 0 ? initialProjects[0].id : ""
  );
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("MEDIUM");
  const [newTaskAssignee, setNewTaskAssignee] = useState("Parth Doshi");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");

  // Filtered tasks
  const filteredTasks = tasks.filter((t) =>
    selectedProjectId === "ALL" ? true : t.projectId === selectedProjectId
  );

  const todoTasks = filteredTasks.filter((t) => t.status === "TODO");
  const inProgressTasks = filteredTasks.filter((t) => t.status === "IN_PROGRESS");
  const doneTasks = filteredTasks.filter((t) => t.status === "DONE");

  // Create Project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;

    try {
      const res = await createProjectAction({
        name: newProjName,
        description: newProjDesc,
        color: newProjColor,
        deadline: newProjDeadline || undefined,
      });

      if (res.success && res.project) {
        setProjects([res.project, ...projects]);
        setProjectModalOpen(false);
        setNewProjName("");
        setNewProjDesc("");
        setNewProjDeadline("");
      }
    } catch (err: any) {
      alert("Error creating project: " + err.message);
    }
  };

  // Delete Project
  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project and all its tasks?")) return;
    try {
      await deleteProjectAction(id);
      setProjects(projects.filter((p) => p.id !== id));
      setTasks(tasks.filter((t) => t.projectId !== id));
      if (selectedProjectId === id) setSelectedProjectId("ALL");
    } catch (err: any) {
      alert("Error deleting project: " + err.message);
    }
  };

  // Create Task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskProjectId) return;

    try {
      const res = await createTaskAction({
        title: newTaskTitle,
        description: newTaskDesc,
        projectId: newTaskProjectId,
        priority: newTaskPriority,
        assigneeName: newTaskAssignee,
        dueDate: newTaskDueDate || undefined,
      });

      if (res.success && res.task) {
        setTasks([res.task, ...tasks]);
        setTaskModalOpen(false);
        setNewTaskTitle("");
        setNewTaskDesc("");
        setNewTaskDueDate("");

        // Update project task count locally
        setProjects(
          projects.map((p) =>
            p.id === newTaskProjectId ? { ...p, taskCount: p.taskCount + 1 } : p
          )
        );
      }
    } catch (err: any) {
      alert("Error creating task: " + err.message);
    }
  };

  // Update Task Status
  const handleUpdateStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await updateTaskStatusAction(taskId, newStatus);
      setTasks(
        tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (err: any) {
      alert("Error updating task: " + err.message);
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTaskAction(taskId);
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (err: any) {
      alert("Error deleting task: " + err.message);
    }
  };

  const getPriorityBadge = (p: TaskPriority) => {
    switch (p) {
      case "URGENT":
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-red-500/20 text-red-300">URGENT</span>;
      case "HIGH":
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300">HIGH</span>;
      case "MEDIUM":
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300">MEDIUM</span>;
      case "LOW":
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-gray-500/20 text-gray-400">LOW</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#292E36]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#F1F3F5]">Projects & Tasks</h1>
          <p className="text-xs text-[#A7AFBB] mt-0.5">
            Coordinate coursework, research milestones, visualizer algorithm implementations, and benchmarks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setProjectModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181C22] border border-[#292E36] text-xs font-medium text-[#F1F3F5] hover:bg-[#1F242D] transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[#6C8CFF]" />
            New Project
          </button>
          <button
            onClick={() => {
              if (selectedProjectId !== "ALL") {
                setNewTaskProjectId(selectedProjectId);
              }
              setTaskModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6C8CFF] text-white text-xs font-medium hover:bg-[#5A7BEF] transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Task
          </button>
        </div>
      </div>

      {/* Projects Overview Row */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase text-[#717885] tracking-wider">
            Active Projects ({projects.length})
          </h2>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSelectedProjectId("ALL")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedProjectId === "ALL"
                  ? "bg-[#6C8CFF] text-white"
                  : "bg-[#181C22] text-[#A7AFBB] hover:text-[#F1F3F5] border border-[#292E36]"
              }`}
            >
              All Projects
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projects.map((proj) => {
            const isSelected = selectedProjectId === proj.id;
            const completionPct =
              proj.taskCount > 0 ? Math.round((proj.completedTaskCount / proj.taskCount) * 100) : 0;

            return (
              <div
                key={proj.id}
                onClick={() => setSelectedProjectId(isSelected ? "ALL" : proj.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? "bg-[#6C8CFF]/15 border-[#6C8CFF]/60 shadow-lg"
                    : "bg-[#181C22] border-[#292E36] hover:border-[#6C8CFF]/30"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: proj.color }}></span>
                    <h3 className="text-sm font-semibold text-[#F1F3F5] truncate max-w-[180px]">{proj.name}</h3>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(proj.id);
                    }}
                    className="text-[#717885] hover:text-red-400 p-1"
                    title="Delete project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-[#A7AFBB] line-clamp-2 leading-relaxed">{proj.description}</p>

                {/* Progress bar */}
                <div className="mt-4 pt-3 border-t border-[#292E36]/60">
                  <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                    <span className="text-[#717885]">
                      {proj.completedTaskCount}/{proj.taskCount} Tasks
                    </span>
                    <span className="text-[#6C8CFF] font-semibold">{completionPct}%</span>
                  </div>
                  <div className="w-full bg-[#111418] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#6C8CFF] h-1.5 rounded-full transition-all"
                      style={{ width: `${completionPct}%` }}
                    ></div>
                  </div>
                </div>

                {proj.deadline && (
                  <div className="mt-2 text-[10px] text-[#717885] flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3 text-[#6C8CFF]" /> Due {proj.deadline}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-[#F1F3F5] flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-[#6C8CFF]" />
            Task Board {selectedProjectId !== "ALL" && `, ${projects.find((p) => p.id === selectedProjectId)?.name}`}
          </h2>
          <span className="text-xs text-[#717885] font-mono">{filteredTasks.length} total tasks</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Column 1: TODO */}
          <div className="rounded-xl bg-[#111418] border border-[#292E36] p-3 flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#292E36]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                <span className="text-xs font-semibold text-[#F1F3F5]">To Do</span>
              </div>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#181C22] text-[#A7AFBB]">
                {todoTasks.length}
              </span>
            </div>

            <div className="space-y-2.5 flex-1 overflow-y-auto">
              {todoTasks.map((t) => (
                <div key={t.id} className="p-3 rounded-lg bg-[#181C22] border border-[#292E36] space-y-2">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="text-xs font-semibold text-[#F1F3F5] leading-snug">{t.title}</h4>
                    {getPriorityBadge(t.priority)}
                  </div>
                  {t.description && <p className="text-[11px] text-[#A7AFBB] leading-relaxed">{t.description}</p>}
                  <div className="flex items-center justify-between pt-2 border-t border-[#292E36]/40 text-[10px] text-[#717885]">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-[#6C8CFF]" /> {t.assigneeName}
                    </span>
                    <button
                      onClick={() => handleUpdateStatus(t.id, "IN_PROGRESS")}
                      className="inline-flex items-center gap-1 text-[10px] text-[#6C8CFF] hover:underline"
                    >
                      Start <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: IN PROGRESS */}
          <div className="rounded-xl bg-[#111418] border border-[#292E36] p-3 flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#292E36]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#6C8CFF]"></span>
                <span className="text-xs font-semibold text-[#F1F3F5]">In Progress</span>
              </div>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#181C22] text-[#6C8CFF]">
                {inProgressTasks.length}
              </span>
            </div>

            <div className="space-y-2.5 flex-1 overflow-y-auto">
              {inProgressTasks.map((t) => (
                <div key={t.id} className="p-3 rounded-lg bg-[#181C22] border border-[#6C8CFF]/30 space-y-2 shadow-sm">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="text-xs font-semibold text-[#F1F3F5] leading-snug">{t.title}</h4>
                    {getPriorityBadge(t.priority)}
                  </div>
                  {t.description && <p className="text-[11px] text-[#A7AFBB] leading-relaxed">{t.description}</p>}
                  <div className="flex items-center justify-between pt-2 border-t border-[#292E36]/40 text-[10px] text-[#717885]">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-[#6C8CFF]" /> {t.assigneeName}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateStatus(t.id, "TODO")}
                        className="text-[10px] text-[#717885] hover:text-[#F1F3F5]"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(t.id, "DONE")}
                        className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium hover:underline"
                      >
                        Done <CheckCircle2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: DONE */}
          <div className="rounded-xl bg-[#111418] border border-[#292E36] p-3 flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#292E36]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-xs font-semibold text-[#F1F3F5]">Done</span>
              </div>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#181C22] text-emerald-400">
                {doneTasks.length}
              </span>
            </div>

            <div className="space-y-2.5 flex-1 overflow-y-auto">
              {doneTasks.map((t) => (
                <div key={t.id} className="p-3 rounded-lg bg-[#181C22]/80 border border-[#292E36] space-y-2 opacity-80">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="text-xs font-medium text-[#F1F3F5] line-through leading-snug">{t.title}</h4>
                    <span className="text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#292E36]/40 text-[10px] text-[#717885]">
                    <span>Completed</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateStatus(t.id, "IN_PROGRESS")}
                        className="text-[10px] text-[#6C8CFF] hover:underline"
                      >
                        Reopen
                      </button>
                      <button
                        onClick={() => handleDeleteTask(t.id)}
                        className="text-[10px] text-red-400 hover:text-red-300"
                        title="Delete task"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* MODAL 1: New Project                       */}
      {/* ========================================== */}
      {projectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#181C22] border border-[#292E36] rounded-xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#292E36]">
              <h3 className="text-sm font-semibold text-[#F1F3F5]">Create New Project</h3>
              <button
                onClick={() => setProjectModalOpen(false)}
                className="text-[#717885] hover:text-[#F1F3F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#A7AFBB] mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Heuristic Search Visualizer v2"
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  className="w-full bg-[#111418] text-xs text-[#F1F3F5] px-3 py-2 rounded-lg border border-[#292E36] outline-none focus:border-[#6C8CFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A7AFBB] mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Goals, team objectives, and milestones..."
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  className="w-full bg-[#111418] text-xs text-[#F1F3F5] p-2.5 rounded-lg border border-[#292E36] outline-none focus:border-[#6C8CFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#A7AFBB] mb-1">Deadline (Optional)</label>
                  <input
                    type="date"
                    value={newProjDeadline}
                    onChange={(e) => setNewProjDeadline(e.target.value)}
                    className="w-full bg-[#111418] text-xs text-[#F1F3F5] px-3 py-1.5 rounded-lg border border-[#292E36] outline-none focus:border-[#6C8CFF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#A7AFBB] mb-1">Theme Accent</label>
                  <div className="flex items-center gap-2 mt-2">
                    {["#6C8CFF", "#10B981", "#F59E0B", "#EC4899", "#8B5CF6"].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewProjColor(color)}
                        className={`w-5 h-5 rounded-full border-2 transition-transform ${
                          newProjColor === color ? "border-white scale-110" : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#292E36]">
                <button
                  type="button"
                  onClick={() => setProjectModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#A7AFBB] hover:bg-[#111418]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#6C8CFF] text-white text-xs font-medium hover:bg-[#5A7BEF] transition-colors"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 2: Add Task                          */}
      {/* ========================================== */}
      {taskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#181C22] border border-[#292E36] rounded-xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#292E36]">
              <h3 className="text-sm font-semibold text-[#F1F3F5]">Add New Task</h3>
              <button
                onClick={() => setTaskModalOpen(false)}
                className="text-[#717885] hover:text-[#F1F3F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#A7AFBB] mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement IDA* depth threshold expansion"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full bg-[#111418] text-xs text-[#F1F3F5] px-3 py-2 rounded-lg border border-[#292E36] outline-none focus:border-[#6C8CFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A7AFBB] mb-1">Assign to Project</label>
                <select
                  value={newTaskProjectId}
                  onChange={(e) => setNewTaskProjectId(e.target.value)}
                  required
                  className="w-full bg-[#111418] text-xs text-[#F1F3F5] px-3 py-2 rounded-lg border border-[#292E36] outline-none focus:border-[#6C8CFF]"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#A7AFBB] mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                    className="w-full bg-[#111418] text-xs text-[#F1F3F5] px-3 py-1.5 rounded-lg border border-[#292E36] outline-none focus:border-[#6C8CFF]"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#A7AFBB] mb-1">Assignee</label>
                  <input
                    type="text"
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    className="w-full bg-[#111418] text-xs text-[#F1F3F5] px-3 py-1.5 rounded-lg border border-[#292E36] outline-none focus:border-[#6C8CFF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A7AFBB] mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Details, acceptance criteria..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="w-full bg-[#111418] text-xs text-[#F1F3F5] p-2.5 rounded-lg border border-[#292E36] outline-none focus:border-[#6C8CFF]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#292E36]">
                <button
                  type="button"
                  onClick={() => setTaskModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#A7AFBB] hover:bg-[#111418]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#6C8CFF] text-white text-xs font-medium hover:bg-[#5A7BEF] transition-colors"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
