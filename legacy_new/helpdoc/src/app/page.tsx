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
      style={{ padding: '100px 24px', maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', gap: 0, flexWrap: 'wrap' }}>
        {[
          { value: 3, suffix: ' hrs', label: 'saved per doctor daily' },
          { value: 8, suffix: ' sec', label: 'to generate a full SOAP note' },
          { value: 4, suffix: '', label: 'languages supported natively' },
        ].map((stat, i) => (
          <motion.div key={i} variants={fadeUp} style={{
            flex: '1 1 200px', textAlign: 'center', padding: '20px',
            borderRight: i < 2 ? '1px dotted rgba(255,255,255,0.1)' : undefined,
          }}>
            <div style={{ fontSize: 56, fontWeight: 600 }}>
              <CountUpNumber end={stat.value} suffix={stat.suffix} />
            </div>
            <p style={{ color: '#888', fontSize: 14, marginTop: 4 }}>{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

function HowItWorksSection() {
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '-60px' })
  const steps = [
    { icon: <IconMicrophone size={32} />, title: 'Record', desc: 'Start recording your consultation. ScribeAI listens and transcribes in real-time across 4 languages.' },
    { icon: <IconFileText size={32} />, title: 'Generate', desc: 'AI processes the transcript and generates a structured SOAP note in seconds — complete with prescriptions.' },
    { icon: <IconCheck size={32} />, title: 'Review & Save', desc: 'Review the generated note, make any edits, and save directly to the patient record. Export PDF or send via WhatsApp.' },
  ]
  return (
    <motion.section
      ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger}
      style={{ padding: '100px 24px', position: 'relative', zIndex: 1 }}
    >
      <motion.h2 variants={fadeUp} style={{ fontSize: 40, fontWeight: 600, textAlign: 'center', marginBottom: 8 }}>
        From consultation to notes
      </motion.h2>
      <motion.p variants={fadeUp} style={{ color: '#888', fontSize: 16, textAlign: 'center', marginBottom: 60 }}>
        No typing. No dictation. Just medicine.
      </motion.p>
      <div style={{ display: 'flex', gap: 16, maxWidth: 960, margin: '0 auto', flexWrap: 'wrap' }}>
        {steps.map((step, i) => (
          <motion.div
            key={i} variants={fadeUp}
            className={`glass ${i === 1 ? 'teal-glow' : ''}`}
            style={{
              flex: '1 1 280px', padding: 28, textAlign: 'center',
              borderColor: i === 1 ? 'var(--teal-border)' : undefined,
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: '50%', margin: '0 auto 16px',
              border: '1px solid var(--teal-border)', color: 'var(--teal)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'monospace', fontSize: 14,
            }}>{i + 1}</div>
            <div style={{ color: 'var(--teal)', marginBottom: 16, display: 'flex', justifyContent: 'center' }}>{step.icon}</div>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{step.title}</h3>
            <p style={{ color: '#888', fontSize: 14, lineHeight: 1.6 }}>{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

function TrustSection() {
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '-60px' })
  const cards = [
    { icon: <IconLock size={28} />, title: 'Your data is private', desc: 'Audio is processed and deleted automatically. Notes are stored encrypted. You own your data.' },
    { icon: <IconUserCheck size={28} />, title: 'AI-assisted, doctor-reviewed', desc: 'ScribeAI generates the draft. You review, edit, and approve every note before saving.' },
    { icon: <IconShieldLock size={28} />, title: 'Built for Gulf compliance', desc: 'Designed with DHA guidelines in mind. HIPAA-aware architecture. Data stored in region.' },
  ]
  return (
    <motion.section
      ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger}
      style={{ padding: '80px 24px', background: 'var(--bg-1)', position: 'relative', zIndex: 1 }}
    >
      <div style={{ display: 'flex', gap: 16, maxWidth: 960, margin: '0 auto', flexWrap: 'wrap' }}>
        {cards.map((card, i) => (
          <motion.div key={i} variants={fadeUp} className="glass" style={{ flex: '1 1 280px', padding: 28 }}>
            <div style={{ color: 'var(--teal)', marginBottom: 16 }}>{card.icon}</div>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{card.title}</h3>
            <p style={{ color: '#888', fontSize: 13, lineHeight: 1.6 }}>{card.desc}</p>
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
      ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger}
      style={{ padding: '100px 24px', position: 'relative', zIndex: 1 }}
    >
      <motion.h2 variants={fadeUp} style={{ fontSize: 40, fontWeight: 600, textAlign: 'center', marginBottom: 48 }}>
        Everything your clinic needs
      </motion.h2>
      <div className="bento-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 16, maxWidth: 960, margin: '0 auto',
      }}>
        <motion.div variants={fadeUp} className="glass bento-large" style={{
          padding: 32,
          background: 'linear-gradient(135deg, rgba(15,173,160,0.15), transparent)',
          borderColor: 'var(--teal-border)',
        }}>
          <div style={{ color: 'var(--teal)', marginBottom: 16 }}><IconMicrophone size={32} /></div>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Multilingual by default</h3>
          <p style={{ color: '#888', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
            The only medical scribe built for Gulf and South Asian clinical workflows. Switch language per consultation.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            {['EN', 'HI', 'AR', 'UR'].map(lang => (
              <span key={lang} style={{
                padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600,
                border: '1px solid var(--teal-border)', color: 'var(--teal)',
              }}>{lang}</span>
            ))}
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="glass" style={{ padding: 24 }}>
          <div style={{ color: 'var(--teal)', marginBottom: 12 }}><IconDownload size={24} /></div>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>PDF Export</h3>
          <p style={{ color: '#888', fontSize: 13, lineHeight: 1.5 }}>One click export of any note</p>
        </motion.div>

        <motion.div variants={fadeUp} className="glass" style={{ padding: 24 }}>
          <div style={{ color: 'var(--red)', marginBottom: 12 }}><IconAlertTriangle size={24} /></div>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Red Flag Alerts</h3>
          <p style={{ color: '#888', fontSize: 13, lineHeight: 1.5 }}>AI flags urgent symptoms automatically</p>
        </motion.div>

        <motion.div variants={fadeUp} className="glass" style={{ padding: 24 }}>
          <div style={{ color: 'var(--teal)', marginBottom: 12 }}><IconBrandWhatsapp size={24} /></div>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>WhatsApp Delivery</h3>
          <p style={{ color: '#888', fontSize: 13, lineHeight: 1.5 }}>Send note summary to patient instantly</p>
        </motion.div>

        <motion.div variants={fadeUp} className="glass" style={{ padding: 24 }}>
          <div style={{ color: 'var(--teal)', marginBottom: 12 }}><IconUsers size={24} /></div>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Multi-doctor</h3>
          <p style={{ color: '#888', fontSize: 13, lineHeight: 1.5 }}>Your whole clinic on one account</p>
        </motion.div>
      </div>
    </motion.section>
  )
}

function PricingSection() {
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '-60px' })
  const plans = [
    { name: 'Starter', price: '365', features: ['1 doctor', '100 consultations/mo', 'EN + 1 language', 'PDF export', 'Email support'] },
    { name: 'Growth', price: '730', popular: true, features: ['3 doctors', 'Unlimited consultations', 'All 4 languages', 'PDF + WhatsApp', 'Priority support', 'Analytics dashboard'] },
    { name: 'Clinic', price: '1,835', features: ['Unlimited doctors', 'Unlimited consultations', 'All 4 languages', 'Custom templates', 'API access', 'Dedicated account manager'] },
  ]
  return (
    <motion.section
      ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger}
      style={{ padding: '100px 24px', background: 'var(--bg-1)', position: 'relative', zIndex: 1 }}
    >
      <motion.h2 variants={fadeUp} style={{ fontSize: 40, fontWeight: 600, textAlign: 'center', marginBottom: 8 }}>
        Simple pricing
      </motion.h2>
      <motion.p variants={fadeUp} style={{ color: '#888', fontSize: 16, textAlign: 'center', marginBottom: 48 }}>
        14-day free trial. No credit card required.
      </motion.p>
      <div style={{ display: 'flex', gap: 16, maxWidth: 960, margin: '0 auto', flexWrap: 'wrap' }}>
        {plans.map((plan, i) => (
          <motion.div
            key={i} variants={fadeUp}
            className={`glass ${plan.popular ? 'teal-glow' : ''}`}
            style={{
              flex: '1 1 280px', padding: 28,
              borderColor: plan.popular ? 'var(--teal-border)' : undefined,
              position: 'relative',
              display: 'flex', flexDirection: 'column'
            }}
          >
            {plan.popular && (
              <span style={{
                position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                background: 'var(--teal)', color: '#000', fontSize: 11, fontWeight: 600,
                padding: '3px 12px', borderRadius: 100,
              }}>Most popular</span>
            )}
            <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', color: 'var(--teal)', marginBottom: 12 }}>
              {plan.name}
            </div>
            <div style={{ marginBottom: 4 }}>
              <span style={{ fontSize: 36, fontWeight: 600 }}>AED {plan.price}</span>
              <span style={{ color: '#888', fontSize: 14 }}>/mo</span>
            </div>
            <span style={{
              display: 'inline-block', width: 'fit-content',
              background: 'var(--teal-dim)', color: 'var(--teal)', fontSize: 12,
              padding: '3px 10px', borderRadius: 100, marginBottom: 20,
            }}>14-day free trial</span>
            <ul style={{ listStyle: 'none', marginBottom: 24, padding: 0, flexGrow: 1 }}>
              {plan.features.map((f, j) => (
                <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 14, color: '#888' }}>
                  <IconCheck size={16} color="var(--teal)" /> {f}
                </li>
              ))}
            </ul>
            <button style={{
              width: '100%', height: 44, borderRadius: 8, fontSize: 14, fontWeight: 600,
              background: plan.popular ? 'var(--teal)' : 'transparent',
              color: plan.popular ? '#000' : '#888',
              border: plan.popular ? 'none' : '1px solid var(--border)',
              cursor: 'pointer',
            }}>
              {plan.popular ? 'Start free trial' : 'Get started'}
            </button>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

// --- Main Page Component ---

export default function LandingPage() {
  return (
    <div style={{ position: 'relative', zIndex: 1, backgroundColor: '#080808' }}>
      {/* NAV */}
      <motion.nav
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'rgba(8,8,8,0.85)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)',
          height: 60, padding: '0 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--teal)' }} />
          <span style={{ fontWeight: 600, fontSize: 18 }}>ScribeAI</span>
        </div>
        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link href="/demo" style={{ color: '#888', fontSize: 14, textDecoration: 'none' }}>Live demo</Link>
          <a href="/login" style={{ color: '#888', fontSize: 14, textDecoration: 'none' }}>Login</a>
          <a href="/signup" style={{
            background: 'var(--teal)', color: '#000', fontWeight: 600,
            padding: '8px 18px', borderRadius: 8, fontSize: 14, textDecoration: 'none',
          }}>Get started</a>
        </div>
      </motion.nav>

      {/* HERO */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '80px 24px',
      }}>
        <div style={{ maxWidth: 720, width: '100%', textAlign: 'center' }}>
          {/* Announce pill */}
          <motion.div variants={scaleIn} initial="hidden" animate="visible" transition={{ delay: 0 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'var(--teal-dim)', border: '1px solid var(--teal-border)',
              color: 'var(--teal)', padding: '6px 16px', borderRadius: 100,
              fontSize: 13, marginBottom: 28,
            }}>
              ✦ Now available in UAE & India
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}
            style={{ fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 600, lineHeight: 1.1, marginBottom: 20 }}
          >
            The AI medical scribe<br />
            built for the{' '}
            <span style={{
              background: 'linear-gradient(90deg, #0FADA0, #7fffd4, #0FADA0)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'shimmer 3s linear infinite',
            }}>Gulf</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}
            style={{ fontSize: 18, color: '#888', maxWidth: 480, margin: '0 auto', lineHeight: 1.6, marginBottom: 32 }}
          >
            Record your consultation. ScribeAI writes the clinical note in 8 seconds.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.25 }}
            style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}
          >
            <a href="/signup" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'var(--teal)', color: '#000', fontWeight: 600,
              height: 48, padding: '0 28px', borderRadius: 10, fontSize: 15, textDecoration: 'none',
            }}>Start free trial →</a>
            <Link href="/demo" style={{
              display: 'inline-flex', alignItems: 'center',
              height: 48, padding: '0 28px', borderRadius: 10, fontSize: 15,
              border: '1px solid var(--border)', color: '#888', textDecoration: 'none',
              transition: 'all 0.15s',
            }}
            >See demo</Link>
          </motion.div>
          <p style={{ color: '#444', fontSize: 13, marginTop: 14 }}>14-day free trial · No credit card required</p>

          {/* Hero card */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.4 }}
            style={{ maxWidth: 680, margin: '60px auto 0' }}
          >
            <div className="glass teal-glow" style={{
              border: '1px solid rgba(15,173,160,0.2)',
              animation: 'float 4s ease-in-out infinite',
              overflow: 'hidden',
            }}>
              {/* Top bar */}
              <div style={{
                padding: '12px 20px', borderBottom: '1px solid var(--border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', background: 'var(--red)',
                    animation: 'pulseRing 2s ease-out infinite',
                  }} />
                  <span style={{ fontFamily: 'monospace', fontSize: 14 }}>Recording  0:47</span>
                </div>
                <span style={{
                  padding: '2px 10px', borderRadius: 100, fontSize: 12,
                  border: '1px solid var(--teal-border)', color: 'var(--teal)',
                }}>EN</span>
              </div>

              {/* Transcript */}
              <div style={{
                padding: '16px 20px', borderBottom: '1px solid var(--border)',
              }}>
                <p style={{
                  color: '#888', fontSize: 13, lineHeight: 1.7,
                  overflow: 'hidden', whiteSpace: 'nowrap',
                  borderRight: '2px solid #888',
                  width: '0', animation: 'typewriter 3s steps(90) 1s forwards, blink 0.7s step-end infinite',
                }}>
                  Patient: I&apos;ve had a fever for 3 days, around 101 to 102. Bad headache and body aches. No appetite since yesterday.
                </p>
                <style>{`
                  @keyframes typewriter { to { width: 100%; } }
                  @keyframes blink { 50% { border-color: transparent; } }
                `}</style>
              </div>

              {/* SOAP preview */}
              <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                {[
                  { label: 'S', title: 'Subjective', text: '38.8°C fever × 3 days, headache, myalgia...' },
                  { label: 'O', title: 'Objective', text: 'Temp 101.4°F, BP 118/76, SpO2 98%...' },
                  { label: 'A', title: 'Assessment', text: 'Viral fever, likely influenza...' },
                  { label: 'P', title: 'Plan', text: 'Tab Paracetamol 500mg TID × 5 days...' },
                ].map(({ label, title, text }) => (
                  <div key={label} style={{
                    background: 'var(--bg-2)', borderRadius: 8, padding: '10px 12px',
                    borderLeft: '3px solid var(--teal)', textAlign: 'left'
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--teal)', marginBottom: 4 }}>
                      {label} — {title}
                    </div>
                    <p style={{ fontSize: 12, color: '#a0a0a0', lineHeight: 1.5 }}>{text}</p>
                  </div>
                ))}
              </div>

              {/* Bottom bar */}
              <div style={{
                padding: '10px 20px', borderTop: '1px solid var(--border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ color: 'var(--teal)', fontSize: 13 }}>✓ Note generated in 6.2s</span>
                <button style={{
                  background: 'var(--teal)', color: '#000', fontWeight: 600,
                  padding: '6px 14px', borderRadius: 6, fontSize: 13, border: 'none',
                }}>Save to record</button>
              </div>
            </div>
          </motion.div>

          {/* Ticker */}
          <div style={{
            marginTop: 48,
            borderTop: '1px solid rgba(255,255,255,0.04)',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            padding: '14px 0', overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex', whiteSpace: 'nowrap',
              animation: 'marquee 25s linear infinite',
              color: '#444', fontSize: 13, letterSpacing: 0.5,
            }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <span key={i} style={{ marginRight: 48 }}>
                  GP Clinic · Dental · Dermatology · Paediatrics · Cardiology · Orthopaedics · Physiotherapy · ENT · Psychiatry ·
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <StatsSection />
      <HowItWorksSection />
      <TrustSection />
      <FeaturesBento />
      <PricingSection />

      {/* CTA BANNER */}
      <section style={{
        padding: '80px 24px', background: 'var(--teal)', textAlign: 'center',
        position: 'relative', overflow: 'hidden', zIndex: 1
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.05\'/%3E%3C/svg%3E")',
          pointerEvents: 'none',
        }} />
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 600, color: '#000', marginBottom: 12, position: 'relative' }}>
          Stop spending 3 hours on paperwork
        </h2>
        <p style={{ color: 'rgba(0,0,0,0.5)', fontSize: 18, marginBottom: 32, position: 'relative' }}>
          Join Gulf clinics using ScribeAI
        </p>
        <a href="/signup" style={{
          display: 'inline-flex', background: '#fff', color: '#000', fontWeight: 600,
          height: 48, padding: '0 32px', borderRadius: 10, fontSize: 15,
          textDecoration: 'none', alignItems: 'center', position: 'relative',
        }}>Get started free →</a>
      </section>

      {/* FOOTER */}
      <footer style={{
        padding: '40px 24px', borderTop: '1px solid var(--border)',
        background: 'var(--bg)', position: 'relative', zIndex: 1
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 16, maxWidth: 1100, margin: '0 auto',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--teal)' }} />
            <span style={{ fontWeight: 600, fontSize: 15 }}>ScribeAI</span>
            <span style={{ color: '#888', fontSize: 13, marginLeft: 8 }}>Built for UAE & India</span>
          </div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {['Pricing', 'Login', 'Contact'].map(link => (
              <a key={link} href="#" style={{ color: '#888', fontSize: 14, textDecoration: 'none' }}>{link}</a>
            ))}
          </div>
          <span style={{ color: '#888', fontSize: 13 }}>hello@scribeai.io</span>
        </div>
        <p style={{ color: '#444', fontSize: 12, textAlign: 'center', marginTop: 24 }}>© 2025 ScribeAI</p>
      </footer>
      <style>{`
        @media (max-width: 640px) {
          .nav-links { display: none !important; }
        }
        .bento-grid > div { min-height: 180px; }
        .bento-large { grid-column: span 2; }
        @media (max-width: 768px) {
          .bento-large { grid-column: span 1; }
        }
      `}</style>
    </div>
  )
}
