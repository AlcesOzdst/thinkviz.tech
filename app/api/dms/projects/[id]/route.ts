import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/dms/auth";
import { dmsStore } from "@/lib/dms/store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const project = dmsStore.getProjectById(id);
    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    const tasks = dmsStore.getTasks(id);
    return NextResponse.json({ success: true, project, tasks });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch project" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await req.json();

    const existing = dmsStore.getProjectById(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    const updated = dmsStore.updateProject(id, body);

    dmsStore.logActivity({
      action: "UPDATE",
      resourceType: "PROJECT",
      resourceId: id,
      resourceName: updated?.name || existing.name,
      userId: user.id,
      userName: user.name,
      details: "Updated project properties via API",
      isSecurityAudit: false,
    });

    return NextResponse.json({ success: true, project: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update project" },
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

    const existing = dmsStore.getProjectById(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    dmsStore.deleteProject(id);

    dmsStore.logActivity({
      action: "DELETE",
      resourceType: "PROJECT",
      resourceId: id,
      resourceName: existing.name,
      userId: user.id,
      userName: user.name,
      details: `Deleted project "${existing.name}" via API`,
      isSecurityAudit: false,
    });

    return NextResponse.json({ success: true, message: "Project and tasks deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete project" },
      { status: 500 }
    );
  }
}
