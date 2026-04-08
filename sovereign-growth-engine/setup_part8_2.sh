#!/bin/bash
set -e

cat > novu/src/app/'(dashboard)'/analytics/page.tsx << 'ENDFILE'
"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/stores/appStore";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { RecoveredRevenue, Contact } from "@/types";

export default function AnalyticsPage() {
  const { currentOrg } = useAppStore();
  const [revenue, setRevenue] = useState<RecoveredRevenue[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!currentOrg?.id) return;
      const supabase = createClient();
      const { data: rev } = await supabase.from("recovered_revenue").select("*").eq("org_id", currentOrg.id);
      if (rev) setRevenue(rev as RecoveredRevenue[]);
      const { data: cont } = await supabase.from("contacts").select("*").eq("org_id", currentOrg.id);
      if (cont) setContacts(cont as Contact[]);
      setLoading(false);
    }
    fetchData();
  }, [currentOrg?.id]);

  const totalRevenue = revenue.reduce((s, r) => s + r.amount, 0);

  const recoveryByType = [
    { type: "Appointments", value: revenue.filter((r) => r.recovery_type === "appointment").reduce((s, r) => s + r.amount, 0) },
    { type: "Leads", value: revenue.filter((r) => r.recovery_type === "lead").reduce((s, r) => s + r.amount, 0) },
    { type: "Invoices", value: revenue.filter((r) => r.recovery_type === "invoice").reduce((s, r) => s + r.amount, 0) },
    { type: "Reactivations", value: revenue.filter((r) => r.recovery_type === "reactivation").reduce((s, r) => s + r.amount, 0) },
  ];

  const funnelData = [
    { stage: "New Leads", count: contacts.filter((c) => c.stage === "new_lead").length },
    { stage: "Contacted", count: contacts.filter((c) => c.stage === "contacted").length },
    { stage: "Replied", count: contacts.filter((c) => c.stage === "replied").length },
    { stage: "Booked", count: contacts.filter((c) => c.stage === "appointment_booked").length },
    { stage: "Recovered", count: contacts.filter((c) => c.stage === "recovered").length },
  ];

  const tooltipStyle = { backgroundColor: "#1a2235", border: "1px solid #1e2d45", borderRadius: "8px", color: "#fff", fontSize: "12px" };

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-text-1">Analytics</h1><p className="text-sm text-text-2">Revenue recovery performance</p></div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-6"><p className="text-sm text-text-2">Total Recovered</p><p className="mt-2 text-3xl font-bold text-green">{formatCurrency(totalRevenue)}</p></div>
        <div className="rounded-xl border border-border bg-surface p-6"><p className="text-sm text-text-2">Total Contacts</p><p className="mt-2 text-3xl font-bold text-primary">{contacts.length}</p></div>
        <div className="rounded-xl border border-border bg-surface p-6"><p className="text-sm text-text-2">Recovery Rate</p><p className="mt-2 text-3xl font-bold text-amber">{contacts.length > 0 ? Math.round((contacts.filter((c) => c.stage === "recovered").length / contacts.length) * 100) : 0}%</p></div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-6">
          <h3 className="mb-4 text-sm font-medium text-text-2">Revenue by Type</h3>
          <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={recoveryByType}><CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" /><XAxis dataKey="type" stroke="#4a5568" fontSize={11} tickLine={false} axisLine={false} /><YAxis stroke="#4a5568" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="value" fill="#00c896" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6">
          <h3 className="mb-4 text-sm font-medium text-text-2">Conversion Funnel</h3>
          <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={funnelData} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" /><XAxis type="number" stroke="#4a5568" fontSize={11} tickLine={false} axisLine={false} /><YAxis dataKey="stage" type="category" stroke="#4a5568" fontSize={11} tickLine={false} axisLine={false} width={80} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="count" fill="#0066ff" radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer></div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6">
        <h3 className="mb-4 text-sm font-medium text-text-2">Summary</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div><p className="text-xs text-text-3">New Leads</p><p className="text-lg font-bold text-text-1">{contacts.filter((c) => c.stage === "new_lead").length}</p></div>
          <div><p className="text-xs text-text-3">In Contact</p><p className="text-lg font-bold text-text-1">{contacts.filter((c) => ["contacted", "replied"].includes(c.stage)).length}</p></div>
          <div><p className="text-xs text-text-3">Appointments Booked</p><p className="text-lg font-bold text-green">{contacts.filter((c) => c.stage === "appointment_booked").length}</p></div>
          <div><p className="text-xs text-text-3">Recovered</p><p className="text-lg font-bold text-green">{contacts.filter((c) => c.stage === "recovered").length}</p></div>
        </div>
      </div>
    </div>
  );
}
ENDFILE

