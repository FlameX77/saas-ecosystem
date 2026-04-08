/**
 * NarrateIQ — Anthropic AI Client
 *
 * Single entry point for all Claude API calls. Enforces:
 * - Rate limiting (per-user, per-hour, in-memory token bucket)
 * - Consistent model selection
 * - Streaming and non-streaming interfaces
 * - Structured error handling
 *
 * Never call @anthropic-ai/sdk or the `ai` package directly elsewhere in the codebase.
 */

import Anthropic from "@anthropic-ai/sdk";
import { createAnthropic } from "@ai-sdk/anthropic";
import { streamText, generateText } from "ai";
import type { FinancialData } from "@/types/financial";

// ─── Constants ────────────────────────────────────────────────────────────────

const MODEL = "claude-sonnet-4-0" as const;
const MAX_TOKENS_NARRATIVE = 4096;
const MAX_TOKENS_CHAT = 2048;

/**
 * Requests per user per hour. Override with AI_RATE_LIMIT_RPH env var.
 * The same limit is enforced at the API route layer via headers.
 */
const RATE_LIMIT_RPH = parseInt(process.env.AI_RATE_LIMIT_RPH ?? "20", 10);

// ─── Rate Limiter (in-process token bucket) ───────────────────────────────────

interface TokenBucket {
  tokens: number;
  lastRefillAt: number;
}

const buckets = new Map<string, TokenBucket>();

/**
 * Returns true if the request is allowed, false if rate-limited.
 * Buckets refill to RATE_LIMIT_RPH tokens every hour.
 */
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const hourMs = 60 * 60 * 1000;

  let bucket = buckets.get(userId);

  if (!bucket) {
    bucket = { tokens: RATE_LIMIT_RPH, lastRefillAt: now };
    buckets.set(userId, bucket);
  }

  // Partial refill proportional to elapsed time
  const elapsed = now - bucket.lastRefillAt;
  const refill = Math.floor((elapsed / hourMs) * RATE_LIMIT_RPH);
  if (refill > 0) {
    bucket.tokens = Math.min(RATE_LIMIT_RPH, bucket.tokens + refill);
    bucket.lastRefillAt = now;
  }

  if (bucket.tokens <= 0) return false;

  bucket.tokens -= 1;
  return true;
}

/**
 * Returns the number of remaining AI requests for a user this hour.
 */
export function getRemainingRequests(userId: string): number {
  const bucket = buckets.get(userId);
  return bucket ? bucket.tokens : RATE_LIMIT_RPH;
}

// ─── SDK Clients ──────────────────────────────────────────────────────────────

/**
 * Raw Anthropic SDK client — used for non-streaming structured calls.
 * Instantiated once; safe to reuse across requests in Node.js.
 */
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Vercel AI SDK provider — used for streaming API routes.
 */
const anthropicProvider = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ─── Error Types ──────────────────────────────────────────────────────────────

export class AIRateLimitError extends Error {
  readonly statusCode = 429;
  constructor(userId: string) {
    super(`Rate limit exceeded for user ${userId}. Try again later.`);
    this.name = "AIRateLimitError";
  }
}

export class AIClientError extends Error {
  readonly statusCode: number;
  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = "AIClientError";
    this.statusCode = statusCode;
  }
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface NarrativeOptions {
  userId: string;
  organizationId: string;
  financialData: FinancialData;
  reportType: "profit_loss" | "balance_sheet" | "cash_flow" | "summary";
  /** Optional additional context (e.g. industry, company name) */
  context?: string;
}

export interface ChatOptions {
  userId: string;
  organizationId: string;
  financialData: FinancialData;
  conversationHistory: Anthropic.MessageParam[];
  userMessage: string;
}

export interface GeneratedNarrative {
  content: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
}

// ─── Prompt Builders ──────────────────────────────────────────────────────────

function buildNarrativeSystemPrompt(reportType: NarrativeOptions["reportType"]): string {
  const base = `You are a senior financial analyst writing board-ready reports for UAE SMBs and clinic CFOs.
Your writing is precise, executive-friendly, and avoids jargon.
You always:
- Lead with the most important insight
- Use specific numbers (in AED or the source currency)
- Flag significant variances (>10%) immediately
- Keep paragraphs to 3 sentences maximum
- Structure output with clear sections using markdown headers`;

  const typeInstructions: Record<typeof reportType, string> = {
    profit_loss: "\n\nFocus on revenue growth, gross margin trends, operating expenses, and net profit narrative.",
    balance_sheet: "\n\nFocus on liquidity ratios, asset quality, debt structure, and working capital position.",
    cash_flow: "\n\nFocus on operating cash generation, capex requirements, free cash flow, and runway.",
    summary: "\n\nProvide a concise executive summary covering all key financial metrics and top 3 action items.",
  };

  return base + typeInstructions[reportType];
}

