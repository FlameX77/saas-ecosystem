#!/bin/bash
set -e

cat > novu/src/app/'(dashboard)'/contacts/page.tsx << 'ENDFILE'
"use client";

import { useEffect, useState, useRef } from "react";
import { useAppStore } from "@/stores/appStore";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlideOver } from "@/components/shared/SlideOver";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatCurrency, timeAgo, stageLabel } from "@/lib/utils";
import { Search, Plus, Upload, Download, Phone, Mail, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import type { Contact } from "@/types";

export default function ContactsPage() {
  const { currentOrg } = useAppStore();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [selected, setSelected] = useState<Contact | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importData, setImportData] = useState<Record<string, string>[]>([]);
  const [importStep, setImportStep] = useState(0);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newFirst, setNewFirst] = useState("");
  const [newLast, setNewLast] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newService, setNewService] = useState("");
  const [newValue, setNewValue] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!currentOrg?.id) return;
    const supabase = createClient();
    supabase.from("contacts").select("*").eq("org_id", currentOrg.id).order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setContacts(data as Contact[]);
      setLoading(false);
    });
  }, [currentOrg?.id]);

  const stages = ["all", "new_lead", "contacted", "replied", "appointment_booked", "recovered", "lost"];

  const filtered = contacts.filter((c) => {
    if (stageFilter !== "all" && c.stage !== stageFilter) return false;
    if (search && !`${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase()) && !c.phone?.includes(search) && !c.email?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const paginated = filtered.slice(page * 25, (page + 1) * 25);
  const totalPages = Math.ceil(filtered.length / 25);

  const handleAddContact = async () => {
    if (!currentOrg?.id || !newFirst.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase.from("contacts").insert({
      org_id: currentOrg.id, first_name: newFirst, last_name: newLast || null, phone: newPhone || null, email: newEmail || null, service_interest: newService || null, deal_value: newValue ? parseFloat(newValue) : null,
    }).select().single();
    if (error) { toast.error("Failed to add contact"); setSaving(false); return; }
    if (data) setContacts((prev) => [data as Contact, ...prev]);
    toast.success("Contact added!");
    setAddOpen(false); setNewFirst(""); setNewLast(""); setNewPhone(""); setNewEmail(""); setNewService(""); setNewValue(""); setSaving(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").filter((l) => l.trim());
      if (lines.length < 2) { toast.error("CSV must have headers and data"); return; }
      const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
      const rows = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
        const row: Record<string, string> = {};
        headers.forEach((h, i) => { row[h] = values[i] || ""; });
        return row;
      });
      setImportData(rows); setImportStep(1);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!currentOrg?.id) return;
    const supabase = createClient();
    const mapped = importData.map((row) => ({
      org_id: currentOrg.id,
      first_name: row[columnMapping.first_name] || row[columnMapping.name]?.split(" ")[0] || "",
      last_name: row[columnMapping.last_name] || row[columnMapping.name]?.split(" ").slice(1).join(" ") || null,
      phone: row[columnMapping.phone] || null,
      email: row[columnMapping.email] || null,
      service_interest: row[columnMapping.service_interest] || null,
      deal_value: row[columnMapping.deal_value] ? parseFloat(row[columnMapping.deal_value]) : null,
      source: "import",
    })).filter((r) => r.phone || r.email);
    if (mapped.length === 0) { toast.error("No valid contacts to import"); return; }
    const { data, error } = await supabase.from("contacts").insert(mapped).select();
    if (error) { toast.error("Import failed"); return; }
    setContacts((prev) => [...(data as Contact[]), ...prev]);
    toast.success(`Imported ${data?.length || 0} contacts!`);
    setImportOpen(false); setImportData([]); setImportStep(0);
  };

  const handleExport = () => {
    const headers = ["First Name", "Last Name", "Phone", "Email", "Service", "Deal Value", "Stage", "Last Contacted"];
    const rows = contacts.map((c) => [c.first_name, c.last_name || "", c.phone || "", c.email || "", c.service_interest || "", c.deal_value || "", c.stage, c.last_contacted_at || ""]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "contacts.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-text-1">Contacts</h1><p className="text-sm text-text-2">{contacts.length} total contacts</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="mr-1.5 h-3.5 w-3.5" />Export</Button>
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}><Upload className="mr-1.5 h-3.5 w-3.5" />Import</Button>
          <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="mr-1.5 h-3.5 w-3.5" />Add Contact</Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search contacts..." className="pl-9" /></div>
        <div className="flex gap-1">{stages.map((s) => (<button key={s} onClick={() => setStageFilter(s)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${stageFilter === s ? "bg-primary text-white" : "bg-surface-2 text-text-2 hover:text-text-1"}`}>{s === "all" ? "All" : s.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}</button>))}</div>
      </div>

      {filtered.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="px-4 py-3 text-left text-xs font-medium text-text-3">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-3">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-3">Service</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-3">Value</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-3">Stage</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-3">Last Contact</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((contact) => (
                <tr key={contact.id} onClick={() => setSelected(contact)} className="cursor-pointer border-b border-border transition-colors hover:bg-surface-2">
                  <td className="px-4 py-3"><p className="text-sm font-medium text-text-1">{contact.first_name} {contact.last_name}</p></td>
                  <td className="px-4 py-3"><p className="text-xs text-text-2">{contact.phone}</p><p className="text-xs text-text-3">{contact.email}</p></td>
                  <td className="px-4 py-3 text-sm text-text-2">{contact.service_interest || "---"}</td>
                  <td className="px-4 py-3 text-sm font-medium text-green">{contact.deal_value ? formatCurrency(contact.deal_value) : "---"}</td>
                  <td className="px-4 py-3"><Badge variant="outline">{contact.stage.replace("_", " ")}</Badge></td>
                  <td className="px-4 py-3 text-xs text-text-3">{contact.last_contacted_at ? timeAgo(contact.last_contacted_at) : "Never"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <p className="text-xs text-text-3">Showing {page * 25 + 1}-{Math.min((page + 1) * 25, filtered.length)} of {filtered.length}</p>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
                <Button variant="ghost" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next</Button>
              </div>
            </div>
          )}
        </div>
      ) : (<EmptyState icon={Users} title="No contacts found" description={search || stageFilter !== "all" ? "Try adjusting your filters" : "Import contacts from a CSV or add them manually"} action={search || stageFilter !== "all" ? undefined : () => setImportOpen(true)} actionLabel={search || stageFilter !== "all" ? undefined : "Import Contacts"} />)}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Contact</DialogTitle><DialogDescription>Add a new contact to your pipeline</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>First Name *</Label><Input value={newFirst} onChange={(e) => setNewFirst(e.target.value)} placeholder="John" /></div><div className="space-y-2"><Label>Last Name</Label><Input value={newLast} onChange={(e) => setNewLast(e.target.value)} placeholder="Smith" /></div></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="+971501234567" /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="john@email.com" /></div>
            <div className="space-y-2"><Label>Service Interest</Label><Input value={newService} onChange={(e) => setNewService(e.target.value)} placeholder="Dental Implants" /></div>
            <div className="space-y-2"><Label>Deal Value ($)</Label><Input type="number" value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder="5000" /></div>
            <Button onClick={handleAddContact} disabled={saving || !newFirst.trim()} className="w-full">{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Add Contact</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={importOpen} onOpenChange={(o) => { setImportOpen(o); if (!o) { setImportStep(0); setImportData([]); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Import Contacts</DialogTitle><DialogDescription>Upload a CSV file to import contacts</DialogDescription></DialogHeader>
          {importStep === 0 && (
            <div className="space-y-4">
              <div className="rounded-lg border border-dashed border-border p-8 text-center">
                <Upload className="mx-auto mb-3 h-10 w-10 text-text-3" /><p className="mb-2 text-sm font-medium text-text-1">Upload a CSV file</p><p className="mb-4 text-xs text-text-3">Must include first_name and phone or email</p>
                <label className="cursor-pointer"><input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" ref={fileRef} /><span className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-glow">Choose File</span></label>
              </div>
            </div>
          )}
          {importStep === 1 && importData.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-text-1">Map your columns</p>
              {["first_name", "last_name", "phone", "email", "service_interest", "deal_value"].map((field) => {
                const csvCols = Object.keys(importData[0]);
                return (
                  <div key={field} className="flex items-center gap-3"><Label className="w-28 text-right">{field.replace("_", " ")}</Label><Select value={columnMapping[field] || ""} onValueChange={(v) => setColumnMapping((p) => ({ ...p, [field]: v }))}><SelectTrigger className="flex-1"><SelectValue placeholder="Select column" /></SelectTrigger><SelectContent>{csvCols.map((col) => (<SelectItem key={col} value={col}>{col}</SelectItem>))}</SelectContent></Select></div>
                );
              })}
              <div className="rounded-lg bg-surface-2 p-3"><p className="mb-2 text-xs font-medium text-text-3">Preview (first 3 rows)</p>{importData.slice(0, 3).map((row, i) => (<p key={i} className="text-xs text-text-2">{columnMapping.first_name && row[columnMapping.first_name]} {columnMapping.last_name && row[columnMapping.last_name]} {" --- "} {columnMapping.phone && row[columnMapping.phone]}</p>))}</div>
              <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => { setImportStep(0); setImportData([]); }}>Back</Button><Button onClick={handleImport}>Import {importData.length} Contacts</Button></div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <SlideOver open={!!selected} onClose={() => setSelected(null)} title="Contact Details">
        {selected && (
          <div className="space-y-6">
            <div><h3 className="text-xl font-bold text-text-1">{selected.first_name} {selected.last_name}</h3><Badge variant="outline" className="mt-2">{stageLabel(selected.stage)}</Badge></div>
            {selected.deal_value && (<div className="rounded-lg bg-surface-2 p-4"><p className="text-sm text-text-2">Deal Value</p><p className="text-2xl font-bold text-green">{formatCurrency(selected.deal_value)}</p></div>)}
            <div className="space-y-3">
              {selected.phone && (<div className="flex items-center gap-3 text-sm"><Phone className="h-4 w-4 text-text-3" /><span className="text-text-1">{selected.phone}</span></div>)}
              {selected.email && (<div className="flex items-center gap-3 text-sm"><Mail className="h-4 w-4 text-text-3" /><span className="text-text-1">{selected.email}</span></div>)}
              {selected.service_interest && (<p className="text-sm text-text-1">Service: {selected.service_interest}</p>)}
              {selected.last_contacted_at && (<p className="text-sm text-text-2">Last contacted: {timeAgo(selected.last_contacted_at)}</p>)}
            </div>
            <div>
              <Label className="mb-1">Notes</Label>
              <Textarea defaultValue={selected.notes || ""} onBlur={async (e) => { const supabase = createClient(); await supabase.from("contacts").update({ notes: e.target.value }).eq("id", selected.id); toast.success("Notes saved"); }} className="min-h-[100px]" />
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  );
}
ENDFILE
