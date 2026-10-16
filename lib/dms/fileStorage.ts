import fs from "fs";
import path from "path";
import crypto from "crypto";
import { FileType } from "./types";

const STORAGE_ROOT = path.join(process.cwd(), ".data", "storage", "files");
export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_ROOT)) {
  fs.mkdirSync(STORAGE_ROOT, { recursive: true });
}

export function detectFileType(fileName: string, mimeType: string): FileType {
  const ext = path.extname(fileName).toLowerCase();
  if ([".csv", ".tsv", ".json", ".parquet", ".xlsx"].includes(ext)) {
    return "DATASET";
  }
  if ([".pdf", ".docx", ".doc", ".txt", ".md", ".rtf", ".odt"].includes(ext)) {
    return "DOCUMENT";
  }
  if ([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"].includes(ext)) {
    return "IMAGE";
  }
  if ([".py", ".ts", ".tsx", ".js", ".jsx", ".cpp", ".java", ".html", ".css", ".sql"].includes(ext)) {
    return "CODE";
  }
  return "OTHER";
}

export async function saveFileToStorage(
  fileName: string,
  buffer: Buffer
): Promise<{ storagePath: string; sizeBytes: number; hash: string }> {
  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File exceeds maximum allowed size of 50MB (${(buffer.length / (1024 * 1024)).toFixed(1)}MB)`);
  }

  const hash = crypto.createHash("sha256").update(buffer).digest("hex");
  const ext = path.extname(fileName);
  const safeName = `${hash.slice(0, 16)}_${Date.now()}${ext}`;
  const absolutePath = path.join(STORAGE_ROOT, safeName);

  await fs.promises.writeFile(absolutePath, buffer);

  return {
    storagePath: safeName,
    sizeBytes: buffer.length,
    hash,
  };
}

export async function readStorageFile(storagePath: string): Promise<Buffer> {
  // Prevent directory traversal
  const safePath = path.normalize(storagePath).replace(/^(\.\.[\/\\])+/, "");
  const fullPath = path.join(STORAGE_ROOT, safePath);

  if (!fs.existsSync(fullPath)) {
    throw new Error("File not found in physical storage");
  }

  return await fs.promises.readFile(fullPath);
}

export async function deleteStorageFile(storagePath: string): Promise<void> {
  const safePath = path.normalize(storagePath).replace(/^(\.\.[\/\\])+/, "");
  const fullPath = path.join(STORAGE_ROOT, safePath);
  if (fs.existsSync(fullPath)) {
    await fs.promises.unlink(fullPath);
  }
}

export function generateTextPreview(buffer: Buffer, mimeType: string, fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  if ([".txt", ".md", ".csv", ".json", ".ts", ".js", ".py", ".sql", ".html"].includes(ext)) {
    return buffer.toString("utf-8").slice(0, 1500);
  }
  return `[Binary file preview not available for ${ext || mimeType}]`;
}
