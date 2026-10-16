import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/dms/auth";
import { dmsStore } from "@/lib/dms/store";

export async function GET() {
  try {
    await requireAuth();
    const projects = dmsStore.getProjects();
    return NextResponse.json({ success: true, count: projects.length, projects });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch projects" },
      { status: 401 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ success: false, error: "Project name is required" }, { status: 400 });
    }

    const proj = dmsStore.addProject({
      name: body.name.trim(),
      description: body.description || "",
      color: body.color || "#6C8CFF",
      status: "ACTIVE",
      deadline: body.deadline || null,
      ownerId: user.id,
      ownerName: user.name,
    });

    dmsStore.logActivity({
      action: "CREATE",
      resourceType: "PROJECT",
      resourceId: proj.id,
      resourceName: proj.name,
      userId: user.id,
      userName: user.name,
      details: `Created project "${proj.name}" via API`,
      isSecurityAudit: false,
    });

    return NextResponse.json({ success: true, project: proj }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create project" },
      { status: 400 }
    );
  }
}
