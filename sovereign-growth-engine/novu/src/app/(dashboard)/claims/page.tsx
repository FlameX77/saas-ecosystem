'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight,
  ChevronRight,
  MoreVertical,
  Plus,
  ShieldCheck,
  FileDown
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from "@/lib/utils";

const CLAIMS_MOCK = [
  { id: 'CLM-01', patient: 'Khalid Al-Mansoori', insurer: 'Daman', amount: 15200, status: 'denied', reason: 'Missing Modifier 25', date: '2026-04-01' },
  { id: 'CLM-02', patient: 'Sarah James', insurer: 'AXA Gulf', amount: 8400, status: 'under_review', reason: '-', date: '2026-04-02' },
  { id: 'CLM-03', patient: 'Fatima Zayed', insurer: 'ADNIC', amount: 24500, status: 'denied', reason: 'Prior Auth Req', date: '2026-03-31' },
  { id: 'CLM-04', patient: 'Rahul Gupta', insurer: 'Neuron', amount: 3200, status: 'paid', reason: '-', date: '2026-04-03' },
];

export default function ClaimsPage() {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  return (
    <div className="space-y-12 pb-20">
      
      {/* 🏙️ HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl italic font-display font-medium text-white tracking-tight">Claims Management</h1>
          <p className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground opacity-60 mt-1">Lifecycle Operations: Submitted → Recovered</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="h-12 border-white/5 bg-card/40 font-medium tracking-tight">Export Batch Report</Button>
          <Button className="h-12 bg-primary text-background font-bold tracking-tight italic gap-2 transition-all hover:scale-105 shadow-[0_0_20px_-5px_rgba(0,212,170,0.5)]">
            <ShieldCheck className="h-4 w-4" /> Bulk Auto-Resubmit
          </Button>
        </div>
      </div>

      {/* 🔍 SEARCH & FILTERS */}
      <div className="flex flex-col lg:flex-row gap-4 items-center bg-card/30 p-4 border border-border/40 rounded-[2rem]">
         <div className="relative flex-1 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              className="w-full h-14 pl-14 pr-6 bg-background border-border/50 rounded-2xl text-sm font-body italic placeholder:opacity-40 focus:ring-1 focus:ring-primary/20 transition-all" 
              placeholder="Search Claim ID, Patient Name, or Emirates ID..." 
            />
         </div>
         <div className="flex gap-2 w-full lg:w-auto">
            {['Status', 'Insurer', 'Date Range', 'Denial Code'].map(f => (
              <Button key={f} variant="outline" className="h-14 px-6 border-border/50 bg-background rounded-2xl gap-3 text-xs uppercase font-mono tracking-widest hover:bg-card">
                 {f} <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            ))}
         </div>
      </div>

      {/* 📊 DATA DENSE TABLE */}
      <Card className="bg-background border-border/40 rounded-[2.5rem] overflow-hidden shadow-2xl">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-card/50 border-b border-border/50">
                     <th className="p-6 text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-bold">Claim ID</th>
                     <th className="p-6 text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-bold">Inpatient / Outpatient</th>
                     <th className="p-6 text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-bold">Insurer</th>
                     <th className="p-6 text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-bold">Amount (AED)</th>
                     <th className="p-6 text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-bold text-center">Status</th>
                     <th className="p-6 text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-bold text-center">Auto-Rescue</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-border/20 font-body">
                  {CLAIMS_MOCK.map((clm) => (
                    <React.Fragment key={clm.id}>
                      <tr 
                         onClick={() => setExpandedRow(expandedRow === clm.id ? null : clm.id)}
                         className="hover:bg-card/30 transition-colors cursor-pointer group"
                      >
                         <td className="p-6">
                            <span className="text-sm font-bold text-white block tracking-tight">{clm.id}</span>
                            <span className="text-[10px] text-muted-foreground opacity-50 font-mono italic">Submitted {clm.date}</span>
                         </td>
                         <td className="p-6">
                            <span className="text-sm text-slate-300 block italic leading-none">{clm.patient}</span>
                            <span className="text-[9px] uppercase font-mono text-muted-foreground tracking-tighter mt-1 block opacity-40">EMR: MED-882-2</span>
                         </td>
                         <td className="p-6">
                            <Badge variant="ghost" className="bg-secondary/10 text-secondary border-none uppercase text-[8px] font-bold tracking-widest px-3 py-0.5">
                               {clm.insurer}
                            </Badge>
                         </td>
                         <td className="p-6">
                            <span className="text-lg font-mono font-medium text-white italic tracking-tighter">{formatCurrency(clm.amount)}</span>
                         </td>
                         <td className="p-6 text-center">
                            <Badge variant="outline" className={`uppercase text-[9px] px-3 py-1 font-mono tracking-tight bg-white/5 border-none ${clm.status === 'denied' ? 'text-secondary' : clm.status === 'paid' ? 'text-primary' : 'text-blue-400'}`}>
                               {clm.status.replace('_', ' ')}
                            </Badge>
                         </td>
                         <td className="p-6 text-center">
                            {clm.status === 'denied' ? (
                              <div className="h-10 w-10 mx-auto bg-primary/10 rounded-xl flex items-center justify-center text-primary hover:bg-primary hover:text-background transition-all">
                                 <Plus className="h-5 w-5" />
                              </div>
                            ) : clm.status === 'paid' ? (
                              <CheckCircle2 className="h-6 w-6 text-primary/40 mx-auto" />
                            ) : (
                               <div className="h-2 w-16 bg-blue-500/10 rounded-full mx-auto overflow-hidden">
                                 <div className="h-full bg-blue-500 w-1/2 animate-pulse" />
                               </div>
                            )}
                         </td>
                      </tr>

                      {/* --- EXPANDED ROW (The Audit Detail) --- */}
                      {expandedRow === clm.id && (
                        <tr className="bg-card/10 border-l-[3px] border-primary">
                          <td colSpan={6} className="p-12">
                             <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                                <div className="lg:col-span-8 flex flex-col gap-8">
                                   <div className="flex items-start gap-4">
                                      <AlertCircle className="h-6 w-6 text-secondary mt-1" />
                                      <div>
                                         <h4 className="text-xl italic font-display font-medium text-white mb-2">Denial Audit: {clm.reason}</h4>
                                         <p className="text-sm font-body text-muted-foreground leading-relaxed italic opacity-80">
                                            The insurer ({clm.insurer}) flagged code 99213 as requiring a modifier '25' since it was submitted alongside a secondary procedure. Our AI models predict a <span className="font-bold text-primary">94%</span> success rate upon correction.
                                         </p>
                                      </div>
                                   </div>
                                   <div className="flex gap-4">
                                      <Button className="h-12 px-8 bg-primary text-background font-bold tracking-tight rounded-xl italic">Generate Corrected Batch</Button>
                                      <Button variant="outline" className="h-12 border-white/5 bg-background text-sm font-medium tracking-tight rounded-xl">View Original EMR Note</Button>
                                   </div>
                                </div>
                                <div className="lg:col-span-4 space-y-6">
                                   <div className="p-6 bg-background rounded-3xl border border-border/50">
                                      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-4 font-bold opacity-30">Payer Details</p>
                                      <div className="space-y-4">
                                         <div className="flex justify-between text-xs"> <span className="opacity-40">Insurer Hub</span> <span className="font-bold text-white font-mono uppercase tracking-tighter">Portal Connected</span> </div>
                                         <div className="flex justify-between text-xs"> <span className="opacity-40">Regulatory Body</span> <span className="font-bold text-white font-mono uppercase tracking-tighter">DHA</span> </div>
                                         <div className="flex justify-between text-xs"> <span className="opacity-40">Days Outstanding</span> <span className="font-bold text-secondary font-mono">14 Days</span> </div>
                                      </div>
                                   </div>
                                </div>
                             </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
               </tbody>
            </table>
         </div>
      </Card>

      <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground opacity-40 uppercase tracking-widest px-8">
         <span>Total Volume AED 42.4 M this month</span>
         <div className="flex items-center gap-6">
            <button className="hover:text-primary transition-colors">Previous Page</button>
            <span className="font-bold text-white">Showing 1 - 25 of 1,240 Claims</span>
            <button className="hover:text-primary transition-colors">Next Page</button>
         </div>
      </div>

    </div>
  );
}
