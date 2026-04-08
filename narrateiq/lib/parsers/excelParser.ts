/**
 * Excel Parser — handles .xlsx and .xls exports.
 * Reads the first sheet (or a sheet named "P&L", "Income Statement", etc.)
 * and delegates to the CSV parser after converting to CSV string.
 */

import * as XLSX from "xlsx";
import { parseCSV, type CSVParseResult } from "./csvParser";

/** Sheet name preference order for financial reports */
const PREFERRED_SHEET_NAMES = [
  "profit & loss",
  "p&l",
  "income statement",
  "profit and loss",
  "balance sheet",
  "cash flow",
  "summary",
];

function findBestSheet(workbook: XLSX.WorkBook): XLSX.WorkSheet {
  const names = workbook.SheetNames.map((n) => n.toLowerCase());

  for (const preferred of PREFERRED_SHEET_NAMES) {
    const idx = names.findIndex((n) => n.includes(preferred));
    if (idx !== -1) {
      return workbook.Sheets[workbook.SheetNames[idx]]!;
    }
  }

  // Fall back to the first sheet
  return workbook.Sheets[workbook.SheetNames[0]]!;
}

export interface ExcelParseResult extends CSVParseResult {
  sheetName: string;
  sheetCount: number;
}

export function parseExcel(buffer: Buffer): ExcelParseResult {
  const workbook = XLSX.read(buffer, {
    type: "buffer",
    cellDates: true,
    cellNF: false,
    cellText: true,
  });

  if (!workbook.SheetNames.length) {
    throw new Error("Excel file contains no sheets.");
  }

  const sheet = findBestSheet(workbook);
  const sheetName =
    workbook.SheetNames.find((n) =>
      PREFERRED_SHEET_NAMES.some((p) => n.toLowerCase().includes(p))
    ) ?? workbook.SheetNames[0]!;

  // Convert to CSV string preserving cell text (handles formatted numbers)
  const csvString = XLSX.utils.sheet_to_csv(sheet, {
    forceQuotes: false,
    strip: false,
  });

  const csvResult = parseCSV(csvString);

  return {
    ...csvResult,
    sheetName,
    sheetCount: workbook.SheetNames.length,
    sourceHint: "generic",
  };
}
