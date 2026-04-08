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
