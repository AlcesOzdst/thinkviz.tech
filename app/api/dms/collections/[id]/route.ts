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

    const existing = dmsStore.getCollections().find((c) => c.id === id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Collection not found" }, { status: 404 });
    }

    dmsStore.deleteCollection(id);

    dmsStore.logActivity({
      action: "DELETE",
      resourceType: "COLLECTION",
      resourceId: id,
      resourceName: existing.name,
      userId: user.id,
      userName: user.name,
      details: `Deleted collection "${existing.name}" via API`,
      isSecurityAudit: false,
    });

    return NextResponse.json({ success: true, message: "Collection deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete collection" },
      { status: 500 }
    );
  }
}
