/**
 * Narrative Prompt Builder
 *
 * Constructs structured prompts for Claude to generate board-ready
 * financial narrative reports from parsed financial data.
 */

import type { ParsedReport, Variance } from "@/lib/parsers/normalizer";

// ─── Types ────────────────────────────────────────────────────────────────────

export type NarrativeTone = "board_meeting" | "investor_update" | "internal_review";

export type Industry = "clinic" | "retail" | "fnb" | "services" | "other";

export interface NarrativePromptOptions {
  report: ParsedReport;
  variances: Variance[];
  tone: NarrativeTone;
  industry: Industry;
  companyName: string;
  currency?: string;
}

export interface NarrativeSections {
  executiveSummary: string;
  revenueAnalysis: string;
  costBreakdown: string;
  profitabilityCommentary: string;
  forwardLooking: string;
}

// ─── Tone Descriptions ────────────────────────────────────────────────────────

const TONE_CONFIG: Record<NarrativeTone, { label: string; style: string }> = {
  board_meeting: {
    label: "Board Meeting",
    style: `Formal, authoritative, and concise. Use third-person. Lead with numbers.
      Paragraphs are 2-3 sentences. Use precise financial language without jargon.
      Recommend clear actions at the end of each section.`,
  },
  investor_update: {
    label: "Investor Update",
    style: `Professional but accessible. Highlight growth, risks, and strategic context.
      Focus on what drives long-term value. Reference market dynamics.
      Be transparent about challenges while maintaining confidence.`,
  },
  internal_review: {
    label: "Internal Review",
    style: `Direct, analytical, and candid. Include operational context.
      Flag underperformance clearly. Suggest root causes where visible.
      Use bullet points for action items. Less formal than board language.`,
  },
};

// ─── Industry Context ─────────────────────────────────────────────────────────

const INDUSTRY_CONTEXT: Record<Industry, string> = {
  clinic: `This is a healthcare/clinic business. Key metrics: patient volumes,
    consumable costs, staff costs, billing collections, insurance receivables.
    Reference healthcare-specific KPIs (revenue per patient, cost per consultation).`,
  retail: `This is a retail business. Key metrics: gross margin, inventory turnover,
    same-store sales, shrinkage, occupancy costs. Reference retail seasonality.`,
  fnb: `This is a food & beverage business. Key metrics: food cost percentage,
    covers/transactions, average spend, labour as % of revenue, waste.
    Reference seasonality and supply chain dynamics.`,
  services: `This is a professional services business. Key metrics: utilization rate,
    revenue per employee, client retention, project margins.
    Reference billable hours and pipeline health.`,
  other: `Reference general business financial metrics. Focus on revenue growth,
    margin trends, and cash generation.`,
};

// ─── Number Formatting ────────────────────────────────────────────────────────

