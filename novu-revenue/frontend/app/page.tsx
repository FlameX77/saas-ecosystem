'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import Link from 'next/link'
import { 
  IconRocket, IconShieldCheck, IconBrain, IconReceipt2,
  IconChartBar, IconUsers, IconArrowRight, IconMessageDots,
  IconClock, IconLock, IconCurrencyDollar, IconTimeline,
  IconDeviceAnalytics, IconCreditCard, IconChevronRight,
  IconSparkles, IconActivity, IconBriefcase
} from '@tabler/icons-react'

// --- Animation Variants ---
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as any } }
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
}

export default function NovuLandingPage() {
  return (
    <div className="min-h-screen bg-[#030014] text-slate-300 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
      </div>

      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesGrid />
      <RecoveryPipeline />
      <PricingSection />
      <Footer />
    </div>
  )
}

function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-20 bg-slate-950/40 backdrop-blur-xl border-b border-white/5"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/20">
          <IconReceipt2 className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-black text-white tracking-tighter">Novu Revenue</span>
      </div>
      <div className="hidden md:flex items-center gap-8">
        {['Product', 'AI Agents', 'Impact', 'Pricing'].map(item => (
          <Link key={item} href={`#${item.toLowerCase()}`} className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 hover:text-indigo-400 transition-colors">
            {item}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <Link href="/login" className="px-6 py-2.5 rounded-full bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all shadow-xl shadow-white/5">
          Go to Platform
        </Link>
      </div>
    </motion.nav>
  )
}

function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 px-6 z-10 overflow-hidden">
      <div className="max-w-6xl mx-auto text-center">
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
            <IconSparkles size={14} className="animate-pulse" /> 
            Autonomous Revenue Recovery Platform
          </motion.div>
          
          <motion.h1 variants={fadeUp} className="text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-8">
            Resurrect Lost <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent italic">Revenue Streams.</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="max-w-2xl mx-auto text-slate-500 text-lg md:text-xl font-medium leading-relaxed mb-12">
            Novu deploys an autonomous fleet of AI agents to detect, engage, and recover abandoned leads and denied claims. Revenue growth on autopilot.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="group px-8 py-5 rounded-2xl bg-indigo-600 text-white font-black text-sm uppercase tracking-widest flex items-center gap-3 shadow-2xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all">
              Initialize Recovery Fleet <IconArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="#impact" className="px-8 py-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 font-black text-sm uppercase tracking-widest hover:bg-slate-800 hover:text-white transition-all">
              View ROI Report
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function StatsSection() {
  const { ref, inView } = useInView({ triggerOnce: true })
  
  const stats = [
    { label: 'Avg Recovery Boost', value: '28.4%', icon: IconChartBar, color: 'text-indigo-400' },
    { label: 'Agent Response Time', value: '< 2m', icon: IconClock, color: 'text-purple-400' },
    { label: 'Lead Reactivation', value: '4.2x', icon: IconActivity, color: 'text-emerald-400' },
    { label: 'Security Standard', value: 'SOC 2', icon: IconShieldCheck, color: 'text-blue-400' },
  ]

  return (
    <section ref={ref} id="impact" className="py-20 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.1 }}
            className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-md group hover:border-indigo-500/20 transition-all"
          >
            <div className={`mb-4 ${stat.color} group-hover:scale-110 transition-transform`}>
              <stat.icon size={28} />
            </div>
            <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-600">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function FeaturesGrid() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section id="product" className="py-32 px-6 bg-slate-950/20">
      <div className="max-w-6xl mx-auto">
        <div className="mb-20 space-y-4">
           <div className="text-indigo-500 text-xs font-black uppercase tracking-[0.3em]">Core Intelligence</div>
           <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Engineered for Massive Recovery.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <FeatureCard 
             icon={IconBrain} title="Autonomous Agents" 
             desc="Multi-agent orchestration that knows exactly when to call, text, or email a lead." 
           />
           <FeatureCard 
             icon={IconTimeline} title="Sentiment Routing" 
             desc="Agents adapt their tone based on user responses to maximize conversion probability." 
           />
           <FeatureCard 
             icon={IconMessageDots} title="Omnichannel Presence" 
             desc="From WhatsApp at 10 AM to Voice calls at 6 PM. We cover the entire engagement surface." 
           />
           <FeatureCard 
             icon={IconLock} title="Compliance Protocol" 
             desc="Full DPA and CCPA compliance. Encrypted lead data processing." 
           />
           <FeatureCard 
             icon={IconDeviceAnalytics} title="Deep Funnel Insights" 
             desc="Real-time dashboard showing exactly how much revenue was pulled back from the dead." 
           />
           <FeatureCard 
             icon={IconCurrencyDollar} title="Direct CRM Sync" 
             desc="One-click integration with Hubspot, Salesforce, and custom SQL databases." 
           />
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ icon: Icon, title, desc }: any) {
  return (
    <div className="p-10 rounded-[3rem] bg-indigo-500/[0.02] border border-white/5 hover:border-indigo-500/20 hover:bg-indigo-500/[0.04] transition-all group">
       <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-8 group-hover:scale-110 transition-transform">
          <Icon size={28} />
       </div>
       <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
       <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
    </div>
  )
}

function RecoveryPipeline() {
  return (
    <section id="ai" className="py-32 px-6">
       <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-20">
          <div className="flex-1 space-y-8">
             <div className="w-16 h-1 bg-indigo-500" />
             <h2 className="text-5xl font-black text-white leading-tight tracking-tighter">
                Our Fleet Works <br />
                While You Sleep.
             </h2>
             <p className="text-slate-500 text-lg leading-relaxed">
                Traditional recovery requires humans. Humans have limits. Our agents don't. 
                They process claims, follow up with patients, and close deals 24/7/365.
             </p>
             <ul className="space-y-4">
                {[
                  'Automated Denial Resubmission',
                  'Predictive Lead Scoring',
                  'Dynamic Messaging Sequences',
                  'Live Recovery Analytics'
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm font-bold text-slate-300">
                    <IconCheck className="text-indigo-500" size={18} /> {item}
                  </li>
                ))}
             </ul>
          </div>
          <div className="flex-1 relative">
             <div className="w-full aspect-square rounded-[4rem] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl relative">
                <div className="absolute inset-0 bg-indigo-500/5 animate-pulse" />
                <IconBriefcase size={120} className="text-white/20" />
                {/* Float elements */}
                <motion.div animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute top-10 right-10 p-4 bg-indigo-500 rounded-2xl shadow-2xl">
                   <IconCurrencyDollar size={24} className="text-white" />
                </motion.div>
                <motion.div animate={{ y: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 3, delay: 1 }} className="absolute bottom-10 left-10 p-4 bg-purple-500 rounded-2xl shadow-2xl">
                   <IconUsers size={24} className="text-white" />
                </motion.div>
             </div>
          </div>
       </div>
    </section>
  )
}

