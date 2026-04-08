'use client';

import React, { useState } from 'react';
import { 
  Zap, 
  MessageSquare, 
  CreditCard, 
  ChevronRight, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Calendar,
  Send,
  Languages,
  ArrowUpRight,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from "@/lib/utils";

const OVERDUE_MOCK = [
  { id: 'PAY-01', patient: 'Khalid Al-Mansoori', amount: 450, days_late: 14, status: 'nudge_sent', procedure: 'Physiotherapy' },
  { id: 'PAY-02', patient: 'Sarah James', amount: 1200, days_late: 30, status: 'pending', procedure: 'MRI Scan' },
  { id: 'PAY-03', patient: 'Fatima Zayed', amount: 85, days_late: 5, status: 'scheduled', procedure: 'GP Visit' },
  { id: 'PAY-04', patient: 'Rahul Gupta', amount: 3400, days_late: 45, status: 'delayed', procedure: 'Minor Surgery' },
];

export default function PaymentsPage() {
  const [lang, setLang] = useState<'en' | 'ar'>('en');

  return (
    <div className="space-y-12 pb-20">
      
      {/* 🏙️ HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl italic font-display font-medium text-white tracking-tight">Payment Recovery</h1>
          <p className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground opacity-60 mt-1">Smart Collections & Co-Pay Automation</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="h-12 border-white/5 bg-card/40 font-medium tracking-tight italic">Financial Audit Log</Button>
          <Button className="h-12 bg-primary text-background font-bold tracking-tight italic rounded-xl px-10 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_-10px_rgba(0,212,170,0.5)]">
            Batch Nudge (WhatsApp)
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
         
         {/* OVERDUE LIST (Left 8 cols) */}
         <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <h3 className="text-2xl font-display font-medium italic italic flex items-center gap-4 text-white">
                <Calendar className="h-6 w-6 text-primary opacity-50" /> Outstanding Balances
              </h3>
              <div className="flex gap-3">
                <Button variant="ghost" size="sm" className="text-[10px] uppercase font-mono tracking-widest opacity-40 hover:opacity-100">Most Overdue</Button>
                <Button variant="ghost" size="sm" className="text-[10px] uppercase font-mono tracking-widest opacity-40 hover:opacity-100">All Payers</Button>
              </div>
            </div>

            <div className="space-y-3">
              {OVERDUE_MOCK.map((pay) => (
                <div key={pay.id} className="gsap-card group flex items-center justify-between p-6 bg-card/30 border border-border/40 rounded-[2rem] hover:bg-card/50 hover:border-primary/20 transition-all cursor-pointer">
                  <div className="flex items-center gap-8">
                    <div className="h-16 w-16 rounded-[1.5rem] bg-background border border-border flex flex-col items-center justify-center font-mono text-[10px] text-muted-foreground group-hover:border-primary/40 transition-colors">
                      <span className="opacity-30 uppercase">Late</span>
                      <span className={`font-bold text-sm tracking-tight ${pay.days_late >= 30 ? 'text-secondary font-black' : 'text-white'}`}>{pay.days_late}d</span>
                    </div>
                    <div>
                      <h4 className="text-xl italic font-display font-medium text-white tracking-tight">{pay.patient}</h4>
                      <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground/60 uppercase tracking-tighter mt-1">
                        <span className="flex items-center gap-1.5"><Activity className="h-3.5 w-3.5 opacity-40" /> Procedure: {pay.procedure}</span>
                        <Badge variant="ghost" className={`text-[8px] uppercase tracking-widest px-2 py-0 border-none ${pay.status === 'nudge_sent' ? 'bg-primary/10 text-primary' : 'bg-white/5 text-slate-300'}`}>
                           {pay.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-12">
                     <div className="hidden md:block text-right">
                        <p className="text-[10px] uppercase text-muted-foreground/30 font-mono tracking-widest mb-1">Balance</p>
                        <p className="text-xl font-mono font-bold text-white italic">{formatCurrency(pay.amount)}</p>
                     </div>
                     <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full border border-white/5 hover:bg-primary hover:text-background transition-all group-hover:scale-105 shadow-xl">
                           <Smartphone className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full border border-white/5 hover:bg-secondary hover:text-background transition-all group-hover:scale-105 shadow-xl">
                           <Plus className="h-5 w-5" />
                        </Button>
                     </div>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="ghost" className="w-full h-16 border-dashed border-2 border-border/40 text-muted-foreground/50 hover:bg-card rounded-[2rem] font-body italic transition-all">
               Initialize Bulk Collection Flow (AED 124,000 Recoverable) <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
         </div>

         {/* NUDGE BUILDER (Right 4 cols) */}
         <div className="lg:col-span-4 space-y-12">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <div className="flex items-center gap-4">
                <MessageSquare className="h-6 w-6 text-primary opacity-50" />
                <h3 className="text-2xl font-display font-medium italic text-white">Nudge Logic</h3>
              </div>
              <Button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} variant="ghost" size="sm" className="h-8 border-white/10 rounded-full gap-2 text-[10px] font-mono uppercase tracking-[.2em] font-bold text-primary">
                 <Languages className="h-3 w-3" /> {lang.toUpperCase()}
              </Button>
            </div>

            <Card className={`p-8 rounded-[2rem] border-none shadow-2xl relative overflow-hidden transition-all duration-500 bg-secondary/5 group`}>
               <div className="relative z-10 flex flex-col justify-between h-full">
                <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                   <h4 className="text-sm font-mono uppercase tracking-[0.2em] text-secondary font-bold mb-4 opacity-70">
                      {lang === 'en' ? 'Active Template: 14-Day Overdue' : 'نشط: تأخر ١٤ يوما'}
                   </h4>
                   <p className={`text-lg font-display italic font-medium mb-12 leading-relaxed text-white tracking-tight ${lang === 'ar' ? 'font-arabic' : ''}`}>
                      {lang === 'en' 
                        ? `Dear Patient, your payment of AED 450 for Physiotherapy is outstanding. We offer smart installment plans starting from AED 150/mo. Activating your plan via WhatsApp now.`
                        : `عزيزي المريض، دفعتك البالغة 450 درهماً لا تزال معلقة. نوفر خطط تقسيط ذكية تبدأ من 150 درهماً شهرياً. سيتم تفعيل خطتك عبر واتساب الآن.`
                      }
                   </p>
                </div>
                <div className="space-y-4">
                   <div className="flex items-center gap-2 text-[9px] font-mono text-muted-foreground uppercase opacity-40 px-2 italic font-bold"> <CheckCircle2 className="h-3 w-3 text-primary opacity-100" /> WhatsApp Direct API connected </div>
                   <Button className="w-full h-16 bg-primary text-background hover:brightness-125 font-bold tracking-tight rounded-2xl italic text-lg transition-all shadow-xl group-hover:scale-[1.02]">
                    Send Personalised Nudge
                   </Button>
                </div>
              </div>
              <div className="absolute top-0 right-0 p-8 h-full w-1/3 flex items-start justify-end opacity-5">
                  <Smartphone className="h-64 w-64 -rotate-12" />
               </div>
            </Card>

            <div className="gsap-card p-8 bg-card border border-border/50 rounded-[2.5rem] hover:border-primary/20 transition-all cursor-pointer">
               <ShieldCheck className="h-8 w-8 text-primary mb-6 opacity-40" />
               <h5 className="text-xl italic font-display font-medium text-white mb-4">Installment Intelligence</h5>
               <p className="text-xs font-body text-slate-300 italic opacity-80 leading-relaxed mb-6 leading-relaxed">
                  Historical data indicates patients are <span className="text-primary font-bold">4.2x more likely</span> to pay high-value co-pays (AED 1000+) when offered a 3-month automated plan.
               </p>
               <Button variant="outline" className="w-full h-12 border-white/5 bg-background rounded-xl italic">Configure Thresholds</Button>
            </div>
         </div>

      </div>

    </div>
  );
}
