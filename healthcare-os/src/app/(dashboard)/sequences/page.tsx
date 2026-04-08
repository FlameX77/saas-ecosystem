'use client'
import { useState, useEffect } from 'react'
import { Plus, ChevronRight, Mail, MessageSquare, MessageCircle, Clock, Play, Pause, Trash2, Zap, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const PREVIEW_VARS: Record<string, string> = {
  first_name: 'Sarah',
  service: 'Teeth Whitening',
  business_name: 'Miami Smile Dental',
  booking_link: 'https://cal.com/miami-smile',
  review_link: 'https://g.page/miami-smile/review',
}

function previewTemplate(template: string): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => PREVIEW_VARS[key] ?? `{{${key}}}`)
}

interface Step {
  id: string
  day: number
  channel: 'sms' | 'email' | 'whatsapp'
  template: string
}

interface Sequence {
  id: string
  name: string
  description: string
  steps: Step[]
  enrolled: number
  active: boolean
}

const TEMPLATES: Sequence[] = [
  {
    id: 'dental-reactivation',
    name: 'Dental Lead Reactivation',
    description: 'Re-engage patients who enquired but never booked',
    active: true,
    enrolled: 47,
    steps: [
      { id: 's1', day: 1, channel: 'sms', template: "Hi {{first_name}}! Just saw you were interested in {{service}} at {{business_name}}. We have a few spots this week — want to grab one? 😊" },
      { id: 's2', day: 3, channel: 'email', template: "Subject: Your {{service}} consultation at {{business_name}}\n\nHi {{first_name}},\n\nWe noticed you haven't had a chance to book your {{service}} consultation yet. Our patients who've had it done absolutely love the results.\n\nWe have a few openings this week at no consultation fee. Would any of these times work for you?\n\n{{booking_link}}" },
      { id: 's3', day: 7, channel: 'whatsapp', template: "Hey {{first_name}} 👋 Last check-in — still thinking about {{service}}? Happy to answer any questions before you decide. No pressure at all!" },
    ],
  },
  {
    id: 'no-show-recovery',
    name: 'No-Show Recovery',
    description: 'Reschedule patients who missed their appointment',
    active: true,
    enrolled: 23,
    steps: [
      { id: 'n1', day: 0, channel: 'sms', template: "Hi {{first_name}}, we missed you today! Life gets busy — totally understand. Want to reschedule? Here's our booking link: {{booking_link}}" },
      { id: 'n2', day: 2, channel: 'email', template: "Subject: Reschedule your appointment — {{business_name}}\n\nHi {{first_name}},\n\nWe saved a spot for you and wanted to make it easy to rebook at a time that actually works.\n\n{{booking_link}}\n\nLet us know if you have any questions!" },
      { id: 'n3', day: 5, channel: 'sms', template: "{{first_name}}, one last nudge 😊 We'd love to get you sorted. Click here when you're ready: {{booking_link}}" },
    ],
  },
  {
    id: 'post-service-review',
    name: 'Post-Service Review Request',
    description: 'Collect reviews from happy patients after treatment',
    active: false,
    enrolled: 12,
    steps: [
      { id: 'r1', day: 1, channel: 'sms', template: "Hi {{first_name}}! How's everything after your {{service}}? We hope you're loving the results 🤩 If you have a moment, we'd really appreciate a quick review: {{review_link}}" },
      { id: 'r2', day: 4, channel: 'email', template: "Subject: How was your experience, {{first_name}}?\n\nHi {{first_name}},\n\nWe hope your {{service}} went smoothly! Your feedback means the world to us and helps other patients make confident decisions.\n\nWould you mind leaving us a quick review? It only takes 2 minutes:\n\n{{review_link}}\n\nThank you so much!" },
    ],
  },
]

const chColors: Record<string, string> = { sms: '#2563EB', email: '#06B6D4', whatsapp: '#10B981' }
const chIcons: Record<string, React.ReactNode> = {
  sms: <MessageSquare size={12} />,
  email: <Mail size={12} />,
  whatsapp: <MessageCircle size={12} />,
}

