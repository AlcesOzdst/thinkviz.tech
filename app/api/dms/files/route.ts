import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/dms/auth";
import { dmsStore } from "@/lib/dms/store";
import { saveFileToStorage, detectFileType } from "@/lib/dms/fileStorage";

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const collectionId = searchParams.get("collectionId") || undefined;
    const fileType = searchParams.get("fileType") || undefined;
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    const files = dmsStore.getFiles({
      search,
      collectionId,
      fileType,
      includeDeleted,
    });

    return NextResponse.json({
      success: true,
      total: files.length,
      files,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch files" },
      { status: 401 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const collectionId = (formData.get("collectionId") as string) || undefined;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided in form-data payload" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileType = detectFileType(file.name, file.type);
    const { storagePath, sizeBytes } = await saveFileToStorage(file.name, buffer);

    let collectionName: string | null = null;
    if (collectionId) {
      const col = dmsStore.getCollections().find((c) => c.id === collectionId);
      if (col) collectionName = col.name;
    }

    const newFile = dmsStore.addFile({
      name: file.name,
      originalName: file.name,
      mimeType: file.type || "application/octet-stream",
      sizeBytes,
      storagePath,
      fileType,
      status: "INDEXED",
      version: 1,
      isDeleted: false,
      userId: user.id,
      userName: user.name,
      collectionId: collectionId || null,
      collectionName,
    });

    dmsStore.logActivity({
      action: "UPLOAD",
      resourceType: "FILE",
      resourceId: newFile.id,
      resourceName: newFile.name,
      userId: user.id,
      userName: user.name,
      details: `API upload of ${(sizeBytes / 1024).toFixed(1)} KB file`,
      isSecurityAudit: false,
    });

    return NextResponse.json(
      { success: true, file: newFile },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Upload failed" },
      { status: 400 }
    );
  }
}
