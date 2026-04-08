'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion'
import {
  Zap, ArrowRight, Check, ChevronDown,
  Brain, Ghost, Crosshair, Radio, Shield,
  Search, Send, MessageSquare, FileText,
  Star, Menu, X, BarChart3, TrendingUp,
  Activity, Upload, ShieldCheck, Rocket,
  Users, Mail, Calendar, Target, Sparkles,
  Clock, Globe, Lock, Cpu, Eye, Bot,
  ChevronRight, Plus, Minus
} from 'lucide-react'

/* ═══════════════════════════════════════════
   DESIGN TOKENS — ToDesktop 1:1 clone
   ═══════════════════════════════════════════ */
const C = {
  // Colors
  blue: '#0036ff',
  dark: '#0a0a0b',
  darkPanel: '#18181b',
  lightBg: '#e8ecf4',
  white: '#ffffff',
  textDark: '#0a0a0b',
  textMuted: '#666666',
  textLight: 'rgba(255,255,255,0.55)',
  textLighter: 'rgba(255,255,255,0.4)',
  border: 'rgba(0,0,0,0.06)',
  borderDark: 'rgba(255,255,255,0.08)',
  // Layout
  maxW: '1200px',
  pad: 'clamp(24px, 5vw, 80px)',
}

/* ═══ Agent data ═══ */
const agents = [
  { name: 'Cortex', icon: Brain, desc: 'Lead Discovery & Research', color: '#3B82F6', detail: 'Finds 50 qualified leads every morning using Apollo & Hunter. Each lead is scored 1–100 by Claude AI.' },
  { name: 'Specter', icon: Ghost, desc: 'Email Outreach Sequences', color: '#5B5BD6', detail: 'Writes and sends hyper-personalized cold email sequences. Every email is unique to each prospect.' },
  { name: 'Striker', icon: Crosshair, desc: 'Pipeline & Reply Management', color: '#8B5CF6', detail: 'Handles replies, books meetings, and manages your pipeline. Hot leads never slip through the cracks.' },
  { name: 'Pulse', icon: Radio, desc: 'Content Creation Engine', color: '#14B8A6', detail: 'Creates weekly LinkedIn posts and social content — thought leadership on autopilot.' },
  { name: 'Sentinel', icon: Shield, desc: 'Monitoring & Alerts', color: '#22C55E', detail: 'Monitors all systems 24/7. If anything breaks, you know instantly. Zero downtime.' },
]

const steps = [
  { icon: Upload, title: 'Connect your tools', desc: 'Link Apollo, Hunter, Gmail and Claude in under 10 minutes.' },
  { icon: ShieldCheck, title: 'Configure your ICP', desc: 'Define your ideal customer profile and let AI do the rest.' },
  { icon: Rocket, title: 'Launch your agents', desc: 'All five agents activate simultaneously. Growth begins.' },
]

const features = [
  { title: 'Autonomous Lead Discovery', desc: 'Cortex scans Apollo.io every morning to find 50 fresh, qualified leads matching your ICP. Each lead is verified through Hunter.io and scored by Claude AI.', icon: Search, wide: false },
  { title: 'AI-Powered Outreach', desc: 'Specter crafts hyper-personalized cold emails using Claude AI. Each email is unique — no templates, no spam. Auto follow-ups on day 3 and 7.', icon: Send, wide: false },
  { title: 'Smart Reply Handler', desc: 'Striker classifies replies as interested, not interested, or out of office. Hot leads get instant follow-up. Meetings are booked automatically.', icon: MessageSquare, wide: true },
  { title: 'Content on Autopilot', desc: 'Pulse generates weekly thought leadership posts for LinkedIn. Tailored to your industry. Builds authority while you sleep.', icon: FileText, wide: false },
  { title: 'Always-On Monitoring', desc: 'Sentinel watches your entire system 24/7. API failures, workflow errors, quota limits — you get alerted before they become problems.', icon: Eye, wide: false },
  { title: 'Full Analytics Dashboard', desc: 'Track leads discovered, emails sent, reply rates, meetings booked, and pipeline value. All in real-time. All in one place.', icon: BarChart3, wide: true },
]

const pricing = [
  { name: 'Solo', price: '$199', period: '/ Month', desc: 'For solo founders getting started.', highlight: false, includes: 'SOLO PLAN INCLUDES:', features: ['Any 2 agents', '500 leads/month', '1,000 emails/month', 'Basic analytics', 'Email support'] },
  { name: 'Team', price: '$399', period: '/ Month', desc: 'For growing sales teams.', highlight: true, includes: 'EVERYTHING IN SOLO, PLUS:', features: ['All 5 agents', '2,000 leads/month', 'Unlimited emails', 'Full analytics + reporting', 'Content generation', 'Priority Slack support'] },
  { name: 'Studio', price: '$799', period: '/ Month', desc: 'For agencies and advanced teams.', highlight: false, includes: 'EVERYTHING IN TEAM, PLUS:', features: ['Unlimited leads', 'Unlimited emails', 'White-label branding', 'API access', 'Dedicated account manager', 'Custom onboarding'] },
]

