#!/bin/bash
set -e

cat > novu/src/components/layout/Sidebar.tsx << 'ENDFILE'
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/stores/appStore";
import { cn } from "@/lib/utils";
import { LayoutDashboard, KanbanSquare, MessageSquare, Workflow, Sparkles, Users, BarChart3, Plug, Settings, ChevronLeft, ChevronRight } from "lucide-react";
const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pipeline", label: "Pipeline", icon: KanbanSquare },
  { href: "/inbox", label: "Inbox", icon: MessageSquare },
  { href: "/sequences", label: "Sequences", icon: Workflow },
  { href: "/generate", label: "Generate", icon: Sparkles },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/integrations", label: "Integrations", icon: Plug },
  { href: "/settings", label: "Settings", icon: Settings },
];
export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, currentOrg } = useAppStore();
  return (
    <aside className={cn("hidden h-screen flex-col border-r border-border bg-surface transition-all duration-300 lg:flex", sidebarCollapsed ? "w-16" : "w-60")}>
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        {!sidebarCollapsed && (
          <Link href="/dashboard" className="flex items-center">
            <span className="text-xl font-bold">nov</span>
            <span className="relative text-xl font-bold">u<span className="absolute -top-0.5 left-[2px] h-1.5 w-1.5 rounded-sm bg-primary" /></span>
          </Link>
        )}
        <button onClick={toggleSidebar} className="rounded-lg p-1.5 text-text-3 hover:bg-surface-2 hover:text-text-1">
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all", isActive ? "bg-primary/10 text-primary" : "text-text-2 hover:bg-surface-2 hover:text-text-1", sidebarCollapsed && "justify-center px-2")}>
              <Icon className="h-4 w-4 shrink-0" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      {!sidebarCollapsed && currentOrg && (
        <div className="border-t border-border p-4">
          <p className="truncate text-xs font-medium text-text-1">{currentOrg.name}</p>
          <p className="text-xs text-text-3">{currentOrg.plan_tier} plan</p>
        </div>
      )}
    </aside>
  );
}
ENDFILE

cat > novu/src/components/layout/TopBar.tsx << 'ENDFILE'
"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/stores/appStore";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, Search, Bell } from "lucide-react";
import { useState } from "react";
import { CommandPalette } from "@/components/shared/CommandPalette";
export function TopBar() {
  const router = useRouter();
  const { currentProfile, currentOrg } = useAppStore();
  const [cmdOpen, setCmdOpen] = useState(false);
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };
  const initials = currentProfile?.full_name?.split(" ").map((n) => n[0]).join("") || "U";
  return (
    <>
      <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setCmdOpen(true)} className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm text-text-3 transition-colors hover:text-text-1">
            <Search className="h-3.5 w-3.5" /><span className="hidden sm:inline">Search...</span>
            <kbd className="ml-2 hidden rounded bg-background px-1.5 py-0.5 text-[10px] sm:inline">⌘K</kbd>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative"><Bell className="h-4 w-4" /></Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-surface-2">
                <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary/10 text-xs text-primary">{initials}</AvatarFallback></Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5"><p className="text-sm font-medium text-text-1">{currentProfile?.full_name || "User"}</p><p className="text-xs text-text-3">{currentOrg?.name || ""}</p></div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/settings")}>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red"><LogOut className="mr-2 h-4 w-4" />Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </>
  );
}
ENDFILE

cat > novu/src/components/layout/MobileNav.tsx << 'ENDFILE'
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, KanbanSquare, MessageSquare, Sparkles, Users } from "lucide-react";
const items = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/pipeline", icon: KanbanSquare, label: "Pipeline" },
  { href: "/inbox", icon: MessageSquare, label: "Inbox" },
  { href: "/generate", icon: Sparkles, label: "AI" },
  { href: "/contacts", icon: Users, label: "Contacts" },
];
export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface/95 backdrop-blur lg:hidden">
      <div className="flex items-center justify-around py-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} className={cn("flex flex-col items-center gap-1 px-3 py-1", isActive ? "text-primary" : "text-text-3")}>
              <Icon className="h-5 w-5" /><span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
ENDFILE

