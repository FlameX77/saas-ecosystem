'use client';

import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, ContactShadows, PresentationControls, Sparkles, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, ChevronRight, Check, ShieldCheck, Zap, Waves, Stethoscope, Microscope } from 'lucide-react';

// --- 🌐 3D COMPONENTS (Anatomical Waveforms) ---

function SoundNode({ position, color, delay }: { position: [number, number, number], color: string, delay: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime() + delay;
      meshRef.current.position.y = position[1] + Math.sin(t * 1.5) * 0.1;
      meshRef.current.scale.setScalar(1 + Math.sin(t * 3) * 0.05);
    }
  });

  return (
    <Float speed={5} rotationIntensity={2} floatIntensity={2}>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[0.6, 64, 64]} />
        <MeshDistortMaterial 
          color={color} 
          speed={3} 
          distort={0.45} 
          radius={1} 
          metalness={1} 
          roughness={0.1}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </mesh>
    </Float>
  );
}

function ClinicalEnvironment() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#1B4332" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#D4A853" />
      <Sparkles count={100} scale={15} size={2} color="#D4A853" />
      <Environment preset="studio" />
      <ContactShadows position={[0, -3.5, 0]} opacity={0.4} scale={20} blur={2.5} far={4.5} />
    </>
  );
}

// --- 🏠 ONBOARDING PAGE ---

