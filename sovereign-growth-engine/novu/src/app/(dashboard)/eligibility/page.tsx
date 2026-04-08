'use client';

import React, { useState } from 'react';
import { 
  Search, 
  CreditCard, 
  ShieldCheck, 
  ShieldAlert, 
  ChevronRight, 
  Plus, 
  Clock, 
  Activity,
  History,
  FileSearch,
  CheckCircle2,
  Terminal,
  Zap
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function EligibilityPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | 'eligible' | 'ineligible'>(null);

  const handleCheck = () => {
    setLoading(true);
    setTimeout(() => {
      setResult('eligible');
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-12 pb-20">
      
      {/* 🏙️ HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl italic font-display font-medium text-white tracking-tight">Eligibility Pre-Check</h1>
          <p className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground opacity-60 mt-1">Real-time Insurer Verification Hub</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="h-12 border-white/5 bg-card/40 font-medium tracking-tight italic">Scan Emirates ID</Button>
          <Button className="h-12 bg-primary text-background font-bold tracking-tight italic rounded-xl px-10 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_-10px_rgba(0,212,170,0.5)]">
            Register New Patient
          </Button>
        </div>
      </div>

      {/* 🔍 SEARCH & FILTERS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
         
         {/* SEARCH BOX (Left 8 cols) */}
         <div className="lg:col-span-8 space-y-6">
            <Card className="p-12 bg-card/30 border-border/40 rounded-[3rem] relative overflow-hidden group hover:border-primary/20 transition-all shadow-2xl">
               <div className="relative z-10 flex flex-col gap-10">
                  <div>
                    <h3 className="text-2xl italic font-display font-medium text-white mb-2">Policy Verification</h3>
                    <p className="text-sm font-body text-slate-300 italic opacity-80 leading-relaxed max-w-lg">Enter the Emirates ID or Member Number to verify coverage against DHA/HAAD regulatory rules instantly.</p>
                  </div>

                  <div className="flex flex-col lg:flex-row gap-4 items-center">
                    <div className="relative flex-1 group w-full">
                        <CreditCard className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input 
                          className="w-full h-16 pl-14 pr-6 bg-background border-border/50 rounded-2xl text-lg font-mono tracking-widest placeholder:opacity-40 focus:ring-1 focus:ring-primary/20 transition-all text-white" 
                          placeholder="784-19XX-XXXXXXX-X" 
                        />
                    </div>
                    <Button 
                      onClick={handleCheck}
                      disabled={loading}
                      className="h-16 px-12 bg-primary text-background font-bold tracking-tight italic rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_-5px_rgba(0,212,170,0.5)] w-full lg:w-auto"
                    >
                      {loading ? <Zap className="h-5 w-5 animate-spin" /> : 'Run Verify'}
                    </Button>
                  </div>

                  <div className="flex items-center gap-6 text-[10px] uppercase font-mono tracking-[0.2em] text-muted-foreground/30 font-bold px-2 italic">
                     <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Daman Hub Active</span>
                     <span className="flex items-center gap-2 text-primary/60"><CheckCircle2 className="h-4 w-4" /> ADNIC Verified</span>
                     <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> AXA Sync Complete</span>
                  </div>
               </div>
               {/* Background pattern */}
               <div className="absolute top-0 right-0 p-8 h-full w-1/2 flex items-center justify-end opacity-5">
                  <Terminal className="h-96 w-96 rotate-12" />
               </div>
            </Card>

            {/* --- RESULT PANEL --- */}
            {result && (
              <Card className="p-12 bg-background border border-border/50 rounded-[3rem] animate-in fade-in slide-in-from-bottom-4 duration-700">
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                       <Badge variant="ghost" className="bg-primary/10 text-primary border-none uppercase text-[10px] font-bold tracking-widest px-4 py-1 mb-6">Patient Verified</Badge>
                       <h4 className="text-4xl italic font-display font-medium text-white tracking-tight mb-4">Khalid Al-Mansoori</h4>
                       <div className="space-y-4">
                          <div className="flex justify-between text-xs py-2 border-b border-border/20 italic text-slate-300"> <span>Insurer</span> <span className="font-bold text-white uppercase tracking-widest">Daman Insurance</span> </div>
                          <div className="flex justify-between text-xs py-2 border-b border-border/20 italic text-slate-300"> <span>Plan Code</span> <span className="font-bold text-white uppercase tracking-widest">P-882-ULTRA</span> </div>
                          <div className="flex justify-between text-xs py-2 border-b border-border/20 italic text-slate-300"> <span>Co-Pay (OPD)</span> <span className="font-bold text-secondary font-mono">AED 25.00</span> </div>
                       </div>
                    </div>
                    <div className="bg-card/50 p-8 rounded-[2rem] border border-primary/20 relative overflow-hidden group">
                       <h5 className="text-[10px] uppercase font-mono text-primary font-bold tracking-widest mb-6 opacity-60">Coverage Probability</h5>
                       <div className="space-y-6">
                          <div>
                             <div className="flex justify-between text-[9px] mb-2 font-mono uppercase tracking-widest text-muted-foreground italic"> <span>Physiotherapy</span> <span className="text-primary font-bold">100% (AED 5,000 CAP)</span> </div>
                             <div className="h-1.5 w-full bg-white/5 rounded-full"> <div className="h-full bg-primary w-full" /> </div>
                          </div>
                          <div>
                             <div className="flex justify-between text-[9px] mb-2 font-mono uppercase tracking-widest text-muted-foreground italic"> <span>Pharmacy</span> <span className="text-primary font-bold">85% (AED 2,500 CAP)</span> </div>
                             <div className="h-1.5 w-full bg-white/5 rounded-full"> <div className="h-full bg-primary w-[85%]" /> </div>
                          </div>
                          <p className="text-[10px] font-body text-muted-foreground italic mt-6 opacity-40 leading-relaxed uppercase">Policy excludes psychiatric care and premium dental unless prior-authorized via DHA portal hub.</p>
                       </div>
                    </div>
                 </div>
              </Card>
            )}
         </div>

         {/* RECENT LOOKUPS (Right 4 cols) */}
         <div className="lg:col-span-4 space-y-6">
            <h3 className="text-xl italic font-display font-medium text-white px-2">Verification History</h3>
            <div className="space-y-3">
               {[ 'Sarah James', 'Fatima Zayed', 'Rahul Gupta' ].map((name, i) => (
                  <div key={name} className="gsap-card p-6 bg-card/20 border border-border/50 rounded-[2rem] hover:bg-card/30 transition-all cursor-pointer flex items-center justify-between group">
                     <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-white/5 rounded-2xl flex items-center justify-center font-bold text-white italic text-lg leading-none border border-border/50 group-hover:border-primary/40"> 
                           <History className="h-4 w-4 opacity-40" /> 
                        </div>
                        <div>
                           <h4 className="text-sm font-medium text-white italic tracking-tight">{name}</h4>
                           <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-tighter opacity-40">Checked {i+1}h ago • AXA Gulf</span>
                        </div>
                     </div>
                     <Badge variant="ghost" className="text-[8px] font-bold uppercase border border-primary/20 text-primary px-3 py-1">Active</Badge>
                  </div>
               ))}
            </div>
            
            <Card className="p-8 bg-secondary/10 border-secondary/30 rounded-[2.5rem] relative group overflow-hidden">
               <ShieldAlert className="h-10 w-10 mb-6 text-secondary opacity-80" />
               <h4 className="text-2xl font-display italic font-medium leading-tight text-white tracking-tight">Fraud Detection <br/> Protocol Active</h4>
               <p className="text-xs font-body text-slate-300 italic opacity-80 mt-4 leading-relaxed">Novu is scanning for duplicate policy registrations across DHA portals to minimize regulatory risk.</p>
            </Card>
         </div>

      </div>

    </div>
  );
}
