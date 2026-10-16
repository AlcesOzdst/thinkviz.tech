import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/dms/auth";
import { dmsStore } from "@/lib/dms/store";

export async function GET() {
  try {
    await requireAuth();
    const collections = dmsStore.getCollections();
    return NextResponse.json({ success: true, count: collections.length, collections });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch collections" },
      { status: 401 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ success: false, error: "Collection name is required" }, { status: 400 });
    }

    const col = dmsStore.addCollection({
      name: body.name.trim(),
      description: body.description || "",
      color: body.color || "#6C8CFF",
      icon: body.icon || "Folder",
      userId: user.id,
      isPrivate: body.isPrivate || false,
    });

    dmsStore.logActivity({
      action: "CREATE",
      resourceType: "COLLECTION",
      resourceId: col.id,
      resourceName: col.name,
      userId: user.id,
      userName: user.name,
      details: `Created collection "${col.name}" via API`,
      isSecurityAudit: false,
    });

    return NextResponse.json({ success: true, collection: col }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create collection" },
      { status: 400 }
    );
  }
}
