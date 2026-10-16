import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/dms/auth";
import { dmsStore } from "@/lib/dms/store";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await req.json();

    const existing = dmsStore.getTasks().find((t) => t.id === id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }

    const updated = dmsStore.updateTask(id, body);

    dmsStore.logActivity({
      action: "TASK_UPDATE",
      resourceType: "TASK",
      resourceId: id,
      resourceName: updated?.title || existing.title,
      userId: user.id,
      userName: user.name,
      details: body.status ? `Updated status to ${body.status}` : "Updated task properties",
      isSecurityAudit: false,
    });

    return NextResponse.json({ success: true, task: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update task" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const existing = dmsStore.getTasks().find((t) => t.id === id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }

    dmsStore.deleteTask(id);

    dmsStore.logActivity({
      action: "DELETE",
      resourceType: "TASK",
      resourceId: id,
      resourceName: existing.title,
      userId: user.id,
      userName: user.name,
      details: `Deleted task "${existing.title}" via API`,
      isSecurityAudit: false,
    });

    return NextResponse.json({ success: true, message: "Task deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete task" },
      { status: 500 }
    );
  }
}