function buildNarrativeUserPrompt(options: NarrativeOptions): string {
  const { financialData, reportType, context } = options;

  return `Generate a board-ready ${reportType.replace("_", " ")} narrative report.

${context ? `Company Context: ${context}\n` : ""}
Financial Data:
${JSON.stringify(financialData, null, 2)}

Structure your response with:
1. **Executive Summary** (2-3 sentences, most critical finding first)
2. **Key Metrics** (bullet points with period-over-period comparison)
3. **Performance Analysis** (2-3 paragraphs)
4. **Variance Highlights** (flag anything >10% change)
5. **Recommendations** (3 actionable items)`;
}

function buildChatSystemPrompt(financialData: FinancialData): string {
  return `You are a financial analyst assistant. You have access to the following financial data and must answer questions accurately based only on this data.

Financial Data:
${JSON.stringify(financialData, null, 2)}

Rules:
- Only answer based on the data provided. If information is not in the data, say so clearly.
- Always cite specific figures when answering.
- Keep answers concise (under 150 words unless a detailed breakdown is explicitly requested).
- Format numbers clearly (use commas, specify currency).`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate a complete narrative report (non-streaming).
 * Use for background jobs or when the full content is needed at once.
 */
export async function generateNarrative(
  options: NarrativeOptions
): Promise<GeneratedNarrative> {
  if (!checkRateLimit(options.userId)) {
    throw new AIRateLimitError(options.userId);
  }

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS_NARRATIVE,
      system: buildNarrativeSystemPrompt(options.reportType),
      messages: [
        { role: "user", content: buildNarrativeUserPrompt(options) },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new AIClientError("No text content in AI response");
    }

    return {
      content: textBlock.text,
      model: response.model,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    };
  } catch (err) {
    if (err instanceof AIRateLimitError || err instanceof AIClientError) throw err;
    if (err instanceof Anthropic.RateLimitError) {
      throw new AIClientError("Anthropic rate limit reached. Try again shortly.", 429);
    }
    if (err instanceof Anthropic.AuthenticationError) {
      throw new AIClientError("AI service authentication failed.", 500);
    }
    throw new AIClientError(
      err instanceof Error ? err.message : "Unknown AI error",
      500
    );
  }
}

/**
 * Stream a narrative report via Vercel AI SDK.
 * Returns the result of `streamText` — pipe `result.toDataStreamResponse()` in the API route.
 */
export async function streamNarrative(options: NarrativeOptions) {
  if (!checkRateLimit(options.userId)) {
    throw new AIRateLimitError(options.userId);
  }

  return streamText({
    model: anthropicProvider(MODEL),
    system: buildNarrativeSystemPrompt(options.reportType),
    messages: [
      { role: "user", content: buildNarrativeUserPrompt(options) },
    ],
    maxTokens: MAX_TOKENS_NARRATIVE,
  });
}

/**
 * Stream a chat response for "Ask My Data" feature.
 * Returns the result of `streamText` — pipe `result.toDataStreamResponse()` in the API route.
 */
export async function streamChatResponse(options: ChatOptions) {
  if (!checkRateLimit(options.userId)) {
    throw new AIRateLimitError(options.userId);
  }

  const messages: Anthropic.MessageParam[] = [
    ...options.conversationHistory,
    { role: "user", content: options.userMessage },
  ];

  return streamText({
    model: anthropicProvider(MODEL),
    system: buildChatSystemPrompt(options.financialData),
    messages,
    maxTokens: MAX_TOKENS_CHAT,
  });
}

/**
 * Non-streaming chat response (for server-side use cases).
 */
export async function generateChatResponse(options: ChatOptions): Promise<string> {
  if (!checkRateLimit(options.userId)) {
    throw new AIRateLimitError(options.userId);
  }

  const messages: Anthropic.MessageParam[] = [
    ...options.conversationHistory,
    { role: "user", content: options.userMessage },
  ];

  try {
    const { text } = await generateText({
      model: anthropicProvider(MODEL),
      system: buildChatSystemPrompt(options.financialData),
      messages,
      maxTokens: MAX_TOKENS_CHAT,
    });
    return text;
  } catch (err) {
    if (err instanceof AIRateLimitError) throw err;
    throw new AIClientError(
      err instanceof Error ? err.message : "Chat generation failed",
      500
    );
  }
}
