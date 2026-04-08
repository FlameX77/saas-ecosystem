#!/bin/bash
set -e

cat > novu/src/app/'(dashboard)'/sequences/page.tsx << 'ENDFILE'
"use client";
import { useEffect, useState } from "react";
import { useAppStore } from "@/stores/appStore";
import { createClient } from "@/lib/supabase/client";
import { SequenceList } from "@/components/sequences/SequenceList";
import { SequenceDetail } from "@/components/sequences/SequenceDetail";
import { StepEditor } from "@/components/sequences/StepEditor";
import { EmptyState } from "@/components/shared/EmptyState";
import { Workflow } from "lucide-react";
import { toast } from "sonner";
import type { Sequence, SequenceStep } from "@/types";
export default function SequencesPage() {
  const { currentOrg } = useAppStore();
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [selected, setSelected] = useState<Sequence | null>(null);
  const [steps, setSteps] = useState<SequenceStep[]>([]);
  const [stepEditorOpen, setStepEditorOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<SequenceStep | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!currentOrg?.id) return;
    const supabase = createClient();
    supabase.from("sequences").select("*").eq("org_id", currentOrg.id).then(({ data }) => { if (data) setSequences(data as Sequence[]); setLoading(false); });
  }, [currentOrg?.id]);
  useEffect(() => {
    if (!selected) return;
    const supabase = createClient();
    supabase.from("sequence_steps").select("*").eq("sequence_id", selected.id).order("step_number").then(({ data }) => { if (data) setSteps(data as SequenceStep[]); });
  }, [selected]);
  const handleCreateSequence = async () => {
    if (!currentOrg?.id) return;
    const supabase = createClient();
    const { data } = await supabase.from("sequences").insert({ org_id: currentOrg.id, name: `New Sequence ${sequences.length + 1}`, status: "paused", stop_on_reply: true, stop_on_booked: true }).select().single();
    if (data) { setSequences((prev) => [...prev, data as Sequence]); setSelected(data as Sequence); toast.success("Sequence created!"); }
  };
  const handleToggleStatus = async () => {
    if (!selected) return;
    const newStatus = selected.status === "active" ? "paused" : "active";
    const supabase = createClient();
    await supabase.from("sequences").update({ status: newStatus }).eq("id", selected.id);
    setSelected({ ...selected, status: newStatus });
    setSequences((prev) => prev.map((s) => s.id === selected.id ? { ...s, status: newStatus } : s));
    toast.success(`Sequence ${newStatus}`);
  };
  const handleEditStep = (step: SequenceStep) => { setEditingStep(step); setStepEditorOpen(true); };
  const handleDeleteStep = async (stepId: string) => {
    const supabase = createClient();
    await supabase.from("sequence_steps").delete().eq("id", stepId);
    setSteps((prev) => prev.filter((s) => s.id !== stepId));
    toast.success("Step deleted");
  };
  const handleAddStep = () => { setEditingStep(null); setStepEditorOpen(true); };
  const handleSaveStep = async (data: Partial<SequenceStep>) => {
    if (!selected) return;
    const supabase = createClient();
    if (editingStep) {
      await supabase.from("sequence_steps").update(data).eq("id", editingStep.id);
      setSteps((prev) => prev.map((s) => s.id === editingStep.id ? { ...s, ...data } as SequenceStep : s));
    } else {
      const { data: newStep } = await supabase.from("sequence_steps").insert({ ...data, sequence_id: selected.id, step_number: steps.length + 1, ab_variant: "A" }).select().single();
      if (newStep) setSteps((prev) => [...prev, newStep as SequenceStep]);
    }
    toast.success("Step saved!");
  };
  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-bold text-text-1">Sequences</h1><p className="text-sm text-text-2">Automated follow-up sequences for revenue recovery</p></div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div><SequenceList sequences={sequences} selectedId={selected?.id || null} onSelect={setSelected} onCreate={handleCreateSequence} /></div>
        <div className="lg:col-span-2">{selected ? <SequenceDetail sequence={selected} steps={steps} onEditStep={handleEditStep} onDeleteStep={handleDeleteStep} onAddStep={handleAddStep} onToggleStatus={handleToggleStatus} /> : <EmptyState icon={Workflow} title="No sequences yet" description="Create your first automated follow-up sequence" action={handleCreateSequence} actionLabel="Create Sequence" />}</div>
      </div>
      <StepEditor open={stepEditorOpen} onClose={() => setStepEditorOpen(false)} step={editingStep} onSave={handleSaveStep} />
    </div>
  );
}
ENDFILE

