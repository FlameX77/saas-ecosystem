"use client";
import { Contact, Conversation } from "@/types";
import { cn, timeAgo } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
interface ConversationListProps { contacts: Contact[]; conversations: Conversation[]; selectedId: string | null; onSelect: (contact: Contact) => void; }
export function ConversationList({ contacts, conversations, selectedId, onSelect }: ConversationListProps) {
  const getLastMessage = (contactId: string) => {
    const msgs = conversations.filter((c) => c.contact_id === contactId).sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime());
    return msgs[0] || null;
  };
  const getUnread = (contactId: string) => conversations.filter((c) => c.contact_id === contactId && c.direction === "inbound" && !c.read_at).length;
  return (
    <div className="h-full overflow-y-auto">
      {contacts.length === 0 && <p className="p-4 text-center text-sm text-text-3">No conversations yet</p>}
      {contacts.map((contact) => {
        const lastMsg = getLastMessage(contact.id);
        const unread = getUnread(contact.id);
        const initials = contact.first_name[0] + (contact.last_name?.[0] || "");
        return (
          <button key={contact.id} onClick={() => onSelect(contact)} className={cn("flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-surface-2", selectedId === contact.id && "bg-surface-2")}>
            <Avatar className="h-9 w-9"><AvatarFallback className="bg-primary/10 text-xs text-primary">{initials}</AvatarFallback></Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-text-1">{contact.first_name} {contact.last_name}</p>
                {lastMsg && <span className="text-xs text-text-3">{timeAgo(lastMsg.sent_at)}</span>}
              </div>
              <p className="truncate text-xs text-text-3">{lastMsg?.body || "No messages yet"}</p>
            </div>
            {unread > 0 && <Badge variant="default" className="h-5 w-5 justify-center rounded-full p-0 text-[10px]">{unread}</Badge>}
          </button>
        );
      })}
    </div>
  );
}