export default function SequencesPage() {
  const [sequences, setSequences] = useState<Sequence[]>(TEMPLATES)
  const [selected, setSelected] = useState<Sequence | null>(TEMPLATES[0])
  const [preview, setPreview] = useState(false)

  useEffect(() => { document.title = 'Sequences — Revivo' }, [])

  const toggle = (id: string) => {
    setSequences(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s))
    toast.success('Sequence updated')
  }

  return (
    <div className="p-8 max-w-screen-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#F9FAFB' }}>Sequences</h1>
          <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Automated multi-step outreach campaigns</p>
        </div>
        <Button className="h-9 font-medium" style={{ background: '#2563EB', color: '#fff' }}>
          <Plus size={14} className="mr-1.5" /> New Sequence
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Sequence list */}
        <div className="col-span-1 space-y-3">
          {sequences.map(seq => (
            <div
              key={seq.id}
              onClick={() => setSelected(seq)}
              className="rounded-xl p-4 cursor-pointer transition-all"
              style={{
                background: selected?.id === seq.id ? '#1E3A5F' : '#111827',
                border: `1px solid ${selected?.id === seq.id ? '#2563EB' : '#374151'}`,
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap size={14} style={{ color: seq.active ? '#2563EB' : '#4B5563' }} />
                  <span className="text-sm font-semibold" style={{ color: '#F9FAFB' }}>{seq.name}</span>
                </div>
                <Badge
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: seq.active ? 'rgba(16,185,129,0.15)' : 'rgba(75,85,99,0.3)',
                    color: seq.active ? '#10B981' : '#6B7280',
                    border: 'none',
                  }}
                >
                  {seq.active ? 'Active' : 'Paused'}
                </Badge>
              </div>
              <p className="text-xs mb-3" style={{ color: '#6B7280' }}>{seq.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {seq.steps.map(s => (
                    <span key={s.id} className="w-5 h-5 rounded flex items-center justify-center" style={{ background: chColors[s.channel] + '22', color: chColors[s.channel] }}>
                      {chIcons[s.channel]}
                    </span>
                  ))}
                </div>
                <span className="text-xs" style={{ color: '#6B7280' }}>{seq.enrolled} enrolled</span>
              </div>
            </div>
          ))}
        </div>

        {/* Step builder */}
        <div className="col-span-2 rounded-xl p-6" style={{ background: '#111827', border: '1px solid #374151' }}>
          {selected ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-semibold" style={{ color: '#F9FAFB' }}>{selected.name}</h2>
                  <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{selected.steps.length} steps · {selected.enrolled} contacts enrolled</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreview(p => !p)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{ border: '1px solid #374151', background: preview ? '#1E3A5F' : 'transparent', color: preview ? '#93C5FD' : '#9CA3AF' }}
                  >
                    <Eye size={12} /> {preview ? 'Variables' : 'Preview'}
                  </button>
                  <button
                    onClick={() => toggle(selected.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{ border: '1px solid #374151', color: '#9CA3AF' }}
                  >
                    {selected.active ? <><Pause size={12} /> Pause</> : <><Play size={12} /> Activate</>}
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: '#2563EB', color: '#fff' }}>
                    <Plus size={12} /> Add Step
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {selected.steps.map((step, i) => (
                  <div key={step.id} className="flex gap-4">
                    {/* Timeline */}
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: chColors[step.channel] + '22', color: chColors[step.channel] }}>
                        {i + 1}
                      </div>
                      {i < selected.steps.length - 1 && (
                        <div className="w-px flex-1 mt-1" style={{ background: '#374151', minHeight: 24 }} />
                      )}
                    </div>

                    {/* Step card */}
                    <div className="flex-1 rounded-xl p-4 mb-4" style={{ background: '#1F2937', border: '1px solid #374151' }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium" style={{ background: chColors[step.channel] + '22', color: chColors[step.channel] }}>
                            {chIcons[step.channel]} {step.channel.toUpperCase()}
                          </span>
                          <span className="flex items-center gap-1 text-xs" style={{ color: '#6B7280' }}>
                            <Clock size={11} /> Day {step.day}
                          </span>
                        </div>
                        <button className="p-1 rounded hover:bg-white/5" style={{ color: '#4B5563' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                      {preview ? (
                        <p className="text-xs leading-relaxed" style={{ color: '#E2E8F0', whiteSpace: 'pre-wrap' }}>
                          {previewTemplate(step.template)}
                        </p>
                      ) : (
                        <p className="text-xs leading-relaxed font-mono" style={{ color: '#D1D5DB', whiteSpace: 'pre-wrap' }}>
                          {step.template.split(/(\{\{[^}]+\}\})/g).map((part, idx) =>
                            /^\{\{[^}]+\}\}$/.test(part)
                              ? <span key={idx} style={{ color: '#93C5FD', background: '#1E3A5F', borderRadius: 3, padding: '0 3px' }}>{part}</span>
                              : part
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Variable legend */}
              <div className="mt-4 p-3 rounded-lg" style={{ background: '#1F2937', border: '1px solid #374151' }}>
                <p className="text-xs font-medium mb-2" style={{ color: '#6B7280' }}>AVAILABLE VARIABLES</p>
                <div className="flex flex-wrap gap-2">
                  {['{{first_name}}', '{{service}}', '{{business_name}}', '{{booking_link}}', '{{review_link}}'].map(v => (
                    <span key={v} className="px-2 py-0.5 rounded text-xs font-mono" style={{ background: '#374151', color: '#93C5FD' }}>{v}</span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 gap-3" style={{ color: '#4B5563' }}>
              <ChevronRight size={32} className="opacity-30" />
              <p className="text-sm">Select a sequence to view steps</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
