import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/dms/auth";
import { dmsStore } from "@/lib/dms/store";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    dmsStore.deleteAiArtifact(id);

    dmsStore.logActivity({
      action: "DELETE",
      resourceType: "AI_ARTIFACT",
      resourceId: id,
      resourceName: id,
      userId: user.id,
      userName: user.name,
      details: "Deleted AI artifact via API",
      isSecurityAudit: false,
    });

    return NextResponse.json({ success: true, message: "Artifact deleted" });
  } catch (error: any) {
    const status = error.message.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete artifact" },
      { status }
    );
  }
}
