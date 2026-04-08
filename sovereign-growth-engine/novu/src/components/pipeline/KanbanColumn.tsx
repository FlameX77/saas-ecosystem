import { Contact } from "@/types";
import { KanbanCard } from "./KanbanCard";
import { cn } from "@/lib/utils";
interface KanbanColumnProps { title: string; color: string; contacts: Contact[]; onDragStart: (e: React.DragEvent, contact: Contact) => void; onDragOver: (e: React.DragEvent) => void; onDrop: (e: React.DragEvent, stage: string) => void; stage: string; }
export function KanbanColumn({ title, color, contacts, onDragStart, onDragOver, onDrop, stage }: KanbanColumnProps) {
  return (
    <div onDragOver={onDragOver} onDrop={(e) => onDrop(e, stage)} className="min-w-[280px] flex-1 rounded-xl border border-border bg-background p-3">
      <div className="mb-3 flex items-center gap-2 px-1">
        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-sm font-medium text-text-1">{title}</span>
        <span className="ml-auto text-xs text-text-3">{contacts.length}</span>
      </div>
      <div className="space-y-2">
        {contacts.map((c) => <KanbanCard key={c.id} contact={c} onDragStart={onDragStart} />)}
        {contacts.length === 0 && <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-text-3">Drop contacts here</div>}
      </div>
    </div>
  );
}
