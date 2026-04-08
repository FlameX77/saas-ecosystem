import { Sequence } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Workflow } from "lucide-react";
interface SequenceListProps { sequences: Sequence[]; selectedId: string | null; onSelect: (seq: Sequence) => void; onCreate: () => void; }
export function SequenceList({ sequences, selectedId, onSelect, onCreate }: SequenceListProps) {
  return (
    <div className="rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h3 className="text-sm font-medium text-text-1">Sequences</h3>
        <Button size="sm" variant="outline" onClick={onCreate}><Plus className="mr-1.5 h-3.5 w-3.5" />New</Button>
      </div>
      <div className="divide-y divide-border">
        {sequences.length === 0 && <div className="p-8 text-center"><Workflow className="mx-auto mb-2 h-8 w-8 text-text-3" /><p className="text-sm text-text-3">No sequences yet</p></div>}
        {sequences.map((seq) => (
          <button key={seq.id} onClick={() => onSelect(seq)} className={cn("flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-surface-2", selectedId === seq.id && "bg-surface-2")}>
            <div>
              <p className="text-sm font-medium text-text-1">{seq.name}</p>
              <p className="text-xs text-text-3">{seq.industry_template || "Custom"}</p>
            </div>
            <Badge variant={seq.status === "active" ? "success" : seq.status === "paused" ? "warning" : "secondary"}>{seq.status}</Badge>
          </button>
        ))}
      </div>
    </div>
  );
}
