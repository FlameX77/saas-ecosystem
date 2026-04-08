"use client"
import { motion } from 'framer-motion'
import { fadeUp, scaleIn, stagger } from '@/lib/animations'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import {
  IconMicrophone, IconFileText, IconLock, IconUserCheck,
  IconShieldLock, IconDownload, IconAlertTriangle, IconBrandWhatsapp,
  IconUsers, IconCheck,
} from '@tabler/icons-react'

// --- Section Components ---

function CountUpNumber({ end, suffix = '', duration = 1.2 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = end / (duration * 60)
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 1000 / 60)
    return () => clearInterval(timer)
  }, [inView, end, duration])

  return <span ref={ref}>{count}{suffix}</span>
}

function StatsSection() {
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '-60px' })
  return (
    <motion.section
      ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger}
      className="max-w-4xl mx-auto py-24 px-6 relative z-10"
    >
      <div className="flex flex-wrap justify-center gap-0">
        {[
          { value: 4, suffix: ' hrs', label: 'saved per doctor daily' },
          { value: 6, suffix: ' sec', label: 'to generate a full SOAP note' },
          { value: 4, suffix: '', label: 'languages supported natives' },
        ].map((stat, i) => (
          <motion.div key={i} variants={fadeUp} className={`flex-1 min-w-[200px] text-center p-8 ${i < 2 ? 'border-r border-slate-800/50' : ''}`}>
            <div className="text-5xl md:text-6xl font-bold text-white tracking-tighter">
              <CountUpNumber end={stat.value} suffix={stat.suffix} />
            </div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-2">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

function HowItWorksSection() {
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '-60px' })
  const steps = [
    { icon: <IconMicrophone size={32} />, title: 'Record Session', desc: 'Securely record clinical consultations. Our AI understands medical context in 4 regional languages.' },
    { icon: <IconFileText size={32} />, title: 'AI Synthesis', desc: 'The OS automatically structures the conversation into high-fidelity SOAP notes and clinical summaries.' },
    { icon: <IconCheck size={32} />, title: 'Review & Sync', desc: 'Verify the draft, then instantly sync it to your EMR. One-click discharge summaries for patients.' },
  ]
  return (
    <motion.section
      id="how-it-works"
      ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger}
      className="py-32 px-6 relative z-10"
    >
      <div className="max-w-5xl mx-auto">
        <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black text-center mb-4 tracking-tight text-white">
          Clinical workflow, automated.
        </motion.h2>
        <motion.p variants={fadeUp} className="text-slate-500 text-xl text-center mb-16 max-w-2xl mx-auto">
          From consultation to documentation in under 10 seconds. No more late nights typing notes.
        </motion.p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i} variants={fadeUp}
              className={`p-10 rounded-[2.5rem] bg-slate-900/40 border border-slate-800/50 relative overflow-hidden group hover:border-teal-500/30 transition-colors ${i === 1 ? 'shadow-[0_0_50px_rgba(20,184,166,0.05)]' : ''}`}
            >
              <div className="absolute top-0 right-0 p-8 text-6xl font-black text-white/5 group-hover:text-teal-500/10 transition-colors">{i + 1}</div>
              <div className="text-teal-500 mb-8 inline-flex p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20">{step.icon}</div>
              <h3 className="text-xl font-bold text-white mb-4 tracking-tight">{step.title}</h3>
              <p className="text-slate-400 text-base leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

function TrustSection() {
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '-60px' })
  const cards = [
    { icon: <IconLock size={28} />, title: 'Privacy First', desc: 'Data is encrypted at rest and in transit. Audio is processed and deleted automatically post-transcription.' },
    { icon: <IconUserCheck size={28} />, title: 'Physician in the Loop', desc: 'The AI assists, but you have the final authority. Every note requires your digital sign-off.' },
    { icon: <IconShieldLock size={28} />, title: 'Regionally Compliant', desc: 'Purpose-built for UAE (DHA/HAAD) and India (NABH) regulatory standards.' },
  ]
  return (
    <motion.section
      ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger}
      className="py-24 px-6 bg-slate-900/20 relative z-10"
    >
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {cards.map((card, i) => (
          <motion.div key={i} variants={fadeUp} className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800/50 hover:bg-slate-900/60 shadow-xl transition-all">
            <div className="text-teal-500 mb-6">{card.icon}</div>
            <h3 className="text-lg font-bold text-white mb-3 tracking-tight">{card.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{card.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

function FeaturesBento() {
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '-60px' })
  return (
    <motion.section
      id="features"
      ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger}
      className="py-32 px-6 relative z-10 overflow-hidden"
    >
      <div className="max-w-5xl mx-auto">
        <motion.h2 variants={fadeUp} className="text-4xl font-black text-center mb-16 text-white tracking-tight">
          Beyond a Scribe—A Clinical OS.
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div variants={fadeUp} className="md:col-span-2 p-12 rounded-[3.5rem] bg-gradient-to-br from-teal-500/10 to-transparent border border-teal-500/20 relative overflow-hidden">
            <div className="text-teal-500 mb-8 inset-0 opacity-20 absolute -right-20 -top-20"><IconMicrophone size={300} /></div>
            <h3 className="text-2xl font-black text-white mb-4 relative z-10">Bilingual & Accent-Aware</h3>
            <p className="text-slate-400 text-lg leading-relaxed mb-6 relative z-10 max-w-md">
              Seamlessly switch between English, Hindi, Arabic, and Urdu. Built for the unique linguistic landscape of the Gulf and South Asia.
            </p>
            <div className="flex gap-3 relative z-10">
              {['EN', 'HI', 'AR', 'UR'].map(lang => (
                <span key={lang} className="px-4 py-1.5 rounded-full text-xs font-black bg-teal-500/10 border border-teal-500/20 text-teal-400 tracking-widest">{lang}</span>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="p-10 rounded-[3.5rem] bg-slate-900/40 border border-slate-800/50 flex flex-col justify-between">
            <div className="text-rose-500"><IconAlertTriangle size={32} /></div>
            <div>
              <h3 className="text-xl font-bold text-white mb-3">Red-Flag Alerts</h3>
              <p className="text-slate-500 text-sm leading-relaxed">AI automatically flags urgent clinical symptoms that require immediate physician intervention.</p>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="p-10 rounded-[3.5rem] bg-slate-900/40 border border-slate-800/50">
            <div className="text-teal-500 mb-6"><IconDownload size={32} /></div>
            <h3 className="text-xl font-bold text-white mb-2">Smart PDF Exports</h3>
            <p className="text-slate-500 text-sm">Professional, branded consultation summaries in seconds.</p>
          </motion.div>

          <motion.div variants={fadeUp} className="p-10 rounded-[3.5rem] bg-slate-900/40 border border-slate-800/50">
            <div className="text-green-500 mb-6"><IconBrandWhatsapp size={32} /></div>
            <h3 className="text-xl font-bold text-white mb-2">Direct Patient Link</h3>
            <p className="text-slate-500 text-sm">Send discharge summaries directly to patient WhatsApp after approval.</p>
          </motion.div>

          <motion.div variants={fadeUp} className="p-10 rounded-[3.5rem] bg-slate-900/40 border border-slate-800/50">
            <div className="text-blue-500 mb-6"><IconUsers size={32} /></div>
            <h3 className="text-xl font-bold text-white mb-2">Team Syncing</h3>
            <p className="text-slate-500 text-sm">One account for your entire multi-doctor clinical practice.</p>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}

function PricingSection() {
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '-60px' })
  const plans = [
    { name: 'Starter', price: '365', features: ['1 Doctor Account', '100 consultations/mo', 'Bilingual Support', 'Basic Analytics', 'Email Support'] },
    { name: 'Growth', price: '730', popular: true, features: ['3 Doctor Accounts', 'Unlimited Consultations', 'All 4 Languages', 'WhatsApp Integration', 'Priority Clinical Support'] },
    { name: 'Enterprise', price: '1,835', features: ['Unlimited Doctors', 'Custom EMR Integration', 'White-labeling', 'API Access', 'On-site Staff Training'] },
  ]
  return (
    <motion.section
      id="pricing"
      ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger}
      className="py-32 px-6 bg-slate-900/20 relative z-10"
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-20">
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter">Investment-grade value.</motion.h2>
          <motion.p variants={fadeUp} className="text-slate-500 text-lg">14-day free trial. No credit card required. Cancel anytime.</motion.p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={i} variants={fadeUp}
              className={`p-10 rounded-[3rem] bg-slate-900/40 border transition-all flex flex-col ${plan.popular ? 'border-teal-500 ring-4 ring-teal-500/10 relative shadow-2xl shadow-teal-500/10' : 'border-slate-800/50 hover:border-slate-700'}`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-500 text-black text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full">Recommended</span>
              )}
              <div className="text-teal-500 font-black text-xs uppercase tracking-[0.3em] mb-6">{plan.name}</div>
              <div className="mb-8">
                <span className="text-5xl font-black text-white tracking-tighter">AED {plan.price}</span>
                <span className="text-slate-500 font-bold ml-1">/mo</span>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-3 text-slate-400 text-sm font-medium">
                    <div className="w-5 h-5 rounded-full bg-teal-500/10 flex items-center justify-center flex-shrink-0"><IconCheck size={12} className="text-teal-500" /></div>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className={`w-full py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest text-center transition-all ${plan.popular ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20 hover:scale-[1.02]' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}>
                Start Free Trial
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080808] text-slate-200 selection:bg-teal-500/30 selection:text-teal-200">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150" />
      </div>

      {/* NAV */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-[#080808]/80 backdrop-blur-2xl border-b border-slate-800/50 h-20 px-8 flex items-center justify-between"
      >
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/20" />
            <IconMicrophone size={20} color="black" className="relative z-10" />
          </div>
          <span className="font-black text-2xl tracking-tighter text-white">Healthcare OS</span>
        </Link>
        <div className="hidden md:flex items-center gap-10">
          {['Features', 'How it works', 'Pricing'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-sm font-bold text-slate-400 hover:text-white transition-colors">{item}</a>
          ))}
          <Link href="/login" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Login</Link>
          <Link href="/signup" className="px-6 py-3 rounded-2xl bg-teal-500 text-black font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-teal-500/20 active:scale-95">
            Get Started
          </Link>
        </div>
      </motion.nav>

      {/* HERO */}
      <section className="relative pt-32 pb-24 px-6 min-h-[90vh] flex flex-col items-center justify-center text-center">
        <motion.div variants={scaleIn} initial="hidden" animate="visible" className="mb-8">
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-500 text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-teal-500/10">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" /> Unified Clinical Suite 2026
          </span>
        </motion.div>

        <motion.h1 
          variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}
          className="text-6xl md:text-8xl lg:text-9xl font-black text-white leading-[0.85] tracking-tighter mb-8"
        >
          Medicine at the speed of <br />
          <span className="text-teal-500 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-teal-600">Pure Intelligence.</span>
        </motion.h1>

        <motion.p 
          variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}
          className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-12 font-medium"
        >
          Healthcare OS is the multi-agent clinical brain for private clinics in the Gulf and India. Automate scribing, billing audits, and patient comms in one dashboard.
        </motion.p>

        <motion.div 
          variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.25 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <Link href="/signup" className="h-16 px-10 rounded-[1.5rem] bg-teal-500 text-black font-black text-lg flex items-center justify-center hover:scale-[1.02] transition-all shadow-[0_0_50px_rgba(20,184,166,0.3)] active:scale-95">
            Start Your 14-Day Free Trial →
          </Link>
          <Link href="/demo" className="h-16 px-10 rounded-[1.5rem] bg-slate-900 border border-slate-800 text-white font-black text-lg flex items-center justify-center hover:bg-slate-800 transition-all active:scale-95">
            Watch Technical Demo
          </Link>
        </motion.div>

        <motion.p 
          variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.3 }}
          className="mt-8 text-slate-600 text-xs font-bold uppercase tracking-widest flex items-center gap-3"
        >
          <IconShieldLock size={14} /> HIPAA COMPLIANT · DHA & HAAD COMPATIBLE · NABH READY
        </motion.p>

        {/* Floating Mockup Preview */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.4 }}
          className="mt-24 max-w-6xl w-full mx-auto"
        >
          <div className="relative p-2 rounded-[3.5rem] bg-slate-800/20 border border-slate-700/30 backdrop-blur-md shadow-2xl flex flex-col">
            <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/20 to-blue-500/20 blur-xl opacity-30 group-hover:opacity-100 transition-opacity" />
            <div className="h-12 bg-slate-900/40 border-b border-slate-800/50 rounded-t-[3rem] px-8 flex items-center justify-between">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-700" />
                <div className="w-3 h-3 rounded-full bg-slate-700" />
                <div className="w-3 h-3 rounded-full bg-slate-700" />
              </div>
              <div className="bg-slate-800/50 px-4 py-1 rounded-full text-[10px] font-black text-teal-400 uppercase tracking-widest border border-teal-500/10">Healthcare OS — Live Consultation</div>
              <div className="w-10" />
            </div>
            <div className="grid grid-cols-12 gap-0 overflow-hidden rounded-b-[3rem]">
              <div className="col-span-3 bg-slate-900/20 border-r border-slate-800/50 p-6 space-y-4">
                {[1,2,3,4,5].map(i => <div key={i} className="h-8 w-full bg-slate-800/30 rounded-xl" />)}
              </div>
              <div className="col-span-9 p-8 bg-[#0a0a0a]">
                <div className="grid grid-cols-2 gap-6">
                  <div className="aspect-square bg-slate-900/40 rounded-[2.5rem] border border-slate-800/50 flex flex-col items-center justify-center p-8">
                     <div className="w-20 h-20 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mb-6">
                        <IconMicrophone size={32} className="text-teal-500" />
                     </div>
                     <div className="w-full space-y-2">
                        <div className="h-3 w-full bg-slate-800/50 rounded-full" />
                        <div className="h-3 w-3/4 bg-slate-800/50 rounded-full mx-auto" />
                     </div>
                  </div>
                  <div className="aspect-square bg-slate-900/40 rounded-[2.5rem] border border-slate-800/50 p-8 space-y-6">
                    <div className="flex gap-2 items-center"><div className="w-2 h-2 rounded-full bg-teal-500" /><div className="h-4 w-32 bg-slate-800/50 rounded-full" /></div>
                    <div className="space-y-3">
                      <div className="h-2 w-full bg-slate-800/30 rounded-full" />
                      <div className="h-2 w-full bg-slate-800/30 rounded-full" />
                      <div className="h-2 w-11/12 bg-slate-800/30 rounded-full" />
                      <div className="h-2 w-full bg-slate-800/30 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <StatsSection />
      <HowItWorksSection />
      <TrustSection />
      <FeaturesBento />
      <PricingSection />

      {/* CTA BANNER */}
      <section className="py-32 px-6 relative overflow-hidden group">
        <div className="absolute inset-0 bg-teal-500 transition-colors duration-500" />
        <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        <div className="relative max-w-4xl mx-auto text-center">
           <h2 className="text-5xl md:text-6xl font-black text-black mb-8 tracking-tighter leading-none">
             Stop typing. <br />
             Start practicing.
           </h2>
           <p className="text-black/60 text-xl font-bold mb-12 max-w-xl mx-auto">
             Healthcare OS is the only platform that pays for itself in time saved from day one.
           </p>
           <Link href="/signup" className="inline-flex h-16 px-12 rounded-[1.5rem] bg-black text-white font-black text-lg items-center justify-center hover:scale-105 transition-all shadow-2xl active:scale-95">
             Claim Your Free Trial Account →
           </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 px-8 border-t border-slate-800/50 bg-[#080808]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
                <IconMicrophone size={16} color="black" />
              </div>
              <span className="font-black text-xl tracking-tighter text-white">Healthcare OS</span>
            </Link>
            <p className="text-slate-500 text-sm max-w-xs leading-relaxed font-medium">
              The premier medical intelligence operating system for sovereign clinical practices. Built in Dubai for the world.
            </p>
          </div>
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-6">Platform</h4>
            <ul className="space-y-4">
              {['Pricing', 'Privacy', 'Compliance', 'Security'].map(item => (
                <li key={item}><Link href="#" className="text-slate-500 hover:text-teal-400 text-sm transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-6">Connect</h4>
            <ul className="space-y-4">
              {['Contact Support', 'LinkedIn', 'Twitter', 'Service Health'].map(item => (
                <li key={item}><Link href="#" className="text-slate-500 hover:text-teal-400 text-sm transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">© 2026 ScribeAI Corp. Healthcare OS is a registered trademark.</p>
          <div className="flex gap-6">
             <span className="text-slate-700 text-[10px] font-black uppercase tracking-[0.2em] border border-slate-800 px-3 py-1 rounded-full">v1.2.0-STABLE</span>
             <span className="text-slate-700 text-[10px] font-black uppercase tracking-[0.2em] border border-slate-800 px-3 py-1 rounded-full">DHA CERTIFIED</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
