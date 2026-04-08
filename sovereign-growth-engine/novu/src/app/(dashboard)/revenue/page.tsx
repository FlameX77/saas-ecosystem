'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { 
  TrendingUp, 
  ChevronRight, 
  Activity, 
  BarChart3, 
  Layers, 
  ArrowUpRight,
  TrendingDown,
  PieChart,
  Waves
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function RevenueIntelligencePage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.gsap-card', {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power3.out'
      });

      // Simple bar and metric reveal
      gsap.from('.gsap-bar', {
        scaleY: 0,
        transformOrigin: 'bottom center',
        duration: 1.5,
        stagger: 0.05,
        ease: 'elastic.out(1, 0.5)'
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const scores = [
    { insurer: 'Daman', denial_rate: 18.2, recovery_velocity: 'High', grade: 'B+' },
    { insurer: 'AXA Gulf', denial_rate: 11.4, recovery_velocity: 'Med', grade: 'A' },
    { insurer: 'ADNIC', denial_rate: 22.8, recovery_velocity: 'Low', grade: 'C' },
    { insurer: 'Neuron', denial_rate: 14.5, recovery_velocity: 'High', grade: 'B' },
  ];

  return (
    <div ref={containerRef} className="space-y-12 pb-20">
      
      {/* 🏙️ HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl italic font-display font-medium text-white tracking-tight">Revenue Analysis</h1>
          <p className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground opacity-60 mt-1">Multi-Insurer Performance Scoping</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="h-12 border-white/5 bg-card/40 font-medium tracking-tight italic">Download PDF Audit</Button>
          <Button className="h-12 bg-primary text-background font-bold tracking-tight italic rounded-xl px-10 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_-10px_rgba(0,212,170,0.5)]">
            Configure Recovery Goals
          </Button>
        </div>
      </div>

      {/* 🏙️ KEY METRICS STRIP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         
         {/* WATERFALL CHART (Center 8 cols) */}
         <Card className="lg:col-span-8 p-12 bg-card/30 border-border/40 rounded-[2.5rem] relative overflow-hidden group hover:border-primary/20 transition-all">
            <div className="flex items-center justify-between mb-12">
               <div>
                  <h2 className="text-xl italic font-display font-medium text-white">Loss Waterfall: Denial Root Causes</h2>
                  <p className="text-xs font-mono text-muted-foreground uppercase opacity-40 tracking-widest mt-1">AED 412k total loss audited this month</p>
               </div>
               <Badge className="bg-secondary/10 text-secondary border-none uppercase text-[8px] font-bold tracking-widest px-4 py-1">Criticial: Code 99213</Badge>
            </div>

            <div className="h-64 flex items-end justify-between gap-4 px-4 overflow-hidden">
               {['Prior Auth', 'Modifier 25', 'No Eligibility', 'Dup Claim', 'Provider OOD', 'MOH Rule'].map((label, i) => (
                  <div key={label} className="flex-1 flex flex-col items-center gap-4">
                     <span className="text-[9px] font-mono text-muted-foreground/30 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">AED {i*4}k</span>
                     <div className="gsap-bar w-full bg-primary/20 hover:bg-primary rounded-t-xl transition-colors border-x border-t border-primary/40" style={{ height: `${20 + i*15}%` }} />
                     <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest opacity-60 line-clamp-1">{label}</span>
                  </div>
               ))}
               {/* Recovered Spike */}
               <div className="flex-1 flex flex-col items-center gap-4">
                  <span className="text-[9px] font-mono text-secondary font-bold uppercase tracking-tighter">AED 124k</span>
                  <div className="gsap-bar w-full bg-secondary rounded-t-xl transition-all shadow-[0_-10px_30px_-5px_rgba(245,158,11,0.5)]" style={{ height: `85%` }} />
                  <span className="text-[9px] font-mono text-secondary uppercase tracking-[.2em] font-bold">Resubmitted</span>
               </div>
            </div>
            {/* Background pattern */}
            <div className="absolute inset-x-0 bottom-0 top-[60%] bg-gradient-to-t from-primary/10 to-transparent"></div>
         </Card>

         {/* INSURER SCORECARD (Right 4 cols) */}
            <div className="space-y-3">
               {scores.map((sc) => (
                  <div key={sc.insurer} className="gsap-card p-6 bg-background border border-border/50 rounded-[2rem] hover:bg-card/30 transition-all cursor-pointer flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-white/5 rounded-2xl flex items-center justify-center font-bold text-white italic text-lg leading-none border border-border/50"> {sc.grade} </div>
                        <div>
                           <h4 className="text-sm font-medium text-white italic tracking-tight">{sc.insurer} Corp.</h4>
                           <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-tighter opacity-40">Denial Rate: <span className="text-secondary opacity-100 font-bold">{sc.denial_rate}%</span></span>
                        </div>
                     </div>
                     <Badge variant="secondary" className="text-[8px] font-bold uppercase border border-border/50 px-2 py-0.5 opacity-40">{sc.recovery_velocity} Vol</Badge>
                  </div>
               ))}
            </div>

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         <Card className="gsap-card p-8 bg-card/30 border-border/40 rounded-[2.5rem] relative group hover:border-primary/20 transition-all h-[320px] flex flex-col justify-between">
            <div>
               <PieChart className="h-8 w-8 text-primary mb-6 opacity-80" />
               <h4 className="text-2xl font-display italic font-medium leading-none text-white tracking-tight">Projected Recovery <br/> Accuracy vs Actual</h4>
            </div>
            <div className="flex items-end gap-12 mt-12 overflow-hidden px-4">
               <div className="flex-1 flex flex-col items-center gap-2">
                  <div className="gsap-bar w-full bg-white/5 border border-border/80 h-[40%] rounded-t-xl" />
                  <span className="text-[9px] font-mono text-muted-foreground uppercase opacity-40 tracking-widest pb-2">Forecast</span>
               </div>
               <div className="flex-1 flex flex-col items-center gap-2">
                  <div className="gsap-bar w-full bg-primary h-[48%] rounded-t-xl shadow-[0_0_20px_-5px_rgba(0,212,170,0.4)]" />
                  <span className="text-[9px] font-mono text-primary font-bold uppercase tracking-widest pb-2">Actual (12%+)</span>
               </div>
            </div>
         </Card>
         <Card className="gsap-card p-8 bg-card/30 border-border/40 rounded-[2.5rem] relative group hover:border-primary/20 transition-all h-[320px] flex flex-col justify-between">
            <div>
               <Layers className="h-8 w-8 text-secondary mb-6 opacity-80" />
               <h4 className="text-2xl font-display italic font-medium leading-none text-white tracking-tight">Recovery Timeline <br/> AED 1.2M Backlog</h4>
            </div>
            <div className="flex flex-col gap-4 mt-8">
               <div className="flex justify-between text-xs px-2 italic text-slate-300"> <span>30 Days (Ready)</span> <span>AED 42k</span> </div>
               <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden"> <div className="h-full bg-primary w-[30%]" /> </div>
               <div className="flex justify-between text-xs px-2 italic text-slate-300"> <span>60 Days (Staged)</span> <span>AED 124k</span> </div>
               <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden"> <div className="h-full bg-white w-[50%]" /> </div>
               <div className="flex justify-between text-xs px-2 italic text-slate-300"> <span>90 Days (Forecast)</span> <span>AED 850k</span> </div>
               <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden"> <div className="h-full bg-secondary w-[80%]" /> </div>
            </div>
         </Card>
         <Card className="gsap-card p-8 bg-primary text-background rounded-[2.5rem] shadow-[0_0_50px_-10px_rgba(0,212,170,0.4)] relative group overflow-hidden h-[320px] flex flex-col justify-between">
            <div className="relative z-10">
               <Waves className="h-10 w-10 mb-6 opacity-80" />
               <h4 className="text-3xl font-display italic font-medium mb-4 leading-tight tracking-tight">Maximize <br/> Recovery Capture</h4>
               <p className="text-sm font-body opacity-80 mb-10 italic max-w-xs">AI pattern matching indicates code 99213 from ADNIC can be auto-corrected in bulk.</p>
            </div>
            <Button 
               onClick={async () => {
                 try {
                   const response = await fetch(process.env.NEXT_PUBLIC_NOVU_RECOVERY_URL || '#', {
                     method: 'POST',
                     body: JSON.stringify({ action: 'START_RECOVERY_RUN', timestamp: new Date().toISOString() })
                   });
                   if (response.ok) alert('🚀 Intelligence Run Started: Monitoring Stripe & Triggering AI Recovery...');
                 } catch (e) {
                   console.error('Failed to trigger revenue logic');
                 }
               }}
               className="w-full h-14 bg-background text-primary hover:brightness-125 font-bold tracking-tight rounded-2xl italic text-lg transition-all relative z-10"
            >
               Start Intelligence Run
            </Button>
            <div className="absolute -bottom-10 -right-10 h-40 w-40 bg-white/20 blur-3xl rounded-full" />
         </Card>
      </div>

    </div>
  );
}
