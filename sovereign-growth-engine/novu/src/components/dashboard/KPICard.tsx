import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
export function KPICard({ title, value, suffix, color, icon: Icon, trend, trendLabel, className }: { title: string; value: number | string; suffix?: string; color: string; icon: LucideIcon; trend?: number; trendLabel?: string; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-surface p-6", className)}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-text-2">{title}</p>
        <div className="rounded-lg bg-surface-2 p-2"><Icon className="h-4 w-4" style={{ color }} /></div>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight" style={{ color }}>{value}{suffix}</p>
      {trend !== undefined && (
        <div className="mt-2 flex items-center gap-1">
          {trend >= 0 ? <TrendingUp className="h-3 w-3 text-green" /> : <TrendingDown className="h-3 w-3 text-red" />}
          <span className={cn("text-xs font-medium", trend >= 0 ? "text-green" : "text-red")}>{trend > 0 ? "+" : ""}{trend}%</span>
          {trendLabel && <span className="text-xs text-text-3">{trendLabel}</span>}
        </div>
      )}
    </div>
  );
}
