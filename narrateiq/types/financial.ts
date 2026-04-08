/**
 * NarrateIQ — Financial Data Types
 *
 * All file parsers (CSV, Excel, PDF) normalize their output to these types.
 * This is the contract between the parser layer and the AI layer.
 */

// ─── Base Types ───────────────────────────────────────────────────────────────

export type Currency = string; // ISO 4217, e.g. "AED", "USD"

export interface MonetaryValue {
  amount: number;
  currency: Currency;
}

export interface PeriodComparison {
  current: number;
  previous: number | null;
  changeAmount: number | null;
  changePct: number | null; // null if previous is 0 or null
}

// ─── Financial Line Items ──────────────────────────────────────────────────────

export interface FinancialLineItem {
  /** Account/metric name as it appears in the source file */
  label: string;
  /** Normalized account category, e.g. "Revenue", "COGS", "Operating Expense" */
  category: string;
  values: PeriodComparison;
  currency: Currency;
  /** Depth in the account hierarchy (0 = top-level, 1 = sub-account, etc.) */
  indent: number;
  /** True if this is a subtotal/total row */
  isSubtotal: boolean;
}

// ─── Report-Specific Structures ───────────────────────────────────────────────

export interface ProfitLossData {
  type: "profit_loss";
  revenue: FinancialLineItem[];
  costOfGoodsSold: FinancialLineItem[];
  grossProfit: PeriodComparison;
  operatingExpenses: FinancialLineItem[];
  operatingIncome: PeriodComparison;
  otherIncomeExpenses: FinancialLineItem[];
  netIncome: PeriodComparison;
  grossMarginPct: PeriodComparison;
  netMarginPct: PeriodComparison;
}

export interface BalanceSheetData {
  type: "balance_sheet";
  currentAssets: FinancialLineItem[];
  nonCurrentAssets: FinancialLineItem[];
  totalAssets: PeriodComparison;
  currentLiabilities: FinancialLineItem[];
  nonCurrentLiabilities: FinancialLineItem[];
  totalLiabilities: PeriodComparison;
  equity: FinancialLineItem[];
  totalEquity: PeriodComparison;
  currentRatio: number | null;
  debtToEquityRatio: number | null;
}

export interface CashFlowData {
  type: "cash_flow";
  operatingActivities: FinancialLineItem[];
  netOperatingCashFlow: PeriodComparison;
  investingActivities: FinancialLineItem[];
  netInvestingCashFlow: PeriodComparison;
  financingActivities: FinancialLineItem[];
  netFinancingCashFlow: PeriodComparison;
  netChangeInCash: PeriodComparison;
  openingCash: number | null;
  closingCash: number | null;
  freeCashFlow: PeriodComparison;
}

export interface GeneralLedgerData {
  type: "general_ledger";
  accounts: Array<{
    accountCode: string;
    accountName: string;
    debit: number;
    credit: number;
    balance: number;
    currency: Currency;
  }>;
}

// ─── Unified Financial Data ────────────────────────────────────────────────────

export type FinancialDataPayload =
  | ProfitLossData
  | BalanceSheetData
  | CashFlowData
  | GeneralLedgerData;

export interface FinancialData {
  /** Detected or user-specified report type */
  dataType: "profit_loss" | "balance_sheet" | "cash_flow" | "general_ledger" | "unknown";
  /** ISO date string, e.g. "2024-01-01" */
  periodStart: string | null;
  /** ISO date string, e.g. "2024-12-31" */
  periodEnd: string | null;
  currency: Currency;
  /** Source system hint (Zoho Books, QuickBooks, etc.) */
  sourceSystem: string | null;
  /** Typed payload matching dataType */
  data: FinancialDataPayload | null;
  /**
   * Raw rows as parsed from the file — always present as a fallback.
   * Array of key-value records where keys are column headers.
   */
  rawRows: Record<string, string | number | null>[];
  /** Parse metadata: number of rows, sheets, detected headers, etc. */
  parseMetadata: Record<string, unknown>;
}

// ─── Variance Detection ────────────────────────────────────────────────────────

export interface DetectedVariance {
  metricName: string;
  previousValue: number;
  currentValue: number;
  variancePct: number;
  severity: "info" | "warning" | "critical";
}

/**
 * Detect significant variances in a FinancialData payload.
 * Thresholds: info=5%, warning=10%, critical=25%
 */
export function detectVariances(data: FinancialData): DetectedVariance[] {
  const variances: DetectedVariance[] = [];

  function checkComparison(label: string, comp: PeriodComparison): void {
    if (comp.previous === null || comp.changePct === null) return;
    const pct = Math.abs(comp.changePct);
    if (pct < 5) return;

    variances.push({
      metricName: label,
      previousValue: comp.previous,
      currentValue: comp.current,
      variancePct: comp.changePct,
      severity: pct >= 25 ? "critical" : pct >= 10 ? "warning" : "info",
    });
  }

  if (data.data?.type === "profit_loss") {
    const pl = data.data;
    checkComparison("Gross Profit", pl.grossProfit);
    checkComparison("Operating Income", pl.operatingIncome);
    checkComparison("Net Income", pl.netIncome);
    checkComparison("Gross Margin %", pl.grossMarginPct);
    checkComparison("Net Margin %", pl.netMarginPct);
    pl.revenue.forEach((item) =>
      checkComparison(`Revenue: ${item.label}`, item.values)
    );
  }

  if (data.data?.type === "cash_flow") {
    const cf = data.data;
    checkComparison("Operating Cash Flow", cf.netOperatingCashFlow);
    checkComparison("Free Cash Flow", cf.freeCashFlow);
    checkComparison("Net Change in Cash", cf.netChangeInCash);
  }

  return variances;
}
