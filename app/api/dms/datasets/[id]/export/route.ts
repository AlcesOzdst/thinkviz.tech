import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/dms/auth";
import { dmsStore } from "@/lib/dms/store";
import { exportToCsv, exportToJson } from "@/lib/dms/importExport";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const format = (searchParams.get("format") || "csv").toLowerCase();

    const dataset = dmsStore.getDatasetById(id);
    if (!dataset) {
      return new NextResponse("Dataset not found", { status: 404 });
    }

    const { records } = dmsStore.getDatasetRecords(id, 10000, 0);
    const dataList = records.map((r) => r.data);

    const safeName = dataset.name.toLowerCase().replace(/[^a-z0-9]/g, "_");

    if (format === "json") {
      const jsonContent = exportToJson(dataList);
      return new NextResponse(jsonContent, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${safeName}.json"`,
        },
      });
    } else {
      const csvContent = exportToCsv(dataList);
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${safeName}.csv"`,
        },
      });
    }
  } catch (error: any) {
    return new NextResponse(error.message || "Export error", { status: 500 });
  }
}
