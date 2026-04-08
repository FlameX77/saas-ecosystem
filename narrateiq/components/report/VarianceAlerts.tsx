import { TrendingDown, TrendingUp, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Variance } from "@/lib/parsers/normalizer";

interface VarianceAlertsProps {
  variances: Variance[];
  currency?: string;
}

function formatAmount(n: number, currency: string): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${currency} ${(n / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${currency} ${(n / 1_000).toFixed(1)}K`;
  return `${currency} ${n.toFixed(0)}`;
}

const SEVERITY_CONFIG = {
  critical: {
    bg: "bg-red-50 border-red-200",
    badge: "bg-red-100 text-red-700",
    icon: AlertTriangle,
    iconColor: "text-red-500",
    label: "Critical",
  },
  warning: {
    bg: "bg-amber-50 border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    icon: AlertTriangle,
    iconColor: "text-amber-500",
    label: "Warning",
  },
  info: {
    bg: "bg-blue-50 border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    icon: Info,
    iconColor: "text-blue-500",
    label: "Note",
  },
};

export function VarianceAlerts({ variances, currency = "AED" }: VarianceAlertsProps) {
  if (!variances.length) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <span className="text-emerald-600 text-sm">✓</span>
        </div>
        <div>
          <p className="text-sm font-medium text-emerald-800">All metrics within normal range</p>
          <p className="text-xs text-emerald-600 mt-0.5">
            No significant variances detected (all within 15% of prior period).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Variance Alerts</h3>
        <span className="text-xs text-gray-400">{variances.length} flagged</span>
      </div>

      {variances.map((v, idx) => {
        const config = SEVERITY_CONFIG[v.severity];
        const Icon = config.icon;
        const isNegative = v.changePct < 0;
        const TrendIcon = isNegative ? TrendingDown : TrendingUp;
        const trendColor = isNegative ? "text-red-500" : "text-emerald-500";

        return (
          <div
            key={idx}
            className={cn("rounded-xl border p-4 flex items-start gap-3", config.bg)}
          >
            <div className={cn("mt-0.5 flex-shrink-0", config.iconColor)}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-gray-900 text-sm">{v.metric}</span>
                <span className={cn("text-xs px-1.5 py-0.5 rounded font-semibold", config.badge)}>
                  {config.label}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1.5">
                <div>
                  <p className="text-xs text-gray-500">Current</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatAmount(v.current, currency)}
                  </p>
                </div>
                <div className="text-gray-300">→</div>
                <div>
                  <p className="text-xs text-gray-500">Previous</p>
                  <p className="text-sm text-gray-600">{formatAmount(v.previous, currency)}</p>
                </div>
                <div className={cn("flex items-center gap-1 font-semibold text-sm ml-auto", trendColor)}>
                  <TrendIcon className="h-4 w-4" />
                  {v.changePct >= 0 ? "+" : ""}
                  {v.changePct.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
