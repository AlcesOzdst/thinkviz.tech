import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/dms/auth";
import { dmsStore } from "@/lib/dms/store";
import { readStorageFile, generateTextPreview } from "@/lib/dms/fileStorage";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const file = dmsStore.getFileById(id);

    if (!file) {
      return NextResponse.json({ success: false, error: "File not found" }, { status: 404 });
    }

    let preview = "";
    try {
      const buffer = await readStorageFile(file.storagePath);
      preview = generateTextPreview(buffer, file.mimeType, file.name);
    } catch {
      preview = `[Preview not available]`;
    }

    return NextResponse.json({
      success: true,
      file,
      preview,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve file" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await req.json();

    const existing = dmsStore.getFileById(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "File not found" }, { status: 404 });
    }

    const updates: any = {};
    if (body.name) updates.name = body.name;
    if (body.collectionId !== undefined) {
      updates.collectionId = body.collectionId || null;
      if (body.collectionId) {
        const col = dmsStore.getCollections().find((c) => c.id === body.collectionId);
        updates.collectionName = col ? col.name : null;
      } else {
        updates.collectionName = null;
      }
    }

    const updated = dmsStore.updateFile(id, updates);

    dmsStore.logActivity({
      action: "UPDATE",
      resourceType: "FILE",
      resourceId: id,
      resourceName: updated?.name || existing.name,
      userId: user.id,
      userName: user.name,
      details: body.name ? `Renamed to ${body.name}` : `Updated collection assignment`,
      isSecurityAudit: false,
    });

    return NextResponse.json({ success: true, file: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Update failed" },
      { status: 400 }
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
    const { searchParams } = new URL(req.url);
    const permanent = searchParams.get("permanent") === "true";

    const file = dmsStore.getFileById(id);
    if (!file) {
      return NextResponse.json({ success: false, error: "File not found" }, { status: 404 });
    }

    dmsStore.deleteFile(id, !permanent);

    dmsStore.logActivity({
      action: "DELETE",
      resourceType: "FILE",
      resourceId: id,
      resourceName: file.name,
      userId: user.id,
      userName: user.name,
      details: permanent ? "Permanent file deletion" : "Soft deletion moved to trash",
      isSecurityAudit: permanent,
    });

    return NextResponse.json({
      success: true,
      message: permanent ? "File permanently purged" : "File moved to trash",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Deletion failed" },
      { status: 500 }
    );
  }
}
