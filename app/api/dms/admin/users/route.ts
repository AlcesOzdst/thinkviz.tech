import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/dms/auth";
import { dmsStore } from "@/lib/dms/store";

export async function GET() {
  try {
    await requireAdmin();
    const users = dmsStore.getUsers();
    return NextResponse.json({ success: true, count: users.length, users });
  } catch (error: any) {
    const status = error.message.includes("Forbidden") ? 403 : 401;
    return NextResponse.json(
      { success: false, error: error.message || "Unauthorized" },
      { status }
    );
  }
}
