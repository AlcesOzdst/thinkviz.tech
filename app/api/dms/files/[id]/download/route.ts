import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/dms/auth";
import { dmsStore } from "@/lib/dms/store";
import { readStorageFile } from "@/lib/dms/fileStorage";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
  } catch {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const file = dmsStore.getFileById(id);

  if (!file || file.isDeleted) {
    return new NextResponse("File not found", { status: 404 });
  }

  try {
    const buffer = await readStorageFile(file.storagePath);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": file.mimeType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(file.originalName)}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (err: any) {
    // If physical file not present (e.g. initial demo file), return structured text representation
    const fallbackText = `ThinkViz DMS Content Export\nFile: ${file.name}\nType: ${file.fileType}\nUploaded by: ${file.userName}\nCreated: ${file.createdAt}\n\n[Sample file payload preserved by ThinkViz Data Management System]`;
    return new NextResponse(fallbackText, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(file.name)}.txt"`,
      },
    });
  }
}
