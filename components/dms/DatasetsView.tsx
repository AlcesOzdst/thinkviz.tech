"use client";

import { useState, useEffect } from "react";
import {
  Database,
  Plus,
  Search,
  Download,
  Trash2,
  Table,
  ShieldCheck,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  FileText,
  CheckCircle2,
  X,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { DmsDatasetItem, DmsDatasetRecordItem, SchemaColumn } from "@/lib/dms/types";
import {
  createDatasetAction,
  deleteDatasetAction,
  getDatasetDetailsAction,
  exportDatasetAction,
  addDatasetRecordAction,
  deleteDatasetRecordAction,
} from "@/app/actions/dms";

interface DatasetsViewProps {
  initialDatasets: DmsDatasetItem[];
  initialRecords?: DmsDatasetRecordItem[];
  initialTotal?: number;
}

export function DatasetsView({
  initialDatasets,
  initialRecords = [],
  initialTotal = 0,
}: DatasetsViewProps) {
  const [datasets, setDatasets] = useState<DmsDatasetItem[]>(initialDatasets);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(
    initialDatasets.length > 0 ? initialDatasets[0].id : null
  );

  // Active dataset records & view state
  const [records, setRecords] = useState<DmsDatasetRecordItem[]>(initialRecords);
  const [totalRecords, setTotalRecords] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [recordSearch, setRecordSearch] = useState("");

  // Modals state
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Add Record Modal state
  const [addRecordModalOpen, setAddRecordModalOpen] = useState(false);
  const [newRecordValues, setNewRecordValues] = useState<Record<string, string>>({});
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [addRecordError, setAddRecordError] = useState<string | null>(null);
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);

  // Import form state
  const [datasetName, setDatasetName] = useState("");
  const [datasetDesc, setDatasetDesc] = useState("");
  const [datasetCategory, setDatasetCategory] = useState("Heuristic Benchmarks");
  const [datasetFormat, setDatasetFormat] = useState<"csv" | "json">("csv");
  const [rawContent, setRawContent] = useState("");

  // Active dataset item
  const activeDataset = datasets.find((d) => d.id === selectedDatasetId);

  // Load records when selected dataset or page changes
  const loadRecords = async (dsId: string, pageNum: number) => {
    try {
      setLoadingRecords(true);
      const res = await getDatasetDetailsAction(dsId, pageSize, (pageNum - 1) * pageSize);
      setRecords(res.records);
      setTotalRecords(res.total);
    } catch (err: any) {
      console.error("Failed to load records", err);
    } finally {
      setLoadingRecords(false);
    }
  };

  // Select dataset
  const handleSelectDataset = (id: string) => {
    setSelectedDatasetId(id);
    setPage(1);
    setRecordSearch("");
    loadRecords(id, 1);
  };

  // Handle Import Submit
  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawContent.trim()) {
      setImportError("Please provide CSV or JSON content.");
      return;
    }

    try {
      setImporting(true);
      setImportError(null);

      const res = await createDatasetAction({
        name: datasetName,
        description: datasetDesc,
        category: datasetCategory,
        rawContent,
        format: datasetFormat,
      });

      if (res.success && res.dataset) {
        setDatasets([res.dataset, ...datasets]);
        setSelectedDatasetId(res.dataset.id);
        setImportModalOpen(false);
        setDatasetName("");
        setDatasetDesc("");
        setRawContent("");
        loadRecords(res.dataset.id, 1);
      }
    } catch (err: any) {
      setImportError(err.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  // Handle File read for import form
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!datasetName) {
      setDatasetName(file.name.replace(/\.[^/.]+$/, ""));
    }

    const isJson = file.name.endsWith(".json");
    setDatasetFormat(isJson ? "json" : "csv");

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRawContent(text);
    };
    reader.readAsText(file);
  };

  // Handle Export
  const handleExport = async (format: "csv" | "json") => {
    if (!activeDataset) return;
    try {
      const res = await exportDatasetAction(activeDataset.id, format);
      const blob = new Blob([res.content], { type: res.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert("Export failed: " + err.message);
    }
  };

  // Handle Delete
  const handleDeleteDataset = async (id: string) => {
    if (!confirm("Are you sure you want to delete this dataset?")) return;
    try {
      await deleteDatasetAction(id);
      const remaining = datasets.filter((d) => d.id !== id);
      setDatasets(remaining);
      if (remaining.length > 0) {
        handleSelectDataset(remaining[0].id);
      } else {
        setSelectedDatasetId(null);
        setRecords([]);
      }
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    }
  };

  // Handle Add Record Open
  const handleOpenAddRecord = () => {
    if (!activeDataset) return;
    const initialVals: Record<string, string> = {};
    columns.forEach((col) => {
      initialVals[col.name] = "";
    });
    setNewRecordValues(initialVals);
    setAddRecordError(null);
    setAddRecordModalOpen(true);
  };

  // Handle Add Record Submit
  const handleAddRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDataset) return;
    try {
      setIsAddingRecord(true);
      setAddRecordError(null);

      const parsedData: Record<string, any> = {};
      for (const col of columns) {
        const raw = newRecordValues[col.name];
        if (raw === undefined || raw === "" || raw === null) {
          if (!col.nullable) {
            throw new Error(`Column "${col.name}" is required.`);
          }
          parsedData[col.name] = null;
        } else if (col.type === "number") {
          const num = Number(raw);
          if (isNaN(num)) throw new Error(`Column "${col.name}" must be a valid number.`);
          parsedData[col.name] = num;
        } else if (col.type === "boolean") {
          parsedData[col.name] = raw.toLowerCase() === "true" || raw === "1";
        } else {
          parsedData[col.name] = raw;
        }
      }

      const res = await addDatasetRecordAction(activeDataset.id, parsedData);
      if (res.success && res.record) {
        setRecords([res.record, ...records]);
        setTotalRecords((prev) => prev + 1);
        setDatasets((prev) =>
          prev.map((d) => (d.id === activeDataset.id ? { ...d, rowCount: d.rowCount + 1 } : d))
        );
        setAddRecordModalOpen(false);
      }
    } catch (err: any) {
      setAddRecordError(err.message || "Failed to add record");
    } finally {
      setIsAddingRecord(false);
    }
  };

  // Handle Delete Record Row
  const handleDeleteRecord = async (recordId: string) => {
    if (!activeDataset) return;
    if (!confirm("Are you sure you want to delete this row?")) return;
    try {
      setDeletingRecordId(recordId);
      await deleteDatasetRecordAction(activeDataset.id, recordId);
      setRecords((prev) => prev.filter((r) => r.id !== recordId));
      setTotalRecords((prev) => Math.max(0, prev - 1));
      setDatasets((prev) =>
        prev.map((d) => (d.id === activeDataset.id ? { ...d, rowCount: Math.max(0, d.rowCount - 1) } : d))
      );
    } catch (err: any) {
      alert("Failed to delete record: " + err.message);
    } finally {
      setDeletingRecordId(null);
    }
  };

  // Filtered records by client-side search
  const filteredRecords = records.filter((rec) => {
    if (!recordSearch.trim()) return true;
    const q = recordSearch.toLowerCase();
    return Object.values(rec.data).some((val) =>
      String(val).toLowerCase().includes(q)
    );
  });

  const columns = activeDataset ? activeDataset.schemaDefinition || activeDataset.schema || [] : [];
  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#292E36]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#F1F3F5]">Structured Datasets & Benchmarks</h1>
          <p className="text-xs text-[#A7AFBB] mt-0.5">
            Create, validate, inspect, and export heuristic test matrices, A* benchmark grids, and problem records.
          </p>
        </div>
        <button
          onClick={() => setImportModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#10B981] text-white text-xs font-medium hover:bg-[#0EA271] transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Import Dataset (CSV/JSON)
        </button>
      </div>

      {/* Main Grid: Datasets Explorer + Record Table View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Datasets List */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-xs font-semibold uppercase text-[#717885] tracking-wider px-1">
            Datasets ({datasets.length})
          </h2>
          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
            {datasets.map((ds) => {
              const isSelected = ds.id === selectedDatasetId;
              return (
                <div
                  key={ds.id}
                  onClick={() => handleSelectDataset(ds.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#6C8CFF]/15 border-[#6C8CFF]/50 shadow-md"
                      : "bg-[#181C22] border-[#292E36] hover:border-[#6C8CFF]/30 hover:bg-[#1C2027]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 mb-1.5">
                    <h3 className="text-xs font-semibold text-[#F1F3F5] truncate max-w-[170px]" title={ds.name}>
                      {ds.name}
                    </h3>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#111418] border border-[#292E36] text-[#A7AFBB]">
                      {ds.format}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#717885] line-clamp-1">{ds.description || "No description provided."}</p>

                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#292E36]/60 text-[10px]">
                    <span className="text-[#A7AFBB] font-mono">{ds.rowCount} records</span>
                    <span
                      className={`font-mono font-medium ${
                        ds.dataQualityScore >= 90 ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      {ds.dataQualityScore}% Quality
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Dataset Details, Records Table & Quality Report */}
        <div className="lg:col-span-3 space-y-5">
          {activeDataset ? (
            <>
              {/* Dataset Meta Banner */}
              <div className="p-4 rounded-xl bg-[#181C22] border border-[#292E36] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                      {activeDataset.category}
                    </span>
                    <span className="text-xs text-[#717885]">•</span>
                    <span className="text-xs text-[#717885]">Format: {activeDataset.format}</span>
                  </div>
                  <h2 className="text-base font-bold text-[#F1F3F5] mt-1">{activeDataset.name}</h2>
                  <p className="text-xs text-[#A7AFBB] mt-0.5">{activeDataset.description}</p>
                </div>

                {/* Actions & Export */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleOpenAddRecord}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6C8CFF] text-white text-xs font-medium hover:bg-[#5A7BEF] transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Record
                  </button>
                  <button
                    onClick={() => handleExport("csv")}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#111418] border border-[#292E36] text-xs font-medium text-[#F1F3F5] hover:bg-[#1F242D]"
                  >
                    <Download className="w-3 h-3 text-[#10B981]" /> Export CSV
                  </button>
                  <button
                    onClick={() => handleExport("json")}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#111418] border border-[#292E36] text-xs font-medium text-[#F1F3F5] hover:bg-[#1F242D]"
                  >
                    <Download className="w-3 h-3 text-[#6C8CFF]" /> Export JSON
                  </button>
                  <button
                    onClick={() => handleDeleteDataset(activeDataset.id)}
                    className="p-1.5 rounded-lg bg-[#111418] border border-[#292E36] text-red-400 hover:bg-red-500/10 hover:border-red-500/30"
                    title="Delete Dataset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Data Quality Indicator Card */}
              <div className="p-3.5 rounded-xl bg-[#111418] border border-[#292E36] flex items-center justify-between flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-[#F1F3F5]">Automated Data Quality Audit</span>
                    <p className="text-[11px] text-[#717885]">
                      Evaluated for schema conformity, null fields, and row-level duplicates.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="text-right">
                    <span className="text-[#717885] block text-[10px]">Score</span>
                    <span className="text-emerald-400 font-bold">{activeDataset.dataQualityScore}%</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#717885] block text-[10px]">Columns</span>
                    <span className="text-[#F1F3F5]">{columns.length}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#717885] block text-[10px]">Total Records</span>
                    <span className="text-[#F1F3F5]">{totalRecords}</span>
                  </div>
                </div>
              </div>

              {/* Inferred Schema Pill Tags */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px]">
                <span className="text-[#717885] font-mono shrink-0">Inferred Schema:</span>
                {columns.map((col) => (
                  <span
                    key={col.name}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#181C22] border border-[#292E36] text-[#A7AFBB] font-mono shrink-0"
                  >
                    <span className="text-[#F1F3F5] font-medium">{col.name}</span>
                    <span className="text-[9px] text-[#6C8CFF]">({col.type})</span>
                    {col.nullable && <span className="text-[9px] text-amber-400">null</span>}
                  </span>
                ))}
              </div>

              {/* Records Search and Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="relative w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#717885]" />
                    <input
                      type="text"
                      placeholder="Filter visible records..."
                      value={recordSearch}
                      onChange={(e) => setRecordSearch(e.target.value)}
                      className="w-full bg-[#111418] text-xs text-[#F1F3F5] pl-8 pr-3 py-1.5 rounded-lg border border-[#292E36] outline-none focus:border-[#6C8CFF]"
                    />
                  </div>
                  <span className="text-xs text-[#717885] font-mono">
                    Showing {filteredRecords.length} of {totalRecords} records
                  </span>
                </div>

                {/* Table */}
                <div className="rounded-xl border border-[#292E36] bg-[#181C22] overflow-hidden">
                  {loadingRecords ? (
                    <div className="py-12 text-center text-xs text-[#717885]">
                      <RefreshCw className="w-5 h-5 mx-auto animate-spin text-[#6C8CFF] mb-2" />
                      Loading dataset records...
                    </div>
                  ) : filteredRecords.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#717885]">No records found.</div>
                  ) : (
                    <div className="overflow-x-auto max-h-[480px]">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-[#111418] text-[#717885] uppercase tracking-wider text-[10px] border-b border-[#292E36] sticky top-0 z-10">
                          <tr>
                            <th className="py-2.5 px-3 font-semibold text-[#6C8CFF] w-12">#</th>
                            {columns.map((col) => (
                              <th key={col.name} className="py-2.5 px-3 font-semibold text-[#A7AFBB]">
                                {col.name}
                              </th>
                            ))}
                            <th className="py-2.5 px-3 font-semibold text-[#717885] text-right w-12">Del</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#292E36]/40">
                          {filteredRecords.map((r) => (
                            <tr key={r.id} className="hover:bg-[#1F242D]/40 transition-colors">
                              <td className="py-2 px-3 text-[#717885]">{r.rowIndex + 1}</td>
                              {columns.map((col) => {
                                const val = r.data[col.name];
                                return (
                                  <td key={col.name} className="py-2 px-3 text-[#F1F3F5] truncate max-w-[200px]">
                                    {val === null || val === undefined ? (
                                      <span className="text-[#717885] italic font-sans text-[10px]">null</span>
                                    ) : typeof val === "boolean" ? (
                                      <span
                                        className={`px-1.5 py-0.2 rounded text-[10px] ${
                                          val ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"
                                        }`}
                                      >
                                        {String(val)}
                                      </span>
                                    ) : (
                                      String(val)
                                    )}
                                  </td>
                                );
                              })}
                              <td className="py-2 px-3 text-right">
                                <button
                                  onClick={() => handleDeleteRecord(r.id)}
                                  disabled={deletingRecordId === r.id}
                                  className="text-[#717885] hover:text-red-400 p-1 rounded transition-colors disabled:opacity-30"
                                  title="Delete record row"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Pagination Footer */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-2.5 bg-[#111418] border-t border-[#292E36] text-xs">
                      <span className="text-[#717885]">
                        Page {page} of {totalPages}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            if (page > 1) {
                              setPage(page - 1);
                              loadRecords(activeDataset.id, page - 1);
                            }
                          }}
                          disabled={page <= 1}
                          className="p-1 rounded text-[#A7AFBB] hover:bg-[#181C22] disabled:opacity-30"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (page < totalPages) {
                              setPage(page + 1);
                              loadRecords(activeDataset.id, page + 1);
                            }
                          }}
                          disabled={page >= totalPages}
                          className="p-1 rounded text-[#A7AFBB] hover:bg-[#181C22] disabled:opacity-30"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center bg-[#181C22] rounded-xl border border-[#292E36]">
              <Database className="w-10 h-10 text-[#717885] mx-auto mb-2 opacity-40" />
              <p className="text-xs text-[#717885]">Select a dataset from the left panel to inspect records.</p>
            </div>
          )}
        </div>
      </div>

      {/* ========================================== */}
      {/* MODAL: Import Dataset (CSV or JSON)        */}
      {/* ========================================== */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-[#181C22] border border-[#292E36] rounded-xl p-5 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#292E36]">
              <h3 className="text-sm font-semibold text-[#F1F3F5] flex items-center gap-2">
                <Database className="w-4 h-4 text-[#10B981]" /> Import Tabular Dataset
              </h3>
              <button
                onClick={() => setImportModalOpen(false)}
                className="text-[#717885] hover:text-[#F1F3F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="flex-1 overflow-y-auto mt-4 space-y-3.5 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#A7AFBB] mb-1">Dataset Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Heuristic Map Benchmark"
                    value={datasetName}
                    onChange={(e) => setDatasetName(e.target.value)}
                    className="w-full bg-[#111418] text-xs text-[#F1F3F5] px-3 py-1.5 rounded-lg border border-[#292E36] outline-none focus:border-[#6C8CFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#A7AFBB] mb-1">Category</label>
                  <select
                    value={datasetCategory}
                    onChange={(e) => setDatasetCategory(e.target.value)}
                    className="w-full bg-[#111418] text-xs text-[#F1F3F5] px-3 py-1.5 rounded-lg border border-[#292E36] outline-none focus:border-[#6C8CFF]"
                  >
                    <option value="Heuristic Benchmarks">Heuristic Benchmarks</option>
                    <option value="Algorithm Metrics">Algorithm Metrics</option>
                    <option value="Course Problem Sets">Course Problem Sets</option>
                    <option value="Game Trees">Game Trees</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A7AFBB] mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Summary of benchmark metrics, parameters, etc."
                  value={datasetDesc}
                  onChange={(e) => setDatasetDesc(e.target.value)}
                  className="w-full bg-[#111418] text-xs text-[#F1F3F5] px-3 py-1.5 rounded-lg border border-[#292E36] outline-none focus:border-[#6C8CFF]"
                />
              </div>

              {/* Upload file button or paste text */}
              <div>
                <label className="block text-xs font-medium text-[#A7AFBB] mb-1">Upload File (Optional)</label>
                <input
                  type="file"
                  accept=".csv,.json,.txt"
                  onChange={handleFileChange}
                  className="w-full text-xs text-[#A7AFBB] file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-[#10B981]/20 file:text-[#10B981] bg-[#111418] rounded-lg p-1 border border-[#292E36] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-[#A7AFBB]">
                    Raw Content ({datasetFormat.toUpperCase()})
                  </label>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setDatasetFormat("csv")}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        datasetFormat === "csv"
                          ? "bg-[#6C8CFF] text-white"
                          : "text-[#717885] hover:text-[#F1F3F5]"
                      }`}
                    >
                      CSV
                    </button>
                    <button
                      type="button"
                      onClick={() => setDatasetFormat("json")}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        datasetFormat === "json"
                          ? "bg-[#6C8CFF] text-white"
                          : "text-[#717885] hover:text-[#F1F3F5]"
                      }`}
                    >
                      JSON
                    </button>
                  </div>
                </div>
                <textarea
                  rows={8}
                  placeholder={
                    datasetFormat === "csv"
                      ? "step,nodes_expanded,path_cost,heuristic_value\n1,12,4.5,8.2\n2,25,7.1,5.0"
                      : '[\n  { "step": 1, "nodes_expanded": 12, "path_cost": 4.5 },\n  { "step": 2, "nodes_expanded": 25, "path_cost": 7.1 }\n]'
                  }
                  value={rawContent}
                  onChange={(e) => setRawContent(e.target.value)}
                  className="w-full bg-[#111418] text-xs text-[#F1F3F5] font-mono p-3 rounded-lg border border-[#292E36] outline-none focus:border-[#6C8CFF]"
                />
              </div>

              {importError && (
                <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                  {importError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#292E36]">
                <button
                  type="button"
                  onClick={() => setImportModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#A7AFBB] hover:bg-[#111418]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={importing}
                  className="px-4 py-1.5 rounded-lg bg-[#10B981] text-white text-xs font-medium hover:bg-[#0EA271] disabled:opacity-50 transition-colors"
                >
                  {importing ? "Validating & Importing..." : "Validate & Import"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ========================================== */}
      {/* MODAL: Add Record Row                      */}
      {/* ========================================== */}
      {addRecordModalOpen && activeDataset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#181C22] border border-[#292E36] rounded-xl p-5 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#292E36]">
              <h3 className="text-sm font-semibold text-[#F1F3F5] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#6C8CFF]" /> Add Record to &quot;{activeDataset.name}&quot;
              </h3>
              <button
                onClick={() => setAddRecordModalOpen(false)}
                className="text-[#717885] hover:text-[#F1F3F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddRecordSubmit} className="flex-1 overflow-y-auto mt-4 space-y-3.5 pr-1">
              <p className="text-xs text-[#A7AFBB]">
                Enter values for each column according to the inferred dataset schema.
              </p>

              <div className="space-y-3">
                {columns.map((col) => (
                  <div key={col.name}>
                    <label className="block text-xs font-medium text-[#A7AFBB] mb-1">
                      {col.name}{" "}
                      <span className="text-[10px] text-[#6C8CFF] font-mono">({col.type})</span>
                      {!col.nullable && <span className="text-red-400 ml-1">*</span>}
                    </label>

                    {col.type === "boolean" ? (
                      <select
                        value={newRecordValues[col.name] ?? ""}
                        onChange={(e) =>
                          setNewRecordValues({ ...newRecordValues, [col.name]: e.target.value })
                        }
                        className="w-full bg-[#111418] text-xs text-[#F1F3F5] px-3 py-1.5 rounded-lg border border-[#292E36] outline-none focus:border-[#6C8CFF]"
                      >
                        <option value="">Select Boolean...</option>
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                    ) : (
                      <input
                        type={col.type === "number" ? "number" : "text"}
                        step={col.type === "number" ? "any" : undefined}
                        placeholder={col.type === "number" ? "e.g. 42 or 3.14" : `Enter ${col.name}`}
                        value={newRecordValues[col.name] ?? ""}
                        onChange={(e) =>
                          setNewRecordValues({ ...newRecordValues, [col.name]: e.target.value })
                        }
                        className="w-full bg-[#111418] text-xs text-[#F1F3F5] px-3 py-1.5 rounded-lg border border-[#292E36] outline-none focus:border-[#6C8CFF]"
                      />
                    )}
                  </div>
                ))}
              </div>

              {addRecordError && (
                <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                  {addRecordError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#292E36]">
                <button
                  type="button"
                  onClick={() => setAddRecordModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#A7AFBB] hover:bg-[#111418]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingRecord}
                  className="px-4 py-1.5 rounded-lg bg-[#6C8CFF] text-white text-xs font-medium hover:bg-[#5A7BEF] disabled:opacity-50 transition-colors"
                >
                  {isAddingRecord ? "Adding Record..." : "Insert Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
