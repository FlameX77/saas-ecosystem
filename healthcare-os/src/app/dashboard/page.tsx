'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { 
  Activity, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  BarChart3,
  MessageSquare,
  ChevronRight,
  ShieldCheck,
  Waves,
  Stethoscope,
  Microscope,
  Zap,
  Target
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- 🏔️ SCRIBE DASHBOARD ---

const accuracyData = [
  { day: 'Mon', score: 88 },
  { day: 'Tue', score: 91 },
  { day: 'Wed', score: 89 },
  { day: 'Thu', score: 94 },
  { day: 'Fri', score: 92 },
  { day: 'Sat', score: 96 },
  { day: 'Sun', score: 95 },
];

export default function DashboardPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const counterRefs = useRef<(HTMLHeadingElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Numerical Counter Animation
      counterRefs.current.forEach((ref) => {
        if (!ref) return;
        const targetValue = parseFloat(ref.getAttribute('data-value') || "0");
        gsap.from(ref, {
          innerText: 0,
          duration: 1.5,
          snap: { innerText: 1 },
          ease: 'power2.out'
        });
      });

      // Entry Stagger
      gsap.from('.reveal-item', {
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.8,
        ease: 'back.out(1.7)'
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const kpis = [
    { label: 'Consultations Today', value: 42, unit: 'Scribes', trend: '+12%', icon: Waves },
    { label: 'Notes Auto-Approved', value: 88, unit: '%', trend: '+5.4%', icon: CheckCircle2 },
    { label: 'RAG Query Accuracy', value: 92, unit: '%', trend: '+1.2%', icon: Target },
    { label: 'HelpDoc Articles', value: 742, unit: 'Nodes', trend: '+18 Today', icon: Microscope },
  ];

  return (
    <div ref={containerRef} className="p-10 mb-20 max-w-[1600px] mx-auto space-y-12 bg-ivory font-body min-h-screen">
      
      {/* 🏙️ HEADER STRIP */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div>
           <Badge className="bg-forest-green/10 text-forest-green border-none text-[9px] uppercase font-mono tracking-[0.2em] px-4 py-1.5 mb-4 italic">
              Production Environment: 784-993-1
           </Badge>
          <h1 className="text-5xl italic font-display font-medium text-forest-green tracking-tight">Clinical Hub</h1>
          <p className="text-sm font-body text-charcoal opacity-40 uppercase tracking-[0.3em] mt-2 font-bold">
            MedCare PolyClinic Jumeirah Hub — {new Date().toLocaleDateString('en-AE', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-4">
           <button className="h-14 px-8 rounded-2xl border border-forest-green/10 bg-white font-display italic text-forest-green hover:bg-smoke transition-all">Audit Trails</button>
           <button className="h-14 px-10 rounded-2xl bg-forest-green text-ivory font-display italic text-lg shadow-[0_20px_40px_-10px_rgba(27,67,50,0.3)] hover:scale-[1.02] transition-all">
             Initialize Scribe
           </button>
        </div>
      </div>

      {/* 📊 KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        {kpis.map((kpi, i) => (
          <Card key={kpi.label} className="reveal-item p-8 border border-forest-green/5 bg-smoke rounded-[2.5rem] hover:bg-white transition-all cursor-pointer group shadow-sm hover:shadow-xl hover:shadow-forest-green/5">
            <div className="flex items-center justify-between mb-8">
              <div className="h-12 w-12 rounded-2xl bg-forest-green/5 flex items-center justify-center text-forest-green group-hover:bg-forest-green group-hover:text-ivory transition-all group-hover:rotate-6">
                <kpi.icon className="h-6 w-6" />
              </div>
              <Badge className="text-[10px] font-bold text-forest-green bg-forest-green/5 border-none uppercase tracking-tighter">
                {kpi.trend}
              </Badge>
            </div>
            <p className="text-[10px] text-charcoal/40 font-bold uppercase tracking-[0.2em] mb-2">{kpi.label}</p>
            <div className="flex items-baseline gap-2">
              <h2 
                ref={(el) => { counterRefs.current[i] = el; }}
                data-value={kpi.value}
                className="text-5xl italic font-display font-medium text-forest-green"
              >
                {kpi.value}
              </h2>
              <span className="text-xs font-body text-charcoal/30 uppercase font-bold">{kpi.unit}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-start px-4">
        
        {/* 📋 DOCTOR'S QUEUE: PENDING APPROVALS */}
        <div className="xl:col-span-12 2xl:col-span-8 space-y-8">
           <div className="flex items-center justify-between border-b border-forest-green/5 pb-6">
              <div className="flex items-center gap-4">
                <Stethoscope className="h-6 w-6 text-warm-gold" />
                <h2 className="text-3xl italic font-display font-medium text-forest-green tracking-tight">Clinical Approvals</h2>
              </div>
              <div className="h-10 px-6 rounded-full border border-forest-green/10 flex items-center gap-3">
                 <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                 <span className="text-[10px] font-mono text-forest-green uppercase font-bold tracking-widest">3 Priority Notes</span>
              </div>
           </div>
           
           <div className="grid gap-5">
              {[
                { id: 'SC-091', p: 'Khalid Al Mansoori', t: '14m ago', c: 'High', s: 'Nabidh Sync Pending' },
                { id: 'SC-092', p: 'Priya Sharma', t: '42m ago', c: 'Low', s: 'Ready' },
                { id: 'SC-093', p: 'Fatima Zayed', t: '1h ago', c: 'Moderate', s: 'Ready' }
              ].map((item) => (
                <div key={item.id} className="reveal-item group flex items-center justify-between p-10 bg-smoke border border-forest-green/5 rounded-[3.5rem] hover:bg-white hover:shadow-2xl hover:shadow-forest-green/5 transition-all cursor-pointer">
                   <div className="flex items-center gap-10">
                      <div className="h-20 w-20 rounded-[2.5rem] bg-white border border-forest-green/5 flex flex-col items-center justify-center font-mono group-hover:bg-forest-green group-hover:text-ivory transition-all group-hover:rotate-3 shadow-sm">
                        <span className="uppercase opacity-40 text-[9px] mb-1">NODE</span>
                        <span className="font-bold text-lg tracking-tight">{item.id.split('-')[1]}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-6 mb-3">
                           <h3 className="text-2xl italic font-display font-medium text-forest-green tracking-tight">{item.p}</h3>
                           <Badge className="text-[9px] uppercase font-mono px-3 py-1 bg-forest-green/5 text-forest-green border-none">{item.c} COMPEXITY</Badge>
                        </div>
                        <div className="flex items-center gap-6 text-[11px] font-mono text-charcoal/40 uppercase tracking-widest font-bold">
                           <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> {item.t}</span>
                           <span className="flex items-center gap-2 italic">{item.s}</span>
                        </div>
                      </div>
                   </div>
                   <button className="h-16 w-16 rounded-[2rem] bg-white border border-forest-green/10 flex items-center justify-center group-hover:bg-forest-green group-hover:text-ivory transition-all hover:scale-110 active:scale-95 shadow-sm">
                      <ChevronRight className="h-6 w-6" />
                   </button>
                </div>
              ))}
           </div>
        </div>

        {/* 🤖 FLYWHEEL INSIGHTS & ANALYTICS */}
        <div className="xl:col-span-12 2xl:col-span-4 space-y-10">
           
           <Card className="p-10 border-none bg-forest-green text-ivory rounded-[3.5rem] shadow-2xl relative overflow-hidden group min-h-[400px] flex flex-col justify-end">
              <div className="absolute top-10 left-10">
                 <Zap className="h-10 w-10 text-warm-gold mb-6 animate-pulse" />
              </div>
              <div className="relative z-10">
                <h3 className="text-4xl font-display italic font-medium mb-6 leading-[0.9]">KNOWLEDGE <br/> FLYWHEEL.</h3>
                <p className="text-sm font-body text-ivory/60 leading-relaxed mb-12 italic max-w-xs">
                  ScribeAI derived <span className="text-warm-gold font-bold">18 new health protocols</span> from today's consultations. 
                </p>
                <div className="flex items-center justify-between gap-6">
                   <div className="flex-1 h-2 bg-ivory/10 rounded-full overflow-hidden">
                      <div className="h-full bg-warm-gold w-3/4 animate-shimmer" />
                   </div>
                   <span className="text-[10px] font-mono uppercase font-bold tracking-widest opacity-60">74% Capacity</span>
                </div>
              </div>
              <div className="absolute -bottom-20 -right-20 h-60 w-60 bg-warm-gold/10 blur-[100px] rounded-full" />
           </Card>

           <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-forest-green/5 pb-4">
                <h4 className="text-xl italic font-display font-medium text-forest-green">AI Accuracy Trend</h4>
                <Badge className="bg-forest-green/10 text-forest-green border-none uppercase font-mono text-[9px]">30 Day Cycle</Badge>
              </div>
              <div className="h-56 w-full -ml-8">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={accuracyData}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4A853" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#D4A853" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1B4332" opacity={0.05} />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#1B4332', opacity: 0.4}} />
                    <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="score" stroke="#D4A853" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </div>

        </div>

      </div>

    </div>
  );
}
