'use client';

import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Text, ContactShadows, Environment, MeshWobbleMaterial, Sparkles, PresentationControls, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, ChevronRight, Check, ShieldCheck, Zap, Waves, ZapIcon } from 'lucide-react';
import { createClient } from "@/lib/supabase/client";

// --- 🌐 3D COMPONENTS (Crystalline Physics-lite) ---

function RecoverySphere({ position, color, delay }: { position: [number, number, number], color: string, delay: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime() + delay;
      meshRef.current.position.y = position[1] + Math.sin(t * 0.5) * 0.2;
      meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.1;
      meshRef.current.rotation.z = Math.cos(t * 0.2) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[0.5, 64, 64]} />
        <MeshDistortMaterial 
          color={color} 
          speed={2} 
          distort={0.4} 
          radius={1} 
          metalness={1} 
          roughness={0.1}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </mesh>
    </Float>
  );
}

function ClinicalGrid() {
  const { viewport } = useThree();
  return (
    <gridHelper args={[20, 20, '#00D4AA', '#1A1F2E']} rotation={[Math.PI / 2.5, 0, 0]} position={[0, -2, -2]} />
  );
}

// --- 🏠 ONBOARDING PAGE ---

const FORM_STEPS = [
  { id: 1, title: 'Clinic Identity', description: 'Authenticate your DHA/HAAD clinical credentials.' },
  { id: 2, title: 'Insurance Matrix', description: 'Define your revenue capture targets.' },
  { id: 3, title: 'HIS Integration', description: 'Initialize secure FHIR/HL7 link.' },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(
      '.onboarding-content',
      { opacity: 0, x: 20 },
      { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out', stagger: 0.1 }
    );
  }, [step]);

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", user.id);
      }
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row overflow-hidden font-body">
      
      {/* 🚀 LEFT: IMMERSIVE 3D BRANDING */}
      <section className="relative w-full lg:w-3/5 h-[45vh] lg:h-screen bg-[#0A0F1C] overflow-hidden group">
        <div className="absolute inset-0 z-0 hero-canvas">
          <Canvas camera={{ position: [0, 0, 8], fov: 40 }}>
            <Suspense fallback={null}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={1} color="#00D4AA" />
              <pointLight position={[-10, -10, -10]} intensity={0.5} color="#F59E0B" />
              
              <PresentationControls global rotation={[0, 0, 0]} polar={[-0.4, 0.4]} azimuth={[-0.4, 0.4]}>
                <group position={[0, 0, 0]}>
                   <RecoverySphere position={[-2, 1, 0]} color="#00D4AA" delay={0} />
                   <RecoverySphere position={[2, -1, 1]} color="#F59E0B" delay={2} />
                   <RecoverySphere position={[0, 2, -2]} color="#00D4AA" delay={4} />
                </group>
              </PresentationControls>

              <ClinicalGrid />
              <Sparkles count={80} scale={15} size={2} color="#00D4AA" />
              <Environment preset="night" />
              <ContactShadows position={[0, -3, 0]} opacity={0.4} scale={20} blur={2.5} far={4.5} />
            </Suspense>
          </Canvas>
        </div>
        
        <div className="absolute top-12 left-12 z-10 flex items-center gap-4">
          <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center shadow-[0_0_30px_-5px_rgba(0,212,170,0.5)]">
            <Waves className="h-6 w-6 text-background" />
          </div>
          <h1 className="text-2xl font-display font-medium text-white italic tracking-widest">NOVU</h1>
        </div>

        <div className="absolute bottom-16 left-16 right-16 z-10 lg:max-w-2xl">
          <Badge className="bg-primary/20 text-primary border-none text-[10px] uppercase font-mono tracking-[.3em] font-bold px-4 py-1.5 mb-8 italic">
             Revenue Intelligence Deployment
          </Badge>
          <h2 className="text-5xl lg:text-8xl font-display font-medium text-white leading-[0.85] lg:leading-[0.85] italic tracking-tighter mb-8">
            RECOVER THE <br/> <span className="text-primary">UNSENT.</span>
          </h2>
          <p className="text-lg font-display text-slate-400 leading-relaxed italic max-w-lg opacity-80">
            UAE private clinics lose AED 2.4 Billion annually to unoptimized cycles. Novu reaches into the pipeline and pulls it back.
          </p>
        </div>
      </section>

      {/* 📝 RIGHT: SETUP FLOW */}
      <section className="flex-1 flex flex-col justify-center items-center p-10 lg:p-32 bg-background relative z-10 border-l border-border/50">
        <div ref={formRef} className="max-w-md w-full">
          
          <div className="flex items-center gap-4 mb-16">
            {FORM_STEPS.map((s) => (
              <div 
                key={s.id} 
                className={`flex-1 h-1.5 rounded-full transition-all duration-700 ${s.id <= step ? 'bg-primary shadow-[0_0_10px_rgba(0,212,170,0.5)]' : 'bg-card'}`}
              />
            ))}
          </div>

          <div className="onboarding-content space-y-3 mb-16">
            <h3 className="text-4xl font-display italic font-medium text-white tracking-tight">{FORM_STEPS[step - 1].title}</h3>
            <p className="text-sm text-muted-foreground font-body italic opacity-60 leading-relaxed">{FORM_STEPS[step - 1].description}</p>
          </div>

          <div className="onboarding-content space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground ml-2 opacity-50">Clinic Name</p>
                  <input className="w-full h-16 bg-card/40 border border-border/50 rounded-2xl px-6 text-white text-lg font-display italic focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all font-body" placeholder="Emirates Health Group" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground ml-2 opacity-50">DHA Provider ID</p>
                  <input className="w-full h-16 bg-card/40 border border-border/50 rounded-2xl px-6 font-mono text-white text-lg tracking-widest focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all" placeholder="784-DHA-993-1" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-1 gap-3">
                {['Daman Insurance Corp', 'ADNIC Health', 'AXA Gulf / GIG', 'Neuron Health Services'].map((ins) => (
                  <button key={ins} className="flex items-center justify-between px-6 py-6 rounded-2xl bg-card/40 border border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all group">
                    <span className="text-sm font-display italic font-medium text-slate-300 group-hover:text-white transition-colors">{ins}</span>
                    <div className="h-6 w-6 rounded-xl border border-white/10 group-hover:bg-primary text-background flex items-center justify-center transition-all group-hover:scale-110">
                      <Check className="h-4 w-4" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="p-8 bg-primary/5 border border-primary/20 rounded-[2.5rem] flex flex-col items-center justify-center text-center py-16">
                 <ShieldCheck className="h-16 w-16 text-primary mb-8" />
                 <h4 className="text-2xl font-display italic font-medium text-white mb-4">Encryption Ready</h4>
                 <p className="text-sm font-body text-slate-400 italic leading-relaxed">
                   Novu uses end-to-end AES-256 for all PII/PHI data. Your DHPO/HAAD claim data will be securely synced via FHIR nodes.
                 </p>
              </div>
            )}

            <div className="pt-16 flex gap-4">
              {step > 1 && (
                <Button 
                  variant="ghost" 
                  onClick={() => setStep(step - 1)}
                  className="h-16 flex-1 font-bold text-muted-foreground italic tracking-tight hover:text-white"
                >
                  PREVIOUS
                </Button>
              )}
              <Button 
                onClick={handleNext}
                disabled={loading}
                className="h-20 flex-[2] bg-primary text-background font-bold tracking-tight text-xl italic rounded-[1.5rem] transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_40px_-5px_rgba(0,212,170,0.5)] group"
              >
                {loading ? <Zap className="h-6 w-6 animate-spin" /> : (
                  <>
                    {step === 3 ? 'FINALIZE ENGINE' : 'CONTINUE DEPLOY'}
                    <ChevronRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Footer info */}
        <div className="absolute bottom-12 flex items-center gap-8 text-[10px] font-mono text-muted-foreground/30 uppercase tracking-[0.2em] font-bold">
           <span>UAE DHA 2026 Compliant</span>
           <span>AES-256 Encrypted</span>
           <span className="flex items-center gap-2 text-primary opacity-60"><ShieldCheck className="h-4 w-4" /> Secure Hub</span>
        </div>
      </section>
    </div>
  );
}
