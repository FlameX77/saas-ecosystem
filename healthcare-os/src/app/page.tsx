'use client'

import Link from 'next/link'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import {
  Sparkles, TrendingUp, MessageSquare, BarChart3, Zap, Check,
  ArrowRight, Star, Shield, Clock, Users, ChevronDown,
  Activity, Phone, Mail, Globe, DollarSign, Workflow,
  KanbanSquare, RefreshCw, Target, Lock, LayoutDashboard,
} from 'lucide-react'

// ── Variants ──────────────────────────────────────────────────────────────────
const EASE = [0.21, 0.47, 0.32, 0.98] as const
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.65, delay: i * 0.08, ease: EASE },
  }),
}
const stagger = { visible: { transition: { staggerChildren: 0.09 } } }
const scaleIn = {
  hidden: { opacity: 0, scale: 0.93 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.55, ease: EASE } },
}

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ end, prefix = '', suffix = '', decimals = 0 }: {
  end: number; prefix?: string; suffix?: string; decimals?: number
}) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  useEffect(() => {
    if (!inView) return
    const dur = 2200
    const start = performance.now()
    const tick = (now: number) => {
      const pct = Math.min((now - start) / dur, 1)
      const ease = 1 - Math.pow(1 - pct, 3)
      setVal(parseFloat((end * ease).toFixed(decimals)))
      if (pct < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, end, decimals])
  return <span ref={ref}>{prefix}{decimals > 0 ? val.toFixed(decimals) : val.toLocaleString()}{suffix}</span>
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ children, className = '', id, style }: { children: React.ReactNode; className?: string; id?: string; style?: React.CSSProperties }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.section
      id={id}
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={stagger}
      className={className}
      style={style}
    >
      {children}
    </motion.section>
  )
}

// ── FAQ Item ──────────────────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div
      variants={fadeUp}
      className="rounded-2xl overflow-hidden cursor-pointer glass-card glass-card-hover"
      onClick={() => setOpen(o => !o)}
    >
      <div className="flex items-center justify-between px-6 py-5 gap-4">
        <span className="font-medium text-sm" style={{ color: '#E5E7EB' }}>{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25, ease: 'easeInOut' }} className="flex-shrink-0">
          <ChevronDown size={16} style={{ color: '#6B7280' }} />
        </motion.div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <p className="px-6 pb-5 text-sm leading-relaxed" style={{ color: '#9CA3AF' }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Data ──────────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: <Sparkles size={22} />, color: '#8B5CF6',
    title: 'AI-Powered Outreach',
    desc: 'Claude writes hyper-personalised recovery messages that sound human — mentioning the patient\'s name, procedure, and exact situation. Never generic. Never robotic.',
    large: true,
  },
  {
    icon: <MessageSquare size={22} />, color: '#2563EB',
    title: 'Multi-Channel Campaigns',
    desc: 'SMS, Email, and WhatsApp from one unified inbox. Smart sequences send the right message at the right time.',
    large: false,
  },
  {
    icon: <KanbanSquare size={22} />, color: '#10B981',
    title: 'Pipeline Kanban',
    desc: 'Drag leads from "New" to "Recovered". See your pipeline value in real time.',
    large: false,
  },
  {
    icon: <BarChart3 size={22} />, color: '#F59E0B',
    title: 'Revenue Analytics',
    desc: 'Track reply rates, recovery rates, and ROI per channel. Know exactly what\'s working.',
    large: false,
  },
  {
    icon: <Workflow size={22} />, color: '#06B6D4',
    title: 'Smart Sequences',
    desc: 'Build drip sequences that pause when a lead replies, escalate when they go quiet.',
    large: false,
  },
  {
    icon: <Activity size={22} />, color: '#EF4444',
    title: 'Real-time Activity',
    desc: 'Live feed of every reply, booking, and message sent. Your practice, always in sight.',
    large: true,
  },
]