function fmt(n: number, currency = "AED"): string {
  if (Math.abs(n) >= 1_000_000) return `${currency} ${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `${currency} ${(n / 1_000).toFixed(1)}K`;
  return `${currency} ${n.toFixed(2)}`;
}

function pct(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
}

function margin(profit: number, revenue: number): string {
  if (revenue === 0) return "0.0%";
  return `${((profit / revenue) * 100).toFixed(1)}%`;
}

// ─── Data Summary Builder ─────────────────────────────────────────────────────

function buildDataSummary(report: ParsedReport, variances: Variance[], currency: string): string {
  const { revenue, expenses, grossProfit, netProfit, ebitda, previousPeriod } = report;
  const lines: string[] = [];

  lines.push(`CURRENT PERIOD: ${report.period}`);
  lines.push(`Revenue Total: ${fmt(revenue.total, currency)}`);
  lines.push(`  Revenue Breakdown:`);
  revenue.breakdown.slice(0, 8).forEach((item) => {
    lines.push(`    - ${item.label}: ${fmt(item.amount, currency)}`);
  });

  lines.push(`Total Expenses: ${fmt(expenses.total, currency)}`);
  lines.push(`  Expense Breakdown:`);
  expenses.breakdown.slice(0, 8).forEach((item) => {
    lines.push(`    - ${item.label}: ${fmt(item.amount, currency)}`);
  });

  lines.push(`Gross Profit: ${fmt(grossProfit, currency)} (margin: ${margin(grossProfit, revenue.total)})`);
  lines.push(`Net Profit: ${fmt(netProfit, currency)} (margin: ${margin(netProfit, revenue.total)})`);
  if (ebitda !== null) lines.push(`EBITDA: ${fmt(ebitda, currency)}`);

  if (previousPeriod) {
    lines.push(`\nPREVIOUS PERIOD: ${previousPeriod.period}`);
    lines.push(`Revenue: ${fmt(previousPeriod.revenue.total, currency)}`);
    lines.push(`Net Profit: ${fmt(previousPeriod.netProfit, currency)}`);
    lines.push(`Gross Profit: ${fmt(previousPeriod.grossProfit, currency)}`);
  }

  if (variances.length > 0) {
    lines.push(`\nSIGNIFICANT VARIANCES (>15% change):`);
    variances.forEach((v) => {
      lines.push(
        `  - ${v.metric}: ${fmt(v.current, currency)} vs ${fmt(v.previous, currency)} (${pct(v.changePct)}) [${v.severity.toUpperCase()}]`
      );
    });
  }

  return lines.join("\n");
}

// ─── System Prompt ────────────────────────────────────────────────────────────

export function buildSystemPrompt(tone: NarrativeTone, industry: Industry): string {
  const { style } = TONE_CONFIG[tone];
  const industryContext = INDUSTRY_CONTEXT[industry];

  return `You are a senior financial analyst generating board-ready narrative reports.

TONE & STYLE:
${style}

INDUSTRY CONTEXT:
${industryContext}

FORMATTING RULES:
- Use markdown headers (##) for each section
- Keep each section to 2-4 paragraphs
- Use **bold** for key figures
- Never use bullet points in the main narrative (except recommendations)
- Always cite specific numbers with currency
- For recommendations, use a numbered list
- Do not repeat the same metric in multiple sections without adding new context`;
}

// ─── User Prompt ─────────────────────────────────────────────────────────────

export function buildUserPrompt(options: NarrativePromptOptions): string {
  const { report, variances, companyName, currency = "AED" } = options;
  const dataSummary = buildDataSummary(report, variances, currency);
  const hasPrev = !!report.previousPeriod;

  return `Generate a complete financial narrative report for ${companyName}.

FINANCIAL DATA:
${dataSummary}

Generate the following sections IN ORDER. Each section must start with its exact markdown header:

## Executive Summary
3-4 sentences covering the most critical finding, overall performance trend, and top priority action. Lead with the biggest number or most significant change.

## Revenue Analysis
Analyse revenue performance${hasPrev ? " vs prior period" : ""}. Identify the top 2-3 revenue drivers. ${hasPrev ? `Revenue changed by ${pct(((report.revenue.total - report.previousPeriod!.revenue.total) / Math.abs(report.previousPeriod!.revenue.total || 1)) * 100)}.` : ""}

## Cost & Expense Breakdown
Identify the top cost drivers and their impact on margins. Comment on any cost categories that appear elevated or well-controlled. Note the gross margin of ${margin(report.grossProfit, report.revenue.total)}.

## Profitability Commentary
Analyse gross margin (${margin(report.grossProfit, report.revenue.total)}), net margin (${margin(report.netProfit, report.revenue.total)})${report.ebitda !== null ? `, and EBITDA` : ""}. ${hasPrev ? "Compare to prior period margins." : ""} Explain what is driving profitability trends.

## Variance Alerts
${variances.length > 0
  ? `The following items moved significantly: ${variances.map((v) => `${v.metric} (${pct(v.changePct)})`).join(", ")}. For each variance, explain the likely cause and business impact.`
  : "No significant variances detected (all metrics within 15% of prior period). Note the stability and what is working."}

## Forward-Looking Commentary
One paragraph. Based on this period's performance, what should management prioritise in the next reporting period? Be specific about 2-3 actionable priorities. Maintain a professional, measured tone.`;
}

// ─── Section Parser ───────────────────────────────────────────────────────────

/**
 * Split a completed narrative into structured sections.
 * Used when saving the narrative to the DB after streaming.
 */
export function parseNarrativeSections(content: string): NarrativeSections {
  const sectionKeys: Array<[keyof NarrativeSections, string]> = [
    ["executiveSummary", "Executive Summary"],
    ["revenueAnalysis", "Revenue Analysis"],
    ["costBreakdown", "Cost & Expense Breakdown"],
    ["profitabilityCommentary", "Profitability Commentary"],
    ["forwardLooking", "Forward-Looking Commentary"],
  ];

  const sections: Partial<NarrativeSections> = {};

  for (let i = 0; i < sectionKeys.length; i++) {
    const [key, header] = sectionKeys[i]!;
    const nextHeader = sectionKeys[i + 1]?.[1];

    const startIdx = content.indexOf(`## ${header}`);
    if (startIdx === -1) { sections[key] = ""; continue; }

    const endIdx = nextHeader ? content.indexOf(`## ${nextHeader}`) : content.length;
    const raw = content.slice(startIdx + `## ${header}`.length, endIdx === -1 ? undefined : endIdx);
    sections[key] = raw.trim();
  }

  return sections as NarrativeSections;
}
