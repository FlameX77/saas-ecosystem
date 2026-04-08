"use client";
import { useEffect, useState } from "react";
import { useAppStore } from "@/stores/appStore";
import { createClient } from "@/lib/supabase/client";
import { timeAgo } from "@/lib/utils";
import { MessageSquare, Calendar, DollarSign, UserPlus } from "lucide-react";
import type { Conversation } from "@/types";
export function ActivityFeed() {
  const { currentOrg } = useAppStore();
  const [activities, setActivities] = useState<(Conversation & { contact_name?: string })[]>([]);
  useEffect(() => {
    if (!currentOrg?.id) return;
    const supabase = createClient();
    supabase.from("conversations").select("*, contacts(first_name, last_name)").eq("org_id", currentOrg.id).order("sent_at", { ascending: false }).limit(10).then(({ data }) => {
      if (data) setActivities(data as any);
    });
  }, [currentOrg?.id]);
  const getIcon = (channel: string) => {
    if (channel === "sms") return MessageSquare;
    if (channel === "email") return MessageSquare;
    return MessageSquare;
  };
  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <h3 className="mb-4 text-sm font-medium text-text-2">Recent Activity</h3>
      <div className="space-y-4">
        {activities.length === 0 && <p className="text-sm text-text-3">No recent activity</p>}
        {activities.map((a) => {
          const Icon = getIcon(a.channel);
          return (
            <div key={a.id} className="flex items-start gap-3">
              <div className="mt-0.5 rounded-lg bg-surface-2 p-1.5"><Icon className="h-3.5 w-3.5 text-text-3" /></div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-text-1">{a.body || a.subject || "Message sent"}</p>
                <p className="text-xs text-text-3">{a.channel.toUpperCase()} · {timeAgo(a.sent_at)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
