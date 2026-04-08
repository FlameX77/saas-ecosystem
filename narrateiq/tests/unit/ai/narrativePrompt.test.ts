import { describe, it, expect } from "vitest";
import {
  buildSystemPrompt,
  buildUserPrompt,
  parseNarrativeSections,
} from "@/lib/ai/prompts/narrativePrompt";
import type { NarrativeTone, Industry, NarrativePromptOptions } from "@/lib/ai/prompts/narrativePrompt";
import type { ParsedReport, Variance } from "@/lib/parsers/normalizer";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const BASE_REPORT: ParsedReport = {
  period: "Jan 2024 to Dec 2024",
  revenue: {
    total: 202000,
    breakdown: [
      { label: "Consultation Fees", amount: 125000 },
      { label: "Lab Services", amount: 45000 },
      { label: "Pharmacy Sales", amount: 32000 },
    ],
  },
  expenses: {
    total: 147500,
    breakdown: [
      { label: "Staff Salaries", amount: 85000 },
      { label: "Medical Supplies", amount: 28000 },
      { label: "Lab Consumables", amount: 12000 },
      { label: "Rent", amount: 18000 },
      { label: "Utilities", amount: 4500 },
    ],
  },
  grossProfit: 162000,
  netProfit: 54500,
  ebitda: null,
  cashFlow: null,
  previousPeriod: {
    period: "Jan 2023 to Dec 2023",
    revenue: { total: 166500, breakdown: [] },
    expenses: { total: 134700, breakdown: [] },
    grossProfit: 132000,
    netProfit: 31800,
    ebitda: null,
    cashFlow: null,
    previousPeriod: null,
  },
};

const SINGLE_PERIOD_REPORT: ParsedReport = {
  period: "Q1 2024",
  revenue: {
    total: 75000,
    breakdown: [{ label: "Revenue", amount: 75000 }],
  },
  expenses: {
    total: 57000,
    breakdown: [
      { label: "Cost of Sales", amount: 22000 },
      { label: "Operating Expenses", amount: 35000 },
    ],
  },
  grossProfit: 53000,
  netProfit: 18000,
  ebitda: null,
  cashFlow: null,
  previousPeriod: null,
};

const VARIANCES: Variance[] = [
  {
    metric: "Revenue",
    current: 202000,
    previous: 166500,
    changePct: 21.3,
    severity: "warning",
  },
  {
    metric: "Net Profit",
    current: 54500,
    previous: 31800,
    changePct: 71.4,
    severity: "critical",
  },
];

// ─── buildSystemPrompt ────────────────────────────────────────────────────────

describe("buildSystemPrompt", () => {
  it("includes tone style for board_meeting", () => {
    const prompt = buildSystemPrompt("board_meeting", "clinic");
    expect(prompt).toContain("Formal");
    expect(prompt).toContain("authoritative");
  });

  it("includes tone style for investor_update", () => {
    const prompt = buildSystemPrompt("investor_update", "clinic");
    expect(prompt).toContain("growth");
    expect(prompt).toContain("strategic");
  });

  it("includes tone style for internal_review", () => {
    const prompt = buildSystemPrompt("internal_review", "clinic");
    expect(prompt).toContain("analytical");
    expect(prompt).toContain("candid");
  });

  it("includes clinic industry context", () => {
    const prompt = buildSystemPrompt("board_meeting", "clinic");
    expect(prompt).toContain("healthcare");
    expect(prompt).toContain("patient");
  });

  it("includes retail industry context", () => {
    const prompt = buildSystemPrompt("board_meeting", "retail");
    expect(prompt).toContain("retail");
    expect(prompt).toContain("gross margin");
  });

  it("includes fnb industry context", () => {
    const prompt = buildSystemPrompt("board_meeting", "fnb");
    expect(prompt).toContain("food");
    expect(prompt).toContain("beverage");
  });

  it("includes services industry context", () => {
    const prompt = buildSystemPrompt("board_meeting", "services");
    expect(prompt).toContain("services");
    expect(prompt).toContain("utilization");
  });

  it("includes formatting rules in all combinations", () => {
    const tones: NarrativeTone[] = ["board_meeting", "investor_update", "internal_review"];
    const industries: Industry[] = ["clinic", "retail", "fnb", "services", "other"];
    for (const tone of tones) {
      for (const industry of industries) {
        const prompt = buildSystemPrompt(tone, industry);
        expect(prompt).toContain("##");
        expect(prompt).toContain("markdown");
        expect(prompt).toContain("bold");
      }
    }
  });

  it("returns a non-empty string for all tone/industry combinations", () => {
    const tones: NarrativeTone[] = ["board_meeting", "investor_update", "internal_review"];
    const industries: Industry[] = ["clinic", "retail", "fnb", "services", "other"];
    for (const tone of tones) {
      for (const industry of industries) {
        const prompt = buildSystemPrompt(tone, industry);
        expect(prompt.length).toBeGreaterThan(100);
      }
    }
  });
});

// ─── buildUserPrompt ──────────────────────────────────────────────────────────

