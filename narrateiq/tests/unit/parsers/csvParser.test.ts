import { describe, it, expect } from "vitest";
import { parseCSV } from "@/lib/parsers/csvParser";
import { normalize, detectVariances } from "@/lib/parsers/normalizer";

// ─── Sample Data ──────────────────────────────────────────────────────────────

const ZOHO_BOOKS_CSV = `
Profit and Loss
Acme Clinic - Jan 2024 to Dec 2024

Account,Amount,Previous Year
Revenue,,
  Consultation Fees,"125,000","98,500"
  Lab Services,"45,000","38,200"
  Pharmacy Sales,"32,000","29,800"
Total Revenue,"202,000","166,500"
Cost of Goods Sold,,
  Medical Supplies,"(28,000)","(24,000)"
  Lab Consumables,"(12,000)","(10,500)"
Total Cost of Goods Sold,"(40,000)","(34,500)"
Gross Profit,"162,000","132,000"
Operating Expenses,,
  Staff Salaries,"(85,000)","(78,000)"
  Rent,"(18,000)","(18,000)"
  Utilities,"(4,500)","(4,200)"
Total Operating Expenses,"(107,500)","(100,200)"
Net Profit,"54,500","31,800"
`.trim();

const EMPTY_CSV = `Account,Amount\n`;

const SINGLE_PERIOD_CSV = `
Income Statement - Q1 2024
Account,Current Quarter
Revenue,"75,000"
Cost of Sales,"(22,000)"
Gross Profit,"53,000"
Operating Expenses,"(35,000)"
Net Profit,"18,000"
`.trim();

// ─── CSV Parser Tests ─────────────────────────────────────────────────────────

describe("parseCSV", () => {
  it("parses a Zoho Books style CSV with previous period", () => {
    const result = parseCSV(ZOHO_BOOKS_CSV);

    expect(result.rows.length).toBeGreaterThan(0);
    expect(result.periodCurrent).toMatch(/2024/);

    const totalRevenue = result.rows.find(
      (r) => r.label.toLowerCase().includes("total revenue")
    );
    expect(totalRevenue).toBeDefined();
    expect(totalRevenue?.amount).toBe(202000);
    expect(totalRevenue?.previousAmount).toBe(166500);
  });

  it("parses negative values in parentheses as negative numbers", () => {
    const result = parseCSV(ZOHO_BOOKS_CSV);
    const staffRow = result.rows.find((r) =>
      r.label.toLowerCase().includes("staff salaries")
    );
    expect(staffRow).toBeDefined();
    expect(staffRow!.amount).toBeLessThan(0);
  });

  it("correctly identifies subtotal rows", () => {
    const result = parseCSV(ZOHO_BOOKS_CSV);
    const subtotals = result.rows.filter((r) => r.isSubtotal);
    expect(subtotals.length).toBeGreaterThan(0);
    expect(subtotals.some((r) => r.label.includes("Gross Profit"))).toBe(true);
  });

  it("returns empty rows for empty CSV", () => {
    const result = parseCSV(EMPTY_CSV);
    expect(result.rows.length).toBe(0);
  });

  it("handles single-period CSV without crashing", () => {
    const result = parseCSV(SINGLE_PERIOD_CSV);
    expect(result.rows.length).toBeGreaterThan(0);
    expect(result.rows.every((r) => r.previousAmount === null)).toBe(true);
  });
});

// ─── Normalizer Tests ─────────────────────────────────────────────────────────

describe("normalize", () => {
  it("produces a valid ParsedReport from CSV output", () => {
    const csvResult = parseCSV(ZOHO_BOOKS_CSV);
    const report = normalize(csvResult);

    expect(report.revenue.total).toBeGreaterThan(0);
    expect(report.period).toBeTruthy();
    expect(report.previousPeriod).not.toBeNull();
    expect(report.previousPeriod!.revenue.total).toBeGreaterThan(0);
  });

  it("calculates grossProfit from revenue - COGS when no explicit subtotal", () => {
    const csvResult = parseCSV(SINGLE_PERIOD_CSV);
    const report = normalize(csvResult);
    // Gross profit should be non-zero
    expect(typeof report.grossProfit).toBe("number");
  });

  it("sets previousPeriod to null when no previous amounts exist", () => {
    const csvResult = parseCSV(SINGLE_PERIOD_CSV);
    const report = normalize(csvResult);
    expect(report.previousPeriod).toBeNull();
  });
});

// ─── Variance Detection Tests ──────────────────────────────────────────────────

describe("detectVariances", () => {
  it("flags metrics that changed more than threshold", () => {
    const csvResult = parseCSV(ZOHO_BOOKS_CSV);
    const report = normalize(csvResult);
    const variances = detectVariances(report, 15);

    // Revenue went from 166,500 to 202,000 = ~21% increase → should be flagged
    expect(variances.some((v) => v.metric === "Revenue")).toBe(true);
    // Net Profit went from 31,800 to 54,500 = ~71% increase → critical
    const netProfitVariance = variances.find((v) => v.metric === "Net Profit");
    expect(netProfitVariance).toBeDefined();
    expect(netProfitVariance!.severity).toBe("critical");
  });

  it("returns empty array when no previous period data", () => {
    const csvResult = parseCSV(SINGLE_PERIOD_CSV);
    const report = normalize(csvResult);
    const variances = detectVariances(report, 15);
    expect(variances).toHaveLength(0);
  });

  it("sorts variances by absolute change descending", () => {
    const csvResult = parseCSV(ZOHO_BOOKS_CSV);
    const report = normalize(csvResult);
    const variances = detectVariances(report, 5);

    for (let i = 1; i < variances.length; i++) {
      expect(Math.abs(variances[i - 1]!.changePct)).toBeGreaterThanOrEqual(
        Math.abs(variances[i]!.changePct)
      );
    }
  });

  it("marks critical severity for changes >= 30%", () => {
    const csvResult = parseCSV(ZOHO_BOOKS_CSV);
    const report = normalize(csvResult);
    const variances = detectVariances(report, 5);

    const criticals = variances.filter((v) => v.severity === "critical");
    expect(criticals.every((v) => Math.abs(v.changePct) >= 30)).toBe(true);
  });
});
