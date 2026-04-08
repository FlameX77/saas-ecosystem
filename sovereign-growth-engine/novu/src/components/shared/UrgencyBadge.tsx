import { cn } from "@/lib/utils";
export function UrgencyBadge({ days, className }: { days: number; className?: string }) {
  if (days <= 3) return <span className={cn("inline-flex items-center rounded-md bg-amber/10 px-2 py-0.5 text-xs font-medium text-amber", className)}>Warm</span>;
  if (days <= 7) return <span className={cn("inline-flex items-center rounded bg-amber/20 px-2 py-0.5 text-xs font-medium text-amber", className)}>Hot</span>;
  return <span className={cn("inline-flex items-center rounded bg-red/10 px-2 py-0.5 text-xs font-medium text-red", className)}>Urgent</span>;
}
