import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/dms/auth";
import { dmsStore } from "@/lib/dms/store";

export async function GET() {
  try {
    await requireAdmin();
    const analytics = dmsStore.getAnalytics();

    return NextResponse.json({
      success: true,
      status: "HEALTHY",
      uptimeSeconds: process.uptime(),
      timestamp: new Date().toISOString(),
      governance: {
        storageUsedBytes: analytics.storage.usedBytes,
        storageLimitBytes: analytics.storage.limitBytes,
        retentionDays: 90,
        maxFileSizeBytes: 50 * 1024 * 1024,
        deduplication: "SHA-256",
        totalFiles: analytics.storage.fileCount,
        totalDatasets: analytics.storage.datasetCount,
        averageQualityScore: analytics.qualityStats.averageQualityScore,
      },
    });
  } catch (error: any) {
    const status = error.message.includes("Forbidden") ? 403 : 401;
    return NextResponse.json(
      { success: false, error: error.message || "Unauthorized" },
      { status }
    );
  }
}
