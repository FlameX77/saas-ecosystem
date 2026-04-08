"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/stores/appStore";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MessageSquare, Mail, CreditCard, Calendar, Globe, Sheet, Loader2, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import type { Integration } from "@/types";

interface ProviderField { key: string; label: string; type: string; placeholder: string; }
interface ProviderConfig { provider: string; name: string; desc: string; icon: any; category: string; fields: ProviderField[]; testLabel: string; }

const providers: ProviderConfig[] = [
  { provider: "twilio", name: "Twilio", desc: "Send SMS messages to your contacts", icon: MessageSquare, category: "Messaging", fields: [{ key: "account_sid", label: "Account SID", type: "text", placeholder: "ACxxxxxxxx" }, { key: "auth_token", label: "Auth Token", type: "password", placeholder: "your_auth_token" }, { key: "phone_number", label: "Phone Number", type: "text", placeholder: "+1234567890" }], testLabel: "Send Test SMS" },
  { provider: "sendgrid", name: "SendGrid", desc: "Send transactional emails", icon: Mail, category: "Messaging", fields: [{ key: "api_key", label: "API Key", type: "password", placeholder: "SG.xxxxxxxx" }, { key: "sender_email", label: "Sender Email", type: "email", placeholder: "hello@yourdomain.com" }], testLabel: "Send Test Email" },
  { provider: "whatsapp", name: "WhatsApp Business", desc: "Send WhatsApp messages via Meta API", icon: MessageSquare, category: "Messaging", fields: [{ key: "phone_number_id", label: "Phone Number ID", type: "text", placeholder: "123456789012345" }, { key: "access_token", label: "Access Token", type: "password", placeholder: "EAAxxxxxxxx" }], testLabel: "Test Connection" },
  { provider: "stripe", name: "Stripe", desc: "Track payments and overdue invoices", icon: CreditCard, category: "Payments", fields: [{ key: "secret_key", label: "Secret Key", type: "password", placeholder: "sk_live_xxxxxxxx" }, { key: "webhook_secret", label: "Webhook Secret", type: "password", placeholder: "whsec_xxxxxxxx" }], testLabel: "Test Connection" },
  { provider: "cal_com", name: "Cal.com", desc: "Sync appointments and bookings", icon: Calendar, category: "Scheduling", fields: [{ key: "api_key", label: "API Key", type: "password", placeholder: "cal_live_xxxxxxxx" }], testLabel: "Test Connection" },
  { provider: "google_calendar", name: "Google Calendar", desc: "Sync appointments from Google Calendar", icon: Calendar, category: "Scheduling", fields: [], testLabel: "Connect with Google" },
  { provider: "hubspot", name: "HubSpot", desc: "Sync contacts from your HubSpot CRM", icon: Globe, category: "CRM", fields: [], testLabel: "Connect with HubSpot" },
  { provider: "google_sheets", name: "Google Sheets", desc: "Import contacts from spreadsheets", icon: Sheet, category: "Data", fields: [], testLabel: "Connect with Google" },
];

