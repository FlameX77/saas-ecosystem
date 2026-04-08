'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { 
  Activity, 
  TrendingUp, 
  AlertCircle, 
  Layers, 
  ChevronRight,
  Plus,
  BarChart3,
  Waves,
  LayoutGrid,
  Zap,
  ArrowUpRight,
  TrendingDown,
  Clock
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppStore } from "@/stores/appStore";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";

// --- 🏠 COMPONENT DEFINITION ---

export default function DashboardPage() {
  const { currentOrg } = useAppStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const kpiRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ 
    totalRevenue: 458200, 
    claimsInPipeline: 1240, 
    denialRate: 14.2, 
    collectionRate: 92.4,
    forecastedRecovery: 114000 
  });

  useEffect(() => {
    // ⚡ GSAP Numerical Counter Animation
    const ctx = gsap.context(() => {
      kpiRefs.current.forEach((ref) => {
        if (!ref) return;
        const val = parseFloat(ref.getAttribute('data-value') || "0");
        gsap.from(ref, {
          textContent: 0,
          duration: 1.5,
          snap: { textContent: 1 },
          ease: 'power2.out',
          onUpdate: function() {
            // Numbers already clean
          }
        });
      });

      // Staggered Entrance
      gsap.from('.gsap-card', {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power3.out'
      });
    }, containerRef);

    setLoading(false);
    return () => ctx.revert();
  }, []);

  const kpis = [
    { label: 'Recovered Revenue', value: stats.totalRevenue, unit: 'AED', trend: '+12.5%', icon: TrendingUp },
    { label: 'Claims in Pipeline', value: stats.claimsInPipeline, unit: 'Claims', trend: '+45', icon: Layers },
    { label: 'Forecast Recovery', value: stats.forecastedRecovery, unit: 'AED', trend: '+9k', icon: Activity },
    { label: 'Collection Rate %', value: stats.collectionRate, unit: '%', trend: '+0.5%', icon: Zap },
  ];

  const pipeline = [
    { id: 'DAM-01', insurer: 'Daman', amount: 15200, date: '2h ago', status: 'Denied', risk: 'High' },
    { id: 'AXA-02', insurer: 'AXA Gulf', amount: 8400, date: '4h ago', status: 'Review', risk: 'Low' },
    { id: 'ADN-03', insurer: 'ADNIC', amount: 24500, date: '1d ago', status: 'Denied', risk: 'Critical' },
  ];

  return (
    <div ref={containerRef} className="space-y-12 pb-20">
      
      {/* 🏙️ HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-display font-medium text-white italic tracking-tight">Revenue Dashboard</h2>
          <p className="text-sm font-body text-muted-foreground opacity-60 uppercase tracking-widest mt-2">{currentOrg?.name || 'Clinic Command Center'}</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="h-12 border-white/5 bg-card/40 font-medium tracking-tight">Audit History</Button>
          <Button className="h-12 bg-primary text-background font-bold tracking-tight italic gap-2 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_-10px_rgba(0,212,170,0.5)]">
            <Plus className="h-4 w-4" /> New Batch Submission
          </Button>
        </div>
      </div>

      {/* 📊 KPI STRIP WITH GSAP COUNTERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <Card key={kpi.label} className="gsap-card bg-card border-border/50 p-6 rounded-[2rem] relative group overflow-hidden hover:border-primary/30 transition-all cursor-pointer">
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-8">
                 <div className="h-10 w-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary transition-all group-hover:scale-110">
                    <kpi.icon className="h-5 w-5" />
                 </div>
                 <Badge variant="outline" className="text-[10px] font-mono border-white/5 bg-white/5 text-primary opacity-60 px-2 py-0.5">{kpi.trend} vs cycle</Badge>
              </div>
              <div>
                <p className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground mb-2 opacity-50">{kpi.label}</p>
                <div className="flex items-baseline gap-2">
                  <h3 
                    ref={el => { kpiRefs.current[i] = el; }} 
                    data-value={kpi.value}
                    className="text-3xl font-display font-medium text-white tracking-tight"
                  >
                    {kpi.value}
                  </h3>
                  <span className="text-[10px] text-muted-foreground/30 font-mono tracking-widest">{kpi.unit}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-start">
        
        {/* 📋 CLAIMS KANBAN / DATA DENSE (Center) */}
        <div className="xl:col-span-8 space-y-8">
          <div className="flex items-center justify-between border-b border-border/50 pb-4">
            <h3 className="text-2xl font-display font-medium italic italic flex items-center gap-4 text-white">
              <LayoutGrid className="h-6 w-6 text-primary opacity-50" /> High-Intensity Pipeline
            </h3>
            <div className="flex gap-3">
              <Button variant="ghost" size="sm" className="text-[10px] uppercase font-mono tracking-widest opacity-40 hover:opacity-100">Sort: Value</Button>
              <Button variant="ghost" size="sm" className="text-[10px] uppercase font-mono tracking-widest opacity-40 hover:opacity-100">All Status</Button>
            </div>
          </div>

          <div className="space-y-3">
            {pipeline.map((claim) => (
              <div key={claim.id} className="gsap-card group flex items-center justify-between p-6 bg-card/30 border border-border/40 rounded-[2rem] hover:bg-card/50 hover:border-primary/20 transition-all cursor-pointer">
                <div className="flex items-center gap-8">
                  <div className="h-16 w-16 rounded-[1.5rem] bg-background border border-border flex flex-col items-center justify-center font-mono text-[10px] text-muted-foreground group-hover:border-primary/40 transition-colors">
                    <span className="opacity-30 uppercase">Clm</span>
                    <span className="text-white font-bold text-sm tracking-tight">{claim.id.split('-')[1]}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1.5">
                       <h4 className="text-xl italic font-display font-medium text-white tracking-tight">{claim.insurer} Recovery</h4>
                       <Badge variant="ghost" className="text-[9px] uppercase font-mono px-2 py-0.5 border border-border/50 opacity-40 tracking-tight">{claim.status}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] font-mono text-muted-foreground/60 uppercase tracking-tighter">
                       <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 opacity-40" /> Updated {claim.date}</span>
                       <span className={`flex items-center gap-1.5 font-bold ${claim.risk === 'Critical' ? 'text-secondary' : 'text-primary'}`}>
                          <AlertCircle className="h-3.5 w-3.5" /> Risk: {claim.risk}
                       </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-12">
                   <div className="hidden md:block text-right">
                      <p className="text-[10px] uppercase text-muted-foreground/30 font-mono tracking-widest mb-1.5">Amount AED</p>
                      <p className="text-xl font-mono font-medium text-white italic">{formatCurrency(claim.amount)}</p>
                   </div>
                   <Button variant="ghost" className="h-12 w-12 rounded-full border border-white/5 hover:bg-primary hover:text-background transition-all group-hover:scale-110">
                      <ChevronRight className="h-6 w-6" />
                   </Button>
                </div>
              </div>
            ))}
          </div>

          <Button variant="ghost" className="w-full h-16 border-dashed border-2 border-border/40 text-muted-foreground/50 hover:bg-card rounded-[2rem] font-body italic transition-all">
             Initialize Full Pipeline Sync (1,240 Recoverables) <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* 📊 REVENUE WATERFALL / FORECAST (Right internal) */}
        <div className="xl:col-span-4 space-y-12">
           <div className="flex items-center gap-4 border-b border-border/50 pb-4">
              <BarChart3 className="h-6 w-6 text-primary opacity-50" />
              <h3 className="text-2xl font-display font-medium italic text-white">Waterfall Forecast</h3>
           </div>

           <Card className="p-8 bg-primary text-background rounded-[2.5rem] shadow-[0_0_50px_-10px_rgba(0,212,170,0.4)] relative overflow-hidden group">
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                   <Waves className="h-10 w-10 mb-6 opacity-80" />
                   <h4 className="text-3xl font-display italic font-medium mb-4 leading-tight tracking-tight">Recoverable <br/> Potential Detected</h4>
                   <p className="text-sm font-body opacity-80 leading-relaxed mb-12">
                     Novu pattern-matching identified <span className="font-bold underline decoration-2">AED 84k</span> in denials with a 92% success path on 'Prior Auth' errors.
                   </p>
                </div>
                <Button className="w-full h-16 bg-background text-primary hover:brightness-125 font-bold tracking-tight rounded-[1.5rem] italic text-lg transition-all shadow-xl group-hover:translate-y-[-4px]">
                  Batch Auto-Resubmit
                </Button>
              </div>
              <div className="absolute -bottom-10 -right-10 h-40 w-40 bg-white/20 blur-3xl rounded-full" />
           </Card>

           <div className="space-y-4">
              <div className="gsap-card flex items-start gap-5 p-6 bg-card border border-border/50 rounded-[2rem] hover:border-primary/20 transition-all cursor-pointer">
                <TrendingDown className="h-6 w-6 text-secondary shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-body text-slate-300 leading-relaxed italic">
                    Daman denial rate on code 99213 spiked to <span className="text-white font-bold">24%</span> today. Novu suggests immediate audit of eligibility checks at front desk.
                  </p>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase opacity-40 mt-2 block tracking-widest font-bold">Insurer Drift Alert</span>
                </div>
              </div>
              <div className="gsap-card flex items-start gap-5 p-6 bg-background border border-border/50 rounded-[2rem] hover:border-primary/20 transition-all cursor-pointer">
                <ArrowUpRight className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-body text-slate-300 leading-relaxed italic">
                    Cash flow recovery velocity is <span className="text-white font-bold">12%</span> faster than last cycle. High efficiency on Resubmission batches.
                  </p>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase opacity-40 mt-2 block tracking-widest font-bold">Efficiency Benchmarking</span>
                </div>
              </div>
           </div>
        </div>

      </div>

    </div>
  );
}
