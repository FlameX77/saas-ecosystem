import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
export function EmptyState({ icon: Icon, title, description, action, actionLabel }: { icon: LucideIcon; title: string; description: string; action?: () => void; actionLabel?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
      <div className="mb-4 rounded-full bg-surface-2 p-4"><Icon className="h-8 w-8 text-text-3" /></div>
      <h3 className="mb-1 text-sm font-semibold text-text-1">{title}</h3>
      <p className="mb-4 max-w-xs text-sm text-text-3">{description}</p>
      {action && actionLabel && <Button variant="outline" size="sm" onClick={action}>{actionLabel}</Button>}
    </div>
  );
}
