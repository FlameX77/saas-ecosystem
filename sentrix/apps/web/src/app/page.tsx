import React, { useState, useEffect } from 'react';
import { Shield, Activity, AlertTriangle, CheckCircle, Database, Lock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function SentrixDashboard() {
  const [activities, setActivities] = useState([
    { id: '1', agent: 'Support-Bot', tool: 'search_knowledge_base', status: 'allow', time: '12:04:01' },
    { id: '2', agent: 'Finance-Agent', tool: 'query_payroll_db', status: 'flag', time: '12:04:05' },
    { id: '3', agent: 'Legal-Scribe', tool: 'generate_contract', status: 'allow', time: '12:04:12' },
  ]);

  const stats = [
    { name: 'Active Agents', value: '1,204', icon: Activity, color: 'text-blue-400' },
    { name: 'Risk Level', value: 'Low', icon: Shield, color: 'text-green-400' },
    { name: 'Blocked Actions', value: '42', icon: Lock, color: 'text-red-400' },
    { name: 'Audit Coverage', value: '99.8%', icon: CheckCircle, color: 'text-emerald-400' },
  ];

  const data = [
    { time: '12:00', actions: 400, risk: 240 },
    { time: '12:05', actions: 600, risk: 130 },
    { time: '12:10', actions: 800, risk: 980 },
    { time: '12:15', actions: 1200, risk: 390 },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-500 fill-blue-500/10" />
            SENTRIX <span className="text-slate-500 font-light">SENTINEL</span>
          </h1>
          <p className="text-slate-400">Enterprise AI Agent Governance & Observability</p>
        </div>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-600/20 transition-all">
            Export Audit Trial
          </button>
          <button className="px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-slate-200 transition-all">
            + New Policy
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {stats.map((stat) => (
          <div key={stat.name} className="p-6 bg-[#0a0a0a] border border-white/5 rounded-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-slate-400">{stat.name}</p>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Live Timeline */}
        <div className="lg:col-span-2 p-8 bg-[#0a0a0a] border border-white/5 rounded-3xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            Live Activity Timeline
          </h2>
          <div className="h-[300px] mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorActions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="time" stroke="#ffffff20" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff20" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="actions" stroke="#3b82f6" fillOpacity={1} fill="url(#colorActions)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            {activities.map((act) => (
              <div key={act.id} className="group p-4 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between hover:bg-white/[0.08] transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${act.status === 'allow' ? 'bg-emerald-500' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`} />
                  <div>
                    <p className="font-semibold text-white group-hover:text-blue-400 transition-colors">{act.agent}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-widest">{act.tool}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono text-slate-400">{act.time}</p>
                  <p className={`text-xs uppercase font-bold tracking-tighter ${act.status === 'allow' ? 'text-emerald-500/50' : 'text-amber-500'}`}>{act.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Modules */}
        <div className="space-y-8">
          {/* Anomaly Detection */}
          <div className="p-8 bg-[#0a0a0a] border border-white/5 rounded-3xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Behavioral Drift
            </h2>
            <div className="space-y-6">
              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                <p className="text-amber-400 font-bold mb-1">Anomalous Spike Detected</p>
                <p className="text-sm text-amber-200/60">"Legal-Agent" attempted 400 DB queries in 30s. Baseline is 12.</p>
                <button className="mt-4 text-xs font-bold text-white bg-amber-600/20 px-3 py-1.5 rounded-lg border border-amber-500/30">Investigate Trace</button>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Policy Engine Latency</span>
                <span className="text-emerald-400 font-mono">4.2ms</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Ingestion Backlog</span>
                <span className="text-slate-200 font-mono">0 events</span>
              </div>
            </div>
          </div>

          {/* Quick Config */}
          <div className="p-8 bg-blue-600/10 border border-blue-500/20 rounded-3xl relative overflow-hidden group">
            <Shield className="absolute -right-8 -bottom-8 w-32 h-32 text-blue-500/10 group-hover:scale-110 transition-transform" />
            <h2 className="text-xl font-bold text-white mb-4">Governance Mode</h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              SENTRIX is currently operating in <span className="text-white font-bold">Strict Enforcement</span> mode. 
              All blocked actions are being piped to SOC2 audit logs.
            </p>
            <div className="flex items-center gap-3">
               <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
               <span className="text-blue-300 font-bold text-sm">ENFORCING</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