cat > novu/src/components/dashboard/KPICard.tsx << 'ENDFILE'
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
export function KPICard({ title, value, suffix, color, icon: Icon, trend, trendLabel, className }: { title: string; value: number | string; suffix?: string; color: string; icon: LucideIcon; trend?: number; trendLabel?: string; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-surface p-6", className)}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-text-2">{title}</p>
        <div className="rounded-lg bg-surface-2 p-2"><Icon className="h-4 w-4" style={{ color }} /></div>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight" style={{ color }}>{value}{suffix}</p>
      {trend !== undefined && (
        <div className="mt-2 flex items-center gap-1">
          {trend >= 0 ? <TrendingUp className="h-3 w-3 text-green" /> : <TrendingDown className="h-3 w-3 text-red" />}
          <span className={cn("text-xs font-medium", trend >= 0 ? "text-green" : "text-red")}>{trend > 0 ? "+" : ""}{trend}%</span>
          {trendLabel && <span className="text-xs text-text-3">{trendLabel}</span>}
        </div>
      )}
    </div>
  );
}
ENDFILE

cat > novu/src/components/dashboard/RevenueChart.tsx << 'ENDFILE'
"use client";
import { formatCurrency } from "@/lib/utils";
import type { RecoveredRevenue } from "@/types";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
export function RevenueChart({ data }: { data: RecoveredRevenue[] }) {
  const chartData = data.reduce((acc: { date: string; revenue: number }[], item) => {
    const date = new Date(item.recovered_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const existing = acc.find((d) => d.date === date);
    if (existing) existing.revenue += item.amount;
    else acc.push({ date, revenue: item.amount });
    return acc;
  }, []);
  let cumulative = 0;
  const cumulativeData = chartData.map((d) => { cumulative += d.revenue; return { ...d, cumulative }; });
  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <h3 className="mb-4 text-sm font-medium text-text-2">Revenue Recovered Over Time</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={cumulativeData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00c896" stopOpacity={0.3} /><stop offset="95%" stopColor="#00c896" stopOpacity={0} /></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
            <XAxis dataKey="date" stroke="#4a5568" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#4a5568" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ backgroundColor: "#1a2235", border: "1px solid #1e2d45", borderRadius: "8px", color: "#fff", fontSize: "12px" }} formatter={(value: number) => [formatCurrency(value), "Cumulative"]} />
            <Area type="monotone" dataKey="cumulative" stroke="#00c896" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
ENDFILE

cat > novu/src/components/dashboard/ActivityFeed.tsx << 'ENDFILE'
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
ENDFILE

cat > novu/src/components/pipeline/KanbanCard.tsx << 'ENDFILE'
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
ENDFILE

cat > novu/src/components/pipeline/KanbanColumn.tsx << 'ENDFILE'
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
ENDFILE

cat > novu/src/components/pipeline/KanbanBoard.tsx << 'ENDFILE'
"use client";
import { useState } from "react";
import { Contact } from "@/types";
import { KanbanColumn } from "./KanbanColumn";
const stages = [
  { key: "new_lead", title: "New Lead", color: "#0066ff" },
  { key: "contacted", title: "Contacted", color: "#ffb020" },
  { key: "replied", title: "Replied", color: "#00b8d9" },
  { key: "appointment_booked", title: "Booked", color: "#00c896" },
  { key: "recovered", title: "Recovered", color: "#00c896" },
  { key: "lost", title: "Lost", color: "#ff4444" },
];
export function KanbanBoard({ contacts, onStageChange }: { contacts: Contact[]; onStageChange: (contactId: string, newStage: string) => void }) {
  const [draggedContact, setDraggedContact] = useState<Contact | null>(null);
  const handleDragStart = (e: React.DragEvent, contact: Contact) => { setDraggedContact(contact); e.dataTransfer.effectAllowed = "move"; };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };
  const handleDrop = (e: React.DragEvent, stage: string) => { e.preventDefault(); if (draggedContact && draggedContact.stage !== stage) { onStageChange(draggedContact.id, stage); } setDraggedContact(null); };
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {stages.map((s) => (
        <KanbanColumn key={s.key} title={s.title} color={s.color} stage={s.key} contacts={contacts.filter((c) => c.stage === s.key)} onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop} />
      ))}
    </div>
  );
}
ENDFILE

cat > novu/src/components/inbox/ConversationList.tsx << 'ENDFILE'
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
ENDFILE

