"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { Upload, FileText, CheckCircle2, AlertCircle, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

// ─── Types ────────────────────────────────────────────────────────────────────

type UploadStage = "idle" | "uploading" | "parsing" | "done" | "error";

interface UploadResult {
  uploadId: string;
  parsedDataId: string;
  metadata: {
    filename: string;
    fileType: string;
    rowCount: number;
    period: string;
    hasPreviousPeriod: boolean;
  };
}

const ACCEPTED_TYPES: Record<string, string[]> = {
  "text/csv": [".csv"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "application/vnd.ms-excel": [".xls"],
  "application/pdf": [".pdf"],
};

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FileUploader() {
  const router = useRouter();
  const [stage, setStage] = useState<UploadStage>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: { file: File; errors: { message: string }[] }[]) => {
      setError(null);
      setResult(null);

      if (rejectedFiles.length > 0) {
        const firstError = rejectedFiles[0]?.errors[0]?.message ?? "File rejected";
        setError(
          firstError.includes("file-too-large")
            ? "File is too large. Maximum size is 10 MB."
            : firstError.includes("file-invalid-type")
            ? "Unsupported file type. Please upload a CSV, Excel (.xlsx), or PDF file."
            : firstError
        );
        return;
      }

      const file = acceptedFiles[0];
      if (!file) return;

      setSelectedFile(file);
      await uploadFile(file);
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  async function uploadFile(file: File) {
    setStage("uploading");
    setProgress(20);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      setProgress(40);
      setStage("parsing");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      setProgress(80);
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Upload failed. Please try again.");
        setStage("error");
        return;
      }

      setProgress(100);
      setResult(json as UploadResult);
      setStage("done");
    } catch {
      setError("Network error. Please check your connection and try again.");
      setStage("error");
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    multiple: false,
    disabled: stage === "uploading" || stage === "parsing",
  });

  function reset() {
    setStage("idle");
    setProgress(0);
    setError(null);
    setResult(null);
    setSelectedFile(null);
  }

  // ── Done state ──────────────────────────────────────────────────────────
  if (stage === "done" && result) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-6 text-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">File parsed successfully</h3>
          <p className="text-sm text-gray-500 mb-4">
            <strong>{result.metadata.filename}</strong> — {result.metadata.rowCount} rows extracted
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <Badge variant="secondary">Period: {result.metadata.period}</Badge>
            {result.metadata.hasPreviousPeriod && (
              <Badge variant="default">Comparison period included</Badge>
            )}
            <Badge variant="secondary">{result.metadata.fileType.toUpperCase()}</Badge>
          </div>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => router.push(`/reports/new?uploadId=${result.uploadId}`)}
            >
              Generate Report
            </Button>
            <Button variant="outline" onClick={reset}>
              Upload Another
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Upload in progress ──────────────────────────────────────────────────
  const isLoading = stage === "uploading" || stage === "parsing";

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={cn(
          "relative rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition-all",
          isDragActive
            ? "border-indigo-500 bg-indigo-50"
            : isLoading
            ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
            : error
            ? "border-red-300 bg-red-50 hover:border-red-400"
            : "border-gray-300 bg-white hover:border-indigo-400 hover:bg-indigo-50"
        )}
      >
        <input {...getInputProps()} />

        {isLoading ? (
          <div className="space-y-4">
            <Loader2 className="h-10 w-10 text-indigo-500 mx-auto animate-spin" />
            <div>
              <p className="font-medium text-gray-700">
                {stage === "uploading" ? "Uploading..." : "Parsing financial data..."}
              </p>
              {selectedFile && (
                <p className="text-sm text-gray-400 mt-1">
                  {selectedFile.name} ({formatBytes(selectedFile.size)})
                </p>
              )}
            </div>
            <Progress value={progress} className="max-w-xs mx-auto" />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-center">
              <div className="h-14 w-14 rounded-2xl bg-indigo-100 flex items-center justify-center">
                <Upload className="h-7 w-7 text-indigo-600" />
              </div>
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {isDragActive ? "Drop your file here" : "Drag & drop your financial export"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                or <span className="text-indigo-600 font-medium">browse files</span>
              </p>
            </div>
            <div className="flex justify-center gap-2">
              {["CSV", "XLSX", "XLS", "PDF"].map((type) => (
                <span
                  key={type}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium"
                >
                  {type}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-400">Maximum file size: 10 MB</p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <button onClick={reset} className="ml-2 opacity-70 hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* Supported formats guide */}
      {stage === "idle" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: "📊", title: "Zoho Books", desc: "Export P&L or Trial Balance as CSV" },
            { icon: "📈", title: "QuickBooks", desc: "Export standard reports as CSV or Excel" },
            { icon: "📄", title: "PDF / Manual", desc: "Selectable-text PDFs or custom spreadsheets" },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="rounded-lg border border-gray-200 p-3 bg-white">
              <div className="flex items-center gap-2 mb-1">
                <span>{icon}</span>
                <span className="text-sm font-medium text-gray-700">{title}</span>
              </div>
              <p className="text-xs text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
