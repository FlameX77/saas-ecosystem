'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Mic, 
  ShieldCheck, 
  Zap,
  Globe,
  Stethoscope,
  Info
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ClinicalButton, BilingualText } from '@/components/clinical/Primitives';

export default function NewConsultationPage() {
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [consent, setConsent] = useState(false);

  return (
    <div className="min-h-screen bg-ivory flex flex-col font-body overflow-hidden">
      
      {/* 🏙️ TOP NAV */}
      <div className="p-8 flex items-center justify-between border-b border-forest-green/5 max-w-[1700px] mx-auto w-full">
         <button onClick={() => window.history.back()} className="h-16 w-16 bg-white border border-forest-green/5 rounded-[2rem] flex items-center justify-center hover:bg-forest-green hover:text-ivory transition-all group">
            <ChevronLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
         </button>
         <div className="flex items-center gap-12">
            <div className="flex flex-col items-center">
               <span className="text-[10px] font-mono uppercase font-bold tracking-[0.3em] opacity-40 mb-2">Language</span>
               <div className="h-12 w-32 bg-smoke rounded-xl p-1 flex items-center relative group">
                  <div className={`absolute h-10 w-14 bg-white rounded-lg shadow-sm transition-all duration-500 ${lang === 'en' ? 'left-1' : 'left-[calc(100%-3.5rem-4px)]'}`} />
                  <button className={`flex-1 h-10 text-[10px] font-bold z-10 font-mono tracking-widest ${lang === 'en' ? 'text-forest-green' : 'text-charcoal/40'}`} onClick={() => setLang('en')}>EN</button>
                  <button className={`flex-1 h-10 text-[10px] font-bold z-10 font-mono tracking-widest ${lang === 'ar' ? 'text-forest-green' : 'text-charcoal/40'}`} onClick={() => setLang('ar')}>AR</button>
               </div>
            </div>
         </div>
      </div>

      {/* 📋 CONSENT CORE */}
      <div className="flex-1 flex items-center justify-center p-10 max-w-[1700px] mx-auto w-full">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            
            <div className="space-y-10">
               <div>
                  <Badge className="bg-warm-gold/20 text-warm-gold border-none text-[9px] uppercase font-mono tracking-[0.3em] px-4 py-1.5 mb-6 italic">Initial Intake Engine</Badge>
                  <h1 className="text-6xl lg:text-7xl font-display italic font-medium text-forest-green tracking-tight leading-[0.85] mb-8">
                     <BilingualText en="Initialize Scribe." ar="تهيئة الكاتب الآلي" lang={lang} />
                  </h1>
                  <p className="text-xl font-display text-charcoal/40 italic leading-relaxed max-w-lg mb-12">
                     <BilingualText 
                        en="Your consultation will be processed into a medical note using secure, clinical-grade RAG and LLM nodes." 
                        ar="تتم معالجة استشارتك لتحويلها إلى ملاحظة طبية ببيئة آمنة تماماً" 
                        lang={lang} 
                     />
                  </p>
               </div>

               <Card className="p-10 border border-forest-green/5 bg-smoke rounded-[3rem] space-y-8 relative overflow-hidden">
                  <div className="flex items-center gap-5">
                     <ShieldCheck className="h-10 w-10 text-forest-green" />
                     <h3 className="text-2xl font-display italic font-medium text-forest-green tracking-tight">Patient Consent Protocol</h3>
                  </div>
                  <div className={`h-40 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-forest-green/10 text-sm font-body text-charcoal/60 leading-relaxed italic border-y border-forest-green/5 py-6 ${lang === 'ar' ? 'font-arabic text-right' : ''}`}>
                     <BilingualText 
                        en="I authorize ScribeAI to record the audio of this consultation for the sole purpose of clinical documentation. No audio is stored after processing. PII is encrypted at source according to UAE Federal Law No. 2 of 2019." 
                        ar="أوافق على قيام ScribeAI بتسجيل الاستشارة بغرض التوثيق الطبي. لا يتم تخزين الصوت، ويتم تشفير البيانات الشخصية وفقاً للقانون الاتحادي رقم 2 لعام 2019." 
                        lang={lang} 
                     />
                  </div>
                  <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setConsent(!consent)}>
                     <div className={`h-10 w-10 border-2 rounded-2xl flex items-center justify-center transition-all ${consent ? 'bg-forest-green border-forest-green text-ivory' : 'bg-white border-forest-green/10 group-hover:bg-ivory'}`}>
                        <CheckCircle2 className="h-5 w-5" />
                     </div>
                     <span className="text-xs font-mono uppercase font-bold tracking-[0.2em] text-forest-green/40 group-hover:text-forest-green italic">Authorize Live Recording</span>
                  </div>
               </Card>
            </div>

            <div className="space-y-10 flex flex-col items-center">
               <div className="relative group">
                  <div className={`absolute inset-0 bg-forest-green/20 blur-[120px] rounded-full transition-opacity duration-1000 ${consent ? 'opacity-40 animate-pulse' : 'opacity-0'}`} />
                  <button 
                     className={`h-72 w-72 rounded-[6rem] flex flex-col items-center justify-center gap-6 relative z-10 transition-all duration-700 shadow-2xl ${consent ? 'bg-forest-green text-ivory scale-105 shadow-forest-green/40' : 'bg-smoke text-charcoal/20 cursor-not-allowed grayscale'}`}
                     disabled={!consent}
                     onClick={() => window.location.href = `/consultation/001/live`}
                   >
                     <Mic className={`h-20 w-20 transition-transform duration-700 ${consent ? 'animate-shimmer' : ''}`} />
                     <span className="text-sm font-display italic font-bold tracking-widest uppercase">Start Scribe</span>
                  </button>
               </div>
               
               {/* ADVICE */}
               <div className="flex items-center gap-6 text-[10px] font-mono text-charcoal/20 uppercase tracking-[0.4em] font-bold">
                  <span className="flex items-center gap-3"><Zap className="h-4 w-4" /> Real-time Node</span>
                  <span className="flex items-center gap-3"><Mic className="h-4 w-4" /> 128kbps Stereo</span>
               </div>
            </div>

         </div>
      </div>

    </div>
  );
}

function CheckCircle2({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
}
