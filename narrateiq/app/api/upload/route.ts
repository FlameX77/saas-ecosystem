/**
 * POST /api/upload
 *
 * Accepts a multipart/form-data request with a single `file` field.
 * Flow:
 *   1. Validate auth + org membership
 *   2. Validate file (type, size)
 *   3. Upload to Supabase Storage
 *   4. Parse file → normalized ParsedReport
 *   5. Save upload record + parsed_data to DB
 *   6. Return upload_id + preview data
 */

import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { db } from "@/lib/db/client";
import { uploads, parsedData, organizationMembers } from "@/lib/db/schema";
import { validateUpload, extensionToFileType } from "@/lib/validators/upload";
import { parseCSV } from "@/lib/parsers/csvParser";
import { parseExcel } from "@/lib/parsers/excelParser";
import { parsePDF } from "@/lib/parsers/pdfParser";
import { normalize } from "@/lib/parsers/normalizer";
import { eq } from "drizzle-orm";

export const maxDuration = 30; // Vercel function timeout (seconds)
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    // ── Auth ───────────────────────────────────────────────────────────────
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // ── Org ────────────────────────────────────────────────────────────────
    const [membership] = await db
      .select({ organizationId: organizationMembers.organizationId })
      .from(organizationMembers)
      .where(eq(organizationMembers.userId, user.id))
      .limit(1);

    if (!membership) {
      return NextResponse.json({ error: "No organization found. Complete onboarding first." }, { status: 403 });
    }
    const { organizationId } = membership;

    // ── Parse form data ────────────────────────────────────────────────────
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const filename = file instanceof File ? file.name : "upload";
    const validation = validateUpload({
      name: filename,
      type: file.type,
      size: file.size,
    });

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 422 });
    }

    const fileType = extensionToFileType(filename);
    const buffer = Buffer.from(await file.arrayBuffer());

    // ── Upload to Supabase Storage ─────────────────────────────────────────
    const serviceSupabase = createServiceClient();
    const storagePath = `${organizationId}/${user.id}/${Date.now()}-${filename}`;
    const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "financial-uploads";

    const { error: storageError } = await serviceSupabase.storage
      .from(bucket)
      .upload(storagePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (storageError) {
      console.error("[upload] Storage error:", storageError);
      return NextResponse.json({ error: "Failed to store file. Please try again." }, { status: 500 });
    }

    // ── Parse file ────────────────────────────────────────────────────────
    let parseResult;
    try {
      if (fileType === "csv") {
        parseResult = parseCSV(buffer.toString("utf-8"));
      } else if (fileType === "xlsx" || fileType === "xls") {
        parseResult = parseExcel(buffer);
      } else if (fileType === "pdf") {
        parseResult = await parsePDF(buffer);
      } else {
        throw new Error("Unsupported file type");
      }
    } catch (parseErr) {
      // Save upload record with failed status
      await db.insert(uploads).values({
        organizationId,
        userId: user.id,
        filename,
        fileType,
        fileSizeBytes: file.size,
        storagePath,
        status: "failed",
        errorMessage: parseErr instanceof Error ? parseErr.message : "Parse failed",
      });
      return NextResponse.json(
        { error: `Could not parse file: ${parseErr instanceof Error ? parseErr.message : "Unknown parse error"}` },
        { status: 422 }
      );
    }

    const normalizedReport = normalize(parseResult);

    // ── Save to DB ────────────────────────────────────────────────────────
    const [upload] = await db
      .insert(uploads)
      .values({
        organizationId,
        userId: user.id,
        filename,
        fileType,
        fileSizeBytes: file.size,
        storagePath,
        status: "parsed",
      })
      .returning({ id: uploads.id });

    if (!upload) {
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    const [pd] = await db
      .insert(parsedData)
      .values({
        uploadId: upload.id,
        organizationId,
        dataType: "profit_loss", // default; can be inferred in future
        periodStart: normalizedReport.period,
        periodEnd: normalizedReport.period,
        rawData: { report: normalizedReport, rows: parseResult.rawRows },
        metadata: {
          sourceHint: parseResult.sourceHint,
          rowCount: parseResult.rows.length,
          headers: parseResult.headers,
          filename,
        },
      })
      .returning({ id: parsedData.id });

    return NextResponse.json(
      {
        uploadId: upload.id,
        parsedDataId: pd?.id,
        report: normalizedReport,
        metadata: {
          filename,
          fileType,
          rowCount: parseResult.rows.length,
          period: normalizedReport.period,
          hasPreviousPeriod: !!normalizedReport.previousPeriod,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/upload]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
