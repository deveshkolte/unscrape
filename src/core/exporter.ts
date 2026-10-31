import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

export type OutputFormat = "json" | "csv" | "jsonl" | "table";

function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str =
    typeof value === "object" ? JSON.stringify(value) : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Converts an array of flat/nested objects into RFC-4180 CSV text.
 */
export function toCsv(records: unknown[]): string {
  if (records.length === 0) return "";
  const columnSet = new Set<string>();
  for (const item of records) {
    if (item && typeof item === "object" && !Array.isArray(item)) {
      for (const key of Object.keys(item as Record<string, unknown>)) {
        columnSet.add(key);
      }
    }
  }
  const columns = Array.from(columnSet);
  if (columns.length === 0) return "";

  const headerLine = columns.map(escapeCsvCell).join(",");
  const rows = records.map((item) => {
    const rec = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
    return columns.map((col) => escapeCsvCell(rec[col])).join(",");
  });

  return [headerLine, ...rows].join("\n");
}

/**
 * Converts an array of records into JSON Lines (`.jsonl`) for LLM / RAG ingestion.
 */
export function toJsonl(records: unknown[]): string {
  return records.map((item) => JSON.stringify(item)).join("\n");
}

/**
 * Renders an ASCII table string from an array of objects.
 */
export function toAsciiTable(records: unknown[], maxColWidth = 38): string {
  if (records.length === 0) return "(0 records)";

  const firstObj = records[0];
  if (!firstObj || typeof firstObj !== "object") {
    return JSON.stringify(records, null, 2);
  }

  const allColumns = Object.keys(firstObj as Record<string, unknown>).filter(
    (k) => k !== "scrapedAt" && k !== "url"
  );
  const columns = allColumns.slice(0, 7);

  const truncate = (val: unknown): string => {
    if (val === null || val === undefined) return "-";
    const str = Array.isArray(val)
      ? val.join(", ")
      : typeof val === "object"
        ? JSON.stringify(val)
        : String(val);
    const singleLine = str.replace(/\s+/g, " ").trim();
    return singleLine.length > maxColWidth
      ? `${singleLine.slice(0, maxColWidth - 1)}…`
      : singleLine;
  };

  const widths = columns.map((col) => {
    const maxDataLen = records.reduce<number>((max, row) => {
      const cell = truncate((row as Record<string, unknown>)[col]);
      return Math.max(max, cell.length);
    }, 0);
    return Math.max(col.length, maxDataLen);
  });

  const divider = `+-${widths.map((w) => "-".repeat(w)).join("-+-")}-+`;
  const header = `| ${columns.map((c, i) => c.padEnd(widths[i] ?? c.length)).join(" | ")} |`;

  const body = records.map((row) => {
    const rec = row as Record<string, unknown>;
    const cells = columns.map((col, i) =>
      truncate(rec[col]).padEnd(widths[i] ?? col.length)
    );
    return `| ${cells.join(" | ")} |`;
  });

  return [divider, header, divider, ...body, divider].join("\n");
}

/**
 * Formats and optionally writes output to a file (`--out`) or stdout.
 */
export function formatAndEmitOutput(
  payload: unknown,
  format: OutputFormat = "json",
  outPath?: string
): string {
  const records = Array.isArray(payload)
    ? payload
    : payload &&
        typeof payload === "object" &&
        Array.isArray((payload as Record<string, unknown>).items)
      ? ((payload as Record<string, unknown>).items as unknown[])
      : [payload];

  let formatted: string;
  switch (format) {
    case "csv":
      formatted = toCsv(records);
      break;
    case "jsonl":
      formatted = toJsonl(records);
      break;
    case "table":
      formatted = toAsciiTable(records);
      break;
    case "json":
    default:
      formatted = JSON.stringify(payload, null, 2);
      break;
  }

  if (outPath) {
    const resolved = resolve(process.cwd(), outPath);
    writeFileSync(resolved, `${formatted}\n`, "utf-8");
  }

  return formatted;
}
