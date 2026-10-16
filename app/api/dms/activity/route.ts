import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/dms/auth";
import { dmsStore } from "@/lib/dms/store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isSecurityAudit = searchParams.get("isSecurityAudit") === "true";
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    if (isSecurityAudit) {
      await requireAdmin();
    } else {
      await requireAuth();
    }

    const activities = dmsStore.getActivities({
      isSecurityAudit: isSecurityAudit ? true : undefined,
      limit,
    });

    return NextResponse.json({
      success: true,
      count: activities.length,
      activities,
    });
  } catch (error: any) {
    const status = error.message.includes("Forbidden") ? 403 : 401;
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch activities" },
      { status }
    );
  }
}