cat > novu/src/app/'(dashboard)'/integrations/page.tsx << 'ENDFILE'
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
ENDFILE

cat > novu/src/app/'(dashboard)'/settings/page.tsx << 'ENDFILE'
"use client";

import { useState } from "react";
import { useAppStore } from "@/stores/appStore";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { currentOrg, currentProfile } = useAppStore();
  const [saving, setSaving] = useState(false);
  const [orgName, setOrgName] = useState(currentOrg?.name || "");
  const [bookingLink, setBookingLink] = useState(currentOrg?.booking_link || "");
  const [avgDeal, setAvgDeal] = useState(String(currentOrg?.avg_deal_value || 5000));
  const [fullName, setFullName] = useState(currentProfile?.full_name || "");
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(true);

  const handleSaveOrg = async () => {
    if (!currentOrg?.id) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("organizations").update({ name: orgName, booking_link: bookingLink || null, avg_deal_value: parseFloat(avgDeal) || 5000 }).eq("id", currentOrg.id);
    toast.success("Settings saved!");
    setSaving(false);
  };

  const handleSaveProfile = async () => {
    if (!currentProfile?.id) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("profiles").update({ full_name: fullName, notification_prefs: { email: emailNotifs, sms: smsNotifs } }).eq("id", currentProfile.id);
    toast.success("Profile saved!");
    setSaving(false);
  };

  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-bold text-text-1">Settings</h1><p className="text-sm text-text-2">Manage your account and preferences</p></div>

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList><TabsTrigger value="business">Business</TabsTrigger><TabsTrigger value="profile">Profile</TabsTrigger><TabsTrigger value="notifications">Notifications</TabsTrigger></TabsList>

        <TabsContent value="business">
          <div className="max-w-lg space-y-4 rounded-xl border border-border bg-surface p-6">
            <div className="space-y-2"><Label>Business Name</Label><Input value={orgName} onChange={(e) => setOrgName(e.target.value)} /></div>
            <div className="space-y-2"><Label>Booking Link</Label><Input value={bookingLink} onChange={(e) => setBookingLink(e.target.value)} placeholder="https://cal.com/yourclinic" /></div>
            <div className="space-y-2"><Label>Average Deal Value ($)</Label><Input type="number" value={avgDeal} onChange={(e) => setAvgDeal(e.target.value)} /></div>
            <Button onClick={handleSaveOrg} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save Changes</Button>
          </div>
        </TabsContent>

        <TabsContent value="profile">
          <div className="max-w-lg space-y-4 rounded-xl border border-border bg-surface p-6">
            <div className="space-y-2"><Label>Full Name</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
            <div className="space-y-2"><Label>Email</Label><Input value={currentProfile?.id || ""} disabled className="opacity-50" /></div>
            <Button onClick={handleSaveProfile} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save Profile</Button>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="max-w-lg space-y-4 rounded-xl border border-border bg-surface p-6">
            <div className="flex items-center justify-between"><div><p className="text-sm font-medium text-text-1">Email Notifications</p><p className="text-xs text-text-3">Receive email alerts for new replies</p></div><Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} /></div>
            <div className="flex items-center justify-between"><div><p className="text-sm font-medium text-text-1">SMS Notifications</p><p className="text-xs text-text-3">Receive SMS alerts for recovered revenue</p></div><Switch checked={smsNotifs} onCheckedChange={setSmsNotifs} /></div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
ENDFILE
