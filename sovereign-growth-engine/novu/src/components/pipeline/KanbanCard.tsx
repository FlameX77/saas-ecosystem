import { Contact } from "@/types";
import { formatCurrency, timeAgo } from "@/lib/utils";
import { ChannelBadge } from "@/components/shared/ChannelBadge";
import { Phone, Mail } from "lucide-react";
export function KanbanCard({ contact, onDragStart }: { contact: Contact; onDragStart: (e: React.DragEvent, contact: Contact) => void }) {
  return (
    <div draggable onDragStart={(e) => onDragStart(e, contact)} className="cursor-grab rounded-lg border border-border bg-surface p-4 transition-all hover:border-border/80 active:cursor-grabbing">
      <p className="text-sm font-medium text-text-1">{contact.first_name} {contact.last_name}</p>
      <div className="mt-1 flex items-center gap-2">
        {contact.phone && <span className="flex items-center gap-1 text-xs text-text-3"><Phone className="h-3 w-3" />{contact.phone}</span>}
        {contact.email && <span className="flex items-center gap-1 text-xs text-text-3"><Mail className="h-3 w-3" />{contact.email}</span>}
      </div>
      <div className="mt-2 flex items-center justify-between">
        {contact.deal_value ? <span className="text-sm font-semibold text-green">{formatCurrency(contact.deal_value)}</span> : <span />}
        <span className="text-xs text-text-3">{timeAgo(contact.created_at)}</span>
      </div>
    </div>
  );
}
