/**
 * Normalizer — converts parser output to the canonical ParsedReport structure.
 *
 * All parsers (CSV, Excel, PDF) produce ParsedRow[].
 * This module aggregates rows into the structured report format
 * expected by the AI prompt builder and the UI.
 */

import type { CSVParseResult } from "./csvParser";

// ─── Output Types ─────────────────────────────────────────────────────────────

export interface ReportLineItem {
  label: string;
  amount: number;
}

export interface ReportPeriod {
  period: string;
  revenue: { total: number; breakdown: ReportLineItem[] };
  expenses: { total: number; breakdown: ReportLineItem[] };
  grossProfit: number;
  netProfit: number;
  ebitda: number | null;
  cashFlow: number | null;
}

export interface ParsedReport {
  period: string;
  revenue: { total: number; breakdown: ReportLineItem[] };
  expenses: { total: number; breakdown: ReportLineItem[] };
  grossProfit: number;
  netProfit: number;
  ebitda: number | null;
  cashFlow: number | null;
  previousPeriod: ReportPeriod | null;
}

// ─── Category Mapping ─────────────────────────────────────────────────────────

const REVENUE_CATEGORIES = new Set(["Revenue", "Other"]);
const EXPENSE_CATEGORIES = new Set([
  "Cost of Sales",
  "Operating Expense",
  "Depreciation",
  "Finance Cost",
  "Tax",
]);
const SUBTOTAL_LABELS = new Set([
  "gross profit",
  "net profit",
  "net income",
  "net loss",
  "ebitda",
  "total revenue",
  "total expenses",
  "total income",
]);

function isRevenueRow(row: CSVParseResult["rows"][number]): boolean {
  return REVENUE_CATEGORIES.has(row.category) && !row.isSubtotal;
}

function isExpenseRow(row: CSVParseResult["rows"][number]): boolean {
  return EXPENSE_CATEGORIES.has(row.category) && !row.isSubtotal;
}

function findSubtotalRow(
  rows: CSVParseResult["rows"],
  keyword: string
): number {
  const row = rows.find(
    (r) => r.isSubtotal && r.label.toLowerCase().includes(keyword)
  );
  return row?.amount ?? 0;
}

function buildPeriod(
  rows: CSVParseResult["rows"],
  getAmount: (r: CSVParseResult["rows"][number]) => number,
  periodLabel: string
): ReportPeriod {
  const revenueRows = rows.filter(isRevenueRow);
  const expenseRows = rows.filter(isExpenseRow);

  const revenue: ReportLineItem[] = revenueRows.map((r) => ({
    label: r.label.trim(),
    amount: getAmount(r),
  }));
  const expenses: ReportLineItem[] = expenseRows.map((r) => ({
    label: r.label.trim(),
    amount: Math.abs(getAmount(r)), // expenses are stored as positive numbers
  }));

  const revenueTotal = revenue.reduce((s, r) => s + r.amount, 0);
  const expensesTotal = expenses.reduce((s, r) => s + r.amount, 0);

  // Use explicit subtotal rows if available, otherwise calculate
  const grossProfitRow = findSubtotalRow(rows.map((r) => ({ ...r, amount: getAmount(r) })), "gross profit");
  const netProfitRow = findSubtotalRow(rows.map((r) => ({ ...r, amount: getAmount(r) })), "net");
  const ebitdaRow = rows.find((r) => r.label.toLowerCase().includes("ebitda"));
  const cashFlowRow = rows.find((r) => r.label.toLowerCase().includes("cash flow"));

  const grossProfit = grossProfitRow !== 0 ? grossProfitRow : revenueTotal - expensesTotal;
  const netProfit = netProfitRow !== 0 ? netProfitRow : grossProfit;

  return {
    period: periodLabel,
    revenue: { total: revenueTotal, breakdown: revenue },
    expenses: { total: expensesTotal, breakdown: expenses },
    grossProfit,
    netProfit,
    ebitda: ebitdaRow ? getAmount(ebitdaRow) : null,
    cashFlow: cashFlowRow ? getAmount(cashFlowRow) : null,
  };
}

// ─── Main normalizer ──────────────────────────────────────────────────────────

export function normalize(parseResult: CSVParseResult): ParsedReport {
  const { rows, periodCurrent, periodPrevious } = parseResult;

  const hasPrevious = rows.some((r) => r.previousAmount !== null);

  const currentPeriod = buildPeriod(
    rows,
    (r) => r.amount,
    periodCurrent ?? "Current Period"
  );

  const previousPeriod = hasPrevious
    ? buildPeriod(
        rows,
        (r) => r.previousAmount ?? 0,
        periodPrevious ?? "Previous Period"
      )
    : null;

  return {
    period: currentPeriod.period,
    revenue: currentPeriod.revenue,
    expenses: currentPeriod.expenses,
    grossProfit: currentPeriod.grossProfit,
    netProfit: currentPeriod.netProfit,
    ebitda: currentPeriod.ebitda,
    cashFlow: currentPeriod.cashFlow,
    previousPeriod,
  };
}

// ─── Variance Detection ────────────────────────────────────────────────────────

export interface Variance {
  metric: string;
  current: number;
  previous: number;
  changePct: number;
  severity: "info" | "warning" | "critical";
}

/** Flag metrics that changed by more than the threshold vs prior period */
export function detectVariances(report: ParsedReport, thresholdPct = 15): Variance[] {
  const variances: Variance[] = [];
  const prev = report.previousPeriod;
  if (!prev) return [];

  function check(metric: string, current: number, previous: number) {
    if (previous === 0) return;
    const changePct = ((current - previous) / Math.abs(previous)) * 100;
    if (Math.abs(changePct) < thresholdPct) return;
    variances.push({
      metric,
      current,
      previous,
      changePct,
      severity: Math.abs(changePct) >= 30 ? "critical" : Math.abs(changePct) >= 20 ? "warning" : "info",
    });
  }

  check("Revenue", report.revenue.total, prev.revenue.total);
  check("Gross Profit", report.grossProfit, prev.grossProfit);
  check("Net Profit", report.netProfit, prev.netProfit);
  check("Total Expenses", report.expenses.total, prev.expenses.total);
  if (report.ebitda !== null && prev.ebitda !== null) {
    check("EBITDA", report.ebitda, prev.ebitda);
  }

  // Check individual revenue line items
  for (const item of report.revenue.breakdown) {
    const prevItem = prev.revenue.breakdown.find((p) => p.label === item.label);
    if (prevItem) check(`Revenue: ${item.label}`, item.amount, prevItem.amount);
  }

  return variances.sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct));
}
