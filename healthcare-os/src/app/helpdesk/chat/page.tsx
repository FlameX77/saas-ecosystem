'use client';

import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { 
  Send, 
  ChevronLeft, 
  Zap, 
  Search, 
  Globe, 
  Layers, 
  Clock, 
  CheckCircle2, 
  MessageSquare,
  Sparkles,
  Database,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ClinicalButton, BilingualText, ConfidenceMeter } from '@/components/clinical/Primitives';

export default function HelpDocChat() {
  const [messages, setMessages] = useState([
    { id: '1', role: 'ai', content: 'Peace be upon you. How may I assist your clinic documentation session?', ar: 'السلام عليكم. كيف يمكنني مساعدتك في وثائق العيادة؟' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    gsap.from('.message-reveal:last-child', { opacity: 0, y: 10, duration: 0.5 });
  }, [messages]);

  const handleSend = () => {
    if (!input) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: input, ar: '' }]);
    setInput('');
    setIsTyping(true);

    // Simulated RAG Synthesis lag
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'ai', 
        content: 'Based on our Cardiology Protocols (DHA-BM-2024), Hypertension screenings for males over 40 must include an ECG at baseline.',
        ar: 'بناءً على بروتوكولات القلب لدينا، يجب أن تتضمن فحوصات ضغط الدم للرجال فوق سن 40 تخطيط القلب الأساسي.'
      }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="h-screen bg-ivory flex flex-col font-body">
      
      {/* 🏙️ HEADER STRIP */}
      <div className="p-8 pb-4 flex items-center justify-between border-b border-forest-green/5 max-w-[1700px] mx-auto w-full">
         <div className="flex items-center gap-6">
            <button onClick={() => window.history.back()} className="h-16 w-16 bg-white border border-forest-green/5 rounded-[2rem] flex items-center justify-center hover:bg-forest-green hover:text-ivory transition-all group">
               <ChevronLeft className="h-6 w-6 group-hover:-translate-x-1" />
            </button>
            <div>
               <h1 className="text-3xl italic font-display font-medium text-forest-green tracking-tight">Staff AI Chat</h1>
               <div className="flex items-center gap-3 mt-2">
                  <div className="h-2 w-2 rounded-full bg-forest-green animate-pulse shadow-[0_0_10px_rgba(27,67,50,0.5)]" />
                  <span className="text-[10px] font-mono font-bold text-forest-green uppercase tracking-widest italic opacity-40">Connected to ScribeAI RAG Node</span>
               </div>
            </div>
         </div>
         <div className="flex items-center gap-6">
            <div className="h-12 w-32 bg-smoke rounded-xl p-1 flex items-center relative group shadow-inner">
               <div className={`absolute h-10 w-14 bg-white rounded-lg shadow-sm transition-all duration-500 ${lang === 'en' ? 'left-1' : 'left-[calc(100%-3.5rem-4px)]'}`} />
               <button className={`flex-1 h-10 text-[10px] font-bold z-10 font-mono tracking-widest ${lang === 'en' ? 'text-forest-green' : 'text-charcoal/40'}`} onClick={() => setLang('en')}>EN</button>
               <button className={`flex-1 h-10 text-[10px] font-bold z-10 font-mono tracking-widest ${lang === 'ar' ? 'text-forest-green' : 'text-charcoal/40'}`} onClick={() => setLang('ar')}>AR</button>
            </div>
         </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row max-w-[1700px] mx-auto w-full overflow-hidden p-8 gap-8">
         
         {/* 💬 CHAT STREAM (8 cols) */}
         <div className="flex-1 flex flex-col bg-white border border-forest-green/5 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
            
            <div className="flex-1 p-12 overflow-y-auto space-y-12">
               {messages.map((m) => (
                 <div key={m.id} className={`message-reveal flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} gap-4`}>
                    <div className={`max-w-2xl p-8 rounded-[2.5rem] text-lg leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-forest-green text-ivory rounded-tr-none' : 'bg-smoke text-forest-green/80 rounded-tl-none font-display italic italic'}`}>
                       <BilingualText en={m.content} ar={m.ar} lang={lang} />
                       {m.role === 'ai' && (
                         <div className="mt-8 pt-6 border-t border-forest-green/5 flex items-center justify-between">
                            <Badge className="bg-forest-green/5 text-forest-green border-none text-[8px] uppercase font-mono px-3 py-1 font-bold">Source: Cardiology (v2.4)</Badge>
                            <ArrowUpRight className="h-4 w-4 text-warm-gold opacity-40" />
                         </div>
                       )}
                    </div>
                 </div>
               ))}
               {isTyping && (
                 <div className="flex items-center gap-3 p-8 bg-smoke rounded-[2rem] w-32 justify-center animate-pulse">
                    <div className="h-1.5 w-1.5 rounded-full bg-forest-green/20 animate-bounce" />
                    <div className="h-1.5 w-1.5 rounded-full bg-forest-green/40 animate-bounce delay-100" />
                    <div className="h-1.5 w-1.5 rounded-full bg-forest-green/60 animate-bounce delay-200" />
                 </div>
               )}
               <div ref={scrollRef} />
            </div>

            {/* INPUT UNIT */}
            <div className="p-8 border-t border-forest-green/5 bg-smoke relative group">
               <div className="relative w-full max-w-4xl mx-auto flex items-center gap-4">
                  <div className="relative flex-1">
                     <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-forest-green/20" />
                     <input 
                        className="w-full h-20 pl-16 pr-10 bg-white border border-forest-green/5 rounded-[2rem] shadow-xl text-lg font-display italic text-forest-green tracking-tight placeholder:opacity-20 focus:outline-none focus:ring-1 focus:ring-forest-green/20 transition-all font-body"
                        placeholder="Query the clinic flywheel..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                     />
                  </div>
                  <button onClick={handleSend} className="h-20 w-20 bg-forest-green text-ivory rounded-[1.5rem] flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all group-hover:rotate-3 shadow-forest-green/20">
                     <Send className="h-6 w-6" />
                  </button>
               </div>
            </div>

         </div>

         {/* 📚 CITATION ENGINE & KB SYNC (4 cols) */}
         <div className="w-full lg:w-[450px] space-y-10">
            <div className="flex items-center justify-between border-b border-forest-green/5 pb-6">
               <div className="flex items-center gap-4">
                 <Layers className="h-6 w-6 text-warm-gold" />
                 <h2 className="text-2xl italic font-display font-medium text-forest-green tracking-tight">Active Context</h2>
               </div>
            </div>

            <Card className="p-10 border-none bg-forest-green text-ivory rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
               <div className="relative z-10 flex flex-col gap-6">
                  <div className="flex items-center gap-3">
                     <Database className="h-6 w-6 text-warm-gold" />
                     <span className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-40">Knowledge Flynnwheel Node</span>
                  </div>
                  <h3 className="text-3xl font-display italic font-medium leading-[0.9]">Hybrid Search <br/> MMR ACTIVE.</h3>
                  <div className="h-1 bg-ivory/10 rounded-full overflow-hidden mt-6">
                     <div className="h-full bg-warm-gold w-4/5 animate-shimmer" />
                  </div>
                  <p className="text-[10px] font-mono text-charcoal/30 uppercase opacity-60 italic mt-2">Relevance Multiplier: 2.4x</p>
               </div>
               <div className="absolute -bottom-20 -right-20 h-60 w-60 bg-warm-gold/5 blur-[80px] rounded-full" />
            </Card>

            <div className="space-y-5">
               <h4 className="text-[10px] font-mono text-charcoal/30 uppercase font-bold tracking-widest px-2">CITED ARTICLES</h4>
               {[
                 { title: 'Hypertension Management (DHA)', lang: 'EN/AR', views: 1240 },
                 { title: 'Baseline ECG Protocol', lang: 'EN', views: 842 }
               ].map((cite) => (
                 <div key={cite.title} className="p-6 bg-smoke border border-forest-green/5 rounded-[2rem] hover:bg-white transition-all cursor-pointer group">
                    <div className="flex items-center justify-between mb-4">
                       <Badge className="bg-forest-green/5 text-forest-green border-none uppercase text-[8px] font-bold tracking-widest px-3 py-1 font-mono">{cite.lang}</Badge>
                       <Clock className="h-4 w-4 text-forest-green/20" />
                    </div>
                    <h5 className="text-xl font-display italic font-medium text-forest-green group-hover:text-warm-gold transition-colors leading-[0.9]">{cite.title}</h5>
                    <div className="flex items-center gap-3 mt-4 opacity-40 text-[9px] font-mono uppercase font-bold tracking-widest">
                       <MessageSquare className="h-3 w-3" /> {cite.views} Citations
                    </div>
                 </div>
               ))}
            </div>

            <div className="p-8 border-2 border-dashed border-forest-green/10 rounded-[3rem] bg-white text-center opacity-60">
               <ShieldCheck className="h-10 w-10 text-warm-gold mx-auto mb-4" />
               <p className="text-[11px] font-body text-charcoal/60 leading-relaxed italic uppercase tracking-widest font-bold">
                  All RAG queries are <br/> logged for clinical audit.
               </p>
            </div>
         </div>

      </div>

    </div>
  );
}
