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
