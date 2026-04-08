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
