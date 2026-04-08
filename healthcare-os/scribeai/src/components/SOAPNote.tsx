'use client'

import { useRef, useEffect, useState } from 'react'
import { AlertTriangle, Check, Clock, FileText, Clipboard, MessageCircle, X, Loader2, Phone } from 'lucide-react'
import { motion } from 'framer-motion'
import type { SOAPNote } from '@/types'

interface SOAPNoteProps {
  note: SOAPNote
  onUpdate: (note: SOAPNote) => void
  readOnly?: boolean
  clinicName?: string
  patientName?: string
  consultationId?: string
  whatsappEnabled?: boolean
  patientPhone?: string
}

const sections: { key: keyof Pick<SOAPNote, 'subjective' | 'objective' | 'assessment' | 'plan'>; label: string; color: string; icon: any }[] = [
  { key: 'subjective', label: 'Subjective', color: 'blue', icon: MessageCircle },
  { key: 'objective', label: 'Objective', color: 'purple', icon: Clipboard },
  { key: 'assessment', label: 'Assessment', color: 'amber', icon: AlertTriangle },
  { key: 'plan', label: 'Plan', color: 'green', icon: Check },
]

const colorMapVibrant: Record<string, string> = {
  blue: 'bg-blue-600',
  purple: 'bg-indigo-600',
  amber: 'bg-amber-500',
  green: 'bg-emerald-600',
}

const colorMapMuted: Record<string, string> = {
  blue: 'bg-blue-50 border-blue-100',
  purple: 'bg-indigo-50 border-indigo-100',
  amber: 'bg-amber-50 border-amber-100',
  green: 'bg-emerald-50 border-emerald-100',
}

const labelColorMapVibrant: Record<string, string> = {
  blue: 'text-blue-600',
  purple: 'text-indigo-600',
  amber: 'text-amber-600',
  green: 'text-emerald-600',
}

function AutoTextarea({ value, onChange, readOnly }: { value: string; onChange?: (v: string) => void; readOnly?: boolean }) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.style.height = `${ref.current.scrollHeight}px`
    }
  }, [value])

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={e => onChange?.(e.target.value)}
      readOnly={readOnly}
      rows={3}
      className="w-full bg-transparent text-slate-900 text-sm font-medium resize-none focus:outline-none leading-relaxed placeholder:text-slate-300"
      placeholder="No data recorded for this section..."
    />
  )
}

