'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  Zap, 
  Globe, 
  BarChart3,
  Search,
  Settings,
  Bell,
  Wallet,
  ArrowUpRight
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function SuperAdminInformatics() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.gsap-stat-card', {
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 1,
        ease: 'power4.out'
      });
      
      gsap.from('.gsap-clinic-row', {
        opacity: 0,
        x: -20,
        stagger: 0.05,
        duration: 0.8,
        delay: 0.5,
        ease: 'power3.out'
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const clinics = [
    { name: 'Emirates Central Hospital', patients: 12400, reactivation_rate: '14.2%', status: 'Active', rev: '$12,400' },
    { name: 'MedStar Specialist Clinic', patients: 3200, reactivation_rate: '22.8%', status: 'Active', rev: '$4,100' },
    { name: 'Dubai Health Partners', patients: 28400, reactivation_rate: '9.4%', status: 'In-Outreach', rev: '$28,000' },
    { name: 'Apex Orthopedic Center', patients: 1100, reactivation_rate: '31.1%', status: 'Active', rev: '$2,200' },
    { name: 'City Dental Abu Dhabi', patients: 4500, reactivation_rate: '18.5%', status: 'Idle', rev: '$4,500' },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050505] text-white p-8 font-sans selection:bg-primary selection:text-black">
      
      {/* 🚀 SUPER-ADMIN NAV */}
      <div className="max-w-[1600px] mx-auto mb-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center shadow-[0_0_30px_-5px_rgba(0,212,170,0.6)]">
            <ShieldCheck className="text-black h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">NOVU <span className="text-primary italic font-medium">SOVEREIGN</span></h1>
            <p className="text-[10px] uppercase font-mono tracking-[0.3em] opacity-40">Network Informatics & Global Ops</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 opacity-60">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-mono">Claude 3.5 Sonnet: OPERATIONAL</span>
           </div>
           <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 opacity-60">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-mono">MiMo API: ACTIVE</span>
           </div>
           <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5"><Bell className="h-5 w-5 opacity-40" /></Button>
           <div className="h-10 w-10 bg-gradient-to-tr from-primary to-emerald-400 rounded-full border-2 border-white/20 shadow-lg" />
        </div>
      </div>

      {/* 🏙️ GLOBAL METRICS */}
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
         {[
           { label: 'Total Network Patients', val: '52,401', icon: Users, color: 'text-primary' },
           { label: 'Connected Clinics', val: '14', icon: Building2, color: 'text-white' },
           { label: 'Total Recovered Revenue', val: '$512.4k', icon: Wallet, color: 'text-secondary' },
           { label: 'Your SaaS Fee MRR', val: '$51,240', icon: Zap, color: 'text-primary' }
         ].map((stat, i) => (
           <Card key={i} className="gsap-stat-card p-8 bg-white/[0.03] border-white/10 rounded-[2rem] hover:border-primary/30 transition-all group overflow-hidden relative">
             <stat.icon className={`h-8 w-8 ${stat.color} mb-6 opacity-80 group-hover:scale-110 transition-transform`} />
             <p className="text-xs font-mono uppercase tracking-widest opacity-40 mb-1">{stat.label}</p>
             <h3 className="text-4xl font-display font-medium italic tracking-tight">{stat.val}</h3>
             <div className="absolute -bottom-4 -right-4 h-24 w-24 bg-primary/5 blur-3xl rounded-full" />
           </Card>
         ))}
      </div>

      {/* 🏥 CLINIC REGISTRY TABLE */}
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between mb-8 px-4">
           <h2 className="text-2xl italic font-display font-medium tracking-tight">Clinic Registry</h2>
           <div className="flex gap-4">
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40" />
                 <input type="text" placeholder="Search clinics..." className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-all w-64" />
              </div>
              <Button className="bg-primary text-black font-bold h-10 px-6 rounded-xl hover:scale-105 active:scale-95 transition-all">Add New Clinic</Button>
           </div>
        </div>

        <Card className="bg-white/[0.02] border-white/5 rounded-[2.5rem] overflow-hidden">
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="border-b border-white/5">
                       <th className="p-6 text-[10px] uppercase font-mono tracking-widest opacity-40">Clinic Name</th>
                       <th className="p-6 text-[10px] uppercase font-mono tracking-widest opacity-40 text-center">Patients</th>
                       <th className="p-6 text-[10px] uppercase font-mono tracking-widest opacity-40 text-center">React. Rate</th>
                       <th className="p-6 text-[10px] uppercase font-mono tracking-widest opacity-40 text-center">Clinic Revenue</th>
                       <th className="p-6 text-[10px] uppercase font-mono tracking-widest opacity-40">Status</th>
                       <th className="p-6 text-[10px] uppercase font-mono tracking-widest opacity-40 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {clinics.map((clinic, i) => (
                       <tr key={i} className="gsap-clinic-row group hover:bg-white/[0.03] transition-colors cursor-pointer">
                          <td className="p-6">
                             <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-primary" />
                                <span className="font-medium italic tracking-tight">{clinic.name}</span>
                             </div>
                          </td>
                          <td className="p-6 text-center font-mono text-sm opacity-60">{clinic.patients.toLocaleString()}</td>
                          <td className="p-6 text-center">
                             <Badge variant="secondary" className="bg-white/5 hover:bg-primary/20 hover:text-primary transition-colors cursor-default">{clinic.reactivation_rate}</Badge>
                          </td>
                          <td className="p-6 text-center text-sm font-medium text-secondary">{clinic.rev}</td>
                          <td className="p-6">
                             <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                               clinic.status === 'Active' ? 'bg-primary/10 text-primary border border-primary/20' : 
                               clinic.status === 'In-Outreach' ? 'bg-secondary/10 text-secondary border border-secondary/20' : 'bg-white/5 text-white/40 border border-white/10'
                             }`}>
                                {clinic.status}
                             </span>
                          </td>
                          <td className="p-6 text-right">
                             <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/5">
                                <ArrowUpRight className="h-5 w-5 text-primary" />
                             </Button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </Card>
      </div>

      {/* 📊 SYSTEM LOAD / GEOGRAPHY */}
      <div className="max-w-[1600px] mx-auto mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
         <Card className="lg:col-span-8 p-10 bg-white/[0.02] border-white/5 rounded-[2.5rem] relative overflow-hidden h-[400px]">
            <div className="flex justify-between items-start mb-10">
               <div>
                  <h3 className="text-xl italic font-display font-medium text-white mb-1">Global Logic Pipeline</h3>
                  <p className="text-[10px] font-mono uppercase tracking-widest opacity-40">Processed 4,209 patient reactivations last 24h</p>
               </div>
               <Badge className="bg-primary text-black font-extrabold px-4">99.9% UPTIME</Badge>
            </div>
            
            {/* Visualizer Mock */}
            <div className="flex items-end gap-1 h-[200px] px-2">
               {Array.from({length: 48}).map((_, i) => (
                  <div key={i} className="flex-1 bg-white/5 rounded-t-sm hover:bg-primary transition-colors group relative" style={{ height: `${Math.random() * 80 + 20}%` }}>
                     <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-black border border-white/10 rounded-lg text-[8px] font-mono opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap">
                        14:00 - {Math.floor(Math.random()*100)} CALLS
                     </div>
                  </div>
               ))}
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
         </Card>

         <Card className="lg:col-span-4 p-10 bg-primary text-black rounded-[2.5rem] relative overflow-hidden h-[400px] group">
            <Globe className="h-12 w-12 mb-8 opacity-80 group-hover:rotate-12 transition-transform duration-700" />
            <h3 className="text-3xl font-display font-medium italic leading-tight mb-4 tracking-tight">Market <br/> DOMINATION</h3>
            <p className="text-sm font-medium opacity-80 leading-relaxed mb-10">You are currently active in the UAE and India. Scaling to Kuwait and Saudi Arabia planned for Q3.</p>
            <div className="space-y-4">
               <div className="flex justify-between text-xs font-bold border-b border-black/10 pb-2"> <span>Abu Dhabi / Dubai</span> <span>72% Market Share</span> </div>
               <div className="flex justify-between text-xs font-bold border-b border-black/10 pb-2"> <span>Mumbai / Delhi</span> <span>21,000+ Profiles</span> </div>
            </div>
            <div className="absolute bottom-[-50px] right-[-50px] h-64 w-64 bg-white/30 blur-3xl rounded-full" />
         </Card>
      </div>

    </div>
  );
}
