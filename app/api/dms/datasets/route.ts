import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/dms/auth";
import { dmsStore } from "@/lib/dms/store";
import { parseCsvContent, inferSchema, analyzeDataQuality } from "@/lib/dms/importExport";

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const datasets = dmsStore.getDatasets(search);

    return NextResponse.json({
      success: true,
      total: datasets.length,
      datasets,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch datasets" },
      { status: 401 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    if (!body.name || !body.rawContent) {
      return NextResponse.json(
        { success: false, error: "name and rawContent are required fields" },
        { status: 400 }
      );
    }

    const format = (body.format || "CSV").toUpperCase();
    let records: Record<string, any>[] = [];

    if (format === "CSV") {
      records = parseCsvContent(body.rawContent);
    } else {
      try {
        const parsed = JSON.parse(body.rawContent);
        records = Array.isArray(parsed) ? parsed : [parsed];
      } catch (err: any) {
        return NextResponse.json(
          { success: false, error: `Invalid JSON syntax: ${err.message}` },
          { status: 400 }
        );
      }
    }

    if (records.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cannot create empty dataset. Provide valid CSV or JSON records." },
        { status: 400 }
      );
    }

    const schema = inferSchema(records);
    const quality = analyzeDataQuality(records, schema);

    const newDs = dmsStore.addDataset(
      {
        name: body.name.trim(),
        description: body.description || "",
        category: body.category || "General",
        format: format as "CSV" | "JSON",
        rowCount: records.length,
        columnCount: schema.length,
        schemaDefinition: schema,
        schema,
        dataQualityScore: quality.score,
        qualityIssues: quality.issues.slice(0, 20),
        userId: user.id,
        userName: user.name,
        isDeleted: false,
      },
      records
    );

    dmsStore.logActivity({
      action: "CREATE",
      resourceType: "DATASET",
      resourceId: newDs.id,
      resourceName: newDs.name,
      userId: user.id,
      userName: user.name,
      details: `Imported ${records.length} records via API. Quality score: ${quality.score}%`,
      isSecurityAudit: false,
    });

    return NextResponse.json(
      {
        success: true,
        dataset: newDs,
        dataQuality: quality,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create dataset" },
      { status: 400 }
    );
  }
}
