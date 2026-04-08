'use client';

import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { 
  Check, 
  ChevronLeft, 
  ShieldCheck, 
  Edit3, 
  Plus, 
  X,
  CreditCard,
  Briefcase,
  FileText,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ClinicalButton, SOAPSection, ConfidenceMeter, ApprovalGate } from '@/components/clinical/Primitives';

export default function ReviewNotePage({ params }: { params: { id: string } }) {
  const [isApproved, setIsApproved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState([
    { id: 'S', title: 'Subjective', content: 'Patient (M, 42) complaining of sharp lower back pain (8/10) following lifting a heavy crate yesterday. No history of IVDU or prior back trauma.', conf: 0.98 },
    { id: 'O', title: 'Objective', content: 'Patient restricted in hip flexion. SLR +ve on left at 30 deg. No saddle anesthesia. Reflexes symmetric 1+ bilaterally.', conf: 0.95 },
    { id: 'A', title: 'Assessment', content: 'Mechanical Lower Back Pain. Suspected lumbar disc prolapse with radiculopathy.', conf: 0.92 },
    { id: 'P', title: 'Plan', content: 'Lumbar Spine MRI (Urgent). Ibuprofen 400mg tid. Physiotherapy referral. Sick leave for 3 days.', conf: 0.94 }
  ]);

  const codes = [
    { code: 'M54.5', label: 'Low Back Pain', conf: 0.98 },
    { code: 'M51.26', label: 'Lumbago due to Disc Prolapse', conf: 0.88 },
    { code: '99213', label: 'Outpatient Office Visit', conf: 0.99 }
  ];

  const handleApprove = () => {
    setLoading(true);
    setTimeout(() => {
      setIsApproved(true);
      setLoading(false);
      gsap.to('.approval-status', { scale: 1.1, repeat: 1, yoyo: true, duration: 0.3 });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-ivory p-10 font-body">
      
      {/* 🏙️ HEADER STRIP */}
      <div className="max-w-[1400px] mx-auto flex items-center justify-between border-b border-forest-green/10 pb-8 mb-12">
        <div className="flex items-center gap-8">
           <button onClick={() => window.history.back()} className="h-16 w-16 bg-smoke border border-forest-green/5 rounded-[2rem] flex items-center justify-center hover:bg-forest-green hover:text-ivory transition-all group">
             <ChevronLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
           </button>
           <div>
             <h1 className="text-5xl italic font-display font-medium text-forest-green tracking-tight">Clinical Validation</h1>
             <div className="flex items-center gap-4 mt-3">
               <Badge className="bg-forest-green/10 text-forest-green border-none uppercase font-mono text-[9px] px-4 py-1.5 font-bold italic tracking-widest tracking-tight">Scribe-ID: {params.id.slice(0,8)}</Badge>
               <span className="text-xs text-charcoal/30 font-mono uppercase font-bold tracking-widest">DHA/HAAD Compliant</span>
             </div>
           </div>
        </div>
        {!isApproved && (
          <div className="approval-status p-4 border border-warm-gold/20 bg-warm-gold/5 rounded-2xl flex items-center gap-4">
             <div className="h-2 w-2 rounded-full bg-warm-gold animate-pulse" />
             <span className="text-[10px] font-mono text-warm-gold font-bold uppercase tracking-widest">Needs Human Sign-off</span>
          </div>
        )}
      </div>

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-16">
        
        {/* 📋 REVIEW FLOW: THE SOAP NOTE */}
        <div className="xl:col-span-8 space-y-8">
           {sections.map((s, idx) => (
             <div key={s.id} className="group relative">
                <SOAPSection title={s.title} content={s.content} confidence={s.conf} />
                <button className="absolute top-6 right-20 h-10 w-10 rounded-full border border-forest-green/5 bg-smoke flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-forest-green hover:text-ivory">
                  <Edit3 className="h-4 w-4" />
                </button>
             </div>
           ))}

           {/* AI INSIGHT: Billing Gap (The Authority) */}
           <Card className="p-10 border border-warm-gold border-dashed bg-warm-gold/5 rounded-[3rem] relative overflow-hidden">
              <div className="relative z-10">
                 <div className="flex items-center gap-4 mb-6">
                    <ShieldCheck className="h-7 w-7 text-warm-gold" />
                    <h3 className="text-2xl font-display italic font-medium text-forest-green">Compliance Intelligence</h3>
                 </div>
                 <p className="text-sm font-body text-forest-green/70 leading-relaxed italic max-w-2xl mb-8">
                   "Patient reports heavy lifting ( yesterday )". ScribeAI detected a potential Work Re-Entry gap. Recommend documenting "Lumbar Spine MRI (Urgent)" as per latest DHA Musculoskeletal guidelines.
                 </p>
                 <ClinicalButton variant="ghost" className="h-10 px-6 rounded-2xl text-[10px] uppercase font-bold tracking-widest italic border-warm-gold/20 text-warm-gold">Ignore Suggestion</ClinicalButton>
              </div>
           </Card>
        </div>

        {/* 📊 CODES, REVENUE, & APPROVAL WRAPPER */}
        <div className="xl:col-span-4 space-y-10">
           
           {/* CODING MATRIX */}
           <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-forest-green/5 pb-4">
                 <CreditCard className="h-5 w-5 text-warm-gold" />
                 <h2 className="text-xl italic font-display font-medium text-forest-green">Billing Matrix</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                 {codes.map(c => (
                   <div key={c.code} className="p-5 bg-smoke border border-forest-green/5 rounded-[1.5rem] flex items-center gap-6 hover:bg-white hover:shadow-lg transition-all group">
                      <div className="flex flex-col">
                        <span className="text-lg font-mono font-bold text-forest-green">{c.code}</span>
                        <span className="text-[10px] text-charcoal/40 uppercase font-bold tracking-widest">{c.label}</span>
                      </div>
                      <div className="h-8 w-8 rounded-full border border-forest-green/10 flex items-center justify-center opacity-40 group-hover:bg-destructive group-hover:border-none group-hover:text-ivory group-hover:opacity-100 transition-all cursor-pointer">
                        <X className="h-3 w-3" />
                      </div>
                   </div>
                 ))}
                 <button className="h-14 w-14 bg-smoke border border-dashed border-forest-green/20 rounded-2xl flex items-center justify-center text-charcoal/20 hover:text-forest-green hover:border-forest-green/40 transition-all">
                    <Plus className="h-6 w-6" />
                 </button>
              </div>
              <p className="text-[10px] font-mono font-bold text-charcoal/30 uppercase tracking-[0.2em] italic">Calculated Reimbursement Impact: 785.00 AED</p>
           </div>

           {/* APPROVAL GATE */}
           <div className="p-8 bg-forest-green rounded-[3.5rem] text-ivory shadow-2xl relative overflow-hidden">
              <div className="relative z-10 space-y-10">
                 <div>
                    <h3 className="text-4xl italic font-display font-medium leading-[0.9]">Clinical <br/> Sign-off.</h3>
                    <p className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-40 mt-8 mb-6">Medical Sovereign Node</p>
                    <div className="flex items-center gap-4">
                       <ConfidenceMeter value={0.96} />
                       <span className="text-[10px] uppercase font-bold text-warm-gold tracking-widest italic">Global Score</span>
                    </div>
                 </div>

                 <ClinicalButton 
                   variant="approve" 
                   className="w-full h-20 bg-ivory text-forest-green hover:bg-warm-gold hover:text-forest-green text-2xl font-bold rounded-2xl italic tracking-tight transition-all active:scale-95 group shadow-xl"
                   disabled={loading || isApproved}
                   onClick={handleApprove}
                 >
                    {loading ? <Zap className="h-8 w-8 animate-spin" /> : isApproved ? <ShieldCheck className="h-8 w-8" /> : 'SIGN & FINAL REPORT'}
                 </ClinicalButton>
              </div>

              {isApproved && (
                <div className="absolute inset-0 bg-forest-green/90 backdrop-blur-lg flex flex-col items-center justify-center text-center p-12 z-20 animate-reveal">
                   <div className="h-24 w-24 bg-ivory/10 rounded-full flex items-center justify-center text-warm-gold mb-8 animate-pulse">
                      <Check className="h-12 w-12" />
                   </div>
                   <h4 className="text-3xl font-display italic">Report Finalized</h4>
                   <p className="text-sm font-mono opacity-50 mt-4 leading-relaxed uppercase tracking-widest font-bold">Encrypted & Dispatched <br/> to Nabidh Node</p>
                   <ClinicalButton variant="ghost" className="mt-12 text-ivory border-ivory/20" onClick={() => window.location.href = '/dashboard'}>Return to Command Center</ClinicalButton>
                </div>
              )}
           </div>

           {/* FLYWHEEL PREVIEW (Status: Approve triggers Knowledge Ingest) */}
           <div className="p-8 border border-forest-green/5 bg-smoke rounded-[2.5rem] opacity-60">
              <div className="flex items-center gap-3 mb-4">
                 <Zap className="h-5 w-5 text-forest-green" />
                 <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest">Ingest Flywheel</h4>
              </div>
              <p className="text-[11px] italic font-body text-charcoal/50 leading-relaxed font-bold italic">
                 On sign-off, this note will automatically produce <span className="text-forest-green">1 Clinical protocol article</span> to HelpDoc KB.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