export default function SOAPNoteDisplay({ note, onUpdate, readOnly, clinicName, patientName, consultationId, whatsappEnabled, patientPhone }: SOAPNoteProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const [showWhatsApp, setShowWhatsApp] = useState(false)
  const [waPhone, setWaPhone] = useState(patientPhone || '')
  const [waSending, setWaSending] = useState(false)
  const [waStatus, setWaStatus] = useState<'idle' | 'sent' | 'error'>('idle')
  const [waError, setWaError] = useState('')

  const sendWhatsApp = async () => {
    if (!consultationId || !waPhone.trim()) return
    setWaSending(true)
    setWaStatus('idle')
    setWaError('')
    try {
      const res = await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultationId, phoneNumber: waPhone.trim() }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setWaStatus('sent')
    } catch (err) {
      setWaError(err instanceof Error ? err.message : 'Failed to send')
      setWaStatus('error')
    } finally {
      setWaSending(false)
    }
  }

  const handleSectionChange = (key: keyof SOAPNote, value: string) => {
    onUpdate({ ...note, [key]: value })
  }

  const copyPrescription = (text: string, idx: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  const exportPDF = async () => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ orientation: 'portrait', format: 'a4' })

    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    let y = 25

    // Header
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text(clinicName || 'ScribeAI', margin, y)

    y += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100)
    doc.text(`Patient: ${patientName || 'Unknown'} | Generated: ${new Date().toLocaleDateString()}`, margin, y)

    y += 6
    doc.setDrawColor(200)
    doc.line(margin, y, pageWidth - margin, y)
    y += 10

    // SOAP Sections
    const addSection = (title: string, content: string) => {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30)
      doc.text(title, margin, y)
      y += 6

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(60)
      const lines = doc.splitTextToSize(content || 'N/A', pageWidth - margin * 2)
      doc.text(lines, margin, y)
      y += lines.length * 5 + 8
    }

    addSection('Subjective', note.subjective)
    addSection('Objective', note.objective)
    addSection('Assessment', note.assessment)
    addSection('Plan', note.plan)

    if (note.prescription_suggestions?.length) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30)
      doc.text('Prescriptions', margin, y)
      y += 6
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(60)
      note.prescription_suggestions.forEach(rx => {
        doc.text(`• ${rx}`, margin + 3, y)
        y += 6
      })
      y += 4
    }

    if (note.follow_up) addSection('Follow-up', note.follow_up)
    if (note.red_flags?.length) addSection('Red Flags', note.red_flags.join(', '))

    doc.save(`SOAP-${patientName || 'note'}-${Date.now()}.pdf`)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  }

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* 4 SOAP sections */}
      {sections.map(({ key, label, color, icon: Icon }) => (
        <motion.div 
          key={key} 
          variants={itemVariants} 
          className="group relative bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
        >
          {/* Side Accent */}
          <div className={`absolute left-0 top-8 bottom-8 w-1.5 rounded-r-full ${colorMapVibrant[color]}`} />
          
          <div className="flex items-center justify-between mb-4 pl-4">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorMapMuted[color]}`}>
                <Icon className={`w-4.5 h-4.5 ${labelColorMapVibrant[color]}`} />
              </div>
              <span className={`text-xs font-black uppercase tracking-[0.2em] ${labelColorMapVibrant[color]}`}>{label}</span>
            </div>
          </div>
          
          <div className="pl-4">
            <AutoTextarea
              value={note[key] || ''}
              onChange={readOnly ? undefined : v => handleSectionChange(key, v)}
              readOnly={readOnly}
            />
          </div>
        </motion.div>
      ))}

      {/* Action Grid: Prescriptions & Flags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Prescriptions */}
        <motion.div variants={itemVariants} className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <Clipboard className="w-4.5 h-4.5 text-blue-600" />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Prescription Desk</span>
          </div>
          
          {note.prescription_suggestions && note.prescription_suggestions.length > 0 ? (
            <div className="flex flex-col gap-2">
              {note.prescription_suggestions.map((rx, i) => (
                <button
                  key={i}
                  onClick={() => copyPrescription(rx, i)}
                  className="flex items-center justify-between px-5 py-4 bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 rounded-2xl transition-all group shadow-sm active:scale-[0.98]"
                >
                  <span className="text-sm font-bold text-slate-900">{rx}</span>
                  {copiedIdx === i ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Clipboard className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm font-bold text-slate-300 italic">No recommendations provided.</p>
          )}
        </motion.div>

        {/* Red Flags & Follow-up */}
        <div className="space-y-6">
          {/* Red Flags */}
          {note.red_flags && note.red_flags.length > 0 && (
            <motion.div variants={itemVariants} className="bg-rose-50 border border-rose-100 rounded-[2rem] p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
                  <AlertTriangle className="w-4.5 h-4.5 text-white" />
                </div>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-rose-600">Critical Red Flags</span>
              </div>
              <ul className="space-y-3">
                {note.red_flags.map((flag, i) => (
                  <li key={i} className="text-sm font-bold text-rose-700 flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" /> 
                    {flag}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Follow-up */}
          {note.follow_up && (
            <motion.div variants={itemVariants} className="bg-indigo-50 border border-indigo-100 rounded-[2rem] p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Clock className="w-4.5 h-4.5 text-white" />
                </div>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600">Follow-up Schedule</span>
              </div>
              <p className="text-sm font-black text-slate-900 pl-1">{note.follow_up}</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button
          onClick={exportPDF}
          className="flex-1 flex items-center justify-center gap-3 py-5 bg-white border border-slate-100 rounded-2xl text-sm font-black text-slate-900 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all active:scale-[0.98]"
        >
          <FileText className="w-5 h-5 text-blue-600" />
          Export Clinical PDF
        </button>

        {whatsappEnabled && consultationId && (
          <button
            onClick={() => { setShowWhatsApp(true); setWaStatus('idle'); setWaError('') }}
            className="flex-1 flex items-center justify-center gap-3 py-5 bg-emerald-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-emerald-500/20 hover:bg-emerald-500 transition-all active:scale-[0.98]"
          >
            <MessageCircle className="w-5 h-5" />
            Send via WhatsApp
          </button>
        )}
      </div>

      {/* WhatsApp Modal */}
      {showWhatsApp && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">WhatsApp Send</h3>
                  <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mt-1">Direct Patient Sync</p>
                </div>
              </div>
              <button 
                onClick={() => setShowWhatsApp(false)} 
                className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {waStatus === 'sent' ? (
              <div className="text-center py-6">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10 text-emerald-600" />
                </div>
                <p className="text-lg font-black text-slate-900">Summary Dispatched!</p>
                <p className="text-sm font-medium text-slate-400 mt-2">The patient will receive a secure clinical summary on their device.</p>
                <button 
                  onClick={() => setShowWhatsApp(false)} 
                  className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm transition-all hover:bg-slate-800"
                >
                  Dismiss
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-sm font-medium text-slate-500 leading-relaxed">Confirm the patient's WhatsApp number to securely transmit the consultation summary.</p>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Recipient Number</label>
                  <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-2xl px-5 shadow-inner">
                    <Phone className="w-4.5 h-4.5 text-slate-400 flex-shrink-0" />
                    <input
                      type="tel"
                      value={waPhone}
                      onChange={e => setWaPhone(e.target.value)}
                      placeholder="e.g. 971501234567"
                      className="flex-1 bg-transparent py-4 text-slate-900 font-bold text-sm placeholder-slate-300 focus:outline-none"
                    />
                  </div>
                  <p className="text-[10px] font-bold text-slate-300 italic px-1">International format, digits only (e.g. 9715...)</p>
                </div>

                {waStatus === 'error' && (
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl">
                    <p className="text-xs font-bold text-rose-600">{waError}</p>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setShowWhatsApp(false)} 
                    className="flex-1 py-4 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl text-sm font-black transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendWhatsApp}
                    disabled={waSending || !waPhone.trim()}
                    className="flex-[2] flex items-center justify-center gap-3 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl text-sm font-black shadow-xl shadow-emerald-500/20 transition-all"
                  >
                    {waSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />}
                    {waSending ? 'Syncing...' : 'Send Summary'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}
