'use client';

import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { 
  ChevronLeft, 
  Download, 
  Share, 
  CheckCircle2, 
  MessageCircle, 
  Calendar,
  Clock,
  ShieldCheck,
  Stethoscope,
  MapPin,
  ClipboardCheck,
  Zap,
  Star,
  ArrowUpRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ClinicalButton, BilingualText, ApprovalGate } from '@/components/clinical/Primitives';

export default function PatientDocsPage({ params }: { params: { id: string } }) {
  const [lang, setLang] = useState<'en' | 'ar'>('en');

  return (
    <div className="min-h-screen bg-ivory p-8 font-body">
      
      {/* 🏙️ HEADER STRIP */}
      <div className="max-w-[1200px] mx-auto flex items-center justify-between border-b border-forest-green/5 pb-12 mb-16">
        <div className="flex items-center gap-8">
           <button onClick={() => window.history.back()} className="h-16 w-16 bg-white border border-forest-green/5 rounded-3xl flex items-center justify-center hover:bg-forest-green hover:text-ivory transition-all group">
             <ChevronLeft className="h-6 w-6 group-hover:-translate-x-1" />
           </button>
           <div>
             <h1 className="text-5xl italic font-display font-medium text-forest-green tracking-tight">Health Summary</h1>
             <p className="text-sm font-mono text-charcoal/20 uppercase font-bold tracking-[0.3em] mt-2 font-bold tracking-tight">Patient Node: {params.id}</p>
           </div>
        </div>
        <div className="flex items-center gap-6">
           <div className="h-12 w-32 bg-smoke rounded-xl p-1 flex items-center relative group shadow-inner">
               <div className={`absolute h-10 w-14 bg-white rounded-lg shadow-sm transition-all duration-500 ${lang === 'en' ? 'left-1' : 'left-[calc(100%-3.5rem-4px)]'}`} />
               <button className={`flex-1 h-10 text-[10px] font-bold z-10 font-mono tracking-widest ${lang === 'en' ? 'text-forest-green' : 'text-charcoal/40'}`} onClick={() => setLang('en')}>EN</button>
               <button className={`flex-1 h-10 text-[10px] font-bold z-10 font-mono tracking-widest ${lang === 'ar' ? 'text-forest-green' : 'text-charcoal/40'}`} onClick={() => setLang('ar')}>AR</button>
           </div>
           <button className="h-16 w-16 bg-forest-green text-ivory rounded-3xl flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all">
             <Download className="h-6 w-6" />
           </button>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-20">
         
         {/* 📋 DISCHARGE CORE: Grade 6 Literacy (8 cols) */}
         <div className="lg:col-span-8 space-y-12">
            
            <Card className="p-16 border border-forest-green/5 bg-white rounded-[4rem] shadow-2xl shadow-forest-green/5 relative overflow-hidden">
               <div className="relative z-10 space-y-12">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-5">
                       <div className="h-14 w-14 bg-forest-green/5 rounded-2xl flex items-center justify-center text-forest-green">
                          <ClipboardCheck className="h-7 w-7" />
                       </div>
                       <h2 className="text-4xl italic font-display font-medium text-forest-green">Care Plan Summary</h2>
                     </div>
                     <Badge className="bg-forest-green/5 text-forest-green border-none text-[9px] uppercase font-mono px-4 py-1.5 font-bold tracking-widest italic">Clinical-to-Plain Node Active</Badge>
                  </div>

                  <div className={`space-y-12 ${lang === 'ar' ? 'font-arabic text-right' : 'font-display italic text-2xl leading-[1.3] text-forest-green/80'}`}>
                     <div className="space-y-4">
                        <BilingualText 
                           en="You have some back pain from lifting something heavy. It's not serious, but you need to rest." 
                           ar="لديك آلام في الظهر نتيجة رفع شيء ثقيل. هي ليست مشكلة خطيرة، لكنك تحتاج للراحة." 
                           lang={lang} 
                        />
                     </div>
                     <div className="p-10 bg-smoke rounded-[2.5rem] border border-forest-green/5">
                        <h4 className="text-[10px] font-mono text-charcoal/30 uppercase font-bold tracking-[0.2em] mb-6 italic">Next Steps</h4>
                        <ul className="space-y-5 text-lg font-body italic text-forest-green/70">
                           <li className="flex items-start gap-4">
                              <Star className="h-5 w-5 text-warm-gold mt-1 shrink-0" />
                              <BilingualText en="Take 1 tablet (Ibuprofen) 3 times a day for 5 days." ar="تناول حبة واحدة 3 مرات يومياً لمدة 5 أيام." lang={lang} />
                           </li>
                           <li className="flex items-start gap-4">
                              <Star className="h-5 w-5 text-warm-gold mt-1 shrink-0" />
                              <BilingualText en="Rest your back. Do not lift heavy objects for 1 week." ar="أرح ظهرك. لا ترفع أشياء ثقيلة لمدة أسبوع." lang={lang} />
                           </li>
                           <li className="flex items-start gap-4">
                              <Star className="h-5 w-5 text-warm-gold mt-1 shrink-0" />
                              <BilingualText en="We have booked a Physiotherapy visit for you next Tuesday." ar="حجزنا لك موعداً للعلاج الطبيعي الثلاثاء القادم." lang={lang} />
                           </li>
                        </ul>
                     </div>
                  </div>

                  <div className="flex items-center justify-between pt-12 border-t border-forest-green/5">
                     <div className="flex items-center gap-5">
                        <div className="h-16 w-16 bg-smoke rounded-full border border-forest-green/10 flex flex-col items-center justify-center font-mono text-[9px]">
                           <span className="opacity-40">DR</span>
                           <span className="font-bold text-forest-green">SAM</span>
                        </div>
                        <div>
                           <p className="text-xl font-display italic font-medium text-forest-green">Dr. Sameer Al-Fayed</p>
                           <p className="text-[9px] font-mono text-charcoal/30 uppercase font-bold tracking-widest tracking-tight">Digitally Signed: DHA-MB-2024</p>
                        </div>
                     </div>
                     <ShieldCheck className="h-10 w-10 text-warm-gold opacity-30" />
                  </div>
               </div>
               {/* FLYWHEEL LOGO WATERMARK */}
               <div className="absolute -bottom-20 -right-20 h-64 w-64 bg-forest-green/5 blur-[100px] rounded-full" />
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <Card className="p-10 border border-forest-green/5 bg-smoke rounded-[3rem] hover:bg-white hover:shadow-2xl hover:shadow-forest-green/5 transition-all cursor-pointer group">
                  <div className="flex items-center justify-between mb-8">
                    <Calendar className="h-8 w-8 text-forest-green/40 group-hover:text-forest-green" />
                    <ArrowUpRight className="h-5 w-5 text-forest-green/20" />
                  </div>
                  <h4 className="text-2xl italic font-display font-medium text-forest-green leading-tight">View <br/> Appointments</h4>
               </Card>
               <Card className="p-10 border border-forest-green/5 bg-smoke rounded-[3rem] hover:bg-white hover:shadow-2xl hover:shadow-forest-green/5 transition-all cursor-pointer group">
                  <div className="flex items-center justify-between mb-8">
                    <MessageCircle className="h-8 w-8 text-forest-green/40 group-hover:text-forest-green" />
                    <ArrowUpRight className="h-5 w-5 text-forest-green/20" />
                  </div>
                  <h4 className="text-2xl italic font-display font-medium text-forest-green leading-tight">Text Your <br/> Care Team</h4>
               </Card>
            </div>

         </div>

         {/* 📱 WHATSAPP REMINDERS & STATUS (4 cols) */}
         <div className="lg:col-span-4 space-y-12">
            
            <div className="space-y-6">
               <div className="flex items-center gap-4 border-b border-forest-green/5 pb-6">
                  <MessageCircle className="h-6 w-6 text-warm-gold" />
                  <h2 className="text-2xl italic font-display font-medium text-forest-green">Comms Node</h2>
               </div>
               <div className="p-8 bg-forest-green text-ivory rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
                  <div className="relative z-10 flex flex-col gap-8">
                     <div className="flex items-center justify-between">
                        <Zap className="h-6 w-6 text-warm-gold animate-pulse" />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-40">Live Status</span>
                     </div>
                     <h3 className="text-3xl font-display italic font-medium leading-[0.9]">WhatsApp Dispatched.</h3>
                     <div className="h-1 bg-ivory/10 rounded-full overflow-hidden">
                        <div className="h-full bg-warm-gold animate-shimmer" />
                     </div>
                     <p className="text-[10px] font-mono text-charcoal/30 uppercase opacity-60 italic mt-2">Delivered to Node: +971 52 ...</p>
                  </div>
                  <div className="absolute -bottom-10 -right-10 h-40 w-40 bg-warm-gold/5 blur-[80px] rounded-full" />
               </div>
            </div>

            <div className="space-y-6">
               <h4 className="text-[10px] font-mono text-charcoal/30 uppercase font-bold tracking-widest px-2">LOG ENTRIES</h4>
               {[
                 { action: 'Summary Sent', t: '2m ago', icon: CheckCircle2 },
                 { action: 'Prescription Sync', t: '12m ago', icon: ShieldCheck },
                 { action: 'Signed by Doctor', t: '1h ago', icon: Stethoscope }
               ].map((log, idx) => (
                 <div key={idx} className="flex items-center gap-6 p-6 bg-smoke border border-forest-green/5 rounded-[2rem]">
                    <div className="h-10 w-10 bg-ivory rounded-xl flex items-center justify-center text-forest-green/20">
                       <log.icon className="h-5 w-5" />
                    </div>
                    <div>
                       <p className="text-lg font-display italic font-medium text-forest-green/60 leading-tight">{log.action}</p>
                       <p className="text-[9px] font-mono text-charcoal/20 uppercase font-bold tracking-widest">{log.t}</p>
                    </div>
                 </div>
               ))}
            </div>

            <div className="p-10 border-2 border-dashed border-forest-green/10 rounded-[3rem] bg-white text-center opacity-60">
               <MapPin className="h-10 w-10 text-warm-gold mx-auto mb-4" />
               <p className="text-[11px] font-body text-charcoal/60 leading-relaxed italic uppercase tracking-widest font-bold">
                  MedCare Jumeirah Node <br/> DHA Licensed: 784-993-1
               </p>
            </div>

         </div>

      </div>

    </div>
  );
}
