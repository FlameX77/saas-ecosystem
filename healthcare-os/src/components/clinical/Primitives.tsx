'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { gsap } from 'gsap';
import { Check, ShieldCheck, AlertCircle, Volume2 } from 'lucide-react';

/**
 * 1. ClinicalButton - variants: primary, ghost, danger, approve
 */
export const ClinicalButton = ({ 
  children, 
  variant = 'primary', 
  className, 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' | 'approve' }) => {
  const base = "h-12 px-8 rounded-xl font-display italic text-lg transition-all active:scale-95 flex items-center gap-2";
  const variants = {
    primary: "bg-primary text-ivory hover:opacity-90 shadow-sm",
    ghost: "bg-transparent text-primary hover:bg-smoke border border-forest-green/10",
    danger: "bg-destructive text-ivory hover:bg-destructive/90",
    approve: "bg-sage text-ivory hover:bg-forest-green shadow-lg",
  };

  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
};

/**
 * 2. ClinicalBadge - consultation status badges
 */
export const ClinicalBadge = ({ status = 'recording' }: { status: string }) => {
  const styles = {
    recording: "bg-destructive/10 text-destructive border-destructive/20",
    processing: "bg-warm-gold/10 text-warm-gold border-warm-gold/20",
    approved: "bg-forest-green/10 text-forest-green border-forest-green/20",
    default: "bg-smoke text-primary border-black/5"
  };

  return (
    <span className={cn(
      "h-6 px-3 rounded-full border text-[10px] uppercase font-mono tracking-widest flex items-center",
      // @ts-ignore
      styles[status] || styles.default
    )}>
      {status}
    </span>
  );
};

/**
 * 3. SOAPSection - collapsible with confidence meter bar
 */
export const SOAPSection = ({ title, content, confidence }: { title: string, content: string, confidence: number }) => {
  return (
    <div className="border border-forest-green/10 rounded-2xl bg-ivory p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl italic">{title}</h3>
        <ConfidenceMeter value={confidence} />
      </div>
      <p className="text-sm font-mono text-charcoal/70 leading-relaxed font-body">
        {content}
      </p>
    </div>
  );
};

/**
 * 4. ConfidenceMeter - visual 0-100% bar
 */
export const ConfidenceMeter = ({ value = 0 }: { value: number }) => {
  const color = value > 0.8 ? 'bg-forest-green' : value > 0.6 ? 'bg-warm-gold' : 'bg-destructive';
  return (
    <div className="flex items-center gap-3">
      <div className="w-24 h-1.5 bg-smoke rounded-full overflow-hidden">
        <div className={cn("h-full transition-all duration-700", color)} style={{ width: `${value * 100}%` }} />
      </div>
      <span className="text-[10px] font-mono font-bold opacity-40 italic">{Math.round(value * 100)}%</span>
    </div>
  );
};

/**
 * 5. BilingualText - renders Arabic RTL or English LTR
 */
export const BilingualText = ({ en, ar, lang = 'en' }: { en: string, ar: string, lang?: 'en' | 'ar' }) => {
  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className={cn(
      lang === 'ar' ? 'font-arabic' : 'font-display',
      "leading-relaxed transition-all duration-300"
    )}>
      {lang === 'ar' ? ar : en}
    </div>
  );
};

/**
 * 6. WaveformVisualizer - canvas-based real-time audio waveform
 */
export const WaveformVisualizer = ({ isActive }: { isActive: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !isActive) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    let anim: number;
    const draw = () => {
       ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
       ctx.beginPath();
       ctx.strokeStyle = '#1B4332'; // forest-green
       ctx.lineWidth = 2;
       
       for (let i = 0; i < 100; i++) {
         const h = Math.sin(Date.now() * 0.005 + i * 0.1) * 20 * Math.random();
         ctx.moveTo(i * 10, 50 - h);
         ctx.lineTo(i * 10, 50 + h);
       }
       ctx.stroke();
       anim = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(anim);
  }, [isActive]);

  return <canvas ref={canvasRef} width={1000} height={100} className="w-full h-12 opacity-40" />;
};

/**
 * 7. ApprovalGate - blocks content until doctor_approved=true
 */
export const ApprovalGate = ({ isApproved, children }: { isApproved: boolean, children: React.ReactNode }) => {
  if (isApproved) return <>{children}</>;

  return (
    <div className="p-12 border-2 border-dashed border-forest-green/10 rounded-[3rem] bg-smoke flex flex-col items-center justify-center text-center opacity-70 cursor-not-allowed">
       <ShieldCheck className="h-12 w-12 text-warm-gold mb-4 opacity-50" />
       <h4 className="text-2xl font-display italic">Approval Pending</h4>
       <p className="text-sm font-mono opacity-50 max-w-xs mx-auto mt-2 italic">This area is locked until clinical sign-off is completed.</p>
    </div>
  );
};
