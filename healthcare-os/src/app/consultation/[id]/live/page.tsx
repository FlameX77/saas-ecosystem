'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { gsap } from 'gsap';
import { 
  Activity, 
  Mic, 
  CheckCircle2, 
  Flag, 
  ChevronRight, 
  Info,
  Clock,
  Layers,
  ShieldCheck,
  Zap,
  Volume2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { WaveformVisualizer, ConfidenceMeter, SOAPSection, ClinicalButton } from '@/components/clinical/Primitives';

// --- 🎧 LIVE SCRIBE VISUALIZER ---

const SIMULATED_PHRASES = [
  "Patient. complains. of. consistent. lower. back. pain.",
  "Pain. started. 3. weeks. ago. after. lifting. a. heavy. box.",
  "Radiating. down. the. left. leg. but. no. numbness.",
  "Physical. examination. shows. limited. range. of. motion.",
  "Prescribing. Ibuprofen. 400mg. twice. daily. with. rest."
];

export default function LiveScribePage({ params }: { params: { id: string } }) {
  const [words, setWords] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(true);
  const [activeNoteSection, setActiveNoteSection] = useState('subjective');
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // --- 🪄 WORD TICKER (GSAP Ticker ≤800ms lag) ---
  useEffect(() => {
    let currentPhraseIdx = 0;
    let currentWordIdx = 0;
    
    const interval = setInterval(() => {
      const phrase = SIMULATED_PHRASES[currentPhraseIdx];
      const phraseWords = phrase.split(' ');

      if (currentWordIdx < phraseWords.length) {
        setWords(prev => [...prev, phraseWords[currentWordIdx]]);
        currentWordIdx++;
      } else {
        currentPhraseIdx++;
        currentWordIdx = 0;
        if (currentPhraseIdx >= SIMULATED_PHRASES.length) {
          clearInterval(interval);
          setIsRecording(false);
        }
      }
    }, 400); // 400ms per word = high pace real-time

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    gsap.fromTo(
      '.word-reveal:last-child',
      { opacity: 0, y: 5, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'back.out(2)' }
    );
  }, [words]);

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-ivory overflow-hidden p-8 gap-8 font-body">
      
      {/* 🎙️ LEFT PANEL: LIVE TRANSCRIPT (65%) */}
      <div className="flex-1 flex flex-col gap-8">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-6">
            <h1 className="text-4xl italic font-display font-medium text-forest-green tracking-tight">Consultation Stream</h1>
            <div className="flex items-center gap-3 h-10 px-6 rounded-full border border-forest-green/10 bg-ivory shadow-sm">
                <div className={`h-2.5 w-2.5 rounded-full ${isRecording ? 'bg-destructive animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-forest-green'}`} />
                <span className="text-[10px] font-mono font-bold text-forest-green uppercase tracking-[0.2em] italic">
                   {isRecording ? 'Whisper v3 Active' : 'Scribe Finalized'}
                </span>
            </div>
          </div>
          <div className="flex gap-3">
             <ClinicalButton variant="ghost" className="h-10 px-6 rounded-2xl text-sm italic">
                <Flag className="h-4 w-4" /> FLAG MOMENT
             </ClinicalButton>
             <ClinicalButton variant="ghost" className="h-10 px-6 rounded-2xl text-sm italic">
                <Zap className="h-4 w-4" /> CDS SEARCH
             </ClinicalButton>
          </div>
        </div>

        {/* WAVEFORM ENGINE */}
        <div className="h-24 bg-smoke border border-forest-green/5 rounded-[2.5rem] relative overflow-hidden flex items-center justify-center group shadow-inner">
           <div className="absolute inset-x-0 bottom-0 top-0 opacity-40">
              <WaveformVisualizer isActive={isRecording} />
           </div>
           <Badge className="relative z-10 bg-ivory/80 backdrop-blur-md text-forest-green border-forest-green/10 text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-full font-mono font-bold italic">
              Acoustic Integrity: 98.4%
           </Badge>
        </div>

        {/* TRANSCRIPT FLOW - GSAP TICKER */}
        <div className="flex-1 bg-white border border-forest-green/5 rounded-[3rem] p-12 overflow-y-auto shadow-2xl shadow-forest-green/5 relative">
           <div className="max-w-3xl mx-auto flex flex-wrap gap-x-2 gap-y-4">
              {words.map((word, idx) => (
                <span key={idx} className="word-reveal text-2xl font-display font-medium text-forest-green italic tracking-tight opacity-90">
                  {word}
                </span>
              ))}
              {isRecording && <span className="h-8 w-1 bg-forest-green ml-1 animate-shimmer" />}
              <div ref={transcriptEndRef} className="w-full h-20" />
           </div>
           <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        </div>
      </div>

      {/* 📋 RIGHT PANEL: SOAP ASSEMBLY (35%) */}
      <div className="w-full lg:w-[480px] flex flex-col gap-8">
        <div className="flex items-center justify-between border-b border-forest-green/5 pb-6 px-4">
           <div className="flex items-center gap-4">
             <Layers className="h-6 w-6 text-warm-gold" />
             <h2 className="text-2xl italic font-display font-medium text-forest-green">SOAP Evolution</h2>
           </div>
           <Badge className="bg-forest-green/5 text-forest-green border-none text-[9px] uppercase font-mono px-3 py-1 font-bold">GPT-4o Structuring</Badge>
        </div>

        <div className="flex-1 overflow-y-auto space-y-5 px-2 pr-4 custom-scrollbar">
           {[
             { title: 'Subjective', content: 'Patient reports persistent lower back pain for 3 weeks after heavy lifting. No neurological deficits.', conf: 0.94 },
             { title: 'Objective', content: 'Limited lumbar flexion to 40 degrees. Palpable spasm in paraspinal muscles. Reflexes intact.', conf: 0.88 },
             { title: 'Assessment', content: 'Acute Mechanical Low Back Pain. Rule out Disc Herniation.', conf: 0.72 },
             { title: 'Plan', content: 'Ibuprofen 400mg tid x 5 days. Physical therapy evaluation. Return if weakness develops.', conf: 0 }
           ].map((section, idx) => (
             <div key={section.title} className={idx < words.length / 5 ? 'opacity-100 scale-100 translate-y-0 transition-all duration-700' : 'opacity-30 scale-95 translate-y-4 grayscale transition-all'}>
               <SOAPSection title={section.title} content={section.content} confidence={idx < words.length / 5 ? section.conf : 0} />
             </div>
           ))}
           
           {/* CDS SUGGESTION (Flywheel interaction) */}
           {words.length > 20 && (
             <Card className="p-8 border border-warm-gold/20 bg-warm-gold/5 rounded-[2.5rem] border-dashed animate-reveal">
                <div className="flex items-center gap-3 mb-4">
                   <ShieldCheck className="h-6 w-6 text-warm-gold" />
                   <h4 className="text-lg italic font-display font-medium text-forest-green">Clinical Advice (CDS)</h4>
                </div>
                <p className="text-sm font-body text-forest-green/70 italic leading-relaxed">
                   Based on "heavy lifting", consider screening for Cauda Equina symptoms if pain persists.
                </p>
             </Card>
           )}
        </div>

        {/* ACTIONS */}
        <div className="p-8 bg-forest-green rounded-[3rem] text-ivory shadow-2xl relative overflow-hidden group">
           <div className="relative z-10 flex flex-col gap-6">
              <div className="flex justify-between items-start">
                 <div>
                    <h4 className="text-2xl font-display italic font-medium leading-[0.9]">Sign-off <br/> Consult</h4>
                    <p className="text-[10px] font-mono uppercase tracking-widest mt-4 opacity-50">Global Accuracy: 96.2%</p>
                 </div>
                 <div className="h-12 w-12 rounded-2xl bg-ivory/10 flex items-center justify-center text-warm-gold">
                    <CheckCircle2 className="h-6 w-6" />
                 </div>
              </div>
              <ClinicalButton 
                variant="approve" 
                className="w-full h-18 bg-ivory text-forest-green hover:bg-warm-gold hover:text-forest-green text-xl font-bold rounded-2xl shadow-xl italic"
                disabled={isRecording}
                onClick={() => window.location.href = `/consultation/${params.id}/review`}
              >
                 {isRecording ? <Zap className="h-5 w-5 animate-spin" /> : 'GENERATE STRUCTURED REPORT'}
              </ClinicalButton>
           </div>
           <div className="absolute -top-10 -right-10 h-32 w-32 bg-warm-gold/10 blur-[60px] rounded-full" />
        </div>
      </div>
    </div>
  );
}
