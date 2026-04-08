import { Conversation, Contact } from "@/types";
import { cn, timeAgo } from "@/lib/utils";
import { ChannelBadge } from "@/components/shared/ChannelBadge";
interface MessageThreadProps { contact: Contact; conversations: Conversation[]; }
export function MessageThread({ contact, conversations }: MessageThreadProps) {
  const messages = conversations.filter((c) => c.contact_id === contact.id).sort((a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime());
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="text-center">
        <p className="text-sm font-medium text-text-1">{contact.first_name} {contact.last_name}</p>
        <p className="text-xs text-text-3">{contact.phone || contact.email}</p>
      </div>
      {messages.length === 0 && <p className="text-center text-sm text-text-3">No messages yet. Start a conversation!</p>}
      {messages.map((msg) => (
        <div key={msg.id} className={cn("flex", msg.direction === "outbound" ? "justify-end" : "justify-start")}>
          <div className={cn("max-w-[70%] rounded-xl px-4 py-2.5", msg.direction === "outbound" ? "bg-primary text-white" : "bg-surface-2 text-text-1")}>
            {msg.subject && <p className="mb-1 text-xs font-medium opacity-80">{msg.subject}</p>}
            <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className={cn("text-[10px]", msg.direction === "outbound" ? "text-white/60" : "text-text-3")}>{timeAgo(msg.sent_at)}</span>
              {msg.ai_generated && <span className={cn("text-[10px]", msg.direction === "outbound" ? "text-white/60" : "text-text-3")}>AI</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
