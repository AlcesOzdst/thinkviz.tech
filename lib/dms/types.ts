export type UserRole = "ADMIN" | "EDUCATOR" | "STUDENT" | "RESEARCHER";

export type FileType = "DOCUMENT" | "DATASET" | "CODE" | "IMAGE" | "OTHER";
export type FileStatus = "READY" | "PROCESSING" | "INDEXED" | "FAILED";

export type DatasetFormat = "CSV" | "JSON";
export type JobStatus = "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";

export type ProjectStatus = "ACTIVE" | "ARCHIVED" | "COMPLETED";
export type ProjectRole = "OWNER" | "EDITOR" | "VIEWER";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type AiOperation = "SUMMARIZATION" | "EXTRACTION" | "ANALYSIS" | "RAG_QUERY";
export type ArtifactType = "SUMMARY" | "REPORT" | "INSIGHT" | "CODE";

export interface DmsUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string;
}

export interface DmsFileItem {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
  fileType: FileType;
  status: FileStatus;
  version: number;
  metadata?: Record<string, any>;
  userId: string;
  userName?: string;
  collectionId?: string | null;
  collectionName?: string | null;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DmsFileVersionItem {
  id: string;
  fileId: string;
  version: number;
  sizeBytes: number;
  storagePath: string;
  changeSummary?: string;
  createdBy?: string;
  createdAt: string;
}

export interface DmsCollectionItem {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  userId: string;
  fileCount: number;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SchemaColumn {
  name: string;
  type: "string" | "number" | "boolean" | "date";
  nullable: boolean;
}

export interface DataQualityReport {
  score: number; // 0 - 100
  totalRows: number;
  duplicateRows: number;
  missingFieldCount: number;
  issues: {
    type: "DUPLICATE" | "MISSING_VALUE" | "TYPE_MISMATCH";
    row?: number;
    column?: string;
    message: string;
  }[];
}

export interface DmsDatasetItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  format: DatasetFormat;
  rowCount: number;
  columnCount: number;
  schemaDefinition: SchemaColumn[];
  schema?: SchemaColumn[];
  dataQualityScore: number;
  qualityIssues?: any[];
  userId: string;
  userName?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DmsDatasetRecordItem {
  id: string;
  datasetId: string;
  rowIndex: number;
  data: Record<string, any>;
  createdAt: string;
}

export interface DmsProjectItem {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  color: string;
  deadline?: string | null;
  ownerId: string;
  ownerName?: string;
  memberCount: number;
  taskCount: number;
  completedTaskCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DmsTaskItem {
  id: string;
  projectId: string;
  projectName?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string | null;
  assigneeName?: string | null;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DmsAiArtifactItem {
  id: string;
  runId?: string;
  userId: string;
  userName?: string;
  title: string;
  artifactType: ArtifactType;
  content: string;
  confidenceScore?: number;
  model: string;
  operation?: AiOperation;
  sourceType?: "FILE" | "DATASET";
  sourceId?: string;
  sourceTitle?: string;
  prompt?: string;
  tokensUsed?: number;
  latencyMs?: number;
  sourceRefs?: {
    fileId?: string;
    fileName?: string;
    citationText: string;
    pageNumber?: number;
    similarityScore: number;
  }[];
  createdAt: string;
}

export interface DmsActivityItem {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  resourceName: string;
  details?: string | Record<string, any>;
  isSecurityAudit: boolean;
  ipAddress?: string;
  timestamp: string;
}

export interface DmsAnalyticsData {
  storage: {
    totalBytes: number;
    usedBytes: number;
    limitBytes: number;
    fileCount: number;
    datasetCount: number;
    byType: { type: string; bytes: number; count: number }[];
  };
  activityTimeline: { date: string; uploads: number; aiRuns: number; taskUpdates: number }[];
  projectStats: {
    totalProjects: number;
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    todoTasks: number;
  };
  qualityStats: {
    averageQualityScore: number;
    verifiedDatasets: number;
    flaggedDatasets: number;
  };
}
