"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { ChannelBadge } from "@/components/shared/ChannelBadge";
interface MessageComposerProps { onSend: (message: string, channel: string) => void; onGenerate: () => void; generating: boolean; }
export function MessageComposer({ onSend, onGenerate, generating }: MessageComposerProps) {
  const [message, setMessage] = useState("");
  const [channel, setChannel] = useState<"sms" | "email" | "whatsapp">("sms");
  const handleSend = () => { if (!message.trim()) return; onSend(message, channel); setMessage(""); };
  return (
    <div className="border-t border-border p-4">
      <div className="mb-2 flex items-center gap-2">
        {(["sms", "email", "whatsapp"] as const).map((ch) => (
          <button key={ch} onClick={() => setChannel(ch)} className={`rounded-md px-2 py-1 text-xs font-medium transition-all ${channel === ch ? "bg-primary text-white" : "bg-surface-2 text-text-3 hover:text-text-1"}`}>{ch.toUpperCase()}</button>
        ))}
        <div className="ml-auto">
          <Button variant="ghost" size="sm" onClick={onGenerate} disabled={generating}>
            {generating ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-1.5 h-3.5 w-3.5" />}
            AI Draft
          </Button>
        </div>
      </div>
      <div className="flex gap-2">
        <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={`Type a ${channel.toUpperCase()} message...`} className="min-h-[60px] flex-1 resize-none" onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }} />
        <Button onClick={handleSend} disabled={!message.trim()} className="self-end"><Send className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}
