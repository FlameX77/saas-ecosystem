"use client";
import { useEffect, useState, useRef } from "react";
import { Search, LayoutDashboard, KanbanSquare, MessageSquare, Workflow, Sparkles, Users, BarChart3, Plug, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
interface CommandItem { label: string; icon: any; href: string; keywords: string[] }
const items: CommandItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", keywords: ["home", "overview"] },
  { label: "Pipeline", icon: KanbanSquare, href: "/pipeline", keywords: ["kanban", "leads"] },
  { label: "Inbox", icon: MessageSquare, href: "/inbox", keywords: ["messages", "chat"] },
  { label: "Sequences", icon: Workflow, href: "/sequences", keywords: ["automation", "follow up"] },
  { label: "Generate", icon: Sparkles, href: "/generate", keywords: ["ai", "message"] },
  { label: "Contacts", icon: Users, href: "/contacts", keywords: ["people", "list"] },
  { label: "Analytics", icon: BarChart3, href: "/analytics", keywords: ["stats", "reports"] },
  { label: "Integrations", icon: Plug, href: "/integrations", keywords: ["connect", "tools"] },
  { label: "Settings", icon: Settings, href: "/settings", keywords: ["config", "profile"] },
];
export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const filtered = items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()) || item.keywords.some((k) => k.includes(query.toLowerCase())));
  useEffect(() => { if (open) { setQuery(""); setSelected(0); setTimeout(() => inputRef.current?.focus(), 50); } }, [open]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); open ? onClose() : onClose(); }
      if (!open) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") { e.preventDefault(); setSelected((s) => Math.min(s + 1, filtered.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); }
      if (e.key === "Enter" && filtered[selected]) { router.push(filtered[selected].href); onClose(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, filtered, selected, router, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[20vh]">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-border bg-surface shadow-2xl">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 text-text-3" />
          <input ref={inputRef} value={query} onChange={(e) => { setQuery(e.target.value); setSelected(0); }} placeholder="Search pages..." className="flex-1 bg-transparent text-sm text-text-1 outline-none placeholder:text-text-3" />
          <kbd className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] text-text-3">ESC</kbd>
        </div>
        <div className="max-h-64 overflow-y-auto p-2">
          {filtered.map((item, i) => {
            const Icon = item.icon;
            return (
              <button key={item.href} onClick={() => { router.push(item.href); onClose(); }} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${i === selected ? "bg-primary/10 text-text-1" : "text-text-2 hover:bg-surface-2 hover:text-text-1"}`}>
                <Icon className="h-4 w-4" />{item.label}
              </button>
            );
          })}
          {filtered.length === 0 && <p className="px-3 py-6 text-center text-sm text-text-3">No results found</p>}
        </div>
      </div>
    </div>
  );
}
