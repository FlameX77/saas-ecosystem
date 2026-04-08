/**
 * POST /api/generate/narrative
 *
 * Streams a board-ready narrative report using Claude.
 * Rate limit: 10 generations per user per day (free tier).
 *
 * Body: { parsedDataId, tone, currency? }
 * Response: text/event-stream (Vercel AI SDK data stream)
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { eq, and, gte, sql } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db/client";
import {
  parsedData,
  organizationMembers,
  narratives,
  profiles,
  reports,
} from "@/lib/db/schema";
import { streamNarrative, AIRateLimitError } from "@/lib/ai/client";
import {
  buildSystemPrompt,
  buildUserPrompt,
  parseNarrativeSections,
  type NarrativeTone,
  type Industry,
} from "@/lib/ai/prompts/narrativePrompt";
import { normalize, detectVariances } from "@/lib/parsers/normalizer";
import type { CSVParseResult } from "@/lib/parsers/csvParser";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const FREE_TIER_DAILY_LIMIT = 10;

const requestSchema = z.object({
  parsedDataId: z.string().uuid(),
  tone: z.enum(["board_meeting", "investor_update", "internal_review"]).default("board_meeting"),
  currency: z.string().max(3).default("AED"),
  /** Optional: associate this narrative with a report record */
  reportId: z.string().uuid().optional(),
});

async function getDailyGenerationCount(userId: string, organizationId: string): Promise<number> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(narratives)
    .where(
      and(
        eq(narratives.userId, userId),
        gte(narratives.createdAt, startOfDay)
      )
    );

  return Number(result[0]?.count ?? 0);
}

export async function POST(request: Request) {
  try {
    // ── Auth ───────────────────────────────────────────────────────────────
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // ── Validate body ──────────────────────────────────────────────────────
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }
    const { parsedDataId, tone, currency, reportId } = parsed.data;

    // ── Org membership ─────────────────────────────────────────────────────
    const [membership] = await db
      .select({ organizationId: organizationMembers.organizationId })
      .from(organizationMembers)
      .where(eq(organizationMembers.userId, user.id))
      .limit(1);

    if (!membership) {
      return NextResponse.json({ error: "No organization found." }, { status: 403 });
    }
    const { organizationId } = membership;

    // ── Daily rate limit ───────────────────────────────────────────────────
    // Check org plan — paid orgs get unlimited generations
    // For now treat all as free tier
    const dailyCount = await getDailyGenerationCount(user.id, organizationId);
    if (dailyCount >= FREE_TIER_DAILY_LIMIT) {
      return NextResponse.json(
        { error: `Daily generation limit reached (${FREE_TIER_DAILY_LIMIT}/day on free plan). Upgrade for unlimited reports.` },
        { status: 429 }
      );
    }

    // ── Load parsed data ───────────────────────────────────────────────────
    const [pd] = await db
      .select()
      .from(parsedData)
      .where(
        and(
          eq(parsedData.id, parsedDataId),
          eq(parsedData.organizationId, organizationId)
        )
      )
      .limit(1);

    if (!pd) {
      return NextResponse.json({ error: "Financial data not found." }, { status: 404 });
    }

    // ── Load profile for industry context ──────────────────────────────────
    const [profile] = await db
      .select({ industry: profiles.industry, companyName: profiles.companyName })
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    const industry = (profile?.industry ?? "other") as Industry;
    const companyName = profile?.companyName ?? "Your Company";

    // ── Normalize data ─────────────────────────────────────────────────────
    const rawData = pd.rawData as { report?: ReturnType<typeof normalize>; rows?: CSVParseResult["rows"] };

    let reportData: ReturnType<typeof normalize>;
    if (rawData.report) {
      reportData = rawData.report;
    } else {
      // Fallback: re-normalize from rows
      reportData = normalize({ rows: rawData.rows ?? [], headers: [], periodCurrent: pd.periodStart, periodPrevious: null, rawRows: [], sourceHint: "generic" });
    }

    const variances = detectVariances(reportData, 15);

    // ── Create a placeholder narrative record (to track usage) ─────────────
    const [narrativeRecord] = await db
      .insert(narratives)
      .values({
        organizationId,
        reportId: reportId ?? null,
        userId: user.id,
        tone: tone as NarrativeTone,
        model: "claude-sonnet-4-0",
      })
      .returning({ id: narratives.id });

    if (!narrativeRecord) {
      return NextResponse.json({ error: "Failed to create narrative record." }, { status: 500 });
    }

    // ── Build prompts ──────────────────────────────────────────────────────
    const systemPrompt = buildSystemPrompt(tone as NarrativeTone, industry);
    const userPrompt = buildUserPrompt({
      report: reportData,
      variances,
      tone: tone as NarrativeTone,
      industry,
      companyName,
      currency,
    });

    // ── Stream via AI client ───────────────────────────────────────────────
    // We override the streamNarrative helper here since we have pre-built prompts
    const { createAnthropic } = await import("@ai-sdk/anthropic");
    const { streamText } = await import("ai");

    const anthropicProvider = createAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    let fullContent = "";
    let inputTokens = 0;
    let outputTokens = 0;

    const result = streamText({
      model: anthropicProvider("claude-sonnet-4-0"),
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
      maxTokens: 3000,
      onFinish: async ({ text, usage }) => {
        fullContent = text;
        inputTokens = usage.promptTokens;
        outputTokens = usage.completionTokens;

        // Save completed narrative to DB
        const sections = parseNarrativeSections(fullContent);
        await db
          .update(narratives)
          .set({
            content: fullContent,
            sections,
            inputTokens,
            outputTokens,
          })
          .where(eq(narratives.id, narrativeRecord.id));

        // Update report status if linked
        if (reportId) {
          await db
            .update(reports)
            .set({ status: "ready" })
            .where(eq(reports.id, reportId));
        }
      },
    });

    // Return streaming response with narrative ID in headers
    const streamResponse = result.toDataStreamResponse();
    const headers = new Headers(streamResponse.headers);
    headers.set("X-Narrative-Id", narrativeRecord.id);
    headers.set("X-Daily-Count", String(dailyCount + 1));
    headers.set("X-Daily-Limit", String(FREE_TIER_DAILY_LIMIT));

    return new Response(streamResponse.body, {
      headers,
      status: streamResponse.status,
    });
  } catch (err) {
    if (err instanceof AIRateLimitError) {
      return NextResponse.json({ error: err.message }, { status: 429 });
    }
    console.error("[POST /api/generate/narrative]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