describe("buildUserPrompt", () => {
  const baseOptions: NarrativePromptOptions = {
    report: BASE_REPORT,
    variances: VARIANCES,
    tone: "board_meeting",
    industry: "clinic",
    companyName: "Acme Clinic",
    currency: "AED",
  };

  it("includes company name", () => {
    const prompt = buildUserPrompt(baseOptions);
    expect(prompt).toContain("Acme Clinic");
  });

  it("includes current period", () => {
    const prompt = buildUserPrompt(baseOptions);
    expect(prompt).toContain("Jan 2024 to Dec 2024");
  });

  it("includes revenue total", () => {
    const prompt = buildUserPrompt(baseOptions);
    // 202000 → AED 202.0K
    expect(prompt).toContain("202");
  });

  it("includes previous period when available", () => {
    const prompt = buildUserPrompt(baseOptions);
    expect(prompt).toContain("PREVIOUS PERIOD");
    expect(prompt).toContain("Jan 2023 to Dec 2023");
  });

  it("omits previous period section when not available", () => {
    const prompt = buildUserPrompt({ ...baseOptions, report: SINGLE_PERIOD_REPORT, variances: [] });
    expect(prompt).not.toContain("PREVIOUS PERIOD");
  });

  it("includes all six required section headers in order", () => {
    const prompt = buildUserPrompt(baseOptions);
    const sections = [
      "## Executive Summary",
      "## Revenue Analysis",
      "## Cost & Expense Breakdown",
      "## Profitability Commentary",
      "## Variance Alerts",
      "## Forward-Looking Commentary",
    ];
    let lastIdx = -1;
    for (const section of sections) {
      const idx = prompt.indexOf(section);
      expect(idx, `Missing section: ${section}`).toBeGreaterThan(-1);
      expect(idx, `Section out of order: ${section}`).toBeGreaterThan(lastIdx);
      lastIdx = idx;
    }
  });

  it("includes variance metrics when variances exist", () => {
    const prompt = buildUserPrompt(baseOptions);
    expect(prompt).toContain("Revenue");
    expect(prompt).toContain("Net Profit");
    expect(prompt).toContain("SIGNIFICANT VARIANCES");
  });

  it("notes no significant variances when list is empty", () => {
    const prompt = buildUserPrompt({ ...baseOptions, variances: [] });
    expect(prompt).toContain("No significant variances");
  });

  it("includes revenue percentage change vs prior period", () => {
    const prompt = buildUserPrompt(baseOptions);
    // Revenue went from 166500 to 202000 = ~21.3%
    expect(prompt).toMatch(/\+21\.\d+%/);
  });

  it("does not include revenue change line for single-period report", () => {
    const prompt = buildUserPrompt({ ...baseOptions, report: SINGLE_PERIOD_REPORT, variances: [] });
    // No "vs prior period" comparison
    expect(prompt).not.toContain("vs prior period");
  });

  it("uses provided currency", () => {
    const prompt = buildUserPrompt({ ...baseOptions, currency: "USD" });
    expect(prompt).toContain("USD");
  });

  it("defaults to AED currency", () => {
    const { currency, ...rest } = baseOptions;
    const prompt = buildUserPrompt(rest);
    expect(prompt).toContain("AED");
  });

  it("includes gross margin in cost section instruction", () => {
    const prompt = buildUserPrompt(baseOptions);
    // grossProfit=162000, revenue=202000 → ~80.2%
    expect(prompt).toMatch(/80\.\d+%/);
  });

  it("includes revenue breakdown items", () => {
    const prompt = buildUserPrompt(baseOptions);
    expect(prompt).toContain("Consultation Fees");
    expect(prompt).toContain("Lab Services");
  });

  it("includes expense breakdown items", () => {
    const prompt = buildUserPrompt(baseOptions);
    expect(prompt).toContain("Staff Salaries");
    expect(prompt).toContain("Medical Supplies");
  });
});

// ─── parseNarrativeSections ───────────────────────────────────────────────────

const FULL_NARRATIVE = `## Executive Summary
The clinic delivered exceptional results for the period, with total revenue reaching **AED 202.0K** — an increase of 21.3% over the prior year. Net profit surged 71.4% to **AED 54.5K**, reflecting improved operational efficiency and stronger patient volumes. Management should prioritise sustaining this growth momentum while monitoring cost inflation.

## Revenue Analysis
Revenue grew from **AED 166.5K** to **AED 202.0K**, driven primarily by Consultation Fees (**AED 125.0K**), which now represent 61.9% of total revenue. Lab Services also contributed meaningfully at **AED 45.0K**, up from the prior period. Pharmacy Sales remained stable. Management should evaluate capacity to sustain this growth trajectory.

## Cost & Expense Breakdown
Total expenses of **AED 147.5K** were led by Staff Salaries at **AED 85.0K** (57.6% of expenses), consistent with the prior period's staffing level. Medical Supplies cost **AED 28.0K**, reflecting increased patient throughput. The gross margin of 80.2% is strong for a clinic operation, indicating effective cost management.

## Profitability Commentary
The gross margin of 80.2% and net margin of 27.0% represent significant improvements over the prior period. The increase in net margin from approximately 19.1% to 27.0% reflects operating leverage — revenue grew faster than fixed costs. Management should maintain discipline on variable costs as volumes continue to grow.

## Variance Alerts
Two metrics recorded significant variances. Revenue increased 21.3% (warning level), driven by higher patient volumes and expanded service capacity. Net Profit surged 71.4% (critical level), primarily attributable to operating leverage as fixed costs were absorbed by growing revenue. Both variances are favourable and indicate strong performance.

## Forward-Looking Commentary
Management should prioritise three areas in the next reporting period: first, sustaining the patient volume growth by monitoring appointment capacity and staffing levels; second, reviewing consumable procurement to ensure Medical Supplies costs scale proportionally with revenue; and third, exploring whether Pharmacy Sales can be expanded to capture a larger share of the growing patient base.`;

