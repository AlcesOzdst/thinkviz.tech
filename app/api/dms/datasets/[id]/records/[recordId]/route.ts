import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/dms/auth";
import { dmsStore } from "@/lib/dms/store";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; recordId: string }> }
) {
  try {
    const user = await requireAuth();
    const { id, recordId } = await params;

    const success = dmsStore.deleteDatasetRecord(id, recordId);
    if (!success) {
      return NextResponse.json({ success: false, error: "Record or dataset not found" }, { status: 404 });
    }

    dmsStore.logActivity({
      action: "DELETE",
      resourceType: "DATASET_RECORD",
      resourceId: recordId,
      resourceName: recordId,
      userId: user.id,
      userName: user.name,
      details: `Deleted dataset record via API`,
      isSecurityAudit: false,
    });

    return NextResponse.json({ success: true, message: "Record deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete record" },
      { status: 500 }
    );
  }
}
