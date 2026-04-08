/**
 * PDF Parser — extracts text from P&L / financial statement PDFs.
 *
 * pdf-parse reads raw text; we then run a line-by-line heuristic
 * to extract labelled amounts. Works best with selectable-text PDFs
 * (not scanned images).
 *
 * NOTE: pdf-parse must run server-side only (Node.js).
 */

import pdfParse from "pdf-parse";
import { type CSVParseResult } from "./csvParser";

// Regex: a line with a label followed by one or two numbers
// e.g. "  Revenue                 125,000    98,500"
const LINE_PATTERN = /^(.+?)\s{2,}([\d,.()\-]+)(?:\s{2,}([\d,.()\-]+))?$/;

function cleanAmount(raw: string): number {
  if (!raw || raw.trim() === "-" || raw.trim() === "") return 0;
  const isNegative = raw.includes("(") || raw.trim().startsWith("-");
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : isNegative ? -num : num;
}

function detectCategory(label: string): string {
  const lower = label.toLowerCase();
  if (/revenue|income|sales/.test(lower)) return "Revenue";
  if (/cost of (goods|sales)|cogs/.test(lower)) return "Cost of Sales";
  if (/gross profit/.test(lower)) return "Gross Profit";
  if (/operating expense|overhead|admin|selling/.test(lower)) return "Operating Expense";
  if (/net (profit|income|loss)/.test(lower)) return "Net Profit";
  if (/ebitda/.test(lower)) return "EBITDA";
  return "Other";
}

function isSubtotalRow(label: string): boolean {
  const lower = label.trim().toLowerCase();
  return lower.startsWith("total") || lower.startsWith("net") || lower.startsWith("gross");
}

function extractPeriodFromText(text: string): { current: string | null; previous: string | null } {
  const match = text.match(/(\w{3,9}\s+\d{4})\s*(?:to|-|–)\s*(\w{3,9}\s+\d{4})/i);
  if (match) return { current: `${match[1]} – ${match[2]}`, previous: null };
  const single = text.match(/(\w{3,9}\s+\d{4})/);
  return { current: single?.[1] ?? null, previous: null };
}

export interface PDFParseResult extends Omit<CSVParseResult, "sourceHint"> {
  pageCount: number;
  sourceHint: "pdf";
}

export async function parsePDF(buffer: Buffer): Promise<PDFParseResult> {
  let data: { text: string; numpages: number };

  try {
    data = await pdfParse(buffer, { max: 5 }); // parse first 5 pages max
  } catch (err) {
    throw new Error(
      `Failed to read PDF: ${err instanceof Error ? err.message : "unknown error"}. ` +
        "Ensure the PDF contains selectable text (not a scanned image)."
    );
  }

  const lines = data.text.split("\n").map((l) => l.trimEnd());
  const { current, previous } = extractPeriodFromText(data.text);

  const rows: CSVParseResult["rows"] = [];
  const rawRows: Record<string, string>[] = [];

  for (const line of lines) {
    const match = line.match(LINE_PATTERN);
    if (!match) continue;

    const [, labelRaw, amountRaw, prevRaw] = match;
    const label = labelRaw.trim();
    if (!label || label.length < 2) continue;

    const amount = cleanAmount(amountRaw);
    // Ignore lines where amount parsed to 0 AND label doesn't look like a real account
    if (amount === 0 && !isSubtotalRow(label)) continue;

    rows.push({
      label,
      amount,
      previousAmount: prevRaw ? cleanAmount(prevRaw) : null,
      category: detectCategory(label),
      indent: (line.match(/^(\s+)/)?.[1]?.length ?? 0) > 4 ? 1 : 0,
      isSubtotal: isSubtotalRow(label),
    });

    rawRows.push({ label, amount: String(amount), previous: prevRaw ?? "" });
  }

  return {
    rows,
    headers: ["Account", "Amount", "Previous"],
    periodCurrent: current,
    periodPrevious: previous,
    pageCount: data.numpages,
    rawRows,
    sourceHint: "pdf",
  };
}
