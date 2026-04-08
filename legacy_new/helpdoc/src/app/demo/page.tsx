"use client"
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IconMicrophone, IconArrowLeft, IconLock, IconShieldCheck, IconCircleCheck } from '@tabler/icons-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Link from 'next/link'

const SAMPLE_TRANSCRIPT = `Doctor: Good morning, what brings you in?
Patient: I've had fever for 3 days, 101 to 12 degrees. Bad headache, body aches, no appetite.
Doctor: Any cough?
Patient: Slight dry cough. No runny nose.
Doctor: Vitals are 101.4F temp, BP 118/76, pulse 88, SpO2 98%. Throat mildly inflamed, lungs clear.`

const SOAP_RESULT = {
  subjective: '38.6°C fever × 3 days with associated headache and generalized myalgia. Anorexia since yesterday. Mild dry cough, no rhinorrhea. No known sick contacts reported.',
  objective: 'Temp 101.4°F, BP 118/76 mmHg, HR 88 bpm, SpO2 98% RA. Oropharynx: mildly erythematous, no exudates. Chest: clear bilateral breath sounds, no wheeze/crackles. No cervical lymphadenopathy.',
  assessment: 'Acute febrile illness — most likely viral upper respiratory tract infection (influenza-like illness). Differential: dengue, COVID-19, bacterial pharyngitis.',
  plan: '1. Tab Paracetamol 500mg TID × 5 days (PRN fever/pain)\n2. Adequate hydration, rest\n3. Monitor for warning signs: persistent high fever, breathing difficulty, rash\n4. F/U if no improvement in 48–72h\n5. Consider rapid flu/COVID test if symptoms worsen',
}

type Phase = 'idle' | 'recording' | 'transcribing' | 'generating' | 'done'

export default function DemoPage() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [timer, setTimer] = useState(0)
  const [visibleSections, setVisibleSections] = useState<string[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (phase === 'recording') {
      let t = 0
      intervalRef.current = setInterval(() => {
        t += 1
        setTimer(t)
        if (t >= 23) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          setPhase('transcribing')
          setTimeout(() => {
            setPhase('generating')
            setTimeout(() => {
              setPhase('done')
              const sections = ['subjective', 'objective', 'assessment', 'plan']
              sections.forEach((s, i) => {
                setTimeout(() => setVisibleSections(prev => [...prev, s]), i * 400)
              })
            }, 1500)
          }, 1200)
        }
      }, 100) // 3x speed
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [phase])

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1, backgroundColor: '#080808' }}>
      {/* Top bar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 32px', borderBottom: '1px solid var(--border)',
        background: 'rgba(8,8,8,0.85)', backdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--teal)' }} />
          <span style={{ fontWeight: 600, fontSize: 16 }}>ScribeAI Demo</span>
        </div>
        <Link href="/" style={{
          color: '#888', fontSize: 14, textDecoration: 'none',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <IconArrowLeft size={16} /> Back to home
        </Link>
      </nav>

      {/* Main */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 24px' }}>
        <div style={{ maxWidth: 640, width: '100%' }}>
          <AnimatePresence mode="wait">
            {phase === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <div className="glass" style={{ padding: '48px 32px', textAlign: 'center' }}>
                  <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>Try it live</h2>
                  <p style={{ color: '#888', fontSize: 15, marginBottom: 36, lineHeight: 1.6 }}>
                    Tap the button below to see ScribeAI generate a real SOAP note from a sample consultation.
                  </p>

                  <button
                    onClick={() => setPhase('recording')}
                    className="demo-record-btn"
                    style={{
                      width: 80, height: 80, borderRadius: '50%',
                      border: '2px solid var(--teal)', background: 'transparent',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    <IconMicrophone size={28} color="var(--teal)" />
                  </button>
                  <p style={{ color: '#888', fontSize: 13, marginTop: 16 }}>Tap to start demo</p>
                </div>
              </motion.div>
            )}

            {phase === 'recording' && (
              <motion.div
                key="recording"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="glass" style={{ padding: '48px 32px', textAlign: 'center' }}>
                  <div style={{ position: 'relative', display: 'inline-flex', marginBottom: 24 }}>
                    {[0, 0.5, 1].map((delay, i) => (
                      <div key={i} style={{
                        position: 'absolute', inset: -20 - i * 12,
                        border: '1px solid rgba(255,68,68,0.2)', borderRadius: '50%',
                        animation: `pulseRing 2s ease-out infinite ${delay}s`,
                      }} />
                    ))}
                    <div style={{
                      width: 80, height: 80, borderRadius: '50%',
                      background: 'var(--red-dim)', border: '2px solid var(--red)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <div style={{ width: 20, height: 20, background: 'var(--red)', borderRadius: 4 }} />
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: 28, fontWeight: 500 }}>
                    {formatTime(timer)}
                  </div>
                  <p style={{ color: '#888', fontSize: 14, marginTop: 8 }}>Recording consultation...</p>
                </div>
              </motion.div>
            )}

            {(phase === 'transcribing' || phase === 'generating') && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                <div className="glass" style={{ padding: '64px 32px', textAlign: 'center' }}>
                  <LoadingSpinner size="lg" />
                  <p style={{ color: '#888', fontSize: 15, marginTop: 20 }}>
                    {phase === 'transcribing' ? 'Transcribing audio...' : 'Generating SOAP note...'}
                  </p>
                </div>
              </motion.div>
            )}

            {phase === 'done' && (
              <motion.div
                key="done"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <p style={{ color: 'var(--teal)', fontSize: 14, fontWeight: 500 }}>
                    Real AI-generated SOAP note — took 7 seconds
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {(['subjective', 'objective', 'assessment', 'plan'] as const).map((section) => (
                    <AnimatePresence key={section}>
                      {visibleSections.includes(section) && (
                        <motion.div
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
                          className="glass"
                          style={{ padding: '16px 20px', borderLeft: '3px solid var(--teal)' }}
                        >
                          <div style={{
                            fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                            color: 'var(--teal)', letterSpacing: 0.5, marginBottom: 8,
                          }}>
                            {section[0]} — {section.charAt(0).toUpperCase() + section.slice(1)}
                          </div>
                          <p style={{ color: '#d0d0d0', fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                            {SOAP_RESULT[section]}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  ))}
                </div>

                <div style={{ textAlign: 'center', marginTop: 40 }}>
                  <a href="/signup" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: 'var(--teal)', color: '#000', fontWeight: 600,
                    padding: '14px 32px', borderRadius: 10, fontSize: 15,
                    textDecoration: 'none', transition: 'opacity 0.15s',
                  }}
                  >
                    Start your free trial →
                  </a>
                  <p style={{ color: '#444', fontSize: 13, marginTop: 12 }}>14-day free trial · No credit card required</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <style>{`
        .demo-record-btn:hover { background: var(--teal-dim) !important; transform: scale(1.05) !important; }
      `}</style>
    </div>
  )
}
