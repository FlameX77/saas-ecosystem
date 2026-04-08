"use client";
import { useEffect, useState } from "react";
import { useAppStore } from "@/stores/appStore";
import { createClient } from "@/lib/supabase/client";
import { KanbanBoard } from "@/components/pipeline/KanbanBoard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Input } from "@/components/ui/input";
import { Search, KanbanSquare } from "lucide-react";
import { toast } from "sonner";
import type { Contact } from "@/types";
export default function PipelinePage() {
  const { currentOrg } = useAppStore();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!currentOrg?.id) return;
    const supabase = createClient();
    supabase.from("contacts").select("*").eq("org_id", currentOrg.id).order("created_at", { ascending: false }).then(({ data }) => { if (data) setContacts(data as Contact[]); setLoading(false); });
  }, [currentOrg?.id]);
  const filtered = contacts.filter((c) => { if (!search) return true; return `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search) || c.email?.toLowerCase().includes(search.toLowerCase()); });
  const handleStageChange = async (contactId: string, newStage: string) => {
    const supabase = createClient();
    await supabase.from("contacts").update({ stage: newStage, last_contacted_at: new Date().toISOString() }).eq("id", contactId);
    setContacts((prev) => prev.map((c) => c.id === contactId ? { ...c, stage: newStage as Contact["stage"], last_contacted_at: new Date().toISOString() } : c));
    toast.success(`Moved to ${newStage.replace("_", " ")}`);
  };
  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  return (
    <div>
      <div className="mb-6 flex items-center justify-between"><div><h1 className="text-2xl font-bold text-text-1">Pipeline</h1><p className="text-sm text-text-2">{contacts.length} contacts in pipeline</p></div><div className="relative w-64"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="pl-9" /></div></div>
      {contacts.length === 0 ? <EmptyState icon={KanbanSquare} title="No leads in your pipeline" description="Add your first lead to get started with revenue recovery" action={() => toast.info("Add contacts from the Contacts page")} actionLabel="Add Lead" /> : <KanbanBoard contacts={filtered} onStageChange={handleStageChange} />}
    </div>
  );
}
