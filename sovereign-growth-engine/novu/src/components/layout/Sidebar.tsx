"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/stores/appStore";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  KanbanSquare, 
  BarChart3, 
  ShieldCheck, 
  CreditCard, 
  Settings,
  Waves
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/claims", label: "Claims", icon: KanbanSquare },
  { href: "/revenue", label: "Revenue", icon: BarChart3 },
  { href: "/eligibility", label: "Eligibility", icon: ShieldCheck },
  { href: "/payments", label: "Payments", icon: CreditCard },
];

export function Sidebar() {
  const pathname = usePathname();
  const { currentOrg } = useAppStore();

  return (
    <aside className="hidden h-screen w-20 flex-col border-r border-border bg-background transition-all lg:flex z-50">
      <div className="flex h-20 items-center justify-center border-b border-border">
        <Link href="/dashboard" className="flex items-center justify-center h-12 w-12 bg-primary rounded-2xl shadow-[0_0_20px_-5px_rgba(0,212,170,0.4)]">
          <Waves className="h-6 w-6 text-background" />
        </Link>
      </div>
      <nav className="flex-1 space-y-6 p-4 py-8">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 rounded-2xl h-14 w-full text-[9px] font-mono uppercase tracking-[0.1em] transition-all", 
                isActive ? "bg-primary text-background font-bold shadow-[0_0_15px_-5px_rgba(0,212,170,0.3)]" : "text-muted-foreground hover:bg-card hover:text-white"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="sr-only">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-border p-4 flex flex-col items-center gap-6 py-8">
        <Link href="/settings" className="text-muted-foreground hover:text-white transition-colors">
          <Settings className="h-5 w-5" />
        </Link>
        <div className="h-10 w-10 rounded-2xl bg-card border border-border flex items-center justify-center font-display italic text-primary text-lg">
          {currentOrg?.name?.[0] || 'N'}
        </div>
      </div>
    </aside>
  );
}
