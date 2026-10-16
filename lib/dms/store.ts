import fs from "fs";
import path from "path";
import {
  DmsFileItem,
  DmsFileVersionItem,
  DmsCollectionItem,
  DmsDatasetItem,
  DmsDatasetRecordItem,
  DmsProjectItem,
  DmsTaskItem,
  DmsAiArtifactItem,
  DmsActivityItem,
  DmsAnalyticsData,
  DmsUser,
} from "./types";
import { DEMO_USERS } from "./auth";

const STORE_PATH = path.join(process.cwd(), ".data", "dms-store.json");

interface DmsStoreData {
  files: DmsFileItem[];
  fileVersions: DmsFileVersionItem[];
  collections: DmsCollectionItem[];
  datasets: DmsDatasetItem[];
  datasetRecords: Record<string, DmsDatasetRecordItem[]>; // datasetId -> records
  projects: DmsProjectItem[];
  tasks: DmsTaskItem[];
  aiArtifacts: DmsAiArtifactItem[];
  activities: DmsActivityItem[];
}

function getInitialSeedData(): DmsStoreData {
  const now = new Date().toISOString();
  const yesterday = new Date(Date.now() - 86400000).toISOString();
  const twoDaysAgo = new Date(Date.now() - 172800000).toISOString();

  const collections: DmsCollectionItem[] = [
    {
      id: "col-1",
      name: "AI Search Syllabus",
      description: "Semester 5 Artificial Intelligence lecture notes and problem sets",
      color: "#6C8CFF",
      icon: "BookOpen",
      userId: "user-admin-1",
      fileCount: 3,
      isPrivate: false,
      createdAt: twoDaysAgo,
      updatedAt: twoDaysAgo,
    },
    {
      id: "col-2",
      name: "Heuristic Benchmark Datasets",
      description: "Grid maps and test scenarios for A* and Greedy BFS benchmarks",
      color: "#10B981",
      icon: "Database",
      userId: "user-admin-1",
      fileCount: 2,
      isPrivate: false,
      createdAt: yesterday,
      updatedAt: yesterday,
    },
    {
      id: "col-3",
      name: "Research & Publications",
      description: "Draft papers and evolutionary computing algorithm comparisons",
      color: "#F59E0B",
      icon: "Folder",
      userId: "user-admin-1",
      fileCount: 1,
      isPrivate: true,
      createdAt: twoDaysAgo,
      updatedAt: now,
    },
  ];

  const files: DmsFileItem[] = [
    {
      id: "file-1",
      name: "Lecture_04_AStar_Optimality_Proof.pdf",
      originalName: "Lecture_04_AStar_Optimality_Proof.pdf",
      mimeType: "application/pdf",
      sizeBytes: 1240500,
      storagePath: "seed_astar_proof.pdf",
      fileType: "DOCUMENT",
      status: "INDEXED",
      version: 1,
      userId: "user-admin-1",
      userName: "Parth Doshi",
      collectionId: "col-1",
      collectionName: "AI Search Syllabus",
      isDeleted: false,
      createdAt: twoDaysAgo,
      updatedAt: twoDaysAgo,
    },
    {
      id: "file-2",
      name: "Genetic_Algorithm_TSP_Benchmark.csv",
      originalName: "Genetic_Algorithm_TSP_Benchmark.csv",
      mimeType: "text/csv",
      sizeBytes: 84320,
      storagePath: "seed_ga_tsp.csv",
      fileType: "DATASET",
      status: "INDEXED",
      version: 2,
      userId: "user-admin-1",
      userName: "Parth Doshi",
      collectionId: "col-2",
      collectionName: "Heuristic Benchmark Datasets",
      isDeleted: false,
      createdAt: yesterday,
      updatedAt: yesterday,
    },
    {
      id: "file-3",
      name: "Minimax_AlphaBeta_Decision_Trees.md",
      originalName: "Minimax_AlphaBeta_Decision_Trees.md",
      mimeType: "text/markdown",
      sizeBytes: 42100,
      storagePath: "seed_minimax_notes.md",
      fileType: "DOCUMENT",
      status: "INDEXED",
      version: 1,
      userId: "user-educator-1",
      userName: "Prof. Sarah Jenkins",
      collectionId: "col-1",
      collectionName: "AI Search Syllabus",
      isDeleted: false,
      createdAt: twoDaysAgo,
      updatedAt: twoDaysAgo,
    },
    {
      id: "file-4",
      name: "Heuristic_Distance_Matrix.json",
      originalName: "Heuristic_Distance_Matrix.json",
      mimeType: "application/json",
      sizeBytes: 189400,
      storagePath: "seed_matrix.json",
      fileType: "DATASET",
      status: "READY",
      version: 1,
      userId: "user-admin-1",
      userName: "Parth Doshi",
      collectionId: "col-2",
      collectionName: "Heuristic Benchmark Datasets",
      isDeleted: false,
      createdAt: yesterday,
      updatedAt: yesterday,
    },
  ];

  const fileVersions: DmsFileVersionItem[] = [
    {
      id: "ver-1",
      fileId: "file-2",
      version: 1,
      sizeBytes: 78200,
      storagePath: "seed_ga_tsp_v1.csv",
      changeSummary: "Initial 10-city test coordinates",
      createdAt: twoDaysAgo,
    },
    {
      id: "ver-2",
      fileId: "file-2",
      version: 2,
      sizeBytes: 84320,
      storagePath: "seed_ga_tsp.csv",
      changeSummary: "Added 12-city circular and clustered topology benchmark rows",
      createdAt: yesterday,
    },
  ];

  const datasets: DmsDatasetItem[] = [
    {
      id: "ds-1",
      name: "Search Algorithm Execution Benchmarks",
      description: "Performance metrics across BFS, DFS, UCS, Greedy BFS, and A* on 100 random grid mazes",
      category: "Machine Learning & AI",
      format: "CSV",
      rowCount: 5,
      columnCount: 6,
      schemaDefinition: [
        { name: "algorithm", type: "string", nullable: false },
        { name: "maze_density", type: "number", nullable: false },
        { name: "nodes_explored", type: "number", nullable: false },
        { name: "path_cost", type: "number", nullable: false },
        { name: "execution_time_ms", type: "number", nullable: false },
        { name: "optimal", type: "boolean", nullable: false },
      ],
      dataQualityScore: 98.4,
      userId: "user-admin-1",
      userName: "Parth Doshi",
      isDeleted: false,
      createdAt: twoDaysAgo,
      updatedAt: yesterday,
    },
    {
      id: "ds-2",
      name: "Student Exam Performance & Study Metrics",
      description: "Correlation between interactive visualization time and AI test scores",
      category: "Education & Learning",
      format: "JSON",
      rowCount: 4,
      columnCount: 5,
      schemaDefinition: [
        { name: "student_id", type: "string", nullable: false },
        { name: "study_hours", type: "number", nullable: false },
        { name: "simulations_run", type: "number", nullable: false },
        { name: "exam_score", type: "number", nullable: false },
        { name: "grade", type: "string", nullable: false },
      ],
      dataQualityScore: 94.2,
      userId: "user-educator-1",
      userName: "Prof. Sarah Jenkins",
      isDeleted: false,
      createdAt: yesterday,
      updatedAt: yesterday,
    },
  ];

  const datasetRecords: Record<string, DmsDatasetRecordItem[]> = {
    "ds-1": [
      { id: "rec-1", datasetId: "ds-1", rowIndex: 0, data: { algorithm: "A* Search", maze_density: 0.3, nodes_explored: 42, path_cost: 28.5, execution_time_ms: 4.2, optimal: true }, createdAt: twoDaysAgo },
      { id: "rec-2", datasetId: "ds-1", rowIndex: 1, data: { algorithm: "Greedy BFS", maze_density: 0.3, nodes_explored: 24, path_cost: 34.0, execution_time_ms: 2.1, optimal: false }, createdAt: twoDaysAgo },
      { id: "rec-3", datasetId: "ds-1", rowIndex: 2, data: { algorithm: "Uniform Cost", maze_density: 0.3, nodes_explored: 96, path_cost: 28.5, execution_time_ms: 8.7, optimal: true }, createdAt: twoDaysAgo },
      { id: "rec-4", datasetId: "ds-1", rowIndex: 3, data: { algorithm: "BFS", maze_density: 0.3, nodes_explored: 120, path_cost: 28.5, execution_time_ms: 9.4, optimal: true }, createdAt: twoDaysAgo },
      { id: "rec-5", datasetId: "ds-1", rowIndex: 4, data: { algorithm: "DFS", maze_density: 0.3, nodes_explored: 184, path_cost: 72.0, execution_time_ms: 11.2, optimal: false }, createdAt: twoDaysAgo },
    ],
    "ds-2": [
      { id: "rec-6", datasetId: "ds-2", rowIndex: 0, data: { student_id: "ST-101", study_hours: 14.5, simulations_run: 38, exam_score: 94, grade: "A+" }, createdAt: yesterday },
      { id: "rec-7", datasetId: "ds-2", rowIndex: 1, data: { student_id: "ST-102", study_hours: 11.0, simulations_run: 25, exam_score: 86, grade: "A" }, createdAt: yesterday },
      { id: "rec-8", datasetId: "ds-2", rowIndex: 2, data: { student_id: "ST-103", study_hours: 6.5, simulations_run: 12, exam_score: 72, grade: "B" }, createdAt: yesterday },
      { id: "rec-9", datasetId: "ds-2", rowIndex: 3, data: { student_id: "ST-104", study_hours: 3.0, simulations_run: 4, exam_score: 58, grade: "C" }, createdAt: yesterday },
    ],
  };

  const projects: DmsProjectItem[] = [
    {
      id: "proj-1",
      name: "Semester 5 AI Research & Course Project",
      description: "Interactive visualizer design and benchmarking of classical search, local search, and knowledge representation algorithms",
      status: "ACTIVE",
      color: "#6C8CFF",
      deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
      ownerId: "user-admin-1",
      ownerName: "Parth Doshi",
      memberCount: 3,
      taskCount: 6,
      completedTaskCount: 4,
      createdAt: twoDaysAgo,
      updatedAt: now,
    },
    {
      id: "proj-2",
      name: "Genetic Algorithm Routing & TSP Visualizer",
      description: "Development of Order Crossover (OX1) and 2-Opt Inversion mutation solvers for 2D closed-loop city routes",
      status: "ACTIVE",
      color: "#10B981",
      deadline: new Date(Date.now() + 7 * 86400000).toISOString(),
      ownerId: "user-admin-1",
      ownerName: "Parth Doshi",
      memberCount: 2,
      taskCount: 4,
      completedTaskCount: 4,
      createdAt: yesterday,
      updatedAt: now,
    },
  ];

  const tasks: DmsTaskItem[] = [
    {
      id: "task-1",
      projectId: "proj-1",
      projectName: "Semester 5 AI Research & Course Project",
      title: "Implement Genetic Algorithm 16-bit binary continuous optimization",
      description: "Encode continuous x values into 16-bit binary strings and compute multi-modal deceptive landscapes",
      status: "DONE",
      priority: "HIGH",
      assigneeId: "user-admin-1",
      assigneeName: "Parth Doshi",
      dueDate: yesterday,
      createdAt: twoDaysAgo,
      updatedAt: yesterday,
    },
    {
      id: "task-2",
      projectId: "proj-1",
      projectName: "Semester 5 AI Research & Course Project",
      title: "Design TSP City Map with Order Crossover and 2-Opt Inversion",
      description: "Interactive 2D Euclidean circuit visualizer with route untangling animation",
      status: "DONE",
      priority: "URGENT",
      assigneeId: "user-admin-1",
      assigneeName: "Parth Doshi",
      dueDate: yesterday,
      createdAt: twoDaysAgo,
      updatedAt: yesterday,
    },
    {
      id: "task-3",
      projectId: "proj-1",
      projectName: "Semester 5 AI Research & Course Project",
      title: "Implement Rule-Based Forward and Backward Chaining engines",
      description: "Support Conflict Resolution policies (Rule Order & Specificity) and goal-directed proof trees",
      status: "DONE",
      priority: "HIGH",
      assigneeId: "user-admin-1",
      assigneeName: "Parth Doshi",
      dueDate: yesterday,
      createdAt: twoDaysAgo,
      updatedAt: yesterday,
    },
    {
      id: "task-4",
      projectId: "proj-1",
      projectName: "Semester 5 AI Research & Course Project",
      title: "Build Centralized Thinkwis Data Management System (DMS)",
      description: "Unified overview, file storage, dataset imports, projects & tasks, AI workspace, and admin console",
      status: "IN_PROGRESS",
      priority: "URGENT",
      assigneeId: "user-admin-1",
      assigneeName: "Parth Doshi",
      dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
      createdAt: yesterday,
      updatedAt: now,
    },
    {
      id: "task-5",
      projectId: "proj-1",
      projectName: "Semester 5 AI Research & Course Project",
      title: "Write university-grade academic documentation and logbook",
      description: "Document mathematical equations, theoretical lifecycle, and fully worked numerical traces",
      status: "TODO",
      priority: "MEDIUM",
      assigneeId: "user-admin-1",
      assigneeName: "Parth Doshi",
      dueDate: new Date(Date.now() + 4 * 86400000).toISOString(),
      createdAt: yesterday,
      updatedAt: now,
    },
  ];

  const aiArtifacts: DmsAiArtifactItem[] = [
    {
      id: "art-1",
      runId: "run-101",
      userId: "user-admin-1",
      title: "Executive Summary: A* Admissibility and Monotonicity Proof",
      artifactType: "SUMMARY",
      content: "The A* algorithm guarantees optimal pathfinding on graphs under the condition that heuristic function h(n) is admissible (never overestimates the true cost to goal) and consistent (monotonic triangle inequality: h(n) <= c(n, a, n') + h(n')). When consistency holds, the f-values along any path are monotonically non-decreasing, guaranteeing that the first time a goal node is expanded, the path is globally optimal.",
      confidenceScore: 0.98,
      model: "gemini-1.5-flash",
      operation: "SUMMARIZATION",
      tokensUsed: 420,
      latencyMs: 840,
      sourceRefs: [
        {
          fileId: "file-1",
          fileName: "Lecture_04_AStar_Optimality_Proof.pdf",
          citationText: "Section 3.2: Consistency and Optimality Guarantees of A* Heuristics",
          pageNumber: 4,
          similarityScore: 0.95,
        },
      ],
      createdAt: yesterday,
    },
    {
      id: "art-2",
      runId: "run-102",
      userId: "user-admin-1",
      title: "Statistical Report: Heuristic vs Uninformed Search Efficiency",
      artifactType: "REPORT",
      content: "Empirical analysis across 100 benchmark grid topologies demonstrates that A* Search reduces node expansions by 64.8% relative to Breadth-First Search (BFS) while preserving path optimality. Greedy Best-First Search achieves a 78.2% reduction in explored states but incurs an average path sub-optimality overhead of 19.3%.",
      confidenceScore: 0.96,
      model: "gemini-1.5-flash",
      operation: "ANALYSIS",
      tokensUsed: 650,
      latencyMs: 1120,
      sourceRefs: [
        {
          fileId: "file-2",
          fileName: "Genetic_Algorithm_TSP_Benchmark.csv",
          citationText: "Dataset table: Search Algorithm Execution Benchmarks",
          pageNumber: 1,
          similarityScore: 0.92,
        },
      ],
      createdAt: now,
    },
  ];

  const activities: DmsActivityItem[] = [
    {
      id: "act-1",
      userId: "user-admin-1",
      userName: "Parth Doshi",
      action: "UPLOAD",
      resourceType: "FILE",
      resourceId: "file-1",
      resourceName: "Lecture_04_AStar_Optimality_Proof.pdf",
      details: { sizeBytes: 1240500, mimeType: "application/pdf" },
      isSecurityAudit: false,
      timestamp: twoDaysAgo,
    },
    {
      id: "act-2",
      userId: "user-admin-1",
      userName: "Parth Doshi",
      action: "IMPORT",
      resourceType: "DATASET",
      resourceId: "ds-1",
      resourceName: "Search Algorithm Execution Benchmarks",
      details: { rowCount: 5, format: "CSV", qualityScore: 98.4 },
      isSecurityAudit: false,
      timestamp: yesterday,
    },
    {
      id: "act-3",
      userId: "user-admin-1",
      userName: "Parth Doshi",
      action: "AI_RUN",
      resourceType: "AI_ARTIFACT",
      resourceId: "art-1",
      resourceName: "Executive Summary: A* Admissibility Proof",
      details: { model: "gemini-1.5-flash", tokens: 420 },
      isSecurityAudit: false,
      timestamp: yesterday,
    },
    {
      id: "act-4",
      userId: "user-admin-1",
      userName: "Parth Doshi",
      action: "ROLE_CHANGE",
      resourceType: "USER",
      resourceId: "user-educator-1",
      resourceName: "Prof. Sarah Jenkins",
      details: { oldRole: "STUDENT", newRole: "EDUCATOR" },
      isSecurityAudit: true,
      timestamp: now,
    },
  ];

  return {
    files,
    fileVersions,
    collections,
    datasets,
    datasetRecords,
    projects,
    tasks,
    aiArtifacts,
    activities,
  };
}

