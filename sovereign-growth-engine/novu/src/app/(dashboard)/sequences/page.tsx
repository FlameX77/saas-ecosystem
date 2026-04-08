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