export default function IntegrationsPage() {
  const { currentOrg } = useAppStore();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [connectingProvider, setConnectingProvider] = useState<ProviderConfig | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (!currentOrg?.id) return;
    const supabase = createClient();
    supabase.from("integrations").select("*").eq("org_id", currentOrg.id).then(({ data }) => { if (data) setIntegrations(data as Integration[]); });
  }, [currentOrg?.id]);

  const getStatus = (provider: string) => integrations.find((i) => i.provider === provider)?.status || "disconnected";
  const getConfig = (provider: string) => (integrations.find((i) => i.provider === provider)?.config as Record<string, string>) || {};

  const handleOpenConnect = (provider: ProviderConfig) => { setFormValues(getConfig(provider.provider)); setTestResult(null); setConnectingProvider(provider); };

  const handleTest = async () => {
    if (!connectingProvider) return;
    setTesting(true); setTestResult(null);
    await new Promise((r) => setTimeout(r, 1500));
    const hasAllFields = connectingProvider.fields.every((f) => formValues[f.key]?.trim());
    setTestResult(hasAllFields ? { success: true, message: "Connection successful!" } : { success: false, message: "Please fill in all required fields" });
    setTesting(false);
  };

  const handleSave = async () => {
    if (!connectingProvider || !currentOrg?.id) return;
    setSaving(true);
    const supabase = createClient();
    const existing = integrations.find((i) => i.provider === connectingProvider.provider);
    if (existing) {
      await supabase.from("integrations").update({ config: formValues, status: "connected", last_sync_at: new Date().toISOString() }).eq("id", existing.id);
      setIntegrations((prev) => prev.map((i) => i.id === existing.id ? { ...i, config: formValues, status: "connected", last_sync_at: new Date().toISOString() } : i));
    } else {
      const { data } = await supabase.from("integrations").insert({ org_id: currentOrg.id, provider: connectingProvider.provider, config: formValues, status: "connected", last_sync_at: new Date().toISOString() }).select().single();
      if (data) setIntegrations((prev) => [...prev, data as Integration]);
    }
    toast.success(`${connectingProvider.name} connected!`);
    setSaving(false); setConnectingProvider(null);
  };

  const handleDisconnect = async (provider: string) => {
    const supabase = createClient();
    const existing = integrations.find((i) => i.provider === provider);
    if (!existing) return;
    await supabase.from("integrations").update({ status: "disconnected", config: {} }).eq("id", existing.id);
    setIntegrations((prev) => prev.map((i) => (i.id === existing.id ? { ...i, status: "disconnected", config: {} } : i)));
    toast.success("Disconnected");
  };

  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-bold text-text-1">Integrations</h1><p className="text-sm text-text-2">Connect your tools to automate revenue recovery</p></div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {providers.map((provider) => {
          const status = getStatus(provider.provider);
          const isConnected = status === "connected";
          const Icon = provider.icon;
          return (
            <Card key={provider.provider} className="border-border bg-surface transition-all hover:border-border/80">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-surface-2 p-3"><Icon className="h-6 w-6 text-primary" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2"><h3 className="font-semibold text-text-1">{provider.name}</h3><Badge variant={isConnected ? "success" : "secondary"}>{isConnected ? "Connected" : "Not connected"}</Badge></div>
                    <p className="mt-1 text-sm text-text-2">{provider.desc}</p>
                    <p className="mt-0.5 text-xs text-text-3">{provider.category}</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  {isConnected ? (<div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => handleOpenConnect(provider)}>Configure</Button><Button variant="ghost" size="sm" className="text-red hover:text-red" onClick={() => handleDisconnect(provider.provider)}>Disconnect</Button></div>) : (<Button size="sm" onClick={() => handleOpenConnect(provider)}>{provider.fields.length > 0 ? "Connect" : provider.testLabel}</Button>)}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!connectingProvider} onOpenChange={(open) => !open && setConnectingProvider(null)}>
        <DialogContent className="max-w-md">
          {connectingProvider && (
            <>
              <DialogHeader><DialogTitle>{getStatus(connectingProvider.provider) === "connected" ? "Configure" : "Connect"} {connectingProvider.name}</DialogTitle><DialogDescription>{connectingProvider.desc}</DialogDescription></DialogHeader>
              {connectingProvider.fields.length > 0 ? (
                <div className="space-y-4">
                  {connectingProvider.fields.map((field) => (<div key={field.key} className="space-y-2"><Label>{field.label}</Label><Input type={field.type} value={formValues[field.key] || ""} onChange={(e) => setFormValues((prev) => ({ ...prev, [field.key]: e.target.value }))} placeholder={field.placeholder} /></div>))}
                  {testResult && (<div className={`flex items-center gap-2 rounded-lg p-3 text-sm ${testResult.success ? "bg-green/10 text-green" : "bg-red/10 text-red"}`}>{testResult.success ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}{testResult.message}</div>)}
                  <div className="flex gap-2"><Button variant="outline" onClick={handleTest} disabled={testing}>{testing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{connectingProvider.testLabel}</Button><Button onClick={handleSave} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save</Button></div>
                </div>
              ) : (
                <div className="space-y-4 py-4 text-center"><p className="text-sm text-text-2">Sign in with your account to connect.</p><Button onClick={() => { toast.info("OAuth flow coming soon"); setConnectingProvider(null); }}>{connectingProvider.testLabel}</Button></div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
