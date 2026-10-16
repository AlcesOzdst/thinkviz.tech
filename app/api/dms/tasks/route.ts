import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/dms/auth";
import { dmsStore } from "@/lib/dms/store";

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId") || undefined;
    const tasks = dmsStore.getTasks(projectId);

    return NextResponse.json({ success: true, count: tasks.length, tasks });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch tasks" },
      { status: 401 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    if (!body.title || !body.projectId) {
      return NextResponse.json(
        { success: false, error: "title and projectId are required" },
        { status: 400 }
      );
    }

    const proj = dmsStore.getProjectById(body.projectId);
    if (!proj) {
      return NextResponse.json({ success: false, error: "Parent project not found" }, { status: 404 });
    }

    const task = dmsStore.addTask({
      title: body.title.trim(),
      description: body.description || "",
      status: body.status || "TODO",
      priority: body.priority || "MEDIUM",
      projectId: body.projectId,
      projectName: proj.name,
      assigneeId: body.assigneeId || user.id,
      assigneeName: body.assigneeName || user.name,
      dueDate: body.dueDate || null,
    });

    dmsStore.logActivity({
      action: "CREATE",
      resourceType: "TASK",
      resourceId: task.id,
      resourceName: task.title,
      userId: user.id,
      userName: user.name,
      details: `Created task "${task.title}" via API`,
      isSecurityAudit: false,
    });

    return NextResponse.json({ success: true, task }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create task" },
      { status: 400 }
    );
  }
}