describe("parseNarrativeSections", () => {
  it("extracts executive summary", () => {
    const sections = parseNarrativeSections(FULL_NARRATIVE);
    expect(sections.executiveSummary).toContain("exceptional results");
    expect(sections.executiveSummary).toContain("AED 202.0K");
  });

  it("extracts revenue analysis", () => {
    const sections = parseNarrativeSections(FULL_NARRATIVE);
    expect(sections.revenueAnalysis).toContain("Revenue grew");
    expect(sections.revenueAnalysis).toContain("Consultation Fees");
  });

  it("extracts cost breakdown", () => {
    const sections = parseNarrativeSections(FULL_NARRATIVE);
    expect(sections.costBreakdown).toContain("Staff Salaries");
    expect(sections.costBreakdown).toContain("80.2%");
  });

  it("extracts profitability commentary", () => {
    const sections = parseNarrativeSections(FULL_NARRATIVE);
    expect(sections.profitabilityCommentary).toContain("gross margin");
    expect(sections.profitabilityCommentary).toContain("net margin");
  });

  it("extracts forward-looking commentary", () => {
    const sections = parseNarrativeSections(FULL_NARRATIVE);
    expect(sections.forwardLooking).toContain("prioritise");
    expect(sections.forwardLooking).toContain("next reporting period");
  });

  it("does not include the ## header in section content", () => {
    const sections = parseNarrativeSections(FULL_NARRATIVE);
    expect(sections.executiveSummary).not.toContain("## Executive Summary");
    expect(sections.revenueAnalysis).not.toContain("## Revenue Analysis");
    expect(sections.costBreakdown).not.toContain("## Cost & Expense Breakdown");
    expect(sections.profitabilityCommentary).not.toContain("## Profitability Commentary");
    expect(sections.forwardLooking).not.toContain("## Forward-Looking Commentary");
  });

  it("does not bleed one section's content into the next", () => {
    const sections = parseNarrativeSections(FULL_NARRATIVE);
    // Executive Summary should not contain Revenue Analysis content
    expect(sections.executiveSummary).not.toContain("Revenue grew from");
    // Revenue Analysis should not contain Cost Breakdown content
    expect(sections.revenueAnalysis).not.toContain("Staff Salaries");
  });

  it("returns empty strings for missing sections", () => {
    const partial = `## Executive Summary\nSome summary content here.`;
    const sections = parseNarrativeSections(partial);
    expect(sections.executiveSummary).toBe("Some summary content here.");
    expect(sections.revenueAnalysis).toBe("");
    expect(sections.costBreakdown).toBe("");
    expect(sections.profitabilityCommentary).toBe("");
    expect(sections.forwardLooking).toBe("");
  });

  it("handles empty content string", () => {
    const sections = parseNarrativeSections("");
    expect(sections.executiveSummary).toBe("");
    expect(sections.revenueAnalysis).toBe("");
    expect(sections.costBreakdown).toBe("");
    expect(sections.profitabilityCommentary).toBe("");
    expect(sections.forwardLooking).toBe("");
  });

  it("trims whitespace from extracted sections", () => {
    const sections = parseNarrativeSections(FULL_NARRATIVE);
    // Each section should not start or end with whitespace
    for (const [key, value] of Object.entries(sections)) {
      expect(value, `Section ${key} has leading/trailing whitespace`).toBe(value.trim());
    }
  });

  it("handles narrative missing the Variance Alerts section gracefully", () => {
    // Variance Alerts is not parsed into NarrativeSections — it's one of the 5 keys
    // The parser only looks for the 5 keys defined in sectionKeys
    const noVarianceNarrative = FULL_NARRATIVE.replace(
      /## Variance Alerts[\s\S]*?(?=## Forward)/,
      ""
    );
    const sections = parseNarrativeSections(noVarianceNarrative);
    expect(sections.forwardLooking).toContain("prioritise");
  });

  it("extracts last section (forward-looking) without trailing garbage", () => {
    const sections = parseNarrativeSections(FULL_NARRATIVE);
    // Should not contain section header markers
    expect(sections.forwardLooking).not.toContain("##");
  });
});
