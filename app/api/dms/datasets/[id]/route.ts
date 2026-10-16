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
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const dataset = dmsStore.getDatasetById(id);
    if (!dataset) {
      return NextResponse.json({ success: false, error: "Dataset not found" }, { status: 404 });
    }

    const { records, total } = dmsStore.getDatasetRecords(id, limit, offset);

    return NextResponse.json({
      success: true,
      dataset,
      records,
      total,
      limit,
      offset,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve dataset" },
      { status: 500 }
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

    const existing = dmsStore.getDatasetById(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Dataset not found" }, { status: 404 });
    }

    dmsStore.deleteDataset(id);

    dmsStore.logActivity({
      action: "DELETE",
      resourceType: "DATASET",
      resourceId: id,
      resourceName: existing.name,
      userId: user.id,
      userName: user.name,
      details: `Deleted dataset "${existing.name}" via API`,
      isSecurityAudit: false,
    });

    return NextResponse.json({ success: true, message: "Dataset deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete dataset" },
      { status: 500 }
    );
  }
}