const PLANS = [
  {
    name: 'Starter', price: 49, desc: 'Solo practitioners',
    features: ['100 contacts', '500 messages/mo', '50 AI generations', 'SMS + Email', 'Pipeline kanban', 'Basic analytics'],
    cta: 'Start Free Trial', highlight: false,
  },
  {
    name: 'Pro', price: 149, desc: 'Growing practices',
    features: ['500 contacts', '2,000 messages/mo', '200 AI generations', 'SMS + Email + WhatsApp', 'Advanced sequences', 'Full analytics', '5 team members', 'Priority support'],
    cta: 'Start Free Trial', highlight: true,
  },
  {
    name: 'Scale', price: 399, desc: 'Multi-location businesses',
    features: ['Unlimited contacts', 'Unlimited messages', 'Unlimited AI', 'All channels', 'Custom sequences', 'White-label reports', 'Unlimited team', 'Dedicated CSM'],
    cta: 'Contact Sales', highlight: false,
  },
]

const TESTIMONIALS = [
  { name: 'Dr. Sarah Kim', role: 'Founder, Bright Smiles Dental', avatar: 'SK', color: '#2563EB',
    quote: 'We recovered $28,000 in our first month. The AI messages are so natural — patients genuinely don\'t realise it\'s automated. It\'s changed how we run recalls.', rating: 5 },
  { name: 'Marcus Thompson', role: 'Owner, Elite Med Spa', avatar: 'MT', color: '#10B981',
    quote: 'Our no-show rate dropped from 34% to 11% in 6 weeks. The WhatsApp sequences are genuinely unreal. I wish we\'d found this two years ago.', rating: 5 },
  { name: 'Jennifer Walsh', role: 'Partner, Walsh & Associates Law', avatar: 'JW', color: '#8B5CF6',
    quote: 'Finally a tool built for service businesses, not a bloated generic CRM. Our pipeline went from chaos to crystal clear in under a week.', rating: 5 },
]

const FAQS = [
  { q: 'How does the AI personalise messages?', a: 'Revivo uses Claude by Anthropic. It reads each lead\'s profile — their name, service type, last appointment date, and any notes — then writes a message that sounds like it came directly from your practice. No templates, no merge tags, no robotic tone.' },
  { q: 'Which channels does Revivo support?', a: 'SMS (via Twilio), Email (via SendGrid), and WhatsApp Business. You can create multi-step sequences across all three, and the system pauses automatically when a lead replies.' },
  { q: 'Is my patient data secure?', a: 'All data is encrypted at rest and in transit. Revivo is built on Supabase with row-level security. We never share or sell your contact data, and you can export or delete everything at any time.' },
  { q: 'Can I try it without a credit card?', a: 'Yes — your 14-day free trial requires no payment details. You get full access to the Pro plan during the trial so you can see real results before committing.' },
  { q: 'What integrations are available?', a: 'Revivo connects with Stripe for billing, Twilio for SMS/WhatsApp, and SendGrid for email. Calendar and EHR integrations (Jane App, Cliniko, Mindbody) are on the roadmap.' },
]

const STATS = [
  { value: 2.3, prefix: '$', suffix: 'M+', label: 'Revenue recovered', decimals: 1 },
  { value: 67, suffix: '%', label: 'Avg no-show recovery rate', decimals: 0 },
  { value: 24, suffix: '%', label: 'Average reply rate', decimals: 0 },
]

const CHANNELS = [
  { icon: <Phone size={14} />, label: 'SMS' },
  { icon: <Mail size={14} />, label: 'Email' },
  { icon: <Globe size={14} />, label: 'WhatsApp' },
]

