import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/dms/auth";
import { dmsStore } from "@/lib/dms/store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
      records,
      total,
      limit,
      offset,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve records" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await req.json();

    const recordData = body.data || body;
    const newRecord = dmsStore.addDatasetRecord(id, recordData);
    if (!newRecord) {
      return NextResponse.json({ success: false, error: "Dataset not found" }, { status: 404 });
    }

    dmsStore.logActivity({
      action: "CREATE",
      resourceType: "DATASET_RECORD",
      resourceId: newRecord.id,
      resourceName: `Record #${newRecord.rowIndex + 1}`,
      userId: user.id,
      userName: user.name,
      details: `Added new row to dataset via API`,
      isSecurityAudit: false,
    });

    return NextResponse.json({ success: true, record: newRecord }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to add record" },
      { status: 500 }
    );
  }
}