cat > novu/src/app/'(dashboard)'/generate/page.tsx << 'ENDFILE'
"use client";
import { useState } from "react";
import { useAppStore } from "@/stores/appStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Loader2, Copy, Send } from "lucide-react";
import { toast } from "sonner";
export default function GeneratePage() {
  const { currentOrg } = useAppStore();
  const [form, setForm] = useState({ contactName: "", serviceInterest: "", goal: "rebook", tone: "friendly" });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const handleGenerate = async () => {
    if (!form.contactName) { toast.error("Enter a contact name"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/generate-message", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, businessType: currentOrg?.industry || "healthcare", businessName: currentOrg?.name || "Our Clinic", bookingLink: currentOrg?.booking_link || undefined }) });
      const data = await res.json();
      setResult(data);
    } catch { toast.error("Generation failed"); }
    setLoading(false);
  };
  const handleCopy = (text: string) => { navigator.clipboard.writeText(text); toast.success("Copied!"); };
  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-bold text-text-1">Generate Message</h1><p className="text-sm text-text-2">AI-powered message generation for any channel</p></div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
          <div className="space-y-2"><Label>Contact Name</Label><Input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} placeholder="John Smith" /></div>
          <div className="space-y-2"><Label>Service Interest</Label><Input value={form.serviceInterest} onChange={(e) => setForm({ ...form, serviceInterest: e.target.value })} placeholder="Dental Implants" /></div>
          <div className="space-y-2"><Label>Goal</Label><Select value={form.goal} onValueChange={(v) => setForm({ ...form, goal: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="rebook">Rebook Appointment</SelectItem><SelectItem value="follow_up">Follow Up</SelectItem><SelectItem value="payment">Payment Reminder</SelectItem><SelectItem value="reactivate">Reactivate</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><Label>Tone</Label><Select value={form.tone} onValueChange={(v) => setForm({ ...form, tone: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="friendly">Friendly</SelectItem><SelectItem value="professional">Professional</SelectItem><SelectItem value="urgent">Urgent</SelectItem></SelectContent></Select></div>
          <Button onClick={handleGenerate} disabled={loading} className="w-full">{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}Generate Messages</Button>
        </div>
        <div className="rounded-xl border border-border bg-surface p-6">
          {result ? (
            <Tabs defaultValue="sms">
              <TabsList><TabsTrigger value="sms">SMS</TabsTrigger><TabsTrigger value="email">Email</TabsTrigger><TabsTrigger value="whatsapp">WhatsApp</TabsTrigger></TabsList>
              <TabsContent value="sms" className="mt-4 space-y-3"><p className="text-sm text-text-1">{result.sms}</p><Button variant="outline" size="sm" onClick={() => handleCopy(result.sms)}><Copy className="mr-1.5 h-3.5 w-3.5" />Copy</Button></TabsContent>
              <TabsContent value="email" className="mt-4 space-y-3"><p className="text-sm font-medium text-text-1">{result.email_subject}</p><div className="text-sm text-text-2" dangerouslySetInnerHTML={{ __html: result.email_body }} /><Button variant="outline" size="sm" onClick={() => handleCopy(result.email_body)}><Copy className="mr-1.5 h-3.5 w-3.5" />Copy</Button></TabsContent>
              <TabsContent value="whatsapp" className="mt-4 space-y-3"><p className="text-sm text-text-1">{result.whatsapp}</p><Button variant="outline" size="sm" onClick={() => handleCopy(result.whatsapp)}><Copy className="mr-1.5 h-3.5 w-3.5" />Copy</Button></TabsContent>
            </Tabs>
          ) : (<div className="flex h-full items-center justify-center"><div className="text-center"><Sparkles className="mx-auto mb-3 h-10 w-10 text-text-3" /><p className="text-sm text-text-3">Fill in the form and generate messages</p></div></div>)}
        </div>
      </div>
    </div>
  );
}
ENDFILE
