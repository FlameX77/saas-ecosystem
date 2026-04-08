"use client";
import { useEffect, useState } from "react";
import { useAppStore } from "@/stores/appStore";
import { createClient } from "@/lib/supabase/client";
import { ConversationList } from "@/components/inbox/ConversationList";
import { MessageThread } from "@/components/inbox/MessageThread";
import { MessageComposer } from "@/components/inbox/MessageComposer";
import { EmptyState } from "@/components/shared/EmptyState";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";
import type { Contact, Conversation } from "@/types";
export default function InboxPage() {
  const { currentOrg } = useAppStore();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!currentOrg?.id) return;
    const supabase = createClient();
    supabase.from("contacts").select("*").eq("org_id", currentOrg.id).order("created_at", { ascending: false }).then(({ data }) => { if (data) setContacts(data as Contact[]); });
    supabase.from("conversations").select("*").eq("org_id", currentOrg.id).order("sent_at", { ascending: false }).limit(100).then(({ data }) => { if (data) setConversations(data as Conversation[]); setLoading(false); });
  }, [currentOrg?.id]);
  const handleSend = async (message: string, channel: string) => {
    if (!selected || !currentOrg?.id) return;
    const supabase = createClient();
    const { data } = await supabase.from("conversations").insert({ org_id: currentOrg.id, contact_id: selected.id, channel, direction: "outbound", body: message, delivery_status: "sent", ai_generated: false }).select().single();
    if (data) setConversations((prev) => [data as Conversation, ...prev]);
    toast.success("Message sent!");
  };
  const handleGenerate = async () => {
    if (!selected) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-message", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contactName: selected.first_name, businessType: currentOrg?.industry || "healthcare", goal: "rebook", tone: "friendly", businessName: currentOrg?.name || "Our Clinic" }) });
      const data = await res.json();
      if (data.sms) toast.success("AI draft ready! Check your composer.");
    } catch { toast.error("Failed to generate"); }
    setGenerating(false);
  };
  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0 overflow-hidden rounded-xl border border-border bg-surface">
      <div className="w-80 border-r border-border"><div className="border-b border-border p-4"><h2 className="text-lg font-semibold text-text-1">Inbox</h2><p className="text-xs text-text-3">{conversations.length} messages</p></div><ConversationList contacts={contacts} conversations={conversations} selectedId={selected?.id || null} onSelect={setSelected} /></div>
      <div className="flex flex-1 flex-col">
        {selected ? (<><MessageThread contact={selected} conversations={conversations} /><MessageComposer onSend={handleSend} onGenerate={handleGenerate} generating={generating} /></>) : (<div className="flex flex-1 items-center justify-center"><EmptyState icon={MessageSquare} title="No conversation selected" description="Choose a contact from the list to view messages" /></div>)}
      </div>
    </div>
  );
}