const faqs = [
  { q: 'Is AXON right for me?', a: 'Yes, if you want to automate your sales pipeline, outreach, and content. AXON handles everything from lead discovery to meeting booking — all autonomously.' },
  { q: 'Do you collect data about my customers?', a: 'We store lead data in your Supabase database with Row Level Security. Your data is yours. We never share it with third parties.' },
  { q: 'Can I try AXON without buying?', a: 'Yes! All plans include a 7-day free trial. No credit card required. Cancel anytime before the trial ends.' },
  { q: 'What support do you offer?', a: 'Solo: Email support. Team: Private Slack channel. Studio: Dedicated account manager, custom onboarding, and priority response SLAs.' },
  { q: 'How accurate are the leads?', a: 'Cortex uses Apollo.io for sourcing and Hunter.io for email verification, achieving 96%+ deliverability. Each lead is scored by Claude AI.' },
  { q: 'Can I migrate from my current tools?', a: 'Absolutely. AXON integrates with your existing CRM and email tools. We provide migration assistance for Studio plan customers.' },
  { q: 'Does AXON send emails automatically?', a: 'Yes. Specter writes and sends personalized cold email sequences using Claude AI. Every email is unique. Follow-ups are automatic.' },
  { q: 'Can I white-label AXON for my clients?', a: 'Yes! Studio plan includes full white-labeling — custom domain, your branding, client dashboards, and API access.' },
  { q: 'How long does setup take?', a: 'Under 10 minutes. Connect your APIs, configure your ICP, and your agents start working immediately.' },
]

/* ═══ Shared Styles ═══ */
const sectionPad = { maxWidth: C.maxW, margin: '0 auto', paddingLeft: C.pad, paddingRight: C.pad }

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
  padding: '14px 28px', borderRadius: '12px', background: C.blue, color: 'white',
  fontWeight: 600, fontSize: '16px', fontFamily: "'Inter', sans-serif",
  border: 'none', cursor: 'pointer', textDecoration: 'none',
  boxShadow: '0 1px 2px -0.5px rgba(255,255,255,0.12) inset, 0 0.5px 0.5px rgba(255,255,255,0.16) inset, 0 8px 24px -4px rgba(255,255,255,0.16) inset, 0 8px 8px -3px rgba(0,0,0,0.03)',
  transition: 'all 0.3s cubic-bezier(0.6,0.6,0,1)',
}

const btnDark: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
  padding: '14px 28px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.04)',
  color: 'rgba(255,255,255,0.9)', fontWeight: 500, fontSize: '16px', fontFamily: "'Inter', sans-serif",
  border: 'none', cursor: 'pointer', textDecoration: 'none',
  boxShadow: '0 -4px 12px -4px rgba(255,255,255,0.08) inset, 0 1px 3px rgba(255,255,255,0.06) inset',
  transition: 'all 0.2s cubic-bezier(0.6,0.6,0,1)',
}

const btnLight: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
  padding: '14px 28px', borderRadius: '12px', background: 'rgba(255,255,255,0.96)',
  color: C.textDark, fontWeight: 600, fontSize: '16px', fontFamily: "'Inter', sans-serif",
  border: 'none', cursor: 'pointer', textDecoration: 'none',
  boxShadow: '0 8px 8px -3px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.04)',
  transition: 'all 0.3s cubic-bezier(0.6,0.6,0,1)',
}

const bentoCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.7)', border: `1px solid ${C.border}`,
  borderRadius: '24px', padding: '40px', overflow: 'hidden', position: 'relative',
  transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
}

const lightSection: React.CSSProperties = {
  background: 'linear-gradient(180deg, #e8ecf4 0%, #dfe4ed 50%, #e2e6ef 100%)',
}