function PricingSection() {
  return (
    <section id="pricing" className="py-32 px-6">
       <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20 space-y-4">
             <h2 className="text-5xl font-black text-white tracking-tighter">Investment Protocol.</h2>
             <p className="text-slate-500">Pay for recovery, not for seats.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="p-12 rounded-[3.5rem] bg-white/[0.02] border border-white/10">
                <div className="text-indigo-400 font-bold text-[10px] uppercase tracking-widest mb-6">Growth Protocol</div>
                <div className="text-5xl font-black text-white mb-8">$2,450<span className="text-sm text-slate-500 font-bold ml-2">/mo</span></div>
                <ul className="space-y-4 mb-12 font-medium text-slate-400">
                   <li className="flex gap-3"><IconCheck size={18} className="text-indigo-500"/> Up to $50k recovered/mo</li>
                   <li className="flex gap-3"><IconCheck size={18} className="text-indigo-500"/> 5 Autonomous Agents</li>
                   <li className="flex gap-3"><IconCheck size={18} className="text-indigo-500"/> WhatsApp & Email Access</li>
                </ul>
                <button className="w-full py-5 rounded-2xl bg-white/5 border border-indigo-500/20 text-white font-black uppercase tracking-widest hover:bg-white text-black transition-all">Start Protocol</button>
             </div>
             <div className="p-12 rounded-[3.5rem] bg-indigo-600/[0.05] border border-indigo-500/50 relative shadow-2xl shadow-indigo-500/10">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-indigo-500 text-black text-[10px] font-black uppercase tracking-widest rounded-full">Primary Choice</div>
                <div className="text-indigo-400 font-bold text-[10px] uppercase tracking-widest mb-6">Scale Protocol</div>
                <div className="text-5xl font-black text-white mb-8">$4,900<span className="text-sm text-slate-500 font-bold ml-2">/mo</span></div>
                <ul className="space-y-4 mb-12 font-medium text-slate-300">
                   <li className="flex gap-3"><IconCheck size={18} className="text-indigo-500"/> Unlimited Recovery Cap</li>
                   <li className="flex gap-3"><IconCheck size={18} className="text-indigo-500"/> Custom Agent Profiles</li>
                   <li className="flex gap-3"><IconCheck size={18} className="text-indigo-500"/> Voice-AI Recovery Beta</li>
                </ul>
                <button className="w-full py-5 rounded-2xl bg-indigo-500 text-white font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/20 hover:bg-indigo-400 transition-all">Activate Fleet</button>
             </div>
          </div>
       </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="py-20 px-8 border-t border-white/5 bg-slate-950/40">
       <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-12">
          <div className="space-y-6">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center">
                  <IconReceipt2 className="text-white w-6 h-6" />
                </div>
                <span className="text-xl font-black text-white tracking-tighter">Novu</span>
             </div>
             <p className="text-slate-600 text-sm max-w-xs leading-relaxed">
                Revolutionizing the revenue cycle through autonomous agent orchestration. Built for 2026.
             </p>
          </div>
          <div className="flex gap-20">
             <div className="space-y-4">
                <div className="text-white font-black text-xs uppercase tracking-widest">Platform</div>
                <div className="flex flex-col gap-2 text-slate-500 text-sm font-bold">
                   <Link href="#" className="hover:text-indigo-400">Agents</Link>
                   <Link href="#" className="hover:text-indigo-400">Recovery</Link>
                   <Link href="#" className="hover:text-indigo-400">Security</Link>
                </div>
             </div>
             <div className="space-y-4">
                <div className="text-white font-black text-xs uppercase tracking-widest">Company</div>
                <div className="flex flex-col gap-2 text-slate-500 text-sm font-bold">
                   <Link href="#" className="hover:text-indigo-400">Impact</Link>
                   <Link href="#" className="hover:text-indigo-400">Support</Link>
                   <Link href="#" className="hover:text-indigo-400">Legal</Link>
                </div>
             </div>
          </div>
       </div>
       <div className="max-w-6xl mx-auto mt-20 pt-8 border-t border-white/5 flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-700">
          <div>© 2026 Novu Technologies</div>
          <div className="flex gap-6">
             <span>DHA Approved</span>
             <span>AES-256 Cloud</span>
          </div>
       </div>
    </footer>
  )
}

function IconCheck({ className, size }: any) {
  return (
    <div className={`rounded-full bg-indigo-500/10 p-1 flex-shrink-0 ${className}`}>
      <svg width={size-6} height={size-6} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
  )
}