// ── Hero Mockup ───────────────────────────────────────────────────────────────
function HeroMockup() {
  const [typing, setTyping] = useState(false)
  const [sent, setSent] = useState(false)
  const msg = "Hi Sarah, Dr. Kim's office here — we noticed you missed your cleaning last Tuesday. We have an opening this Thursday at 2pm and would love to see you. Want me to reserve it?"

  useEffect(() => {
    const t1 = setTimeout(() => setTyping(true), 1800)
    const t2 = setTimeout(() => { setTyping(false); setSent(true) }, 3800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <motion.div
      variants={scaleIn}
      className="w-full max-w-lg mx-auto rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(13,17,30,0.9)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.07)',
        backdropFilter: 'blur(30px)',
      }}
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
        <div className="w-3 h-3 rounded-full" style={{ background: '#EF4444' }} />
        <div className="w-3 h-3 rounded-full" style={{ background: '#F59E0B' }} />
        <div className="w-3 h-3 rounded-full" style={{ background: '#10B981' }} />
        <div className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs" style={{ background: 'rgba(37,99,235,0.15)', color: '#93C5FD', border: '1px solid rgba(37,99,235,0.25)' }}>
          <Sparkles size={10} /> AI Generate
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Lead card */}
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)', color: '#fff' }}>SK</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: '#F9FAFB' }}>Sarah Kim</p>
            <p className="text-xs" style={{ color: '#6B7280' }}>Dental Checkup · Missed 14 days ago</p>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: 'rgba(239,68,68,0.15)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.25)' }}>Cold</span>
        </div>

        {/* Message preview */}
        <div className="p-3 rounded-xl" style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles size={11} style={{ color: '#93C5FD' }} />
            <span className="text-xs font-medium" style={{ color: '#93C5FD' }}>AI-generated message</span>
            {typing && (
              <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} className="text-xs" style={{ color: '#6B7280' }}>typing…</motion.span>
            )}
          </div>
          <AnimatePresence mode="wait">
            {!typing && !sent && (
              <motion.p key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs leading-relaxed" style={{ color: '#9CA3AF' }}>
                Generating personalised message...
              </motion.p>
            )}
            {(typing || sent) && (
              <motion.p key="message" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs leading-relaxed" style={{ color: '#D1D5DB' }}>
                {msg}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold btn-shimmer"
            style={{ color: '#fff' }}
          >
            {sent ? <><Check size={12} /> Sent via SMS</> : <><Phone size={12} /> Send via SMS</>}
          </motion.button>
          <button className="px-3 py-2 rounded-xl text-xs" style={{ background: 'rgba(255,255,255,0.05)', color: '#9CA3AF', border: '1px solid rgba(255,255,255,0.08)' }}>
            Edit
          </button>
        </div>

        {/* Bottom mini stats */}
        <div className="flex gap-2 pt-1">
          {[
            { label: 'Pipeline value', val: '$12,400', color: '#10B981' },
            { label: 'Reply rate', val: '26%', color: '#8B5CF6' },
            { label: 'Recovered', val: '8 leads', color: '#2563EB' },
          ].map(s => (
            <div key={s.label} className="flex-1 p-2 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-xs font-bold" style={{ color: s.color }}>{s.val}</p>
              <p style={{ fontSize: 9, color: '#4B5563', marginTop: 1 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [navScrolled, setNavScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{ background: 'var(--rv-bg)', color: 'var(--rv-text-1)', overflowX: 'hidden', fontFamily: 'var(--rv-font-body)' }}>

      {/* ── Background Orbs ── */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="orb-1" style={{
          position: 'absolute', top: '-15%', left: '40%',
          width: 900, height: 900, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.14) 0%, transparent 65%)',
          filter: 'blur(80px)',
        }} />
        <div className="orb-2" style={{
          position: 'absolute', top: '5%', right: '-8%',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 65%)',
          filter: 'blur(80px)',
        }} />
        <div className="orb-3" style={{
          position: 'absolute', bottom: '15%', left: '-5%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 65%)',
          filter: 'blur(80px)',
        }} />
        <div className="dot-grid absolute inset-0 opacity-40" />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Nav ── */}
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 max-w-screen-xl mx-auto transition-all duration-300"
          style={{
            background: navScrolled ? 'rgba(3,7,18,0.85)' : 'transparent',
            backdropFilter: navScrolled ? 'blur(20px)' : 'none',
            borderBottom: navScrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}>
              <RefreshCw size={14} style={{ color: '#fff' }} />
            </div>
            <span className="text-lg font-bold tracking-tight" style={{ color: '#F9FAFB', letterSpacing: '-0.03em' }}>Revivo</span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            {['Features', 'Pricing', 'FAQ'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`}
                className="px-3 py-1.5 rounded-lg text-sm transition-colors hover:text-white"
                style={{ color: '#9CA3AF' }}
              >{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm transition-colors hover:text-white" style={{ color: '#9CA3AF' }}>Login</Link>
            <Link href="/signup"
              className="btn-shimmer glow-blue flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ color: '#fff' }}
            >
              Get started <ArrowRight size={13} />
            </Link>
          </div>
        </motion.nav>

        {/* ── Hero ── */}
        <Section className="px-6 pt-16 pb-24 max-w-screen-xl mx-auto">
          {/* Badge */}
          <motion.div variants={fadeUp} className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium"
              style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.3)', color: '#93C5FD' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" style={{ animation: 'ping-slow 2s cubic-bezier(0,0,0.2,1) infinite' }} />
              New: WhatsApp sequences now live
              <ArrowRight size={11} />
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={fadeUp} className="text-center text-5xl md:text-7xl font-bold leading-[1.07] mb-6" style={{ fontFamily: 'var(--rv-font-display)', letterSpacing: '-0.03em', lineHeight: 1.07 }}>
            Recover the revenue<br />
            <span className="gradient-text">sitting in your pipeline</span>
          </motion.h1>

          {/* Sub */}
          <motion.p variants={fadeUp} className="text-center text-lg leading-relaxed mb-8 max-w-2xl mx-auto" style={{ color: 'var(--rv-text-2)' }}>
            Revivo uses Claude AI to write and send hyper-personalised follow-up messages to leads who ghosted, no-showed, or went cold — across SMS, Email, and WhatsApp.
          </motion.p>

          {/* Channel badges */}
          <motion.div variants={fadeUp} className="flex justify-center gap-2 mb-8">
            {CHANNELS.map(c => (
              <span key={c.label} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9CA3AF' }}>
                {c.icon} {c.label}
              </span>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 mb-4">
            <Link href="/signup"
              className="btn-shimmer glow-blue flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold transition-all"
              style={{ color: '#fff' }}
            >
              Start free trial <ArrowRight size={15} />
            </Link>
            <Link href="/dashboard"
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold transition-all hover:bg-white/5"
              style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#9CA3AF' }}
            >
              <LayoutDashboard size={15} /> View demo
            </Link>
          </motion.div>
          <motion.p variants={fadeUp} className="text-center text-xs mb-16" style={{ color: '#374151' }}>
            No credit card · 14-day free trial · Cancel anytime
          </motion.p>

          {/* Hero mockup */}
          <HeroMockup />
        </Section>

        {/* ── Marquee / social proof ── */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', overflow: 'hidden', padding: '16px 0' }}>
          <div className="marquee-track" style={{ gap: 0 }}>
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center" style={{ gap: 0 }}>
                {['Dental Clinics', 'Med Spas', 'Law Firms', 'Physiotherapy', 'Coaching', 'Chiropractic', 'Aesthetics', 'Mental Health', 'Veterinary', 'Orthodontics'].map(cat => (
                  <span key={cat} className="inline-flex items-center gap-2 text-sm whitespace-nowrap" style={{ color: '#4B5563', padding: '0 40px' }}>
                    <span className="w-1 h-1 rounded-full inline-block" style={{ background: '#1F2937', flexShrink: 0 }} />
                    {cat}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── Stats ── */}
        <Section className="px-6 py-24 max-w-screen-xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-3">
            <span className="text-xs font-medium uppercase tracking-widest" style={{ color: '#4B5563' }}>Trusted by 500+ practices worldwide</span>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
            {STATS.map((s, i) => (
              <motion.div key={s.label} variants={fadeUp} custom={i}
                className="flex flex-col items-center justify-center py-12 px-8 text-center"
                style={{ borderRight: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}
              >
                <p className="text-5xl font-bold mb-2 tabular" style={{ fontFamily: 'var(--rv-font-display)', letterSpacing: '-0.04em', color: 'var(--rv-text-1)' }}>
                  <Counter end={s.value} prefix={s.prefix} suffix={s.suffix} decimals={s.decimals} />
                </p>
                <p className="text-sm" style={{ color: '#6B7280' }}>{s.label}</p>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* ── Features ── */}
        <Section id="features" className="px-6 py-24 max-w-screen-xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-4">
            <span className="text-xs font-medium uppercase tracking-widest" style={{ color: '#4B5563' }}>Features</span>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-center text-4xl font-bold mb-3" style={{ fontFamily: 'var(--rv-font-display)', letterSpacing: '-0.025em' }}>
            Everything you need to recover revenue
          </motion.h2>
          <motion.p variants={fadeUp} className="text-center text-base mb-12" style={{ color: '#6B7280' }}>
            Built specifically for service businesses — not bolted onto a generic CRM
          </motion.p>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Row 1: large, small, small */}
            {[FEATURES[0]].map(f => (
              <motion.div key={f.title} variants={fadeUp}
                className="md:col-span-2 p-7 rounded-2xl glass-card glass-card-hover cursor-default"
              >
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-5 feature-icon-glow"
                  style={{ background: f.color + '18', color: f.color, border: `1px solid ${f.color}30` }}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#F9FAFB' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#9CA3AF' }}>{f.desc}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {['Patient name', 'Appointment type', 'Last visit date', 'Custom tone'].map(tag => (
                    <span key={tag} className="text-xs px-2.5 py-1 rounded-full" style={{ background: f.color + '12', color: f.color, border: `1px solid ${f.color}25` }}>{tag}</span>
                  ))}
                </div>
              </motion.div>
            ))}
            {[FEATURES[1]].map(f => (
              <motion.div key={f.title} variants={fadeUp}
                className="p-6 rounded-2xl glass-card glass-card-hover cursor-default"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 feature-icon-glow"
                  style={{ background: f.color + '18', color: f.color, border: `1px solid ${f.color}30` }}>
                  {f.icon}
                </div>
                <h3 className="font-semibold mb-2" style={{ color: '#F9FAFB' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#9CA3AF' }}>{f.desc}</p>
              </motion.div>
            ))}

            {/* Row 2: small, small, large */}
            {FEATURES.slice(2, 4).map(f => (
              <motion.div key={f.title} variants={fadeUp}
                className="p-6 rounded-2xl glass-card glass-card-hover cursor-default"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 feature-icon-glow"
                  style={{ background: f.color + '18', color: f.color, border: `1px solid ${f.color}30` }}>
                  {f.icon}
                </div>
                <h3 className="font-semibold mb-2" style={{ color: '#F9FAFB' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#9CA3AF' }}>{f.desc}</p>
              </motion.div>
            ))}
            {[FEATURES[5]].map(f => (
              <motion.div key={f.title} variants={fadeUp}
                className="md:col-span-1 p-6 rounded-2xl glass-card glass-card-hover cursor-default"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 feature-icon-glow"
                  style={{ background: f.color + '18', color: f.color, border: `1px solid ${f.color}30` }}>
                  {f.icon}
                </div>
                <h3 className="font-semibold mb-2" style={{ color: '#F9FAFB' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#9CA3AF' }}>{f.desc}</p>
              </motion.div>
            ))}
            {[FEATURES[4]].map(f => (
              <motion.div key={f.title} variants={fadeUp}
                className="md:col-span-2 p-6 rounded-2xl glass-card glass-card-hover cursor-default"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 feature-icon-glow"
                  style={{ background: f.color + '18', color: f.color, border: `1px solid ${f.color}30` }}>
                  {f.icon}
                </div>
                <h3 className="font-semibold mb-2" style={{ color: '#F9FAFB' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: '#9CA3AF' }}>{f.desc}</p>
                {/* Sequence preview */}
                <div className="flex items-center gap-2 flex-wrap">
                  {['Day 1: SMS', 'Day 3: Email', 'Day 7: WhatsApp', 'Day 14: Final SMS'].map((step, si) => (
                    <div key={step} className="flex items-center gap-2">
                      <span className="text-xs px-3 py-1 rounded-full" style={{ background: f.color + '12', color: f.color, border: `1px solid ${f.color}25` }}>{step}</span>
                      {si < 3 && <ArrowRight size={10} style={{ color: '#374151' }} />}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* ── How it works ── */}
        <Section className="px-6 py-24" style={{ background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="max-w-screen-xl mx-auto">
            <motion.div variants={fadeUp} className="text-center mb-4">
              <span className="text-xs font-medium uppercase tracking-widest" style={{ color: '#4B5563' }}>How it works</span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-center text-4xl font-bold mb-4" style={{ fontFamily: 'var(--rv-font-display)', letterSpacing: '-0.025em' }}>
              Up and running in minutes
            </motion.h2>
            <motion.p variants={fadeUp} className="text-center text-base mb-16" style={{ color: 'var(--rv-text-2)' }}>No complex setup. No dev resources needed.</motion.p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connector line */}
              <div className="hidden md:block absolute top-8 left-[22%] right-[22%] h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(37,99,235,0.4), rgba(139,92,246,0.4), transparent)' }} />

              {[
                { step: '01', icon: <Users size={20} />, color: '#2563EB', title: 'Import your leads', desc: 'Upload a CSV or connect your existing patient management system. We import everything in seconds.' },
                { step: '02', icon: <Sparkles size={20} />, color: '#8B5CF6', title: 'Claude writes the messages', desc: 'Our AI reads each lead\'s profile and crafts a personalised message. You review before anything sends.' },
                { step: '03', icon: <DollarSign size={20} />, color: '#10B981', title: 'Watch revenue recover', desc: 'Leads reply, book, and show up. Your pipeline fills. Track every dollar recovered in real time.' },
              ].map((s, i) => (
                <motion.div key={s.step} variants={fadeUp} custom={i} className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-1" style={{ background: s.color + '18', border: `1px solid ${s.color}30`, color: s.color }}>
                      {s.icon}
                    </div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: s.color, color: '#fff' }}>{i + 1}</span>
                  </div>
                  <h3 className="font-semibold mb-2" style={{ color: '#F9FAFB' }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#9CA3AF' }}>{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Testimonials ── */}
        <Section className="px-6 py-24 max-w-screen-xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-4">
            <span className="text-xs font-medium uppercase tracking-widest" style={{ color: '#4B5563' }}>Testimonials</span>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-center text-4xl font-bold mb-12 tracking-tight" style={{ letterSpacing: '-0.03em' }}>
            Practices that trust Revivo
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} variants={fadeUp} custom={i}
                className="p-6 rounded-2xl glass-card glass-card-hover flex flex-col gap-4"
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, j) => <Star key={j} size={13} fill="#F59E0B" color="#F59E0B" />)}
                </div>
                <p className="text-sm leading-relaxed flex-1" style={{ color: '#D1D5DB' }}>"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: t.color + '22', color: t.color, border: `1px solid ${t.color}40` }}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#F9FAFB' }}>{t.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* ── Pricing ── */}
        <Section id="pricing" className="px-6 py-24" style={{ background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="max-w-screen-xl mx-auto">
            <motion.div variants={fadeUp} className="text-center mb-4">
              <span className="text-xs font-medium uppercase tracking-widest" style={{ color: '#4B5563' }}>Pricing</span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-center text-4xl font-bold mb-3 tracking-tight" style={{ letterSpacing: '-0.03em' }}>
              Simple, transparent pricing
            </motion.h2>
            <motion.p variants={fadeUp} className="text-center text-base mb-12" style={{ color: '#6B7280' }}>
              Start free. Upgrade when you see results.
            </motion.p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {PLANS.map((p, i) => (
                <motion.div key={p.name} variants={fadeUp} custom={i}
                  className="relative rounded-2xl p-6 flex flex-col"
                  style={{
                    background: p.highlight ? 'rgba(37,99,235,0.08)' : 'rgba(255,255,255,0.02)',
                    border: p.highlight ? '1px solid rgba(37,99,235,0.4)' : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: p.highlight ? '0 0 40px rgba(37,99,235,0.12), inset 0 1px 0 rgba(255,255,255,0.06)' : 'none',
                  }}
                >
                  {p.highlight && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold"
                      style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)', color: '#fff' }}>
                      Most Popular
                    </div>
                  )}
                  <div className="mb-5">
                    <p className="font-semibold mb-0.5" style={{ color: '#F9FAFB' }}>{p.name}</p>
                    <p className="text-xs mb-3" style={{ color: '#6B7280' }}>{p.desc}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold tracking-tight" style={{ color: '#F9FAFB', letterSpacing: '-0.04em' }}>${p.price}</span>
                      <span className="text-sm" style={{ color: '#6B7280' }}>/mo</span>
                    </div>
                  </div>
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {p.features.map(f => (
                      <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: '#D1D5DB' }}>
                        <Check size={13} style={{ color: '#10B981', flexShrink: 0 }} /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup"
                    className="block w-full text-center py-3 rounded-xl text-sm font-semibold transition-all"
                    style={p.highlight
                      ? { background: 'linear-gradient(135deg, #2563EB, #4F46E5)', color: '#fff', boxShadow: '0 4px 20px rgba(37,99,235,0.3)' }
                      : { background: 'rgba(255,255,255,0.05)', color: '#9CA3AF', border: '1px solid rgba(255,255,255,0.1)' }
                    }
                  >
                    {p.cta}
                  </Link>
                </motion.div>
              ))}
            </div>
            <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-6 mt-10">
              {[
                { icon: <Shield size={14} />, text: 'SOC 2 compliant' },
                { icon: <Lock size={14} />, text: 'Data encrypted at rest' },
                { icon: <Clock size={14} />, text: '14-day free trial' },
                { icon: <RefreshCw size={14} />, text: 'Cancel anytime' },
              ].map(b => (
                <span key={b.text} className="flex items-center gap-1.5 text-xs" style={{ color: '#6B7280' }}>
                  {b.icon} {b.text}
                </span>
              ))}
            </motion.div>
          </div>
        </Section>

        {/* ── FAQ ── */}
        <Section id="faq" className="px-6 py-24 max-w-3xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-4">
            <span className="text-xs font-medium uppercase tracking-widest" style={{ color: '#4B5563' }}>FAQ</span>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-center text-4xl font-bold mb-12 tracking-tight" style={{ letterSpacing: '-0.03em' }}>
            Questions answered
          </motion.h2>
          <div className="space-y-3">
            {FAQS.map(f => <FAQItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </Section>

        {/* ── CTA Banner ── */}
        <Section className="px-6 py-2 pb-24 max-w-screen-xl mx-auto">
          <motion.div variants={scaleIn}
            className="rounded-3xl p-12 text-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(37,99,235,0.15) 0%, rgba(79,70,229,0.15) 50%, rgba(139,92,246,0.1) 100%)',
              border: '1px solid rgba(37,99,235,0.3)',
            }}
          >
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(circle at 50% -20%, rgba(37,99,235,0.2) 0%, transparent 60%)',
              pointerEvents: 'none',
            }} />
            <div style={{ position: 'relative' }}>
              <motion.div variants={fadeUp} className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(37,99,235,0.4)' }}>
                  <Zap size={22} style={{ color: '#60A5FA' }} />
                </div>
              </motion.div>
              <motion.h2 variants={fadeUp} className="text-4xl font-bold mb-4 tracking-tight" style={{ letterSpacing: '-0.03em' }}>
                Start recovering revenue today
              </motion.h2>
              <motion.p variants={fadeUp} className="text-base mb-8 max-w-md mx-auto" style={{ color: '#9CA3AF' }}>
                Join 500+ practices turning cold leads into booked appointments with AI.
              </motion.p>
              <motion.div variants={fadeUp}>
                <Link href="/signup"
                  className="btn-shimmer glow-blue inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold"
                  style={{ color: '#fff' }}
                >
                  Get started free <ArrowRight size={16} />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </Section>

        {/* ── Footer ── */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="px-8 py-12 max-w-screen-xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
              <div className="col-span-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}>
                    <RefreshCw size={14} style={{ color: '#fff' }} />
                  </div>
                  <span className="font-bold tracking-tight" style={{ letterSpacing: '-0.03em' }}>Revivo</span>
                </div>
                <p className="text-sm leading-relaxed max-w-xs" style={{ color: '#6B7280' }}>
                  AI-powered revenue recovery for service businesses. Recover the leads sitting in your pipeline.
                </p>
              </div>
              {[
                { heading: 'Product', links: ['Features', 'Pricing', 'Integrations', 'Changelog'] },
                { heading: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
                { heading: 'Legal', links: ['Privacy', 'Terms', 'Security', 'HIPAA'] },
              ].map(col => (
                <div key={col.heading}>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#374151' }}>{col.heading}</p>
                  <ul className="space-y-2.5">
                    {col.links.map(l => (
                      <li key={l}><a href="#" className="text-sm transition-colors hover:text-white" style={{ color: '#6B7280' }}>{l}</a></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-xs" style={{ color: '#374151' }}>© 2026 Revivo, Inc. All rights reserved.</p>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: '#374151' }}>
                <Sparkles size={11} />
                Powered by <span style={{ color: '#6B7280' }}>Claude AI</span>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </div>
  )
}