/* ═══ FAQ Item ═══ */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      onClick={() => setOpen(!open)}
      style={{
        background: 'rgba(255,255,255,0.7)', border: `1px solid ${C.border}`,
        borderRadius: '16px', padding: '24px 28px', cursor: 'pointer',
        transition: 'all 0.3s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <span style={{ fontSize: '15px', fontWeight: 500, color: '#1a1a1a', lineHeight: 1.5 }}>{q}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ flexShrink: 0 }}>
          <ChevronDown size={18} color="#999" />
        </motion.span>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} style={{ overflow: 'hidden' }}>
            <p style={{ marginTop: '16px', fontSize: '14px', color: '#666', lineHeight: 1.7 }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  return (
    <div style={{ background: C.dark, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>

      {/* ════════════════════════════════════════
         FLOATING NAVBAR — ToDesktop pill style
         ════════════════════════════════════════ */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        style={{
          position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 100, background: 'rgba(255,255,255,0.94)',
          backdropFilter: 'blur(20px) saturate(1.8)', WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
          borderRadius: '16px', padding: '10px 12px 10px 16px',
          display: 'flex', alignItems: 'center', gap: '8px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.04)',
          width: 'auto',
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', padding: '4px 8px', marginRight: '8px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,54,255,0.3)' }}>
            <Zap size={18} color="white" strokeWidth={2.5} />
          </div>
          <span style={{ fontWeight: 700, fontSize: '16px', color: C.textDark, letterSpacing: '-0.3px' }}>AXON</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          {['Agents', 'Features', 'Pricing', 'FAQ'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} style={{
              textDecoration: 'none', color: 'rgba(10,10,11,0.6)', fontSize: '14px',
              fontWeight: 500, padding: '8px 14px', borderRadius: '10px', transition: 'all 0.2s',
            }}>{item}</a>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '8px' }}>
          <Link href="/login" style={{ textDecoration: 'none', color: 'rgba(10,10,11,0.7)', fontWeight: 600, padding: '8px 16px', borderRadius: '10px', fontSize: '14px' }}>Log in</Link>
          <Link href="/signup" style={{ textDecoration: 'none', background: C.blue, color: 'white', fontWeight: 600, padding: '8px 18px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,54,255,0.3)', fontSize: '14px' }}>Sign up</Link>
        </div>
      </motion.nav>

      {/* ════════════════════════════════════════
         HERO — Dark + blue glow
         ════════════════════════════════════════ */}
      <section style={{
        position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center', overflow: 'hidden',
        background: `radial-gradient(ellipse 60% 50% at 50% 40%, rgba(0,54,255,0.15), transparent 70%), ${C.dark}`,
      }}>
        {/* Grid lines */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{
            position: 'absolute', inset: '-50%',
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '80px 80px', transform: 'perspective(500px) rotateX(60deg)', transformOrigin: 'center top',
          }} />
        </div>

        <div style={{ position: 'relative', zIndex: 2, maxWidth: C.maxW, paddingLeft: C.pad, paddingRight: C.pad, width: '100%' }}>

          {/* Logo icon */}
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.6 }} style={{ marginBottom: '32px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', margin: '0 auto', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={28} color="rgba(255,255,255,0.5)" />
            </div>
          </motion.div>

          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }} style={{ marginBottom: '32px' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '8px 20px', borderRadius: '100px',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              fontSize: '12px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)',
            }}>
              <Zap size={14} color={C.blue} /> AI BUSINESS OPERATING SYSTEM
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7 }} style={{
            fontSize: 'clamp(40px, 6vw, 76px)', fontWeight: 700, letterSpacing: '-3px', lineHeight: 1.05,
            color: 'white', marginBottom: '24px',
          }}>
            Five Agents. One System.{' '}
            <span style={{ display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle' }}>
              <span style={{
                display: 'inline-flex', width: 'clamp(44px, 5vw, 64px)', height: 'clamp(44px, 5vw, 64px)',
                borderRadius: '16px', background: `linear-gradient(135deg, ${C.blue}, #5B5BD6)`,
                alignItems: 'center', justifyContent: 'center', margin: '0 8px',
                boxShadow: '0 4px 20px rgba(0,54,255,0.4)',
              }}>
                <Bot size={32} color="white" />
              </span>
            </span>
            {' '}Zero Headcount.
          </motion.h1>

          {/* Subtitle */}
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6 }} style={{
            fontSize: 'clamp(16px, 1.8vw, 20px)', color: C.textLight,
            maxWidth: '600px', margin: '0 auto 40px', lineHeight: 1.6,
          }}>
            Deploy five autonomous AI agents that fully automate your sales, outreach, content, and monitoring.
          </motion.p>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.6 }} style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" style={btnPrimary}>Start free trial <ChevronRight size={18} /></Link>
            <a href="#features" style={btnDark}>See how it works</a>
          </motion.div>

          {/* 3 Steps */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.6 }} style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px',
            maxWidth: '800px', margin: '80px auto 0',
          }}>
            {steps.map((step, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '14px', margin: '0 auto 16px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <step.icon size={22} color="rgba(255,255,255,0.5)" />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'white', marginBottom: '6px' }}>{step.title}</h4>
                <p style={{ fontSize: '13px', color: C.textLighter, lineHeight: 1.5 }}>{step.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════
         DASHBOARD PREVIEW — Blue gradient
         ════════════════════════════════════════ */}
      <section style={{
        padding: '80px 0 120px', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(180deg, #2b4cff 0%, #4466ff 50%, #5577ff 100%)',
      }}>
        <div style={sectionPad}>
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} style={{
            background: '#0f0f12', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)',
            padding: '24px', boxShadow: '0 40px 120px rgba(0,0,0,0.5)', maxWidth: '900px', margin: '0 auto',
          }}>
            {/* Window chrome */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#febc2e' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28c840' }} />
              <span style={{ marginLeft: '12px', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>AXON Dashboard</span>
            </div>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              {[{ label: 'Leads Today', value: '47', change: '+12%', color: '#3B82F6' }, { label: 'Emails Sent', value: '184', change: '+8%', color: '#5B5BD6' }, { label: 'Meetings', value: '6', change: '+33%', color: '#22C55E' }].map((s, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>{s.label}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '28px', fontWeight: 700, color: 'white' }}>{s.value}</span>
                    <span style={{ fontSize: '13px', color: s.color, fontWeight: 600 }}>{s.change}</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Agent Status */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {agents.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '8px 14px', border: '1px solid rgba(255,255,255,0.06)', flex: '1 1 auto' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: a.color, animation: 'pulse-live 2s ease-in-out infinite' }} />
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{a.name}</span>
                  <span style={{ fontSize: '11px', color: a.color, marginLeft: 'auto' }}>Active</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════
         SOCIAL PROOF — "Powering growth for..."
         ════════════════════════════════════════ */}
      <section style={{ background: 'linear-gradient(180deg, #5577ff 0%, #e8ecf4 30%)', padding: '100px 0 80px' }}>
        <div style={{ ...sectionPad, textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '8px 20px', borderRadius: '100px',
              background: 'rgba(0,54,255,0.08)', border: '1px solid rgba(0,54,255,0.15)',
              fontSize: '12px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase',
              color: C.blue, marginBottom: '24px',
            }}>
              💙 TRUSTED BY TEAMS WORLDWIDE
            </div>
            <h2 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 700, letterSpacing: '-2px', color: C.textDark, lineHeight: 1.1, marginBottom: '60px' }}>
              Powering growth for<br />ambitious companies
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', maxWidth: '700px', margin: '0 auto' }}>
              {['Acme Corp', 'Globex', 'Initech', 'Umbrella', 'Stark', 'Wayne', 'Oscorp', 'LexCorp'].map((name, i) => (
                <div key={i} style={{
                  width: '72px', height: '72px', borderRadius: '18px',
                  background: `hsl(${220 + i * 25}, 70%, ${45 + i * 5}%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, fontSize: '18px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}>{name.charAt(0)}</div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════
         AGENTS — "Command Center" Dark Section
         Premium orbital design with animated connections
         ════════════════════════════════════════ */}
      <section id="agents" style={{
        background: C.dark, position: 'relative', overflow: 'hidden', padding: '140px 0 120px',
      }}>
        {/* Ambient background glow */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,54,255,0.08) 0%, transparent 70%)', top: '10%', left: '50%', transform: 'translateX(-50%)' }} />
          <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,91,214,0.06) 0%, transparent 70%)', bottom: '10%', left: '20%' }} />
          <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.05) 0%, transparent 70%)', bottom: '20%', right: '15%' }} />
          {/* Subtle grid */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        <div style={{ ...sectionPad, position: 'relative', zIndex: 2 }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px',
                borderRadius: '100px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                fontSize: '12px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.5)', marginBottom: '24px',
              }}>
                <Cpu size={14} color={C.blue} /> COMMAND CENTER
              </div>
              <h2 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 700, letterSpacing: '-3px', color: 'white', lineHeight: 1.05, marginBottom: '20px' }}>
                Five agents.{' '}
                <span style={{ background: `linear-gradient(135deg, ${C.blue}, #5B5BD6, #14B8A6)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  One brain.
                </span>
              </h2>
              <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.45)', maxWidth: '550px', margin: '0 auto', lineHeight: 1.6 }}>
                Your autonomous AI workforce — each agent specializes in one domain, all synchronized through AXON&apos;s intelligence layer.
              </p>
            </motion.div>
          </div>

          {/* ── Orbital Hub Visualization ── */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }} style={{ position: 'relative', maxWidth: '700px', margin: '0 auto 100px', height: '400px' }}>
            {/* Center Hub */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: '120px', height: '120px', borderRadius: '30px',
              background: `linear-gradient(135deg, ${C.blue}, #2244dd)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
              boxShadow: `0 0 60px rgba(0,54,255,0.3), 0 0 120px rgba(0,54,255,0.15), inset 0 1px 1px rgba(255,255,255,0.2)`,
              zIndex: 10,
            }}>
              <Zap size={32} color="white" strokeWidth={2} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginTop: '4px', letterSpacing: '1px' }}>AXON</span>
            </div>

            {/* Orbital rings */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: '320px', height: '320px', borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.06)',
            }} />
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: '500px', height: '320px', borderRadius: '50%',
              border: '1px dashed rgba(255,255,255,0.04)',
            }} />

            {/* Agent nodes positioned around hub */}
            {agents.map((agent, i) => {
              const positions = [
                { top: '2%', left: '50%', tx: '-50%', ty: '0' },
                { top: '25%', left: '95%', tx: '-50%', ty: '-50%' },
                { top: '75%', left: '88%', tx: '-50%', ty: '-50%' },
                { top: '75%', left: '12%', tx: '-50%', ty: '-50%' },
                { top: '25%', left: '5%', tx: '-50%', ty: '-50%' },
              ]
              const pos = positions[i]
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.15, duration: 0.5, type: 'spring', stiffness: 200 }}
                  style={{
                    position: 'absolute', top: pos.top, left: pos.left,
                    transform: `translate(${pos.tx}, ${pos.ty})`,
                    zIndex: 5,
                  }}
                >
                  <div style={{
                    width: '80px', height: '80px', borderRadius: '22px',
                    background: `linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))`,
                    border: `1px solid ${agent.color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                    backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                    boxShadow: `0 0 30px ${agent.color}20, 0 8px 32px rgba(0,0,0,0.3)`,
                    cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
                  }}>
                    <agent.icon size={24} color={agent.color} strokeWidth={1.5} />
                    <span style={{ fontSize: '9px', fontWeight: 600, color: agent.color, marginTop: '4px', letterSpacing: '0.5px' }}>{agent.name.toUpperCase()}</span>
                  </div>
                  {/* Pulse ring */}
                  <div style={{
                    position: 'absolute', inset: '-4px', borderRadius: '26px',
                    border: `1px solid ${agent.color}30`,
                    animation: `pulse-ring 3s ease-in-out infinite ${i * 0.6}s`,
                  }} />
                </motion.div>
              )
            })}

            {/* Connection lines (SVG) */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              <defs>
                <linearGradient id="line-grad-0" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0036ff" stopOpacity="0.1" />
                </linearGradient>
                <linearGradient id="line-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#5B5BD6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0036ff" stopOpacity="0.1" />
                </linearGradient>
                <linearGradient id="line-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0036ff" stopOpacity="0.1" />
                </linearGradient>
                <linearGradient id="line-grad-3" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0036ff" stopOpacity="0.1" />
                </linearGradient>
                <linearGradient id="line-grad-4" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22C55E" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0036ff" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              {/* Lines from each node to center */}
              {[
                { x1: '50%', y1: '12%', x2: '50%', y2: '44%' },
                { x1: '90%', y1: '25%', x2: '56%', y2: '46%' },
                { x1: '84%', y1: '72%', x2: '56%', y2: '54%' },
                { x1: '16%', y1: '72%', x2: '44%', y2: '54%' },
                { x1: '10%', y1: '25%', x2: '44%', y2: '46%' },
              ].map((line, i) => (
                <line key={i} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
                  stroke={`url(#line-grad-${i})`} strokeWidth="1.5" strokeDasharray="6 4" />
              ))}
            </svg>
          </motion.div>

          {/* ── Agent Detail Cards — Horizontal scroll strip ── */}
          <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '20px', scrollSnapType: 'x mandatory' }}>
            {agents.map((agent, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                style={{
                  flex: '0 0 300px', scrollSnapAlign: 'start',
                  background: `linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))`,
                  backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '24px', padding: '32px', position: 'relative', overflow: 'hidden',
                  cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
                }}
              >
                {/* Top gradient stripe */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                  background: `linear-gradient(90deg, transparent, ${agent.color}, transparent)`,
                }} />

                {/* Ambient glow */}
                <div style={{
                  position: 'absolute', top: '-30px', right: '-30px',
                  width: '120px', height: '120px', borderRadius: '50%',
                  background: `radial-gradient(circle, ${agent.color}15, transparent 70%)`,
                  filter: 'blur(20px)',
                }} />

                {/* Icon + Status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', position: 'relative' }}>
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '16px',
                    background: `${agent.color}15`,
                    border: `1px solid ${agent.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <agent.icon size={24} color={agent.color} strokeWidth={1.5} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                      width: '6px', height: '6px', borderRadius: '50%', background: agent.color,
                      boxShadow: `0 0 8px ${agent.color}`,
                    }} />
                    <span style={{ fontSize: '11px', fontWeight: 600, color: agent.color, letterSpacing: '0.5px' }}>ACTIVE</span>
                  </div>
                </div>

                {/* Name */}
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'white', marginBottom: '4px', letterSpacing: '-0.5px' }}>
                  {agent.name}
                </h3>
                <p style={{ fontSize: '13px', color: agent.color, fontWeight: 500, marginBottom: '14px' }}>
                  {agent.desc}
                </p>

                {/* Description */}
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginBottom: '20px' }}>
                  {agent.detail}
                </p>

                {/* Bottom metric bar */}
                <div style={{
                  background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '12px 16px',
                  border: '1px solid rgba(255,255,255,0.04)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Performance</span>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[...Array(5)].map((_, j) => (
                      <div key={j} style={{
                        width: '16px', height: '6px', borderRadius: '3px',
                        background: j < 4 ? agent.color : 'rgba(255,255,255,0.06)',
                        opacity: j < 4 ? 0.3 + j * 0.2 : 1,
                      }} />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Agent flow pipeline */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} style={{
            marginTop: '80px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.06)', padding: '40px',
          }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
                AUTONOMOUS PIPELINE
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0', flexWrap: 'wrap' }}>
              {agents.map((agent, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    background: `${agent.color}10`, border: `1px solid ${agent.color}25`,
                    borderRadius: '12px', padding: '10px 18px',
                  }}>
                    <agent.icon size={16} color={agent.color} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: agent.color }}>{agent.name}</span>
                  </div>
                  {i < agents.length - 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px' }}>
                      <div style={{ width: '24px', height: '1px', background: 'rgba(255,255,255,0.15)' }} />
                      <ChevronRight size={14} color="rgba(255,255,255,0.2)" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════
         FEATURES — Dark staggered grid with spotlight glows
         Premium interactive cards with mesh backgrounds
         ════════════════════════════════════════ */}
      <section id="features" style={{
        background: `linear-gradient(180deg, ${C.dark} 0%, #0d0d12 50%, #0f0f15 100%)`,
        position: 'relative', overflow: 'hidden', padding: '120px 0 140px',
      }}>
        {/* Mesh background */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,54,255,0.06) 0%, transparent 70%)', top: '20%', right: '-5%' }} />
          <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)', bottom: '10%', left: '-5%' }} />
        </div>

        <div style={{ ...sectionPad, position: 'relative', zIndex: 2 }}>
          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px',
                borderRadius: '100px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                fontSize: '12px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.5)', marginBottom: '24px',
              }}>
                <Sparkles size={14} color={C.blue} /> CAPABILITIES
              </div>
              <h2 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 700, letterSpacing: '-3px', color: 'white', lineHeight: 1.05, marginBottom: '20px' }}>
                Everything you need.{' '}
                <span style={{ color: 'rgba(255,255,255,0.3)' }}>Nothing you don&apos;t.</span>
              </h2>
              <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.4)', maxWidth: '550px', margin: '0 auto', lineHeight: 1.6 }}>
                Each capability is powered by AI and runs autonomously — no manual intervention required.
              </p>
            </motion.div>
          </div>

          {/* Staggered Feature Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {features.map((feat, i) => {
              const gradients = [
                'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(59,130,246,0.02))',
                'linear-gradient(135deg, rgba(91,91,214,0.08), rgba(91,91,214,0.02))',
                'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(0,54,255,0.03))',
                'linear-gradient(135deg, rgba(20,184,166,0.08), rgba(20,184,166,0.02))',
                'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.02))',
                'linear-gradient(135deg, rgba(0,54,255,0.08), rgba(139,92,246,0.03))',
              ]
              const accentColors = ['#3B82F6', '#5B5BD6', '#8B5CF6', '#14B8A6', '#22C55E', C.blue]
              const accent = accentColors[i]
              const isWide = feat.wide

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 3) * 0.12, duration: 0.7 }}
                  style={{
                    gridColumn: isWide ? '1 / -1' : 'auto',
                    background: gradients[i],
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '24px', padding: isWide ? '48px' : '40px',
                    position: 'relative', overflow: 'hidden',
                    cursor: 'pointer', transition: 'all 0.5s cubic-bezier(0.4,0,0.2,1)',
                  }}
                >
                  {/* Top-left spotlight glow */}
                  <div style={{
                    position: 'absolute', top: '-40px', left: '-40px',
                    width: '200px', height: '200px', borderRadius: '50%',
                    background: `radial-gradient(circle, ${accent}12, transparent 70%)`,
                    filter: 'blur(30px)',
                    transition: 'all 0.5s',
                  }} />

                  {/* Animated border accent line */}
                  <div style={{
                    position: 'absolute', top: 0, left: '32px', right: '32px', height: '1px',
                    background: `linear-gradient(90deg, transparent, ${accent}40, transparent)`,
                  }} />

                  <div style={isWide ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' } : {}}>
                    <div style={{ position: 'relative' }}>
                      {/* Icon container with glow ring */}
                      <div style={{
                        width: '56px', height: '56px', borderRadius: '18px', marginBottom: '24px',
                        background: `${accent}12`, border: `1px solid ${accent}25`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        position: 'relative',
                        boxShadow: `0 0 20px ${accent}10`,
                      }}>
                        <feat.icon size={24} color={accent} strokeWidth={1.5} />
                      </div>

                      {/* Title */}
                      <h3 style={{ fontSize: '22px', fontWeight: 700, color: 'white', marginBottom: '12px', letterSpacing: '-0.5px' }}>
                        {feat.title}
                      </h3>

                      {/* Description */}
                      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: isWide ? '500px' : 'none' }}>
                        {feat.desc}
                      </p>
                    </div>

                    {/* Wide cards get an extra visual element */}
                    {isWide && (
                      <div style={{
                        height: '200px', borderRadius: '16px',
                        background: `linear-gradient(135deg, ${accent}10, rgba(255,255,255,0.02))`,
                        border: `1px solid ${accent}15`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        position: 'relative', overflow: 'hidden',
                      }}>
                        <div style={{ position: 'absolute', width: '150px', height: '150px', borderRadius: '50%', background: `${accent}08`, filter: 'blur(40px)', top: '20%', right: '20%' }} />
                        <feat.icon size={48} color={accent} strokeWidth={1} style={{ opacity: 0.5, position: 'relative', zIndex: 1 }} />
                        {/* Floating data lines */}
                        <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px' }}>
                          {[...Array(3)].map((_, j) => (
                            <div key={j} style={{
                              height: '2px', marginBottom: '6px', borderRadius: '1px',
                              background: `linear-gradient(90deg, ${accent}30, transparent)`,
                              width: `${60 + j * 15}%`,
                            }} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom stats row for non-wide cards */}
                  {!isWide && (
                    <div style={{
                      marginTop: '28px', paddingTop: '20px',
                      borderTop: '1px solid rgba(255,255,255,0.04)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                        Fully autonomous
                      </span>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        background: `${accent}10`, borderRadius: '8px', padding: '4px 10px',
                        border: `1px solid ${accent}20`,
                      }}>
                        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: accent, boxShadow: `0 0 6px ${accent}` }} />
                        <span style={{ fontSize: '11px', color: accent, fontWeight: 600 }}>AI-Powered</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
         MID CTA — "Streamline your growth"
         ════════════════════════════════════════ */}
      <section style={{ ...lightSection, padding: '0 0 120px' }}>
        <div style={{ ...sectionPad, textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 700, letterSpacing: '-2px', color: C.textDark, lineHeight: 1.1, marginBottom: '20px' }}>
              Streamline your<br />growth infrastructure
            </h2>
            <p style={{ fontSize: '18px', color: '#666', maxWidth: '600px', margin: '0 auto 40px', lineHeight: 1.6 }}>
              AXON automates your lead discovery, outreach, pipeline management, and content creation. You focus on closing deals.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/signup" style={btnPrimary}>Start free trial <ChevronRight size={18} /></Link>
              <a href="#features" style={btnLight}>See documentation</a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════
         PRICING
         ════════════════════════════════════════ */}
      <section id="pricing" style={{ ...lightSection, padding: '80px 0 120px' }}>
        <div style={sectionPad}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 700, letterSpacing: '-2px', color: C.textDark, lineHeight: 1.1, marginBottom: '16px' }}>
                Choose a plan<br />that fits your needs
              </h2>
              <p style={{ fontSize: '16px', color: '#666' }}>
                All of our plans include a <strong style={{ color: C.textDark }}>7-day free trial</strong>.
              </p>
            </motion.div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {pricing.map((plan, i) => {
              const hl = plan.highlight
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} style={{
                  background: hl ? C.darkPanel : 'rgba(255,255,255,0.7)',
                  border: `1px solid ${hl ? 'rgba(255,255,255,0.08)' : C.border}`,
                  borderRadius: '24px', overflow: 'hidden', color: hl ? 'white' : C.textDark,
                }}>
                  {/* Header */}
                  <div style={{ padding: '32px 32px 24px', background: hl ? C.darkPanel : 'rgba(0,0,0,0.02)', borderBottom: `1px solid ${hl ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                    <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px', color: hl ? 'white' : C.textDark }}>{plan.name}</h3>
                    <p style={{ fontSize: '14px', color: hl ? 'rgba(255,255,255,0.5)' : '#888' }}>{plan.desc}</p>
                  </div>
                  {/* Price + Features */}
                  <div style={{ padding: '28px 32px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '20px' }}>
                      <span style={{ fontSize: '48px', fontWeight: 700, letterSpacing: '-2px', color: hl ? 'white' : C.textDark }}>{plan.price}</span>
                      <span style={{ fontSize: '15px', color: hl ? 'rgba(255,255,255,0.4)' : '#888' }}>{plan.period}</span>
                    </div>
                    <Link href="/signup" style={{
                      display: 'block', textAlign: 'center', padding: '14px', borderRadius: '12px',
                      fontWeight: 600, fontSize: '15px', textDecoration: 'none', marginBottom: '28px',
                      transition: 'all 0.3s',
                      ...(hl
                        ? { background: C.blue, color: 'white', boxShadow: '0 4px 16px rgba(0,54,255,0.3)' }
                        : { background: 'rgba(0,0,0,0.04)', color: C.textDark, border: '1px solid rgba(0,0,0,0.08)' }),
                    }}>Start free trial</Link>
                    <div style={{ borderTop: `1px dashed ${hl ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`, marginBottom: '20px', paddingTop: '20px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px', color: hl ? 'rgba(255,255,255,0.4)' : '#999', fontFamily: 'monospace' }}>{plan.includes}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {plan.features.map((feat, j) => (
                        <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Check size={16} color={C.blue} style={{ flexShrink: 0 }} />
                          <span style={{ fontSize: '14px', color: hl ? 'rgba(255,255,255,0.7)' : '#555' }}>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
         FAQ — 2-column
         ════════════════════════════════════════ */}
      <section id="faq" style={{ ...lightSection, padding: '0 0 120px' }}>
        <div style={sectionPad}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, letterSpacing: '-2px', color: C.textDark, lineHeight: 1.1 }}>
              Questions & answers
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {faqs.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
          </div>
          <p style={{ textAlign: 'center', marginTop: '48px', fontSize: '14px', color: '#888' }}>
            More questions? Visit our{' '}
            <a href="#" style={{ color: C.textDark, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '3px' }}>docs</a>
            {' '}or{' '}
            <a href="#" style={{ color: C.textDark, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '3px' }}>send us a message</a>
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════
         BOTTOM CTA
         ════════════════════════════════════════ */}
      <section style={{ ...lightSection, padding: '0 0 80px' }}>
        <div style={sectionPad}>
          <div style={{
            background: C.dark, borderRadius: '24px', padding: '80px 40px',
            position: 'relative', overflow: 'hidden', textAlign: 'center',
          }}>
            <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(0,54,255,0.15)', filter: 'blur(100px)', top: '-100px', left: '50%', transform: 'translateX(-50%)' }} />
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: 'white', letterSpacing: '-1.5px', marginBottom: '16px', position: 'relative', zIndex: 1 }}>
              Ready to deploy your AI workforce?
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', maxWidth: '500px', margin: '0 auto 32px', lineHeight: 1.6, position: 'relative', zIndex: 1 }}>
              Start your 7-day free trial. No credit card required.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
              <Link href="/signup" style={btnPrimary}>Start free trial <ChevronRight size={18} /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
         FOOTER — 4-column
         ════════════════════════════════════════ */}
      <footer style={{ ...lightSection, padding: '0 0 60px' }}>
        <div style={sectionPad}>
          {/* Top bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '40px', borderBottom: '1px solid rgba(0,0,0,0.08)', marginBottom: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={18} color="white" strokeWidth={2.5} />
              </div>
              <span style={{ fontWeight: 700, fontSize: '16px', color: C.textDark }}>AXON</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22C55E', animation: 'pulse-live 2s ease-in-out infinite' }} />
              <span style={{ fontSize: '14px', color: '#666' }}>All systems are operational</span>
            </div>
          </div>

          {/* Columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px', marginBottom: '60px' }}>
            {[
              { title: 'Product', links: [{ l: 'AI Agents', h: '#agents' }, { l: 'Features', h: '#features' }, { l: 'Pricing', h: '#pricing' }, { l: 'Dashboard', h: '/dashboard' }] },
              { title: 'Resources', links: [{ l: 'Documentation', h: '#' }, { l: 'API Reference', h: '#' }, { l: 'Changelog', h: '#' }, { l: 'Blog', h: '#' }] },
              { title: 'Legal', links: [{ l: 'Privacy Policy', h: '#' }, { l: 'Terms of Service', h: '#' }, { l: 'Security', h: '#' }, { l: 'Compliance', h: '#' }] },
              { title: 'Company', links: [{ l: 'About', h: '#' }, { l: 'Contact Sales', h: '#' }, { l: 'Twitter (𝕏)', h: '#' }, { l: 'LinkedIn', h: '#' }] },
            ].map((col, i) => (
              <div key={i}>
                <h4 style={{ fontSize: '13px', fontWeight: 500, color: '#999', marginBottom: '20px' }}>{col.title}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {col.links.map((link, j) => (
                    <a key={j} href={link.h} style={{ fontSize: '14px', color: '#333', textDecoration: 'none', transition: 'color 0.2s' }}>{link.l}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom */}
          <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#999' }}>© 2026 AXON, Inc.</span>
            <span style={{ fontSize: '13px', color: '#999' }}>AI Business Operating System</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
