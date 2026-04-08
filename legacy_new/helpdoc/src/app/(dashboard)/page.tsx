"use client"
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  IconMicrophone, IconFileText, IconClock, IconCalendar,
  IconAlertTriangle, IconBrandWhatsapp, IconDownload, IconCheck,
  IconX, IconWaveSine, IconLock, IconShieldCheck,
} from '@tabler/icons-react'
import GlassCard from '@/components/ui/GlassCard'
import { Badge } from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Skeleton } from '@/components/ui/Skeleton'
import { fadeUp, scaleIn, stagger } from '@/lib/animations'

type RecordingState = 'idle' | 'recording' | 'processing'
type NoteState = 'empty' | 'loading' | 'generated'

const SAMPLE_PATIENTS = [
  { id: '1', name: 'Fatima Al-Rashid', age: 34, gender: 'F' },
  { id: '2', name: 'Raj Patel', age: 45, gender: 'M' },
  { id: '3', name: 'Aisha Mohammed', age: 28, gender: 'F' },
  { id: '4', name: 'Omar Hassan', age: 52, gender: 'M' },
]

const LOADING_MESSAGES = [
  'Transcribing audio...',
  'Reading the consultation...',
  'Writing clinical note...',
  'Checking for red flags...',
  'Almost ready...',
]

