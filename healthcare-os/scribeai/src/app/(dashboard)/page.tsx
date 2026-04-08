'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import AudioRecorder from '@/components/AudioRecorder'
import PatientSelector from '@/components/PatientSelector'
import SOAPNoteDisplay from '@/components/SOAPNote'
import { 
  IconMicrophone, IconFileText, IconClock, IconCalendar,
  IconAlertTriangle, IconBrandWhatsapp, IconDownload, IconCheck,
  IconX, IconWaveSine, IconLock, IconShieldCheck, IconSparkles,
  IconSearch, IconArrowRight, IconActivity
} from '@tabler/icons-react'
import type { Patient, SOAPNote, Doctor, Clinic, Language } from '@/types'
import { estimateTimeSaved } from '@/lib/utils'
import { useConsultation } from '@/hooks/useConsultation'
import GlassCard from '@/components/ui/GlassCard'
import { Badge } from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { fadeUp, scaleIn, stagger } from '@/lib/animations'
import { toast } from 'sonner'

type Step = 'idle' | 'uploading' | 'processing' | 'done'

const LOADING_MESSAGES = [
  'Transcribing clinical audio...',
  'Analyzing medical context...',
  'Generating structured SOAP notes...',
  'Extracting symptoms & prescriptions...',
  'Finalizing documentation...',
]

