import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/dms/auth";
import { dmsStore } from "@/lib/dms/store";

export async function GET() {
  try {
    await requireAuth();
    const analytics = dmsStore.getAnalytics();
    return NextResponse.json({ success: true, analytics });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch analytics" },
      { status: 401 }
    );
  }
}
