/**
 * File upload validation — type, size, basic content checks.
 * Called before any file hits Supabase Storage or a parser.
 */

export const ALLOWED_MIME_TYPES = new Set([
  "text/csv",
  "text/plain",                                                                     // some CSVs arrive as text/plain
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",              // .xlsx
  "application/vnd.ms-excel",                                                       // .xls
  "application/pdf",
]);

export const ALLOWED_EXTENSIONS = new Set(["csv", "xlsx", "xls", "pdf"]);

export const MAX_FILE_SIZE_BYTES =
  parseInt(process.env.MAX_UPLOAD_BYTES ?? "10485760", 10); // 10 MB default

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateUpload(file: {
  name: string;
  type: string;
  size: number;
}): ValidationResult {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      error: `Unsupported file type ".${ext}". Please upload a CSV, Excel, or PDF file.`,
    };
  }

  if (!ALLOWED_MIME_TYPES.has(file.type) && file.type !== "") {
    // Some browsers report incorrect MIME types for CSV/XLS — allow if extension is valid
    if (ext !== "csv" && ext !== "xls") {
      return {
        valid: false,
        error: `Unexpected MIME type "${file.type}" for .${ext} file.`,
      };
    }
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const mb = (MAX_FILE_SIZE_BYTES / 1024 / 1024).toFixed(0);
    return { valid: false, error: `File is too large. Maximum size is ${mb} MB.` };
  }

  if (file.size === 0) {
    return { valid: false, error: "File is empty." };
  }

  return { valid: true };
}

/** Map file extension to our internal file_type enum */
export function extensionToFileType(filename: string): "csv" | "xlsx" | "xls" | "pdf" {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "csv") return "csv";
  if (ext === "xlsx") return "xlsx";
  if (ext === "xls") return "xls";
  if (ext === "pdf") return "pdf";
  throw new Error(`Unknown file extension: ${ext}`);
}
