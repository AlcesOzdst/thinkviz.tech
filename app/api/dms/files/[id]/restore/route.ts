import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/dms/auth";
import { dmsStore } from "@/lib/dms/store";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const file = dmsStore.getFileById(id);

    if (!file) {
      return NextResponse.json({ success: false, error: "File not found" }, { status: 404 });
    }

    dmsStore.restoreFile(id);

    dmsStore.logActivity({
      action: "RESTORE",
      resourceType: "FILE",
      resourceId: id,
      resourceName: file.name,
      userId: user.id,
      userName: user.name,
      details: "Restored file from trash via API",
      isSecurityAudit: false,
    });

    return NextResponse.json({ success: true, message: "File successfully restored" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Restore failed" },
      { status: 500 }
    );
  }
}