cat > novu/src/components/inbox/MessageThread.tsx << 'ENDFILE'
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
ENDFILE

cat > novu/src/components/inbox/MessageComposer.tsx << 'ENDFILE'
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
ENDFILE

cat > novu/src/components/sequences/SequenceList.tsx << 'ENDFILE'
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
ENDFILE

cat > novu/src/components/sequences/SequenceDetail.tsx << 'ENDFILE'
import { Sequence, SequenceStep } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ChannelBadge } from "@/components/shared/ChannelBadge";
import { Plus, Edit, Trash2 } from "lucide-react";
interface SequenceDetailProps { sequence: Sequence; steps: SequenceStep[]; onEditStep: (step: SequenceStep) => void; onDeleteStep: (stepId: string) => void; onAddStep: () => void; onToggleStatus: () => void; }
export function SequenceDetail({ sequence, steps, onEditStep, onDeleteStep, onAddStep, onToggleStatus }: SequenceDetailProps) {
  return (
    <div className="rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border p-6">
        <div>
          <h2 className="text-lg font-semibold text-text-1">{sequence.name}</h2>
          <p className="text-sm text-text-3">{sequence.industry_template || "Custom sequence"}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2"><span className="text-xs text-text-3">Active</span><Switch checked={sequence.status === "active"} onCheckedChange={onToggleStatus} /></div>
          <Button size="sm" onClick={onAddStep}><Plus className="mr-1.5 h-3.5 w-3.5" />Add Step</Button>
        </div>
      </div>
      <div className="p-6">
        {steps.length === 0 && <p className="text-center text-sm text-text-3">No steps yet. Add your first step.</p>}
        <div className="space-y-4">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{step.step_number}</div>
                {i < steps.length - 1 && <div className="mt-1 h-8 w-px bg-border" />}
              </div>
              <div className="flex-1 rounded-lg border border-border bg-background p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ChannelBadge channel={step.channel} />
                    <span className="text-xs text-text-3">Day {step.delay_days}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEditStep(step)}><Edit className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red" onClick={() => onDeleteStep(step.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
                {step.subject_template && <p className="mt-2 text-sm font-medium text-text-1">Subject: {step.subject_template}</p>}
                <p className="mt-1 text-sm text-text-2">{step.message_template || "No message template"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
ENDFILE

cat > novu/src/components/sequences/StepEditor.tsx << 'ENDFILE'
"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SequenceStep } from "@/types";
interface StepEditorProps { open: boolean; onClose: () => void; step: SequenceStep | null; onSave: (data: Partial<SequenceStep>) => void; }
export function StepEditor({ open, onClose, step, onSave }: StepEditorProps) {
  const [channel, setChannel] = useState<string>("sms");
  const [delayDays, setDelayDays] = useState(1);
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  useEffect(() => {
    if (step) { setChannel(step.channel); setDelayDays(step.delay_days); setMessage(step.message_template || ""); setSubject(step.subject_template || ""); }
    else { setChannel("sms"); setDelayDays(1); setMessage(""); setSubject(""); }
  }, [step, open]);
  const handleSave = () => {
    onSave({ channel: channel as any, delay_days: delayDays, message_template: message, subject_template: subject || null, step_number: step?.step_number || 0 });
    onClose();
  };
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{step ? "Edit Step" : "Add Step"}</DialogTitle>
          <DialogDescription>Configure the follow-up step</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Channel</Label>
              <Select value={channel} onValueChange={setChannel}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sms">SMS</SelectItem><SelectItem value="email">Email</SelectItem><SelectItem value="whatsapp">WhatsApp</SelectItem></SelectContent></Select>
            </div>
            <div className="space-y-2">
              <Label>Delay (days)</Label>
              <Input type="number" min={0} value={delayDays} onChange={(e) => setDelayDays(parseInt(e.target.value) || 0)} />
            </div>
          </div>
          {channel === "email" && <div className="space-y-2"><Label>Email Subject</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject line" /></div>}
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Use {{first_name}} for personalization" className="min-h-[120px]" />
            <p className="text-xs text-text-3">Variables: {"{{first_name}}"}, {"{{business_name}}"}, {"{{booking_link}}"}</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Save Step</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
ENDFILE
