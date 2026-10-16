"use client";

import { useState, useEffect } from "react";
import {
  FolderOpen,
  UploadCloud,
  Search,
  Filter,
  FileText,
  FileCode,
  Database,
  Image,
  Trash2,
  Download,
  Eye,
  History,
  MoreVertical,
  Plus,
  RotateCcw,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import {
  DmsFileItem,
  DmsCollectionItem,
  DmsFileVersionItem,
  FileType,
} from "@/lib/dms/types";
import {
  uploadFileAction,
  renameFileAction,
  moveFileAction,
  deleteFileAction,
  restoreFileAction,
  getFileVersionsAction,
  uploadNewFileVersionAction,
  getFilePreviewAction,
  createCollectionAction,
  deleteCollectionAction,
} from "@/app/actions/dms";

interface FilesViewProps {
  initialFiles: DmsFileItem[];
  initialCollections: DmsCollectionItem[];
}

export function FilesView({ initialFiles, initialCollections }: FilesViewProps) {
  const [files, setFiles] = useState<DmsFileItem[]>(initialFiles);
  const [collections, setCollections] = useState<DmsCollectionItem[]>(initialCollections);
  const [selectedCollection, setSelectedCollection] = useState<string | "ALL">("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showTrash, setShowTrash] = useState(false);

  // Modals state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [versionModalOpen, setVersionModalOpen] = useState(false);

  // Active items for modals
  const [activePreview, setActivePreview] = useState<{
    file: DmsFileItem;
    preview: string;
    isBinary: boolean;
  } | null>(null);

  const [activeVersionFile, setActiveVersionFile] = useState<DmsFileItem | null>(null);
  const [versions, setVersions] = useState<DmsFileVersionItem[]>([]);

  // Form states
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [newColName, setNewColName] = useState("");
  const [newColDesc, setNewColDesc] = useState("");
  const [newColColor, setNewColColor] = useState("#6C8CFF");

  // Inline rename state
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // Auto-open upload modal if ?action=upload is in URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("action") === "upload") {
        setUploadModalOpen(true);
      }
    }
  }, []);

  // Filtering
  const displayedFiles = files.filter((f) => {
    if (showTrash ? !f.isDeleted : f.isDeleted) return false;
    if (selectedCollection !== "ALL" && f.collectionId !== selectedCollection) return false;
    if (selectedType !== "ALL" && f.fileType !== selectedType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return f.name.toLowerCase().includes(q) || f.originalName.toLowerCase().includes(q);
    }
    return true;
  });

  // Handle File Upload
  const handleUploadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    setUploadError(null);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await uploadFileAction(formData);
      if (res.success && res.file) {
        setFiles([res.file, ...files]);
        setUploadModalOpen(false);
      }
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  // Handle Create Collection
  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;

    try {
      const res = await createCollectionAction(newColName, newColDesc, newColColor);
      if (res.success && res.collection) {
        setCollections([res.collection, ...collections]);
        setCollectionModalOpen(false);
        setNewColName("");
        setNewColDesc("");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handle Delete Collection
  const handleDeleteCollection = async (collectionId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete collection "${name}"? Contained files will become Uncategorized.`)) return;
    try {
      await deleteCollectionAction(collectionId);
      setCollections((prev) => prev.filter((c) => c.id !== collectionId));
      setFiles((prev) =>
        prev.map((f) =>
          f.collectionId === collectionId ? { ...f, collectionId: null, collectionName: null } : f
        )
      );
      if (selectedCollection === collectionId) setSelectedCollection("ALL");
    } catch (err: any) {
      alert("Failed to delete collection: " + err.message);
    }
  };

  // Handle Move File to Collection
  const handleMoveCollection = async (fileId: string, colId: string | null) => {
    try {
      const res = await moveFileAction(fileId, colId);
      if (res.success && res.file) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? { ...f, collectionId: res.file!.collectionId, collectionName: res.file!.collectionName }
              : f
          )
        );
        const oldFile = files.find((f) => f.id === fileId);
        setCollections((prev) =>
          prev.map((c) => {
            let count = c.fileCount;
            if (oldFile?.collectionId === c.id && colId !== c.id) count = Math.max(0, count - 1);
            if (colId === c.id && oldFile?.collectionId !== c.id) count += 1;
            return { ...c, fileCount: count };
          })
        );
      }
    } catch (err: any) {
      alert("Failed to move file: " + err.message);
    }
  };

  // Handle Preview
  const handleOpenPreview = async (file: DmsFileItem) => {
    try {
      const res = await getFilePreviewAction(file.id);
      setActivePreview({
        file: res.file,
        preview: res.preview,
        isBinary: res.isBinary,
      });
      setPreviewModalOpen(true);
    } catch (err: any) {
      alert("Failed to load preview: " + err.message);
    }
  };

  // Handle Version History
  const handleOpenVersions = async (file: DmsFileItem) => {
    setActiveVersionFile(file);
    try {
      const list = await getFileVersionsAction(file.id);
      setVersions(list);
      setVersionModalOpen(true);
    } catch (err: any) {
      alert("Failed to load versions: " + err.message);
    }
  };

  // Handle Rename
  const handleSaveRename = async (fileId: string) => {
    if (!renameValue.trim()) return;
    try {
      await renameFileAction(fileId, renameValue.trim());
      setFiles(
        files.map((f) => (f.id === fileId ? { ...f, name: renameValue.trim() } : f))
      );
      setRenamingId(null);
    } catch (err: any) {
      alert("Failed to rename: " + err.message);
    }
  };

  // Handle Soft Delete
  const handleDelete = async (fileId: string, permanent: boolean = false) => {
    if (permanent && !confirm("Are you sure you want to permanently delete this file?")) return;
    try {
      await deleteFileAction(fileId, permanent);
      if (permanent) {
        setFiles(files.filter((f) => f.id !== fileId));
      } else {
        setFiles(files.map((f) => (f.id === fileId ? { ...f, isDeleted: true } : f)));
      }
    } catch (err: any) {
      alert("Error deleting file: " + err.message);
    }
  };

  // Handle Restore
  const handleRestore = async (fileId: string) => {
    try {
      await restoreFileAction(fileId);
      setFiles(files.map((f) => (f.id === fileId ? { ...f, isDeleted: false } : f)));
    } catch (err: any) {
      alert("Error restoring file: " + err.message);
    }
  };

  // Handle New Version Upload
  const handleNewVersionSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activeVersionFile) return;

    const formData = new FormData(e.currentTarget);
    formData.set("fileId", activeVersionFile.id);

    try {
      const res = await uploadNewFileVersionAction(formData);
      if (res.success) {
        const updatedList = await getFileVersionsAction(activeVersionFile.id);
        setVersions(updatedList);
        setFiles(
          files.map((f) =>
            f.id === activeVersionFile.id ? { ...f, version: res.version } : f
          )
        );
        alert(`Successfully uploaded version v${res.version}`);
      }
    } catch (err: any) {
      alert("Version upload failed: " + err.message);
    }
  };

  const getFileIcon = (type: FileType) => {
    switch (type) {
      case "DOCUMENT":
        return <FileText className="w-4 h-4 text-[#6C8CFF]" />;
      case "DATASET":
        return <Database className="w-4 h-4 text-[#10B981]" />;
      case "CODE":
        return <FileCode className="w-4 h-4 text-[#F59E0B]" />;
      case "IMAGE":
        return <Image className="w-4 h-4 text-purple-400" />;
      default:
        return <FileText className="w-4 h-4 text-[#A7AFBB]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#292E36]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#F1F3F5]">Educational Files & Documents</h1>
          <p className="text-xs text-[#A7AFBB] mt-0.5">
            Manage course materials, heuristic notes, benchmark datasets, and version history.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCollectionModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181C22] border border-[#292E36] text-xs font-medium text-[#F1F3F5] hover:bg-[#1F242D] transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[#6C8CFF]" />
            New Collection
          </button>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6C8CFF] text-white text-xs font-medium hover:bg-[#5A7BEF] transition-colors shadow-sm"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            Upload File
          </button>
        </div>
      </div>

      {/* Collections Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <button
          onClick={() => setSelectedCollection("ALL")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors ${
            selectedCollection === "ALL"
              ? "bg-[#6C8CFF] text-white"
              : "bg-[#181C22] text-[#A7AFBB] hover:text-[#F1F3F5] border border-[#292E36]"
          }`}
        >
          All Collections ({files.filter((f) => !f.isDeleted).length})
        </button>
        {collections.map((col) => (
          <div key={col.id} className="relative group shrink-0 flex items-center">
            <button
              onClick={() => setSelectedCollection(col.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 flex items-center gap-1.5 transition-colors pr-6 ${
                selectedCollection === col.id
                  ? "bg-[#6C8CFF] text-white"
                  : "bg-[#181C22] text-[#A7AFBB] hover:text-[#F1F3F5] border border-[#292E36]"
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }}></span>
              <span>{col.name}</span>
              <span className="text-[10px] opacity-70 font-mono">({col.fileCount})</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteCollection(col.id, col.name);
              }}
              title={`Delete collection "${col.name}"`}
              className="absolute right-1 text-[#717885] hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Search & Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#181C22] p-3 rounded-lg border border-[#292E36]">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#717885]" />
          <input
            type="text"
            placeholder="Search by file name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111418] text-xs text-[#F1F3F5] pl-8 pr-3 py-1.5 rounded-md border border-[#292E36] focus:border-[#6C8CFF] outline-none"
          />
        </div>

        {/* Filter dropdowns & Trash toggle */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            aria-label="Filter by file type"
            className="bg-[#111418] text-xs text-[#F1F3F5] px-2.5 py-1.5 rounded-md border border-[#292E36] outline-none focus:border-[#6C8CFF]"
          >
            <option value="ALL">All File Types</option>
            <option value="DOCUMENT">Documents (.pdf, .md, .txt)</option>
            <option value="DATASET">Datasets (.csv, .json)</option>
            <option value="CODE">Code (.py, .ts, .cpp)</option>
            <option value="IMAGE">Images</option>
          </select>

          <button
            onClick={() => setShowTrash(!showTrash)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              showTrash
                ? "bg-red-500/20 text-red-300 border-red-500/40"
                : "bg-[#111418] text-[#A7AFBB] border-[#292E36] hover:text-[#F1F3F5]"
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            {showTrash ? "Viewing Trash" : "Trash"}
          </button>
        </div>
      </div>

      {/* Files Table */}
      <div className="rounded-xl border border-[#292E36] bg-[#181C22] overflow-hidden">
        {displayedFiles.length === 0 ? (
          <div className="p-12 text-center">
            <FolderOpen className="w-10 h-10 text-[#717885] mx-auto mb-3 opacity-40" />
            <h3 className="text-sm font-semibold text-[#F1F3F5]">No files found</h3>
            <p className="text-xs text-[#717885] mt-1">
              {showTrash
                ? "Trash is empty."
                : "No files match your filter criteria or no documents have been uploaded."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#111418] text-[#717885] uppercase tracking-wider text-[10px] border-b border-[#292E36]">
                <tr>
                  <th className="py-3 px-4 font-medium">Name</th>
                  <th className="py-3 px-4 font-medium">Collection</th>
                  <th className="py-3 px-4 font-medium">Type</th>
                  <th className="py-3 px-4 font-medium">Size</th>
                  <th className="py-3 px-4 font-medium">Version</th>
                  <th className="py-3 px-4 font-medium">Uploaded By</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#292E36]/60">
                {displayedFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-[#1F242D]/50 transition-colors">
                    {/* Name column with inline edit */}
                    <td className="py-3 px-4 font-medium text-[#F1F3F5]">
                      <div className="flex items-center gap-2.5">
                        <div className="shrink-0">{getFileIcon(file.fileType)}</div>
                        {renamingId === file.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              className="bg-[#111418] text-xs text-[#F1F3F5] px-2 py-0.5 rounded border border-[#6C8CFF] outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveRename(file.id)}
                              className="p-1 text-emerald-400 hover:text-emerald-300"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setRenamingId(null)}
                              className="p-1 text-[#717885] hover:text-[#F1F3F5]"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span
                            onClick={() => handleOpenPreview(file)}
                            className="cursor-pointer hover:text-[#6C8CFF] transition-colors truncate max-w-[220px]"
                            title={file.name}
                          >
                            {file.name}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Collection */}
                    <td className="py-3 px-4 text-[#A7AFBB]">
                      <select
                        value={file.collectionId || ""}
                        onChange={(e) => handleMoveCollection(file.id, e.target.value || null)}
                        disabled={file.isDeleted}
                        aria-label={`Collection for ${file.name}`}
                        className="bg-[#111418] text-[#A7AFBB] hover:text-[#F1F3F5] text-[11px] px-2 py-0.5 rounded-md border border-[#292E36] focus:border-[#6C8CFF] outline-none max-w-[150px] truncate cursor-pointer disabled:opacity-40"
                      >
                        <option value="">Uncategorized</option>
                        {collections.map((col) => (
                          <option key={col.id} value={col.id}>
                            {col.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* File Type */}
                    <td className="py-3 px-4">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#111418] border border-[#292E36] text-[#A7AFBB]">
                        {file.fileType}
                      </span>
                    </td>

                    {/* Size */}
                    <td className="py-3 px-4 text-[#A7AFBB] font-mono text-[11px]">
                      {(file.sizeBytes / 1024).toFixed(1)} KB
                    </td>

                    {/* Version */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleOpenVersions(file)}
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-[#6C8CFF] hover:underline"
                      >
                        <History className="w-3 h-3" /> v{file.version}
                      </button>
                    </td>

                    {/* Uploaded By */}
                    <td className="py-3 px-4 text-[#717885] text-[11px]">{file.userName || "System"}</td>

                    {/* Row Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!file.isDeleted ? (
                          <>
                            <button
                              onClick={() => handleOpenPreview(file)}
                              title="Preview"
                              className="p-1 rounded text-[#A7AFBB] hover:bg-[#111418] hover:text-[#6C8CFF]"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href={`/api/dms/files/${file.id}/download`}
                              title="Download"
                              className="p-1 rounded text-[#A7AFBB] hover:bg-[#111418] hover:text-emerald-400"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() => {
                                setRenamingId(file.id);
                                setRenameValue(file.name);
                              }}
                              title="Rename"
                              className="p-1 rounded text-[#A7AFBB] hover:bg-[#111418] hover:text-[#F1F3F5] text-[11px] font-mono"
                            >
                              Rename
                            </button>
                            <button
                              onClick={() => handleDelete(file.id, false)}
                              title="Move to Trash"
                              className="p-1 rounded text-[#A7AFBB] hover:bg-[#111418] hover:text-red-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleRestore(file.id)}
                              title="Restore File"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                            >
                              <RotateCcw className="w-3 h-3" /> Restore
                            </button>
                            <button
                              onClick={() => handleDelete(file.id, true)}
                              title="Permanent Delete"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-red-500/10 text-red-400 hover:bg-red-500/20"
                            >
                              <Trash2 className="w-3 h-3" /> Purge
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* MODAL 1: Upload File                       */}
      {/* ========================================== */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#181C22] border border-[#292E36] rounded-xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#292E36]">
              <h3 className="text-sm font-semibold text-[#F1F3F5] flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-[#6C8CFF]" /> Upload Educational File
              </h3>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-[#717885] hover:text-[#F1F3F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#A7AFBB] mb-1">
                  Target Collection (Optional)
                </label>
                <select
                  name="collectionId"
                  className="w-full bg-[#111418] text-xs text-[#F1F3F5] px-3 py-2 rounded-lg border border-[#292E36] outline-none focus:border-[#6C8CFF]"
                >
                  <option value="">None (Uncategorized)</option>
                  {collections.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A7AFBB] mb-1">Select File</label>
                <input
                  type="file"
                  name="file"
                  required
                  className="w-full text-xs text-[#A7AFBB] file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#6C8CFF]/20 file:text-[#6C8CFF] hover:file:bg-[#6C8CFF]/30 cursor-pointer bg-[#111418] rounded-lg p-2 border border-[#292E36]"
                />
                <p className="text-[10px] text-[#717885] mt-1">
                  Supported formats: PDF, Markdown, CSV, JSON, Python, Code, Images (max 50MB).
                </p>
              </div>

              {uploadError && (
                <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#A7AFBB] hover:bg-[#111418]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-1.5 rounded-lg bg-[#6C8CFF] text-white text-xs font-medium hover:bg-[#5A7BEF] disabled:opacity-50 transition-colors"
                >
                  {uploading ? "Uploading..." : "Upload File"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 2: Create Collection                 */}
      {/* ========================================== */}
      {collectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#181C22] border border-[#292E36] rounded-xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#292E36]">
              <h3 className="text-sm font-semibold text-[#F1F3F5]">New Collection Folder</h3>
              <button
                onClick={() => setCollectionModalOpen(false)}
                className="text-[#717885] hover:text-[#F1F3F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCollection} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#A7AFBB] mb-1">Collection Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Heuristic Benchmarks"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  className="w-full bg-[#111418] text-xs text-[#F1F3F5] px-3 py-2 rounded-lg border border-[#292E36] outline-none focus:border-[#6C8CFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A7AFBB] mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Brief summary of included materials..."
                  value={newColDesc}
                  onChange={(e) => setNewColDesc(e.target.value)}
                  className="w-full bg-[#111418] text-xs text-[#F1F3F5] px-3 py-2 rounded-lg border border-[#292E36] outline-none focus:border-[#6C8CFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A7AFBB] mb-1">Color Tag</label>
                <div className="flex items-center gap-2">
                  {["#6C8CFF", "#10B981", "#F59E0B", "#EC4899", "#8B5CF6"].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewColColor(color)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        newColColor === color ? "border-white scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setCollectionModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#A7AFBB] hover:bg-[#111418]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#6C8CFF] text-white text-xs font-medium hover:bg-[#5A7BEF] transition-colors"
                >
                  Create Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 3: File Preview Drawer               */}
      {/* ========================================== */}
      {previewModalOpen && activePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-[#181C22] border border-[#292E36] rounded-xl p-5 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#292E36]">
              <div>
                <h3 className="text-sm font-semibold text-[#F1F3F5] flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#6C8CFF]" />
                  {activePreview.file.name}
                </h3>
                <span className="text-[11px] text-[#717885] font-mono">
                  {activePreview.file.mimeType} • {(activePreview.file.sizeBytes / 1024).toFixed(1)} KB • v{activePreview.file.version}
                </span>
              </div>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="text-[#717885] hover:text-[#F1F3F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto mt-4 p-4 bg-[#111418] rounded-lg border border-[#292E36]">
              <pre className="text-xs text-[#A7AFBB] font-mono whitespace-pre-wrap leading-relaxed">
                {activePreview.preview}
              </pre>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#292E36] mt-4">
              <span className="text-[11px] text-[#717885]">
                Uploaded by {activePreview.file.userName} on{" "}
                {new Date(activePreview.file.createdAt).toLocaleDateString()}
              </span>
              <a
                href={`/api/dms/files/${activePreview.file.id}/download`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6C8CFF] text-white text-xs font-medium hover:bg-[#5A7BEF]"
              >
                <Download className="w-3.5 h-3.5" /> Download Original
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 4: Version History & Upload Version  */}
      {/* ========================================== */}
      {versionModalOpen && activeVersionFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#181C22] border border-[#292E36] rounded-xl p-5 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#292E36]">
              <div>
                <h3 className="text-sm font-semibold text-[#F1F3F5] flex items-center gap-2">
                  <History className="w-4 h-4 text-[#6C8CFF]" />
                  Version History: {activeVersionFile.name}
                </h3>
                <span className="text-[11px] text-[#717885]">Current Version: v{activeVersionFile.version}</span>
              </div>
              <button
                onClick={() => setVersionModalOpen(false)}
                className="text-[#717885] hover:text-[#F1F3F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List of Versions */}
            <div className="flex-1 overflow-y-auto my-4 space-y-2 pr-1">
              {versions.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#717885]">
                  No past version archives recorded. Current file is baseline v1.
                </div>
              ) : (
                versions.map((ver) => (
                  <div
                    key={ver.id}
                    className="p-3 rounded-lg bg-[#111418] border border-[#292E36] flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#6C8CFF]">v{ver.version}</span>
                        <span className="text-xs text-[#F1F3F5] font-medium">{ver.changeSummary || "Update"}</span>
                      </div>
                      <span className="text-[10px] text-[#717885] font-mono">
                        {(ver.sizeBytes / 1024).toFixed(1)} KB • {new Date(ver.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Upload New Version Form */}
            <form onSubmit={handleNewVersionSubmit} className="pt-3 border-t border-[#292E36] space-y-3">
              <h4 className="text-xs font-semibold text-[#F1F3F5]">Upload Revision (v{activeVersionFile.version + 1})</h4>
              <input
                type="text"
                name="changeSummary"
                placeholder="Change summary (e.g. Added section on A* admissibility)..."
                required
                className="w-full bg-[#111418] text-xs text-[#F1F3F5] px-3 py-1.5 rounded-lg border border-[#292E36] outline-none focus:border-[#6C8CFF]"
              />
              <input
                type="file"
                name="file"
                required
                className="w-full text-xs text-[#A7AFBB] file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-[#6C8CFF]/20 file:text-[#6C8CFF] bg-[#111418] rounded-lg p-1 border border-[#292E36]"
              />
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-[#6C8CFF] text-white text-xs font-medium hover:bg-[#5A7BEF]"
                >
                  Commit New Version
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
