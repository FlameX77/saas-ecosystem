'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Mic, Square, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatDuration } from '@/lib/utils'
import type { RecorderState, Language } from '@/types'
import ConsentGuard from '@/components/ConsentGuard'

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'ar', label: 'Arabic' },
  { code: 'ur', label: 'Urdu' },
]

interface AudioRecorderProps {
  onComplete: (audioBlob: Blob, language: Language) => void
  disabled?: boolean
}

export default function AudioRecorder({ onComplete, disabled }: AudioRecorderProps) {
  const [state, setState] = useState<RecorderState>('idle')
  const [language, setLanguage] = useState<Language>('en')
  const [elapsed, setElapsed] = useState(0)
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(20).fill(0))
  const [error, setError] = useState('')
  const [showConsentGuard, setShowConsentGuard] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const stopAnimation = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  const animateAudioLevels = useCallback(() => {
    if (!analyserRef.current) return
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    const tick = () => {
      analyserRef.current!.getByteFrequencyData(dataArray)
      const bars = Array(20).fill(0).map((_, i) => {
        const idx = Math.floor((i / 20) * dataArray.length)
        return Math.min(100, (dataArray[idx] / 255) * 100)
      })
      setAudioLevels(bars)
      animFrameRef.current = requestAnimationFrame(tick)
    }
    animFrameRef.current = requestAnimationFrame(tick)
  }, [])

  const handleMicClick = useCallback(() => {
    setShowConsentGuard(true)
  }, [])

  const doStartRecording = useCallback(async () => {
    setShowConsentGuard(false)
    setState('requesting-permission')
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Set up analyser
      const audioCtx = new AudioContext()
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser

      chunksRef.current = []
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        streamRef.current?.getTracks().forEach(t => t.stop())
        stopAnimation()
        setState('processing')
        onComplete(blob, language)
      }

      recorder.start(250)
      setState('recording')
      setElapsed(0)

      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000)
      animateAudioLevels()
    } catch {
      setState('error')
      setError('Microphone access denied. Please allow microphone access and try again.')
    }
  }, [language, onComplete, stopAnimation, animateAudioLevels])

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop()
  }, [])

  useEffect(() => {
    return () => {
      stopAnimation()
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [stopAnimation])

  return (
    <div className="flex flex-col items-center gap-10">
      {/* Language selector — only shown when idle */}
      {state === 'idle' && (
        <div className="flex p-1.5 bg-slate-50 border border-slate-100 rounded-2xl shadow-inner">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              disabled={disabled}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                language === lang.code
                  ? 'bg-white text-blue-600 shadow-sm border border-slate-100'
                  : 'text-slate-400 hover:text-slate-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}

      {/* Main button */}
      <div className="relative flex flex-col items-center gap-6">
        {state === 'recording' && (
          <div className="flex items-end gap-1 h-14 mb-4">
            {audioLevels.map((level, i) => (
              <div
                key={i}
                className="w-2 bg-rose-500 rounded-full transition-all duration-100"
                style={{ 
                  height: `${Math.max(6, level * 0.5)}px`, 
                  opacity: 0.4 + level / 150,
                  boxShadow: level > 40 ? '0 0 15px rgba(244, 63, 94, 0.3)' : 'none'
                }}
              />
            ))}
          </div>
        )}

        {state === 'idle' && (
          <button
            onClick={handleMicClick}
            disabled={disabled}
            className="group relative w-24 h-24 rounded-[2rem] bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-2xl shadow-blue-500/40 flex items-center justify-center active:scale-95"
          >
            <div className="absolute inset-0 rounded-[2rem] bg-blue-400/20 scale-110 group-hover:scale-125 transition-transform duration-500 blur-md" />
            <Mic className="relative z-10 w-10 h-10 text-white" />
          </button>
        )}

        {state === 'recording' && (
          <>
            <div className="relative w-24 h-24 flex items-center justify-center">
              {/* Pulse rings */}
              <motion.div
                animate={{ scale: [1, 1.6, 2.2], opacity: [0.6, 0.3, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                className="absolute inset-0 rounded-full bg-rose-500/20"
              />
              <motion.div
                animate={{ scale: [1, 1.4, 2], opacity: [0.6, 0.2, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                className="absolute inset-0 rounded-full bg-rose-500/10"
              />
              <button
                onClick={stopRecording}
                className="relative z-10 w-24 h-24 rounded-[2rem] bg-rose-600 hover:bg-rose-500 transition-all duration-300 shadow-2xl shadow-rose-500/40 flex items-center justify-center active:scale-95"
              >
                <Square className="w-8 h-8 text-white fill-white rounded-lg" />
              </button>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-rose-50 border border-rose-100 rounded-full text-rose-600 font-black text-sm shadow-sm">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              {formatDuration(elapsed)}
            </div>
          </>
        )}

        {state === 'requesting-permission' && (
          <div className="w-24 h-24 rounded-[2rem] bg-white border border-slate-100 shadow-lg flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
        )}

        {state === 'processing' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-[2rem] bg-white border border-blue-100 shadow-xl shadow-blue-500/5 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50/30 animate-pulse" />
              <Loader2 className="relative z-10 w-10 h-10 text-blue-600 animate-spin" />
            </div>
            <p className="text-xs font-black text-blue-600 uppercase tracking-widest animate-pulse">Syncing Transcription</p>
          </div>
        )}

        {state === 'error' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-[2rem] bg-rose-50 border border-rose-100 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-rose-500" />
            </div>
            <p className="text-sm font-bold text-rose-600 text-center max-w-xs">{error}</p>
            <button
              onClick={() => { setState('idle'); setError('') }}
              className="flex items-center gap-2 px-6 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
            >
              <RefreshCw className="w-4 h-4" /> Try again
            </button>
          </div>
        )}
      </div>

      {(state === 'idle' || state === 'recording') && (
        <div className="flex flex-col items-center gap-1">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">
            {state === 'recording' ? 'Recording Clinical Session' : 'Ready for Consultation'}
          </p>
          <p className="text-[10px] font-bold text-slate-300 text-center italic">
            HIPAA-Compliant &bull; End-to-End Encrypted
          </p>
        </div>
      )}

      {/* HIPAA Compliance Consent Guard */}
      <ConsentGuard
        isOpen={showConsentGuard}
        onConfirm={doStartRecording}
        onCancel={() => setShowConsentGuard(false)}
      />
    </div>
  )
}