export default function DashboardPage() {
  const [selectedPatient, setSelectedPatient] = useState<typeof SAMPLE_PATIENTS[0] | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [language, setLanguage] = useState('EN')
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [noteState, setNoteState] = useState<NoteState>('empty')
  const [timer, setTimer] = useState(0)
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0)
  const [transcript, setTranscript] = useState('')
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const loadingRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (recordingState === 'recording') {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [recordingState])

  useEffect(() => {
    if (noteState === 'loading') {
      loadingRef.current = setInterval(() => setLoadingMsgIdx(i => (i + 1) % LOADING_MESSAGES.length), 1800)
    } else {
      if (loadingRef.current) clearInterval(loadingRef.current)
    }
    return () => { if (loadingRef.current) clearInterval(loadingRef.current) }
  }, [noteState])

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  const handleRecord = () => {
    if (recordingState === 'idle') {
      setRecordingState('recording')
      setTimer(0)
    } else if (recordingState === 'recording') {
      setRecordingState('processing')
      setTranscript('Patient: I\'ve had a fever for 3 days, around 101 to 102. Bad headache and body aches. No appetite since yesterday. Doctor: Any cough? Patient: Slight dry cough. No runny nose.')
      setTimeout(() => {
        setRecordingState('idle')
      }, 2000)
    }
  }

  const handleGenerate = () => {
    setNoteState('loading')
    setTimeout(() => setNoteState('generated'), 5000)
  }

  const handleSave = () => {
    toast.success('Note saved to patient record')
  }

  const filtered = SAMPLE_PATIENTS.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" style={{ position: 'relative', zIndex: 1 }}>
      {/* Stats row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, overflowX: 'auto', paddingBottom: 8 }}>
        {[
          { icon: <IconFileText size={20} />, label: 'Consultations today', value: '12' },
          { icon: <IconClock size={20} />, label: 'Time saved today', value: '3.2 hrs' },
          { icon: <IconCalendar size={20} />, label: 'Notes this month', value: '184' },
        ].map((stat, i) => (
          <motion.div key={i} variants={fadeUp} style={{ flex: '1 0 240px' }}>
            <GlassCard className="" hover>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px' }}>
                <div style={{ color: 'var(--teal)' }}>{stat.icon}</div>
                <div>
                  <p style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{stat.label}</p>
                  <p style={{ fontSize: 24, fontWeight: 600 }}>{stat.value}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Two columns */}
      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 400px) 1fr', gap: 16 }}>
        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Patient selector */}
          <GlassCard>
            <div style={{ padding: 16 }}>
              <label style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Patient</label>
              <div style={{ position: 'relative' }}>
                <input
                  placeholder="Search patient..."
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setShowDropdown(true) }}
                  onFocus={() => setShowDropdown(true)}
                />
                {showDropdown && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
                    background: '#141414', border: '1px solid var(--border)', borderRadius: 12,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 10, overflow: 'hidden',
                  }}>
                    {filtered.map(p => (
                      <div
                        key={p.id}
                        onClick={() => { setSelectedPatient(p); setShowDropdown(false); setSearchQuery('') }}
                        className="patient-item"
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 14px', cursor: 'pointer',
                          transition: 'background 0.1s',
                        }}
                      >
                        <Avatar name={p.name} size="sm" />
                        <div>
                          <p style={{ fontSize: 14 }}>{p.name}</p>
                          <p style={{ fontSize: 12, color: '#888' }}>{p.age}y · {p.gender}</p>
                        </div>
                      </div>
                    ))}
                    <div style={{
                      padding: '10px 14px', color: 'var(--teal)', fontSize: 13, cursor: 'pointer',
                      borderTop: '1px solid var(--border)',
                    }}>+ New patient</div>
                  </div>
                )}
              </div>
              {selectedPatient && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ marginTop: 8 }}>
                  <Badge variant="success">
                    {selectedPatient.name}
                    <IconX size={12} style={{ cursor: 'pointer', marginLeft: 4 }} onClick={() => setSelectedPatient(null)} />
                  </Badge>
                </motion.div>
              )}
            </div>
          </GlassCard>

          {/* Language */}
          <GlassCard>
            <div style={{ padding: '14px 16px' }}>
              <label style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>Consultation language</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['EN', 'HI', 'AR', 'UR'].map(lang => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    style={{
                      flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 13, fontWeight: 600,
                      background: language === lang ? 'var(--teal)' : 'transparent',
                      color: language === lang ? '#000' : '#888',
                      border: language === lang ? 'none' : '1px solid var(--border)',
                      cursor: 'pointer', outline: 'none'
                    }}
                  >{lang}</button>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Recorder */}
          <GlassCard>
            <div style={{ padding: 24, textAlign: 'center' }}>
              <AnimatePresence mode="wait">
                {recordingState === 'idle' && (
                  <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <button
                      onClick={handleRecord}
                      className="recorder-btn"
                      style={{
                        width: 80, height: 80, borderRadius: '50%',
                        border: '2px solid var(--border)', background: 'transparent',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'all 0.2s', outline: 'none'
                      }}
                    >
                      <IconMicrophone size={28} color="#888" />
                    </button>
                    <p style={{ color: '#888', fontSize: 13, marginTop: 12 }}>Tap to record</p>
                  </motion.div>
                )}

                {recordingState === 'recording' && (
                  <motion.div key="recording" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div style={{ position: 'relative', display: 'inline-flex' }}>
                      {[0, 0.5, 1].map((delay, i) => (
                        <div key={i} style={{
                          position: 'absolute', inset: -20 - i * 12,
                          border: '1px solid rgba(255,68,68,0.2)', borderRadius: '50%',
                          animation: `pulseRing 2s ease-out infinite ${delay}s`,
                        }} />
                      ))}
                      <button
                        onClick={handleRecord}
                        style={{
                          width: 80, height: 80, borderRadius: '50%',
                          background: 'var(--red-dim)', border: '2px solid var(--red)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', outline: 'none'
                        }}
                      >
                        <div style={{ width: 20, height: 20, background: 'var(--red)', borderRadius: 4 }} />
                      </button>
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: 28, fontWeight: 500, marginTop: 16 }}>
                      {formatTime(timer)}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 3, marginTop: 12 }}>
                      {Array.from({ length: 24 }).map((_, i) => (
                        <div key={i} style={{
                          width: 3, borderRadius: 2, background: 'var(--teal)',
                          height: 4 + Math.random() * 28,
                          animation: `barPulse 0.4s ease-in-out ${i * 0.05}s infinite alternate`,
                        }} />
                      ))}
                    </div>
                  </motion.div>
                )}

                {recordingState === 'processing' && (
                  <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <LoadingSpinner size="lg" />
                    <p style={{ color: '#888', fontSize: 14, marginTop: 16 }}>Processing audio...</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </GlassCard>

          {/* Transcript */}
          {transcript && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <GlassCard>
                <div style={{ padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <label style={{ fontSize: 12, color: '#888', textTransform: 'uppercase' }}>Transcript</label>
                    <span style={{ fontSize: 12, color: '#444' }}>{transcript.length} chars</span>
                  </div>
                  <textarea
                    value={transcript}
                    onChange={e => setTranscript(e.target.value)}
                    style={{
                      background: 'transparent', border: 'none', color: '#a0a0a0',
                      fontSize: 13, lineHeight: 1.7, resize: 'none', minHeight: 100, width: '100%',
                      outline: 'none'
                    }}
                  />
                  <button
                    onClick={handleGenerate}
                    style={{
                      width: '100%', height: 44, borderRadius: 8, border: 'none',
                      background: 'var(--teal)', color: '#000', fontWeight: 600, fontSize: 14,
                      cursor: 'pointer', marginTop: 8,
                      backgroundSize: '200% auto',
                      backgroundImage: 'linear-gradient(90deg, var(--teal), #7fffd4, var(--teal))',
                      animation: 'shimmer 3s linear infinite',
                      outline: 'none'
                    }}
                  >
                    Generate SOAP note →
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </div>

        {/* RIGHT */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <AnimatePresence mode="wait">
            {noteState === 'empty' && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}
              >
                <div style={{ textAlign: 'center' }}>
                  <IconWaveSine size={64} color="var(--teal)" style={{ opacity: 0.3, marginBottom: 16 }} />
                  <p style={{ color: '#888', fontSize: 16, marginBottom: 4 }}>Record a consultation</p>
                  <p style={{ color: '#444', fontSize: 13 }}>Your SOAP note will appear here</p>
                </div>
              </motion.div>
            )}

            {noteState === 'loading' && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                {[1, 2, 3, 4].map(i => <GlassCard key={i}><div style={{ padding: 20 }}><div className="flex flex-col gap-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /></div></div></GlassCard>
                )}
                <div style={{ textAlign: 'center', marginTop: 12 }}>
                  <AnimatePresence mode="wait">
                    <motion.p key={loadingMsgIdx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} style={{ color: '#888', fontSize: 14 }}>
                      {LOADING_MESSAGES[loadingMsgIdx]}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {noteState === 'generated' && (
              <motion.div key="generated" variants={stagger} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'S', name: 'Subjective', content: '38.6°C fever × 3 days with associated headache and generalized myalgia. Anorexia since yesterday. Mild dry cough, no rhinorrhea. No known sick contacts reported.' },
                  { label: 'O', name: 'Objective', content: 'Temp 101.4°F, BP 118/76 mmHg, HR 88 bpm, SpO2 98% RA. Oropharynx: mildly erythematous, no exudates. Chest: clear bilateral breath sounds.' },
                  { label: 'A', name: 'Assessment', content: 'Acute febrile illness — most likely viral upper respiratory tract infection (influenza-like illness). Differential: dengue, COVID-19, bacterial pharyngitis.' },
                  { label: 'P', name: 'Plan', content: '1. Tab Paracetamol 500mg TID × 5 days\n2. Adequate hydration, rest\n3. Monitor for warning signs\n4. F/U if no improvement in 48–72h' },
                ].map((section, i) => (
                  <motion.div key={section.label} variants={fadeUp}>
                    <GlassCard>
                      <div style={{ padding: 16, borderLeft: '3px solid var(--teal)' }}>
                        <div style={{ marginBottom: 8 }}><Badge variant="success">{section.label} — {section.name}</Badge></div>
                        <textarea defaultValue={section.content} style={{ background: 'transparent', border: 'none', color: '#d0d0d0', fontSize: 13, lineHeight: 1.7, resize: 'none', width: '100%', minHeight: 60, outline: 'none' }} />
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
                <motion.div variants={fadeUp}>
                  <GlassCard><div style={{ padding: 16 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--teal)', marginBottom: 10 }}>Prescriptions</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {['Tab Paracetamol 500mg', 'TID × 5 days'].map((rx, i) => (
                        <span key={i} className="rx-pill" style={{ padding: '6px 12px', borderRadius: 8, fontSize: 13, background: 'var(--bg-2)', border: '1px solid var(--border)', color: '#d0d0d0', cursor: 'pointer' }}>{rx}</span>
                      ))}
                    </div>
                  </div></GlassCard>
                </motion.div>
                <motion.div variants={fadeUp}>
                  <button onClick={handleSave} style={{ width: '100%', height: 44, borderRadius: 8, border: 'none', background: 'var(--teal)', color: '#000', fontWeight: 600, fontSize: 14, cursor: 'pointer', marginBottom: 8, outline: 'none' }}>Save & Complete</button>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ flex: 1, height: 40, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: '#888', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, outline: 'none' }}><IconDownload size={16} /> Export PDF</button>
                    <button style={{ flex: 1, height: 40, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: '#888', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, outline: 'none' }}><IconBrandWhatsapp size={16} /> Send WhatsApp</button>
                  </div>
                </motion.div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 20, color: '#444', fontSize: 12, marginTop: 8, flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IconLock size={12} /> Audio auto-deleted</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IconShieldCheck size={12} /> Encrypted + private</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IconCheck size={12} /> AI-assisted, doctor-reviewed</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <style>{`
        @keyframes barPulse { to { height: 4px; } }
        .patient-item:hover { background: rgba(255,255,255,0.03) !important; }
        .recorder-btn:hover { border-color: var(--teal) !important; transform: scale(1.05) !important; }
        .rx-pill:hover { background: var(--teal-dim) !important; border-color: var(--teal-border) !important; color: var(--teal) !important; }
        @media (max-width: 900px) {
          .dashboard-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </motion.div>
  )
}