export class DmsStore {
  private static instance: DmsStore;
  private data: DmsStoreData;

  private constructor() {
    this.data = this.loadFromDisk();
  }

  public static getInstance(): DmsStore {
    if (!DmsStore.instance) {
      DmsStore.instance = new DmsStore();
    }
    return DmsStore.instance;
  }

  private loadFromDisk(): DmsStoreData {
    try {
      const dir = path.dirname(STORE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(STORE_PATH)) {
        const raw = fs.readFileSync(STORE_PATH, "utf-8");
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn("Failed to read DMS store from disk, initializing fresh seed:", err);
    }

    const initial = getInitialSeedData();
    this.saveToDisk(initial);
    return initial;
  }

  private saveToDisk(data: DmsStoreData) {
    try {
      const dir = path.dirname(STORE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to save DMS store to disk:", err);
    }
  }

  private persist() {
    this.saveToDisk(this.data);
  }

  // --- Files ---
  public getFiles(filters?: { collectionId?: string; fileType?: string; search?: string; includeDeleted?: boolean }): DmsFileItem[] {
    let result = this.data.files.filter((f) => (filters?.includeDeleted ? true : !f.isDeleted));

    if (filters?.collectionId) {
      result = result.filter((f) => f.collectionId === filters.collectionId);
    }
    if (filters?.fileType && filters.fileType !== "ALL") {
      result = result.filter((f) => f.fileType === filters.fileType);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((f) => f.name.toLowerCase().includes(q) || f.originalName.toLowerCase().includes(q));
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getFileById(id: string): DmsFileItem | undefined {
    return this.data.files.find((f) => f.id === id);
  }

  public addFile(file: Omit<DmsFileItem, "id" | "createdAt" | "updatedAt">): DmsFileItem {
    const now = new Date().toISOString();
    const newFile: DmsFileItem = {
      ...file,
      id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: now,
      updatedAt: now,
    };
    this.data.files.unshift(newFile);

    // Update collection file count
    if (newFile.collectionId) {
      const col = this.data.collections.find((c) => c.id === newFile.collectionId);
      if (col) col.fileCount++;
    }

    this.persist();
    return newFile;
  }

  public updateFile(id: string, updates: Partial<DmsFileItem>): DmsFileItem | undefined {
    const file = this.data.files.find((f) => f.id === id);
    if (!file) return undefined;

    Object.assign(file, updates, { updatedAt: new Date().toISOString() });
    this.persist();
    return file;
  }

  public deleteFile(id: string, softDelete: boolean = true): boolean {
    const file = this.data.files.find((f) => f.id === id);
    if (!file) return false;

    if (softDelete) {
      file.isDeleted = true;
      file.deletedAt = new Date().toISOString();
    } else {
      this.data.files = this.data.files.filter((f) => f.id !== id);
    }

    if (file.collectionId) {
      const col = this.data.collections.find((c) => c.id === file.collectionId);
      if (col && col.fileCount > 0) col.fileCount--;
    }

    this.persist();
    return true;
  }

  public restoreFile(id: string): boolean {
    const file = this.data.files.find((f) => f.id === id);
    if (!file) return false;
    file.isDeleted = false;
    file.deletedAt = null;
    file.updatedAt = new Date().toISOString();
    this.persist();
    return true;
  }

  // --- File Versions ---
  public getFileVersions(fileId: string): DmsFileVersionItem[] {
    return this.data.fileVersions
      .filter((v) => v.fileId === fileId)
      .sort((a, b) => b.version - a.version);
  }

  public addFileVersion(version: Omit<DmsFileVersionItem, "id" | "createdAt">): DmsFileVersionItem {
    const newVer: DmsFileVersionItem = {
      ...version,
      id: `ver-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.data.fileVersions.unshift(newVer);
    this.persist();
    return newVer;
  }

  // --- Collections ---
  public getCollections(): DmsCollectionItem[] {
    return this.data.collections.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addCollection(col: Omit<DmsCollectionItem, "id" | "fileCount" | "createdAt" | "updatedAt">): DmsCollectionItem {
    const now = new Date().toISOString();
    const newCol: DmsCollectionItem = {
      ...col,
      id: `col-${Date.now()}`,
      fileCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    this.data.collections.unshift(newCol);
    this.persist();
    return newCol;
  }

  public deleteCollection(id: string): boolean {
    const col = this.data.collections.find((c) => c.id === id);
    if (!col) return false;
    this.data.collections = this.data.collections.filter((c) => c.id !== id);
    // Unassign collection from files
    this.data.files.forEach((f) => {
      if (f.collectionId === id) {
        f.collectionId = null;
        f.collectionName = null;
      }
    });
    this.persist();
    return true;
  }

  // --- Datasets ---
  public getDatasets(search?: string): DmsDatasetItem[] {
    let result = this.data.datasets.filter((d) => !d.isDeleted);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((d) => d.name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q));
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getDatasetById(id: string): DmsDatasetItem | undefined {
    return this.data.datasets.find((d) => d.id === id);
  }

  public addDataset(
    dataset: Omit<DmsDatasetItem, "id" | "createdAt" | "updatedAt">,
    records: Record<string, any>[]
  ): DmsDatasetItem {
    const now = new Date().toISOString();
    const newDs: DmsDatasetItem = {
      ...dataset,
      id: `ds-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    this.data.datasets.unshift(newDs);

    // Save records
    const recordItems: DmsDatasetRecordItem[] = records.map((data, idx) => ({
      id: `rec-${newDs.id}-${idx}`,
      datasetId: newDs.id,
      rowIndex: idx,
      data,
      createdAt: now,
    }));
    this.data.datasetRecords[newDs.id] = recordItems;

    this.persist();
    return newDs;
  }

  public getDatasetRecords(datasetId: string, limit: number = 100, offset: number = 0): { records: DmsDatasetRecordItem[]; total: number } {
    const all = this.data.datasetRecords[datasetId] || [];
    return {
      records: all.slice(offset, offset + limit),
      total: all.length,
    };
  }

  public deleteDataset(id: string): boolean {
    const ds = this.data.datasets.find((d) => d.id === id);
    if (!ds) return false;
    ds.isDeleted = true;
    this.persist();
    return true;
  }

  public addDatasetRecord(datasetId: string, data: Record<string, any>): DmsDatasetRecordItem | undefined {
    const ds = this.data.datasets.find((d) => d.id === datasetId);
    if (!ds) return undefined;
    if (!this.data.datasetRecords[datasetId]) {
      this.data.datasetRecords[datasetId] = [];
    }
    const rowIndex = this.data.datasetRecords[datasetId].length;
    const newRecord: DmsDatasetRecordItem = {
      id: `rec-${datasetId}-${Date.now()}`,
      datasetId,
      rowIndex,
      data,
      createdAt: new Date().toISOString(),
    };
    this.data.datasetRecords[datasetId].push(newRecord);
    ds.rowCount = this.data.datasetRecords[datasetId].length;
    ds.updatedAt = new Date().toISOString();
    this.persist();
    return newRecord;
  }

  public deleteDatasetRecord(datasetId: string, recordId: string): boolean {
    const ds = this.data.datasets.find((d) => d.id === datasetId);
    if (!ds || !this.data.datasetRecords[datasetId]) return false;
    this.data.datasetRecords[datasetId] = this.data.datasetRecords[datasetId].filter((r) => r.id !== recordId);
    ds.rowCount = this.data.datasetRecords[datasetId].length;
    ds.updatedAt = new Date().toISOString();
    this.persist();
    return true;
  }

  // --- Projects & Tasks ---
  public getProjects(): DmsProjectItem[] {
    return this.data.projects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getProjectById(id: string): DmsProjectItem | undefined {
    return this.data.projects.find((p) => p.id === id);
  }

  public addProject(proj: Omit<DmsProjectItem, "id" | "memberCount" | "taskCount" | "completedTaskCount" | "createdAt" | "updatedAt">): DmsProjectItem {
    const now = new Date().toISOString();
    const newProj: DmsProjectItem = {
      ...proj,
      id: `proj-${Date.now()}`,
      memberCount: 1,
      taskCount: 0,
      completedTaskCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    this.data.projects.unshift(newProj);
    this.persist();
    return newProj;
  }

  public updateProject(id: string, updates: Partial<DmsProjectItem>): DmsProjectItem | undefined {
    const proj = this.data.projects.find((p) => p.id === id);
    if (!proj) return undefined;
    Object.assign(proj, updates, { updatedAt: new Date().toISOString() });
    this.persist();
    return proj;
  }

  public deleteProject(id: string): boolean {
    const proj = this.data.projects.find((p) => p.id === id);
    if (!proj) return false;
    this.data.projects = this.data.projects.filter((p) => p.id !== id);
    this.data.tasks = this.data.tasks.filter((t) => t.projectId !== id);
    this.persist();
    return true;
  }

  public getTasks(projectId?: string): DmsTaskItem[] {
    let result = this.data.tasks;
    if (projectId) {
      result = result.filter((t) => t.projectId === projectId);
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addTask(task: Omit<DmsTaskItem, "id" | "createdAt" | "updatedAt">): DmsTaskItem {
    const now = new Date().toISOString();
    const newTask: DmsTaskItem = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    this.data.tasks.unshift(newTask);

    // Update project count
    const proj = this.data.projects.find((p) => p.id === newTask.projectId);
    if (proj) {
      proj.taskCount++;
      if (newTask.status === "DONE") proj.completedTaskCount++;
    }

    this.persist();
    return newTask;
  }

  public updateTask(id: string, updates: Partial<DmsTaskItem>): DmsTaskItem | undefined {
    const task = this.data.tasks.find((t) => t.id === id);
    if (!task) return undefined;

    const oldStatus = task.status;
    Object.assign(task, updates, { updatedAt: new Date().toISOString() });

    // Update project completed count
    if (updates.status && updates.status !== oldStatus) {
      const proj = this.data.projects.find((p) => p.id === task.projectId);
      if (proj) {
        if (updates.status === "DONE" && oldStatus !== "DONE") proj.completedTaskCount++;
        else if (oldStatus === "DONE" && updates.status !== "DONE" && proj.completedTaskCount > 0) {
          proj.completedTaskCount--;
        }
      }
    }

    this.persist();
    return task;
  }

  public deleteTask(id: string): boolean {
    const task = this.data.tasks.find((t) => t.id === id);
    if (!task) return false;

    this.data.tasks = this.data.tasks.filter((t) => t.id !== id);
    const proj = this.data.projects.find((p) => p.id === task.projectId);
    if (proj && proj.taskCount > 0) {
      proj.taskCount--;
      if (task.status === "DONE" && proj.completedTaskCount > 0) proj.completedTaskCount--;
    }

    this.persist();
    return true;
  }

  // --- AI Artifacts ---
  public getAiArtifacts(userId?: string): DmsAiArtifactItem[] {
    let result = this.data.aiArtifacts;
    if (userId) {
      result = result.filter((a) => a.userId === userId);
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addAiArtifact(artifact: Omit<DmsAiArtifactItem, "id" | "createdAt">): DmsAiArtifactItem {
    const newArt: DmsAiArtifactItem = {
      ...artifact,
      id: `art-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.data.aiArtifacts.unshift(newArt);
    this.persist();
    return newArt;
  }

  public deleteAiArtifact(id: string): boolean {
    this.data.aiArtifacts = this.data.aiArtifacts.filter((a) => a.id !== id);
    this.persist();
    return true;
  }

  // --- Activities ---
  public getActivities(filters?: { isSecurityAudit?: boolean; limit?: number }): DmsActivityItem[] {
    let list = this.data.activities;
    if (filters?.isSecurityAudit !== undefined) {
      list = list.filter((a) => a.isSecurityAudit === filters.isSecurityAudit);
    }
    const limit = filters?.limit || 100;
    return list
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  public logActivity(activity: Omit<DmsActivityItem, "id" | "timestamp">): DmsActivityItem {
    const newAct: DmsActivityItem = {
      ...activity,
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    this.data.activities.unshift(newAct);
    // Keep max 1000 activities
    if (this.data.activities.length > 1000) {
      this.data.activities = this.data.activities.slice(0, 1000);
    }
    this.persist();
    return newAct;
  }

  // --- Analytics ---
  public getAnalytics(): DmsAnalyticsData {
    const activeFiles = this.data.files.filter((f) => !f.isDeleted);
    const usedBytes = activeFiles.reduce((sum, f) => sum + f.sizeBytes, 0);

    // Group by file type
    const byTypeMap: Record<string, { bytes: number; count: number }> = {};
    activeFiles.forEach((f) => {
      if (!byTypeMap[f.fileType]) byTypeMap[f.fileType] = { bytes: 0, count: 0 };
      byTypeMap[f.fileType].bytes += f.sizeBytes;
      byTypeMap[f.fileType].count++;
    });

    const byType = Object.entries(byTypeMap).map(([type, stats]) => ({
      type,
      bytes: stats.bytes,
      count: stats.count,
    }));

    // Task stats
    const totalTasks = this.data.tasks.length;
    const completedTasks = this.data.tasks.filter((t) => t.status === "DONE").length;
    const inProgressTasks = this.data.tasks.filter((t) => t.status === "IN_PROGRESS").length;
    const todoTasks = this.data.tasks.filter((t) => t.status === "TODO").length;

    // Quality stats
    const activeDatasets = this.data.datasets.filter((d) => !d.isDeleted);
    const avgScore =
      activeDatasets.length > 0
        ? activeDatasets.reduce((sum, d) => sum + d.dataQualityScore, 0) / activeDatasets.length
        : 100;
    const verified = activeDatasets.filter((d) => d.dataQualityScore >= 90).length;
    const flagged = activeDatasets.filter((d) => d.dataQualityScore < 90).length;

    // Activity timeline (last 7 days)
    const timelineMap: Record<string, { uploads: number; aiRuns: number; taskUpdates: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const dateStr = new Date(Date.now() - i * 86400000).toISOString().split("T")[0];
      timelineMap[dateStr] = { uploads: 0, aiRuns: 0, taskUpdates: 0 };
    }

    this.data.activities.forEach((act) => {
      const day = act.timestamp.split("T")[0];
      if (timelineMap[day]) {
        if (act.action === "UPLOAD") timelineMap[day].uploads++;
        if (act.action === "AI_RUN") timelineMap[day].aiRuns++;
        if (act.action === "TASK_UPDATE") timelineMap[day].taskUpdates++;
      }
    });

    const activityTimeline = Object.entries(timelineMap).map(([date, counts]) => ({
      date,
      ...counts,
    }));

    return {
      storage: {
        totalBytes: 5 * 1024 * 1024 * 1024, // 5 GB limit
        usedBytes,
        limitBytes: 5 * 1024 * 1024 * 1024,
        fileCount: activeFiles.length,
        datasetCount: activeDatasets.length,
        byType,
      },
      activityTimeline,
      projectStats: {
        totalProjects: this.data.projects.length,
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
      },
      qualityStats: {
        averageQualityScore: parseFloat(avgScore.toFixed(1)),
        verifiedDatasets: verified,
        flaggedDatasets: flagged,
      },
    };
  }

  // --- Admin User Management ---
  public getUsers(): DmsUser[] {
    return Object.values(DEMO_USERS);
  }

  public updateUserRole(userId: string, newRole: DmsUser["role"]): boolean {
    if (DEMO_USERS[userId]) {
      DEMO_USERS[userId].role = newRole;
      return true;
    }
    return false;
  }
}

export const dmsStore = DmsStore.getInstance();
