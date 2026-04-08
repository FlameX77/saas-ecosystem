"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/stores/appStore";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { MobileNav } from "@/components/layout/MobileNav";
import AiAssistant from "@/components/AiAssistant";
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { setOrg, setProfile } = useAppStore();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (profile) {
        setProfile(profile);
        if (!profile.onboarding_completed) { router.push("/onboarding"); return; }
        if (profile.org_id) {
          const { data: org } = await supabase.from("organizations").select("*").eq("id", profile.org_id).single();
          if (org) setOrg(org);
        }
      }
      setLoading(false);
    }
    load();
  }, [router, setOrg, setProfile]);
  if (loading) return <div className="flex h-screen items-center justify-center bg-background"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  return (
    <div className="dashboard-grid bg-background">
      <Sidebar />
      <div className="flex flex-col overflow-hidden relative">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">{children}</main>
      </div>
      <AiAssistant />
      <MobileNav />
    </div>
  );
}
