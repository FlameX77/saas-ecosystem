'use client';

import React, { Suspense, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Environment, Text, ContactShadows, PresentationControls, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { 
  Search, 
  BookOpen, 
  TrendingUp, 
  MessageSquare, 
  LayoutGrid, 
  Layers,
  ChevronRight,
  ArrowUpRight,
  History,
  Zap,
  Globe,
  Database
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ClinicalButton } from '@/components/clinical/Primitives';

// --- 🌐 3D COMPONENTS (Rapier-lite Physics with useFrame) ---

function PhysicsCard({ position, color, label, index }: { position: [number, number, number], color: string, label: string, index: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    
    // Gentle floating physics
    meshRef.current.position.y = position[1] + Math.sin(t * 0.5 + index) * 0.2;
    meshRef.current.rotation.z = Math.sin(t * 0.2 + index) * 0.05;
    
    if (hovered) {
      meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, 1.1, 0.1));
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, 0.5, 0.1);
    } else {
      meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, 1, 0.1));
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, 0, 0.1);
    }
  });

  return (
    <group position={position} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <mesh ref={meshRef}>
        <boxGeometry args={[1.5, 2.2, 0.06]} />
        <meshStandardMaterial color={color} roughness={0.05} metalness={0.8} emissive={color} emissiveIntensity={0.2} />
        <Text
          position={[0, 0.4, 0.04]}
          fontSize={0.12}
          color="#FAFAF7"
          font="/fonts/DM_Mono/DMMono-Medium.ttf"
          maxWidth={1.2}
          textAlign="center"
          anchorY="middle"
        >
          {label}
        </Text>
      </mesh>
    </group>
  );
}

// --- 🏠 HELP DOC HOME ---

