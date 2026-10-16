import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/dms/auth";
import { dmsStore } from "@/lib/dms/store";
import { UserRole } from "@/lib/dms/types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = await req.json();

    if (!body.role || !["ADMIN", "EDUCATOR", "STUDENT", "RESEARCHER"].includes(body.role)) {
      return NextResponse.json(
        { success: false, error: "Valid role (ADMIN, EDUCATOR, STUDENT, RESEARCHER) is required" },
        { status: 400 }
      );
    }

    const success = dmsStore.updateUserRole(id, body.role as UserRole);
    if (!success) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    dmsStore.logActivity({
      action: "ROLE_CHANGE",
      resourceType: "USER",
      resourceId: id,
      resourceName: id,
      userId: admin.id,
      userName: admin.name,
      details: `Admin changed role of user ${id} to ${body.role}`,
      isSecurityAudit: true,
    });

    return NextResponse.json({ success: true, message: `Role updated to ${body.role}` });
  } catch (error: any) {
    const status = error.message.includes("Forbidden") ? 403 : 401;
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update user role" },
      { status }
    );
  }
}
