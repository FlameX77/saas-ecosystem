"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SequenceStep } from "@/types";
interface StepEditorProps { open: boolean; onClose: () => void; step: SequenceStep | null; onSave: (data: Partial<SequenceStep>) => void; }
export function StepEditor({ open, onClose, step, onSave }: StepEditorProps) {
  const [channel, setChannel] = useState<string>("sms");
  const [delayDays, setDelayDays] = useState(1);
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  useEffect(() => {
    if (step) { setChannel(step.channel); setDelayDays(step.delay_days); setMessage(step.message_template || ""); setSubject(step.subject_template || ""); }
    else { setChannel("sms"); setDelayDays(1); setMessage(""); setSubject(""); }
  }, [step, open]);
  const handleSave = () => {
    onSave({ channel: channel as any, delay_days: delayDays, message_template: message, subject_template: subject || null, step_number: step?.step_number || 0 });
    onClose();
  };
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{step ? "Edit Step" : "Add Step"}</DialogTitle>
          <DialogDescription>Configure the follow-up step</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Channel</Label>
              <Select value={channel} onValueChange={setChannel}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sms">SMS</SelectItem><SelectItem value="email">Email</SelectItem><SelectItem value="whatsapp">WhatsApp</SelectItem></SelectContent></Select>
            </div>
            <div className="space-y-2">
              <Label>Delay (days)</Label>
              <Input type="number" min={0} value={delayDays} onChange={(e) => setDelayDays(parseInt(e.target.value) || 0)} />
            </div>
          </div>
          {channel === "email" && <div className="space-y-2"><Label>Email Subject</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject line" /></div>}
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Use {{first_name}} for personalization" className="min-h-[120px]" />
            <p className="text-xs text-text-3">Variables: {"{{first_name}}"}, {"{{business_name}}"}, {"{{booking_link}}"}</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Save Step</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