export default function HealthcareDashboard() {
  const supabase = createClient()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [chiefComplaint, setChiefComplaint] = useState('')
  const [consultationId, setConsultationId] = useState<string | null>(null)
  const [step, setStep] = useState<Step>('idle')
  const [error, setError] = useState('')
  const [todayCount, setTodayCount] = useState(0)
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0)
  const loadingRef = useRef<NodeJS.Timeout | null>(null)

  const { data: consultation } = useConsultation(consultationId)

  // Loading message rotation
  useEffect(() => {
    if (step === 'processing') {
      loadingRef.current = setInterval(() => setLoadingMsgIdx(i => (i + 1) % LOADING_MESSAGES.length), 2500)
    } else {
      if (loadingRef.current) clearInterval(loadingRef.current)
    }
    return () => { if (loadingRef.current) clearInterval(loadingRef.current) }
  }, [step])

  useEffect(() => {
    if (consultation) {
      if (consultation.status === 'completed' && step !== 'done') {
        setStep('done')
        toast.success('Clinical session complete')
      } else if (consultation.status === 'transcription_failed' || consultation.status === 'failed') {
        setError('Transcription failed. Check audio quality.')
        setStep('idle')
        toast.error('Clinical analysis failed')
      } else if (consultation.status === 'pending' || consultation.status === 'transcribed') {
        setStep('processing')
      }
    }
  }, [consultation, step])

  // Load basic data
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: doctorData } = await supabase.from('doctors').select('*').eq('id', user.id).single()
      if (!doctorData) return
      setDoctor(doctorData)

      const { data: clinicData } = await supabase.from('clinics').select('*').eq('id', doctorData.clinic_id).single()
      if (clinicData) setClinic(clinicData)

      const today = new Date(); today.setHours(0, 0, 0, 0)
      const { count } = await supabase.from('consultations')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', doctorData.clinic_id)
        .gte('created_at', today.toISOString())
      setTodayCount(count || 0)
    }
    load()
  }, [supabase])

  const handleRecordingComplete = useCallback(async (audioBlob: Blob, language: Language) => {
    if (!doctor || !clinic || !selectedPatient) {
        toast.error('Please select a patient first')
        return
    }
    setError('')
    setConsultationId(null)

    try {
      setStep('uploading')
      toast.info('Uploading audio payload...')

      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      formData.append('language', language)
      formData.append('patientId', selectedPatient.id)
      if (chiefComplaint) formData.append('chiefComplaint', chiefComplaint)
      if (selectedPatient.age) formData.append('patientAge', selectedPatient.age.toString())
      if (selectedPatient.gender) formData.append('patientGender', selectedPatient.gender)

      const res = await fetch('/api/consultations', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Upload failed')

      setConsultationId(data.data.id)
      setStep('processing')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload interrupted'
      setError(msg)
      setStep('idle')
      toast.error(msg)
    }
  }, [doctor, clinic, selectedPatient, chiefComplaint])

  const saveAndComplete = async () => {
    if (!consultationId || !clinic) return
    const { error: err } = await supabase.from('consultations').update({ status: 'completed' }).eq('id', consultationId)
    if (err) { toast.error('Finalization failed'); return }
    
    await supabase.from('clinics').update({ consultation_count: (clinic.consultation_count || 0) + 1 }).eq('id', clinic.id)
    setTodayCount(c => c + 1)
    toast.success('Consultation archived to EMR')
    
    // Reset state for next patient
    setConsultationId(null)
    setChiefComplaint('')
    setSelectedPatient(null)
    setStep('idle')
  }

  const isBusy = step === 'uploading' || step === 'processing'

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="relative z-10 space-y-8">
      {/* ── Stats Overview ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-6 flex flex-col justify-between group hover:border-teal-500/20 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
              <IconActivity size={20} />
            </div>
            <Badge variant="dim">Live</Badge>
          </div>
          <div>
            <div className="text-3xl font-black text-white">{todayCount}</div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Sessions Today</p>
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <IconClock size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-white">{estimateTimeSaved(todayCount).split(' ')[0]}h</div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Clinical Time Restored</p>
          </div>
        </GlassCard>

        <GlassCard className="md:col-span-2 p-6 flex flex-col justify-between border-teal-500/20 bg-gradient-to-br from-teal-500/5 to-transparent">
          <div className="flex justify-between items-center mb-4">
             <div className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-500">Resource Quota — {clinic?.subscription_tier?.toUpperCase() || 'TRIAL'}</div>
             <div className="text-[10px] font-black text-slate-500">{clinic?.consultation_count ?? 0} / {clinic?.subscription_tier === 'trial' ? 50 : clinic?.subscription_tier === 'starter' ? 300 : '∞'}</div>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${Math.min(100, ((clinic?.consultation_count ?? 0) / (clinic?.subscription_tier === 'trial' ? 50 : 300)) * 100)}%` }}
               className="h-full bg-teal-500"
             />
          </div>
          <p className="text-[10px] text-slate-500 font-medium italic">You are currently operating in high-performance mode.</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── Consultation Control ── */}
        <div className="lg:col-span-4 space-y-6">
          <GlassCard className="p-8 space-y-8 bg-slate-900/40 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 text-white pointer-events-none rotate-12">
                <IconMicrophone size={120} />
             </div>
             
             <div className="space-y-1 relative z-10">
                <h2 className="text-2xl font-black text-white tracking-tight">Consultation Core</h2>
                <p className="text-xs font-bold text-slate-500 flex items-center gap-2">
                   <IconLock size={12} className="text-teal-500" /> End-to-end encrypted session
                </p>
             </div>

             <div className="space-y-6 relative z-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Identity Management</label>
                  {clinic ? (
                    <PatientSelector onSelect={(p) => { setSelectedPatient(p); toast.info(`Linked to ${p.full_name}`) }} clinicId={clinic.id} />
                  ) : (
                    <div className="h-14 bg-slate-800/50 rounded-2xl animate-pulse border border-slate-700/30" />
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Clinical Focus</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600 group-focus-within:text-teal-500 transition-colors">
                      <IconActivity size={18} />
                    </div>
                    <input
                      value={chiefComplaint}
                      onChange={e => setChiefComplaint(e.target.value)}
                      placeholder="Symptoms or reason for visit..."
                      className="w-full pl-12 pr-6 py-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-white font-medium placeholder-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/5 transition-all"
                    />
                  </div>
                </div>

                {/* Recorder Component */}
                <div className="pt-4 flex justify-center">
                  <div className="p-1 rounded-[3rem] bg-gradient-to-b from-teal-500/20 to-transparent">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-slate-800/50 shadow-2xl">
                      <AudioRecorder
                        onComplete={handleRecordingComplete}
                        disabled={isBusy}
                      />
                    </div>
                  </div>
                </div>
             </div>

             {error && (
               <motion.div variants={fadeUp} className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-bold">
                 <IconAlertTriangle size={18} className="flex-shrink-0" />
                 {error}
               </motion.div>
             )}
          </GlassCard>

          {/* Transcript Feed */}
          <AnimatePresence>
            {(consultation?.transcript || step === 'processing') && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <GlassCard className="p-8 mt-2">
                  <div className="flex justify-between items-center mb-6">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Internal Transcription Intelligence</label>
                    {step === 'processing' && <LoadingSpinner size={14} />}
                  </div>
                  
                  {consultation?.transcript ? (
                    <div 
                      dir={consultation.language === 'ar' ? 'rtl' : 'ltr'}
                      className="p-6 bg-slate-800/30 rounded-2xl border border-slate-700/30 text-slate-400 font-medium leading-relaxed max-h-60 overflow-y-auto text-sm"
                    >
                      {consultation.transcript}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="h-3 bg-slate-800 rounded-full w-full animate-pulse" />
                      <div className="h-3 bg-slate-800 rounded-full w-5/6 animate-pulse" />
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Documentation Output ── */}
        <div className="lg:col-span-8 space-y-6">
           <GlassCard className="p-10 bg-slate-950/50 min-h-[600px] flex flex-col">
              <div className="flex justify-between items-center mb-10">
                 <div className="space-y-1">
                    <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
                       Clinical Document 
                       {consultation?.soap_note && <IconSparkles size={24} className="text-teal-500 animate-pulse" />}
                    </h2>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Multi-Agent Protocol Output</p>
                 </div>
                 {consultation?.soap_note && (
                   <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                     <IconShieldCheck size={14} /> Validation Pass
                   </div>
                 )}
              </div>

              {step === 'processing' && !consultation?.soap_note && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-8 py-20 grayscale opacity-60">
                   <div className="relative w-24 h-24">
                      <LoadingSpinner size={96} strokeWidth={1} />
                      <div className="absolute inset-0 flex items-center justify-center">
                         <IconWaveSine size={32} className="text-teal-500 animate-pulse" />
                      </div>
                   </div>
                   <div className="text-center space-y-2">
                       <p className="text-white text-lg font-black tracking-tight">{LOADING_MESSAGES[loadingMsgIdx]}</p>
                       <p className="text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse">Running Healthcare OS Clinical Pipeline</p>
                   </div>
                </div>
              )}

              {consultation?.soap_note ? (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                   <SOAPNoteDisplay
                      note={consultation.soap_note}
                      onUpdate={async (note) => {
                        if (!consultationId) return
                        await supabase.from('consultations').update({ soap_note: note }).eq('id', consultationId)
                      }}
                      clinicName={clinic?.name}
                      patientName={selectedPatient?.full_name}
                      consultationId={consultationId ?? undefined}
                      whatsappEnabled={true}
                      patientPhone={selectedPatient?.phone}
                    />

                    {consultation.status !== 'completed' && (
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={saveAndComplete}
                        className="w-full flex items-center justify-center gap-4 py-6 bg-teal-500 text-black font-black rounded-3xl transition-all shadow-[0_0_40px_rgba(20,184,166,0.2)]"
                      >
                        <IconCheck size={20} />
                        AUTHORIZE & SAVE TO EMR RECORD
                      </motion.button>
                    )}
                </div>
              ) : step !== 'processing' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-32 px-12 bg-slate-900/20 rounded-[3rem] border-2 border-dashed border-slate-800/50 group hover:border-teal-500/20 transition-all">
                  <div className="w-24 h-24 rounded-[2rem] bg-slate-900 border border-slate-800 flex items-center justify-center mb-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-teal-500/5 group-hover:scale-150 transition-transform duration-1000" />
                    <IconActivity size={40} className="text-slate-700 group-hover:text-teal-500 transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Clinical Workspace Idle</h3>
                  <p className="text-slate-500 text-sm font-medium max-w-sm leading-relaxed mb-10">
                    Select a patient and initiate recording to begin the automated documentation process.
                  </p>
                  <div className="flex gap-4 opacity-50 grayscale hover:opacity-100 transition-all">
                     <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500"><IconMicrophone size={12}/> Audio Logic</div>
                     <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500"><IconWaveSine size={12}/> NLP Pipeline</div>
                     <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500"><IconActivity size={12}/> Health Sync</div>
                  </div>
                </div>
              )}
           </GlassCard>
        </div>
      </div>
    </motion.div>
  )
}
