import { SchemaColumn, DataQualityReport } from "./types";

/**
 * Parses raw CSV text into array of object records.
 * Handles quoted fields containing commas and line breaks.
 */
export function parseCsvContent(csvText: string): Record<string, any>[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  // Parse header
  const headers = splitCsvRow(lines[0]);
  const records: Record<string, any>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitCsvRow(lines[i]);
    if (values.length === 0) continue;

    const row: Record<string, any> = {};
    headers.forEach((header, colIdx) => {
      const rawVal = values[colIdx] !== undefined ? values[colIdx].trim() : "";
      
      // Auto cast numbers and booleans
      if (rawVal === "") {
        row[header] = null;
      } else if (!isNaN(Number(rawVal)) && rawVal.trim() !== "") {
        row[header] = Number(rawVal);
      } else if (rawVal.toLowerCase() === "true") {
        row[header] = true;
      } else if (rawVal.toLowerCase() === "false") {
        row[header] = false;
      } else {
        row[header] = rawVal;
      }
    });

    records.push(row);
  }

  return records;
}

function splitCsvRow(rowText: string): string[] {
  const result: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < rowText.length; i++) {
    const char = rowText[i];
    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      result.push(current.replace(/^"|"$/g, "").trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.replace(/^"|"$/g, "").trim());
  return result;
}

/**
 * Infers data types for dataset columns.
 */
export function inferSchema(records: Record<string, any>[]): SchemaColumn[] {
  if (records.length === 0) return [];
  const keys = Object.keys(records[0]);

  return keys.map((key) => {
    let hasNull = false;
    const typesSeen = new Set<string>();

    for (const record of records) {
      const val = record[key];
      if (val === null || val === undefined || val === "") {
        hasNull = true;
        continue;
      }
      if (typeof val === "number") typesSeen.add("number");
      else if (typeof val === "boolean") typesSeen.add("boolean");
      else if (typeof val === "string" && !isNaN(Date.parse(val)) && val.length > 8 && val.includes("-")) {
        typesSeen.add("date");
      } else {
        typesSeen.add("string");
      }
    }

    const type = typesSeen.has("string") || typesSeen.size > 1 
      ? "string" 
      : typesSeen.values().next().value || "string";

    return {
      name: key,
      type: type as SchemaColumn["type"],
      nullable: hasNull,
    };
  });
}

/**
 * Analyzes dataset rows for missing values, duplicates, and generates quality report.
 */
export function analyzeDataQuality(
  records: Record<string, any>[],
  schema: SchemaColumn[]
): DataQualityReport {
  const totalRows = records.length;
  if (totalRows === 0) {
    return { score: 100, totalRows: 0, duplicateRows: 0, missingFieldCount: 0, issues: [] };
  }

  const seenHashes = new Set<string>();
  let duplicateRows = 0;
  let missingFieldCount = 0;
  const issues: DataQualityReport["issues"] = [];

  records.forEach((row, rowIdx) => {
    // Check duplicates
    const rowHash = JSON.stringify(row);
    if (seenHashes.has(rowHash)) {
      duplicateRows++;
      if (issues.length < 50) {
        issues.push({
          type: "DUPLICATE",
          row: rowIdx + 1,
          message: `Row ${rowIdx + 1} is an exact duplicate of a previous record.`,
        });
      }
    } else {
      seenHashes.add(rowHash);
    }

    // Check missing fields
    schema.forEach((col) => {
      const val = row[col.name];
      if (val === null || val === undefined || val === "") {
        missingFieldCount++;
        if (issues.length < 50) {
          issues.push({
            type: "MISSING_VALUE",
            row: rowIdx + 1,
            column: col.name,
            message: `Row ${rowIdx + 1} has a missing value in column "${col.name}".`,
          });
        }
      }
    });
  });

  // Calculate Quality Score
  const totalCells = totalRows * schema.length;
  const missingPenalty = totalCells > 0 ? (missingFieldCount / totalCells) * 50 : 0;
  const duplicatePenalty = totalRows > 0 ? (duplicateRows / totalRows) * 50 : 0;
  const score = Math.max(0, Math.min(100, parseFloat((100 - missingPenalty - duplicatePenalty).toFixed(1))));

  return {
    score,
    totalRows,
    duplicateRows,
    missingFieldCount,
    issues,
  };
}

/**
 * Serializes records into a CSV string.
 */
export function exportToCsv(records: Record<string, any>[]): string {
  if (records.length === 0) return "";
  const headers = Object.keys(records[0]);
  const rows = records.map((r) =>
    headers
      .map((h) => {
        const val = r[h] === null || r[h] === undefined ? "" : String(r[h]);
        if (val.includes(",") || val.includes('"') || val.includes("\n")) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      })
      .join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

/**
 * Serializes records into JSON string.
 */
export function exportToJson(records: Record<string, any>[]): string {
  return JSON.stringify(records, null, 2);
}
