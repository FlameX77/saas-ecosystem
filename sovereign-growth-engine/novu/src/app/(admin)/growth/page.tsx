'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { 
  Rocket, 
  Target, 
  PhoneForwarded, 
  MessageSquare, 
  Calendar,
  Zap,
  ArrowUpRight,
  TrendingUp,
  BrainCircuit,
  MousePointer2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function GrowthEngineDashboard() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.gsap-hero', { opacity: 0, scale: 0.95, duration: 1, ease: 'expo.out' });
      gsap.from('.gsap-step', { opacity: 0, y: 30, stagger: 0.2, duration: 1, ease: 'power4.out', delay: 0.5 });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const pipeline = [
    { clinic: 'Mediclinic City Hospital', status: 'Called (AI)', interest: 'High', hook: 'Reactivation Logic' },
    { clinic: 'Aster Healthcare Group', status: 'Call Booked', interest: 'Hot', hook: 'Revenue Recovery' },
    { clinic: 'Zulekha Hospital Dubai', status: 'WhatsApp Sent', interest: 'Med', hook: 'Patient Scribe' },
    { clinic: 'Apollo Hospitals Mumbai', status: 'Queued', interest: '-', hook: 'Global Fleet' },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-[#020202] text-white p-12 font-sans overflow-x-hidden">
      
      {/* 🚀 SOVEREIGN GROWTH HEADER */}
      <div className="max-w-[1400px] mx-auto mb-20 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="gsap-hero">
          <Badge className="bg-primary/20 text-primary border-primary/40 px-4 py-1 mb-6 text-xs font-mono tracking-widest uppercase">Growth Phase: ACTIVE</Badge>
          <h1 className="text-6xl italic font-display font-medium tracking-tighter leading-none mb-4">The Sovereign <br/> Growth Engine</h1>
          <p className="text-lg opacity-40 italic max-w-xl">Autonomous B2B outreach across UAE & India. Claude 3.5 Sonnet leads the scripts, MiMo AI handles the calls. You just close.</p>
        </div>
        <div className="flex gap-4">
           <Card className="p-8 bg-white/5 border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center min-w-[200px]">
              <Calendar className="h-8 w-8 text-primary mb-4" />
              <p className="text-3xl font-display font-bold italic">12</p>
              <p className="text-[10px] uppercase font-mono tracking-widest opacity-40">Calls This Week</p>
           </Card>
           <Card className="p-8 bg-primary text-black rounded-[2.5rem] flex flex-col items-center justify-center min-w-[200px] shadow-[0_0_50px_-10px_rgba(0,212,170,0.5)]">
              <Zap className="h-8 w-8 mb-4" />
              <p className="text-3xl font-display font-bold italic">4</p>
              <p className="text-[10px] uppercase font-mono tracking-widest">AI Auto-Closes</p>
           </Card>
        </div>
      </div>

      {/* 🏙️ THE ENGINE MECHANISM */}
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
         
         {/* STEP 1: SCRAPE */}
         <Card className="gsap-step p-10 bg-white/[0.03] border-white/10 rounded-[3rem] relative group hover:border-primary/40 transition-all h-[450px] flex flex-col justify-between overflow-hidden">
            <div>
               <Target className="h-10 w-10 text-white opacity-40 mb-8 group-hover:text-primary transition-colors" />
               <h3 className="text-2xl italic font-display font-medium mb-4">1. Scrape & Enrich</h3>
               <p className="text-sm opacity-50 italic">Automated extraction of Clinic CXOs and IT Directors from Google Maps and LinkedIn in target regions.</p>
            </div>
            <div className="space-y-3 opacity-60">
               <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden"> <div className="h-full bg-primary w-[80%]" /> </div>
               <p className="text-[10px] font-mono tracking-widest uppercase">Targeting: Dubai / Mumbai / Delhi</p>
            </div>
            <div className="absolute -bottom-10 -right-10 h-32 w-32 bg-primary/5 blur-3xl rounded-full" />
         </Card>

         {/* STEP 2: CLAUDE SONNET PERSONALIZATION */}
         <Card className="gsap-step p-10 bg-white/[0.03] border-white/10 rounded-[3rem] relative group hover:border-primary/40 transition-all h-[450px] flex flex-col justify-between overflow-hidden">
            <div>
               <BrainCircuit className="h-10 w-10 text-white opacity-40 mb-8 group-hover:text-primary transition-colors" />
               <h3 className="text-2xl italic font-display font-medium mb-4">2. AI Personalization</h3>
               <p className="text-sm opacity-50 italic">Claude 3.5 Sonnet drafts custom hooks based on the clinic's size, doctor headcount, and current patient volume stats.</p>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl italic text-[10px] text-primary">
               "I noticed your clinic in Jumeirah is processing 500+ patients/mo but lacks a reactivation loop..."
            </div>
         </Card>

         {/* STEP 3: MIMO AI CALLER */}
         <Card className="gsap-step p-10 bg-primary text-black rounded-[3rem] relative group h-[450px] flex flex-col justify-between overflow-hidden shadow-[0_0_80px_-20px_rgba(0,212,170,0.4)]">
            <div>
               <PhoneForwarded className="h-10 w-10 mb-8" />
               <h3 className="text-3xl font-display font-bold italic mb-4">3. MiMo AI Cold Call</h3>
               <p className="text-sm font-medium opacity-80 italic">The MiMo AI Caller executes the physical call. It handles the 'Not Interested' gates and books the call directly on your calendar.</p>
            </div>
            <Button className="w-full h-14 bg-black text-primary font-bold rounded-2xl text-lg italic hover:scale-105 active:scale-95 transition-all shadow-xl">
               Start Outreach Run
            </Button>
            <div className="absolute -bottom-10 -right-10 h-40 w-40 bg-white/20 blur-3xl rounded-full" />
         </Card>

      </div>

      {/* 📑 LIVE OUTREACH PIPELINE */}
      <div className="max-w-[1400px] mx-auto">
         <div className="flex items-center justify-between mb-8 px-4">
            <h2 className="text-3xl italic font-display font-medium tracking-tight">Active Pipeline (AI Driven)</h2>
            <div className="flex gap-4">
               <Badge className="bg-white/10 text-white border-white/20 px-4">642 Leads Scanned</Badge>
               <Badge className="bg-secondary/20 text-secondary border-secondary/40 px-4">12 Active Calls</Badge>
            </div>
         </div>

         <div className="grid grid-cols-1 gap-4">
            {pipeline.map((item, i) => (
               <div key={i} className="group p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:bg-white/[0.05] transition-all flex items-center justify-between">
                  <div className="flex items-center gap-6">
                     <div className="h-12 w-12 bg-white/5 rounded-2xl flex items-center justify-center font-bold italic text-primary group-hover:scale-110 transition-transform">
                        {item.clinic[0]}
                     </div>
                     <div>
                        <h4 className="text-lg font-medium italic tracking-tight">{item.clinic}</h4>
                        <div className="flex items-center gap-3 mt-1">
                           <span className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40">Interested in:</span>
                           <Badge variant="ghost" className="text-[9px] font-bold uppercase border border-white/10 px-2 py-0.5">{item.hook}</Badge>
                        </div>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-12">
                     <div className="text-center">
                        <p className="text-[8px] uppercase font-mono tracking-widest opacity-40 mb-1">Outreach Status</p>
                        <span className={`text-xs font-bold italic ${item.status === 'Call Booked' ? 'text-primary' : 'text-white'}`}>{item.status}</span>
                     </div>
                     <div className="text-center">
                        <p className="text-[8px] uppercase font-mono tracking-widest opacity-40 mb-1">Intent Score</p>
                        <Badge className={`${item.interest === 'High' || item.interest === 'Hot' ? 'bg-primary text-black' : 'bg-white/5 text-white/40'}`}>{item.interest}</Badge>
                     </div>
                     <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform">
                        <ArrowUpRight className="h-6 w-6 text-primary" />
                     </Button>
                  </div>
               </div>
            ))}
         </div>
      </div>

    </div>
  );
}
