import { Skeleton } from "@/components/ui/skeleton";
export function KPICardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="flex items-start justify-between"><Skeleton className="h-4 w-24" /><Skeleton className="h-8 w-8 rounded-lg" /></div>
      <Skeleton className="mt-3 h-10 w-32" /><Skeleton className="mt-2 h-3 w-20" />
    </div>
  );
}
export function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <Skeleton className="mb-4 h-4 w-32" /><Skeleton className="h-48 w-full" />
    </div>
  );
}
export function PipelineColumnSkeleton() {
  return (
    <div className="min-w-[280px] rounded-xl border border-border bg-background p-3">
      <div className="mb-3 flex items-center gap-2 px-1"><Skeleton className="h-2.5 w-2.5 rounded-full" /><Skeleton className="h-4 w-20" /></div>
      <div className="space-y-2">{[1, 2, 3].map((i) => (<div key={i} className="rounded-lg border border-border bg-surface p-4"><Skeleton className="mb-2 h-4 w-28" /><Skeleton className="h-3 w-20" /><Skeleton className="mt-2 h-3 w-16" /></div>))}</div>
    </div>
  );
}
export function ConversationListSkeleton() {
  return (
    <div className="space-y-0">{[1, 2, 3, 4, 5].map((i) => (<div key={i} className="border-b border-border px-4 py-3"><div className="flex items-center gap-3"><Skeleton className="h-9 w-9 rounded-full" /><div className="flex-1"><Skeleton className="mb-1 h-4 w-28" /><Skeleton className="h-3 w-40" /></div></div></div>))}</div>
  );
}
