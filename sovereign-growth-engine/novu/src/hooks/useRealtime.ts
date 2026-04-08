"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Conversation } from "@/types";
export function useRealtimeConversations(orgId: string | undefined) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const supabase = createClient();
  useEffect(() => {
    if (!orgId) return;
    supabase.from("conversations").select("*").eq("org_id", orgId).order("sent_at", { ascending: false }).limit(20).then(({ data }) => { if (data) setConversations(data as Conversation[]); });
    const channel = supabase.channel(`conversations:${orgId}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "conversations", filter: `org_id=eq.${orgId}` }, (payload) => {
      setConversations((prev) => [payload.new as Conversation, ...prev.slice(0, 19)]);
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [orgId, supabase]);
  return conversations;
}
