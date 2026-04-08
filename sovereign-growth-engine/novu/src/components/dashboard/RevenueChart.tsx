"use client";
import { formatCurrency } from "@/lib/utils";
import type { RecoveredRevenue } from "@/types";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
export function RevenueChart({ data }: { data: RecoveredRevenue[] }) {
  const chartData = data.reduce((acc: { date: string; revenue: number }[], item) => {
    const date = new Date(item.recovered_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const existing = acc.find((d) => d.date === date);
    if (existing) existing.revenue += item.amount;
    else acc.push({ date, revenue: item.amount });
    return acc;
  }, []);
  let cumulative = 0;
  const cumulativeData = chartData.map((d) => { cumulative += d.revenue; return { ...d, cumulative }; });
  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <h3 className="mb-4 text-sm font-medium text-text-2">Revenue Recovered Over Time</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={cumulativeData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00c896" stopOpacity={0.3} /><stop offset="95%" stopColor="#00c896" stopOpacity={0} /></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
            <XAxis dataKey="date" stroke="#4a5568" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#4a5568" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ backgroundColor: "#1a2235", border: "1px solid #1e2d45", borderRadius: "8px", color: "#fff", fontSize: "12px" }} formatter={(value: number) => [formatCurrency(value), "Cumulative"]} />
            <Area type="monotone" dataKey="cumulative" stroke="#00c896" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