const FORM_STEPS = [
  { id: 1, title: 'Medical Entity', description: 'Initialize your clinic identity for ScribeAI orchestration.' },
  { id: 2, title: 'Clinical Team', description: 'Authenticate doctors and support staff endpoints.' },
  { id: 3, title: 'HIS Integration', description: 'Map HL7/FHIR nodes for seamless data sync.' },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(
      '.reveal-element',
      { opacity: 0, x: 30 },
      { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1 }
    );
  }, [step]);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setLoading(true);
      setTimeout(() => window.location.href = '/dashboard', 1500);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col lg:flex-row overflow-hidden font-body">
      
      {/* 🚀 LEFT: 3D BRANDING ENGINE */}
      <section className="relative w-full lg:w-3/5 h-[40vh] lg:h-screen bg-forest-green overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 10], fov: 35 }}>
            <Suspense fallback={null}>
              <PresentationControls global rotation={[0, 0.3, 0]} polar={[-0.4, 0.4]} azimuth={[-0.4, 0.4]}>
                <group position={[0, 0.5, 0]}>
                   <SoundNode position={[-2.5, 0, 0]} color="#D4A853" delay={0} />
                   <SoundNode position={[2.5, 1, 1]} color="#FAFAF7" delay={2} />
                   <SoundNode position={[0, -2, -1]} color="#D4A853" delay={4} />
                </group>
              </PresentationControls>
              <ClinicalEnvironment />
            </Suspense>
          </Canvas>
        </div>
        
        <div className="absolute top-12 left-12 z-10 flex items-center gap-4">
           <div className="h-14 w-14 bg-ivory/5 border border-ivory/10 rounded-2xl flex items-center justify-center">
              <Stethoscope className="h-7 w-7 text-warm-gold" />
           </div>
           <h1 className="text-3xl font-display font-medium text-ivory tracking-widest italic">SCRIBEAI</h1>
        </div>

        <div className="absolute bottom-20 left-20 right-20 z-10 lg:max-w-2xl">
           <Badge className="bg-warm-gold/20 text-warm-gold border-none text-[10px] uppercase font-mono tracking-[0.3em] font-bold px-5 py-2 mb-10 italic">
              Knowledge Flywheel Active
           </Badge>
           <h2 className="text-6xl lg:text-9xl font-display font-medium text-ivory leading-[0.8] lg:leading-[0.8] italic tracking-tighter mb-10">
             THE SILENCE, <br/> <span className="text-warm-gold">STRUCTURED.</span>
           </h2>
           <p className="text-xl font-display text-ivory/40 leading-relaxed italic max-w-lg mb-10">
             Your clinic's medical documentation, automated at source and transformed into live intelligence.
           </p>
        </div>
      </section>

      {/* 📝 RIGHT: SETUP FLOW */}
      <section className="flex-1 flex flex-col justify-center items-center p-10 lg:p-32 bg-ivory relative z-10">
        <div className="max-w-md w-full">
          
          <div className="flex items-center gap-4 mb-20">
            {FORM_STEPS.map((s) => (
              <div 
                key={s.id} 
                className={`flex-1 h-1.5 rounded-full transition-all duration-700 ${s.id <= step ? 'bg-forest-green shadow-[0_0_15px_rgba(27,67,50,0.3)]' : 'bg-forest-green/5'}`}
              />
            ))}
          </div>

          <div className="reveal-element space-y-4 mb-16">
            <h3 className="text-5xl font-display italic font-medium text-forest-green tracking-tight">{FORM_STEPS[step - 1].title}</h3>
            <p className="text-sm text-charcoal/50 font-body italic opacity-70 leading-relaxed max-w-sm">{FORM_STEPS[step - 1].description}</p>
          </div>

          <div className="reveal-element space-y-8">
            {step === 1 && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-forest-green/40 ml-2">Clinical Name</p>
                  <input className="w-full h-18 bg-smoke border border-forest-green/5 rounded-3xl px-8 text-xl font-display italic text-foreground focus:outline-none focus:ring-2 focus:ring-forest-green/10 transition-all font-body" placeholder="MedLife Center Dubai" />
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-forest-green/40 ml-2">DHA License Node</p>
                  <input className="w-full h-18 bg-smoke border border-forest-green/5 rounded-3xl px-8 font-mono text-xl text-forest-green tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-forest-green/10 transition-all" placeholder="784-993-1" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-1 gap-4">
                {['Dr. Sameer Al-Fayed', 'Dr. Elena Rossi', 'Sarah Chen (Admin)', 'Nurse Michael'].map((member) => (
                  <button key={member} className="flex items-center justify-between px-8 py-7 rounded-3xl bg-smoke border border-forest-green/5 hover:border-forest-green/20 hover:bg-ivory transition-all group">
                    <span className="text-lg font-display italic font-medium text-charcoal/60 group-hover:text-forest-green transition-colors">{member}</span>
                    <div className="h-7 w-7 rounded-[0.5rem] border border-forest-green/10 group-hover:bg-forest-green text-ivory flex items-center justify-center transition-all group-hover:scale-110">
                      <Check className="h-4 w-4" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="p-10 bg-smoke/50 border-2 border-dashed border-forest-green/10 rounded-[3.5rem] flex flex-col items-center justify-center text-center py-20 relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-tr from-warm-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                 <Microscope className="h-20 w-20 text-warm-gold mb-12 opacity-50" />
                 <h4 className="text-3xl font-display italic font-medium text-forest-green mb-5">Integrate HL7 v2+</h4>
                 <p className="text-sm font-body text-charcoal/40 italic leading-relaxed max-w-xs">
                   Auto-map Nabidh and Shafah data clusters. Your PHI remains sovereign and encrypted at source.
                 </p>
              </div>
            )}

            <div className="pt-20 flex gap-6">
              {step > 1 && (
                <button 
                  onClick={() => setStep(step - 1)}
                  className="h-20 flex-1 font-bold text-forest-green/40 italic tracking-tight hover:text-forest-green transition-colors uppercase text-sm"
                >
                  ROLL BACK
                </button>
              )}
              <button 
                onClick={handleNext}
                disabled={loading}
                className="h-24 flex-[2] bg-forest-green text-ivory font-bold tracking-tight text-2xl italic rounded-[2rem] transition-all hover:scale-[1.03] active:scale-95 shadow-[0_30px_60px_-15px_rgba(27,67,50,0.4)] group flex items-center justify-center"
              >
                {loading ? <Zap className="h-8 w-8 animate-spin" /> : (
                  <>
                    <span>{step === 3 ? 'FINALIZE NODE' : 'DEPLOY STEP'}</span>
                    <ChevronRight className="ml-5 h-8 w-8 group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Footer info - Regulatory */}
        <div className="absolute bottom-12 flex items-center gap-12 text-[11px] font-mono text-forest-green/20 uppercase tracking-[0.3em] font-bold">
           <span className="flex items-center gap-3"><ShieldCheck className="h-5 w-5" /> DHA 2026 Ready</span>
           <span>AES-4096 Sovereign Encryption</span>
           <span className="text-warm-gold opacity-60">Medically Validated</span>
        </div>
      </section>
    </div>
  );
}
