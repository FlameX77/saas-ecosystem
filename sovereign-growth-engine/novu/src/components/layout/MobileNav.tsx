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
