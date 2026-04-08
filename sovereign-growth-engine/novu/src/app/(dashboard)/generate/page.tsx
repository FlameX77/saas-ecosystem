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
              <TabsContent value="email" className="mt-4 space-y-3">
                <p className="text-sm font-medium text-text-1">{result.email_subject}</p>
                <div className="text-sm text-text-2 whitespace-pre-wrap border rounded-lg p-3 bg-slate-50/50">
                  {result.email_body}
                </div>
                <Button variant="outline" size="sm" onClick={() => handleCopy(result.email_body)}>
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                  Copy
                </Button>
              </TabsContent>
              <TabsContent value="whatsapp" className="mt-4 space-y-3"><p className="text-sm text-text-1">{result.whatsapp}</p><Button variant="outline" size="sm" onClick={() => handleCopy(result.whatsapp)}><Copy className="mr-1.5 h-3.5 w-3.5" />Copy</Button></TabsContent>
            </Tabs>
          ) : (<div className="flex h-full items-center justify-center"><div className="text-center"><Sparkles className="mx-auto mb-3 h-10 w-10 text-text-3" /><p className="text-sm text-text-3">Fill in the form and generate messages</p></div></div>)}
        </div>
      </div>
    </div>
  );
}
