import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db/client";
import { reports, parsedData, organizationMembers, uploads } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { NarrativeDisplay } from "@/components/report/NarrativeDisplay";
import { Badge } from "@/components/ui/badge";
import { normalize, detectVariances } from "@/lib/parsers/normalizer";
import type { CSVParseResult } from "@/lib/parsers/csvParser";

interface PageProps {
  params: { id: string };
}

export default async function ReportPage({ params }: PageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  // Get org membership
  const [membership] = await db
    .select({ organizationId: organizationMembers.organizationId })
    .from(organizationMembers)
    .where(eq(organizationMembers.userId, user.id))
    .limit(1);

  if (!membership) notFound();
  const { organizationId } = membership;

  // Load upload + parsed data (no reports table entry required)
  // params.id could be an uploadId or reportId
  const [upload] = await db
    .select({
      id: uploads.id,
      filename: uploads.filename,
      fileType: uploads.fileType,
      createdAt: uploads.createdAt,
      status: uploads.status,
    })
    .from(uploads)
    .where(and(eq(uploads.id, params.id), eq(uploads.organizationId, organizationId)))
    .limit(1);

  if (!upload || upload.status !== "parsed") notFound();

  const [pd] = await db
    .select()
    .from(parsedData)
    .where(
      and(
        eq(parsedData.uploadId, upload.id),
        eq(parsedData.organizationId, organizationId)
      )
    )
    .limit(1);

  if (!pd) notFound();

  // Normalize and detect variances
  const rawData = pd.rawData as { report?: ReturnType<typeof normalize>; rows?: CSVParseResult["rows"] };
  const reportData = rawData.report ?? normalize({
    rows: rawData.rows ?? [],
    headers: [],
    periodCurrent: pd.periodStart,
    periodPrevious: null,
    rawRows: [],
    sourceHint: "generic",
  });

  const variances = detectVariances(reportData, 15);
  const reportTitle = `${upload.filename.replace(/\.[^.]+$/, "")} — Financial Report`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/dashboard" className="hover:text-gray-900 transition-colors">
          Dashboard
        </Link>
        <span>/</span>
        <Link href="/upload" className="hover:text-gray-900 transition-colors">
          Uploads
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate max-w-48">{upload.filename}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-start gap-4">
          <Link
            href="/dashboard"
            className="mt-1 p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{reportTitle}</h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                {upload.filename}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(upload.createdAt).toLocaleDateString("en-AE")}
              </div>
              <Badge variant="secondary">{upload.fileType.toUpperCase()}</Badge>
              {reportData.previousPeriod && (
                <Badge variant="default">Comparison period</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          {
            label: "Revenue",
            value: reportData.revenue.total,
            prev: reportData.previousPeriod?.revenue.total,
          },
          {
            label: "Gross Profit",
            value: reportData.grossProfit,
            prev: reportData.previousPeriod?.grossProfit,
          },
          {
            label: "Net Profit",
            value: reportData.netProfit,
            prev: reportData.previousPeriod?.netProfit,
          },
          {
            label: "Total Expenses",
            value: reportData.expenses.total,
            prev: reportData.previousPeriod?.expenses.total,
          },
        ].map(({ label, value, prev }) => {
          const pct = prev && prev !== 0
            ? ((value - prev) / Math.abs(prev)) * 100
            : null;
          const isPositive = pct !== null && pct >= 0;

          return (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
              <p className="text-xl font-bold text-gray-900">
                {value >= 1_000_000
                  ? `AED ${(value / 1_000_000).toFixed(1)}M`
                  : value >= 1_000
                  ? `AED ${(value / 1_000).toFixed(0)}K`
                  : `AED ${value.toFixed(0)}`}
              </p>
              {pct !== null && (
                <p className={`text-xs mt-1 font-medium ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
                  {isPositive ? "+" : ""}{pct.toFixed(1)}% vs prior
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Narrative Generator */}
      <NarrativeDisplay
        parsedDataId={pd.id}
        variances={variances}
        reportTitle={reportTitle}
        currency="AED"
      />
    </div>
  );
}