export default function HelpDocPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const articles = [
    { id: 1, title: 'Hypertension Management in UAE Clinics', category: 'Cardiology', date: '2h ago', level: 'DHA Standard', ar: 'إدارة ارتفاع ضغط الدم' },
    { id: 2, title: 'Pediatric Asthma Post-Visits (Arabic)', category: 'Pediatrics', date: '4h ago', level: 'AI Generated', ar: 'ربو الأطفال' },
    { id: 3, title: 'Nabidh Integration Requirements', category: 'Admin', date: '1d ago', level: 'EMR Protocol', ar: 'تكامل نبض' },
  ];

  return (
    <div className="min-h-screen bg-ivory font-body">
      
      {/* 🏙️ HERO SECTION WITH 3D INTERACTION */}
      <section className="relative h-[65vh] overflow-hidden border-b border-forest-green/5 bg-smoke">
        <div className="absolute inset-0 z-0 opacity-60">
           <Canvas camera={{ position: [0, 0, 8], fov: 40 }}>
              <Suspense fallback={null}>
                 <ambientLight intensity={0.5} />
                 <pointLight position={[10, 10, 10]} intensity={1.5} color="#D4A853" />
                 <PresentationControls global rotation={[0, -0.2, 0]} polar={[-0.4, 0.4]} azimuth={[-0.5, 0.5]}>
                    <PhysicsCard position={[-2.5, 1, 0]} color="#1B4332" label="Nabidh v2.4" index={0} />
                    <PhysicsCard position={[2.5, 0, 1]} color="#D4A853" label="ICD-10 Mapping" index={1} />
                    <PhysicsCard position={[0, -1.5, -1]} color="#1B4332" label="Patient Consent" index={2} />
                 </PresentationControls>
                 <Environment preset="studio" />
                 <ContactShadows position={[0, -3.5, 0]} opacity={0.4} scale={20} blur={2.5} far={4.5} />
              </Suspense>
           </Canvas>
        </div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center p-10 text-center max-w-5xl mx-auto">
          <Badge className="bg-forest-green/10 text-forest-green border-none text-[9px] uppercase font-mono tracking-[0.3em] px-5 py-2 mb-8 italic">
             Federated Knowledge Node: ScribeAI
          </Badge>
          <h1 className="text-6xl lg:text-8xl italic font-display font-medium text-forest-green mb-10 leading-[0.85] tracking-tight">
            CLINICAL KNOWLEDGE, <br /> <span className="text-warm-gold opacity-80">SOVEREIGN.</span>
          </h1>
          
          <div className="relative w-full max-w-3xl mt-6 group">
             <div className="absolute inset-x-0 -bottom-4 h-24 bg-forest-green/10 blur-3xl rounded-full opacity-30 group-hover:opacity-60 transition-opacity" />
             <Search className="absolute left-8 top-1/2 -translate-y-1/2 h-7 w-7 text-forest-green/30" />
             <input 
               className="w-full h-24 pl-20 pr-10 bg-white/80 backdrop-blur-xl border border-forest-green/5 shadow-2xl rounded-[2.5rem] text-2xl font-display italic text-forest-green tracking-tight placeholder:opacity-20 focus:outline-none focus:ring-1 focus:ring-forest-green/20 transition-all font-body"
               placeholder="Query your clinic's intelligence..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
             <button className="absolute right-6 top-1/2 -translate-y-1/2 h-14 w-14 bg-forest-green text-ivory rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all">
                <ArrowUpRight className="h-6 w-6" />
             </button>
          </div>
        </div>
      </section>

      {/* 📚 KNOWLEDGE ARCHIVE */}
      <section className="p-16 max-w-[1700px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-16">
        
        {/* SIDEBAR: CONTEXTUAL STATS (4 cols) */}
        <div className="xl:col-span-4 space-y-10">
           <div className="flex items-center gap-4 border-b border-forest-green/5 pb-6">
              <Globe className="h-6 w-6 text-warm-gold" />
              <h2 className="text-3xl italic font-display font-medium text-forest-green">Language Nodes</h2>
           </div>
           
           <Card className="p-10 border-none bg-forest-green text-ivory rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
              <div className="relative z-10 flex flex-col gap-8">
                 <div className="h-16 w-16 bg-ivory/10 rounded-2xl flex items-center justify-center text-warm-gold">
                    <Database className="h-8 w-8" />
                 </div>
                 <div>
                    <h3 className="text-3xl font-display italic font-medium leading-[0.9] mb-4">Hybrid Index <br/> Status.</h3>
                    <div className="flex items-center gap-6 mt-10">
                       <div className="flex flex-col gap-1">
                          <span className="text-2xl font-display italic text-warm-gold">1,420</span>
                          <span className="text-[10px] font-mono uppercase tracking-widest opacity-40">EN Articles</span>
                       </div>
                       <div className="w-px h-10 bg-ivory/10" />
                       <div className="flex flex-col gap-1">
                          <span className="text-2xl font-display italic text-ivory/60">485</span>
                          <span className="text-[10px] font-mono uppercase tracking-widest opacity-40">AR Articles</span>
                       </div>
                    </div>
                 </div>
              </div>
              <div className="absolute -bottom-10 -right-10 h-40 w-40 bg-warm-gold/5 blur-[80px] rounded-full" />
           </Card>

           <div className="space-y-4">
              {['Payer Policies', 'Pediatrics-UAE', 'Staff Onboarding', 'DHA Nabidh Sync'].map((topic) => (
                <div key={topic} className="flex items-center justify-between p-7 bg-smoke rounded-[2rem] border border-forest-green/5 hover:bg-white transition-all cursor-pointer group">
                   <div className="flex items-center gap-5">
                      <BookOpen className="h-5 w-5 text-forest-green/40 group-hover:text-forest-green" />
                      <span className="text-lg font-display italic font-medium text-charcoal/60 group-hover:text-forest-green">{topic}</span>
                   </div>
                   <ArrowUpRight className="h-5 w-5 text-forest-green opacity-0 group-hover:opacity-100 transition-all" />
                </div>
              ))}
           </div>
        </div>

        {/* FEED: FLYWHEEL ARTICLES (8 cols) */}
        <div className="xl:col-span-8 space-y-10">
           <div className="flex items-center justify-between border-b border-forest-green/5 pb-6">
              <div className="flex items-center gap-4">
                <Zap className="h-6 w-6 text-warm-gold" />
                <h2 className="text-3xl italic font-display font-medium text-forest-green">Knowledge Flywheel: Today</h2>
              </div>
              <Badge className="bg-forest-green/5 text-forest-green border-none uppercase font-mono text-[10px] px-4 py-1 font-bold">Auto-Digested from SOAP</Badge>
           </div>

           <div className="grid gap-6">
              {articles.map((art) => (
                <div key={art.id} className="group p-10 bg-white border border-forest-green/5 rounded-[3.5rem] hover:shadow-2xl hover:shadow-forest-green/5 transition-all cursor-pointer relative overflow-hidden flex flex-col md:flex-row items-start justify-between gap-8">
                   <div className="flex-1">
                      <div className="flex items-center gap-4 mb-6">
                         <Badge className="bg-smoke text-forest-green/40 border-none uppercase text-[8px] font-bold tracking-widest px-3 py-1 font-mono">{art.category}</Badge>
                         <span className="h-1 w-1 rounded-full bg-forest-green/20" />
                         <span className="text-[10px] font-mono text-charcoal/30 uppercase font-bold italic tracking-widest">{art.date}</span>
                      </div>
                      <h3 className="text-3xl md:text-4xl italic font-display font-medium text-forest-green group-hover:text-warm-gold transition-colors leading-[0.9] mb-6">
                         {art.title}
                      </h3>
                      <p className="text-sm font-arabic font-medium text-charcoal/30 italic opacity-80" dir="rtl">{art.ar}</p>
                   </div>
                   <div className="flex flex-col items-end justify-between self-stretch">
                      <Badge variant="outline" className="text-[9px] uppercase font-mono tracking-widest border-forest-green/10 text-forest-green/40">{art.level}</Badge>
                      <ClinicalButton variant="ghost" className="h-12 w-12 rounded-full p-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all ltr:translate-x-0 rtl:-translate-x-4">
                         <ChevronRight className="h-6 w-6" />
                      </ClinicalButton>
                   </div>
                   {/* VERTICAL ACCENT */}
                   <div className="absolute top-0 bottom-0 left-0 w-1 bg-warm-gold/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
           </div>
        </div>

      </section>
    </div>
  );
}
