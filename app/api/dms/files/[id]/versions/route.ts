import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/dms/auth";
import { dmsStore } from "@/lib/dms/store";
import { saveFileToStorage } from "@/lib/dms/fileStorage";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const versions = dmsStore.getFileVersions(id);
    return NextResponse.json({ success: true, count: versions.length, versions });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch versions" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const file = dmsStore.getFileById(id);

    if (!file) {
      return NextResponse.json({ success: false, error: "Master file not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const uploadedFile = formData.get("file") as File | null;
    const changeSummary = (formData.get("changeSummary") as string) || "Version revision";

    if (!uploadedFile) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await uploadedFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const { storagePath, sizeBytes } = await saveFileToStorage(uploadedFile.name, buffer);

    const nextVer = file.version + 1;

    const versionItem = dmsStore.addFileVersion({
      fileId: id,
      version: nextVer,
      sizeBytes,
      storagePath,
      changeSummary,
      createdBy: user.name,
    });

    dmsStore.updateFile(id, {
      version: nextVer,
      sizeBytes,
      storagePath,
    });

    dmsStore.logActivity({
      action: "VERSION_CREATE",
      resourceType: "FILE",
      resourceId: id,
      resourceName: file.name,
      userId: user.id,
      userName: user.name,
      details: `Created version v${nextVer}: ${changeSummary}`,
      isSecurityAudit: false,
    });

    return NextResponse.json({ success: true, version: versionItem }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to commit version" },
      { status: 400 }
    );
  }
}
