/**
 * CSV Parser — handles Zoho Books and QuickBooks export formats.
 *
 * Both tools export P&L as:
 *   Row 0-N: header rows (report title, date range, etc.)
 *   Row N+1: column headers
 *   Row N+2...: data rows
 *
 * This parser auto-detects the header row and normalizes to ParsedRows.
 */

import Papa from "papaparse";

export interface ParsedRow {
  label: string;
  amount: number;
  previousAmount: number | null;
  category: string;
  indent: number;
  isSubtotal: boolean;
}

export interface CSVParseResult {
  rows: ParsedRow[];
  headers: string[];
  periodCurrent: string | null;
  periodPrevious: string | null;
  sourceHint: "zoho_books" | "quickbooks" | "generic";
  rawRows: Record<string, string>[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cleanAmount(value: string | undefined | null): number {
  if (!value || value.trim() === "" || value.trim() === "-") return 0;
  // Remove currency symbols, spaces, commas; handle parentheses as negative
  const isNegative = value.includes("(") || value.trim().startsWith("-");
  const cleaned = value.replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : isNegative ? -num : num;
}

function detectIndent(label: string): number {
  const leading = label.match(/^(\s+)/)?.[1]?.length ?? 0;
  return Math.floor(leading / 2);
}

function isSubtotalRow(label: string): boolean {
  const lower = label.trim().toLowerCase();
  return (
    lower.startsWith("total") ||
    lower.startsWith("gross") ||
    lower.startsWith("net") ||
    lower.endsWith("total") ||
    lower.includes("subtotal")
  );
}

function detectCategory(label: string): string {
  const lower = label.trim().toLowerCase();
  if (/revenue|income|sales|turnover/.test(lower)) return "Revenue";
  if (/cost of (goods|sales)|cogs|direct cost/.test(lower)) return "Cost of Sales";
  if (/gross profit/.test(lower)) return "Gross Profit";
  if (/operating expense|overhead|admin|selling|marketing/.test(lower)) return "Operating Expense";
  if (/depreciation|amortization/.test(lower)) return "Depreciation";
  if (/interest|finance charge/.test(lower)) return "Finance Cost";
  if (/tax/.test(lower)) return "Tax";
  if (/net (profit|income|loss)/.test(lower)) return "Net Profit";
  if (/ebitda/.test(lower)) return "EBITDA";
  return "Other";
}

function detectSource(headers: string[]): "zoho_books" | "quickbooks" | "generic" {
  const headerStr = headers.join(" ").toLowerCase();
  if (headerStr.includes("zoho")) return "zoho_books";
  if (headerStr.includes("quickbooks") || headerStr.includes("intuit")) return "quickbooks";
  return "generic";
}

/** Find the first row that looks like a data header (has amount-like columns) */
function findHeaderRowIndex(rows: string[][]): number {
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const row = rows[i];
    if (row.length >= 2 && row.some((cell) => /amount|total|\d{4}|current|previous/i.test(cell))) {
      return i;
    }
  }
  // Fall back to first non-empty row
  return rows.findIndex((r) => r.some((c) => c.trim() !== ""));
}

/** Try to extract a period string from header rows (e.g. "Jan 2024 - Dec 2024") */
function extractPeriod(headerRows: string[][]): { current: string | null; previous: string | null } {
  const combined = headerRows.flat().join(" ");
  const dateRangeMatch = combined.match(
    /(\w{3,9}\s+\d{4})\s*(?:to|-|–)\s*(\w{3,9}\s+\d{4})/i
  );
  if (dateRangeMatch) {
    return { current: `${dateRangeMatch[1]} – ${dateRangeMatch[2]}`, previous: null };
  }
  const singleDateMatch = combined.match(/(\w{3,9}\s+\d{4})/);
  return { current: singleDateMatch?.[1] ?? null, previous: null };
}

// ─── Main parser ──────────────────────────────────────────────────────────────

export function parseCSV(csvContent: string): CSVParseResult {
  const { data: rawData } = Papa.parse<string[]>(csvContent, {
    skipEmptyLines: false,
    header: false,
  });

  if (!rawData.length) {
    return { rows: [], headers: [], periodCurrent: null, periodPrevious: null, sourceHint: "generic", rawRows: [] };
  }

  const allRows = rawData as string[][];
  const headerRowIdx = findHeaderRowIndex(allRows);
  const metaRows = allRows.slice(0, headerRowIdx);
  const columnHeaders = allRows[headerRowIdx] ?? [];
  const dataRows = allRows.slice(headerRowIdx + 1);

  const { current, previous } = extractPeriod(metaRows.concat([columnHeaders]));
  const sourceHint = detectSource(metaRows.flat());

  // Identify label column (usually col 0) and amount columns
  const labelColIdx = 0;
  const amountColIdx = columnHeaders.findIndex((h) =>
    /amount|total|current|\d{4}/.test(h?.toLowerCase() ?? "")
  );
  const prevColIdx = columnHeaders.findIndex((h) =>
    /previous|prior|last year|py/.test(h?.toLowerCase() ?? "")
  );

  const effectiveAmountCol = amountColIdx !== -1 ? amountColIdx : 1;

  const rows: ParsedRow[] = [];
  const rawRows: Record<string, string>[] = [];

  for (const row of dataRows) {
    if (!row.length || row.every((c) => !c?.trim())) continue;
    const label = row[labelColIdx]?.trim() ?? "";
    if (!label) continue;

    const rawRecord: Record<string, string> = {};
    columnHeaders.forEach((h, i) => { rawRecord[h ?? `col${i}`] = row[i] ?? ""; });
    rawRows.push(rawRecord);

    rows.push({
      label,
      amount: cleanAmount(row[effectiveAmountCol]),
      previousAmount: prevColIdx !== -1 ? cleanAmount(row[prevColIdx]) : null,
      category: detectCategory(label),
      indent: detectIndent(row[labelColIdx] ?? ""),
      isSubtotal: isSubtotalRow(label),
    });
  }

  return {
    rows,
    headers: columnHeaders.filter(Boolean),
    periodCurrent: current,
    periodPrevious: previous,
    sourceHint,
    rawRows,
  };
}
