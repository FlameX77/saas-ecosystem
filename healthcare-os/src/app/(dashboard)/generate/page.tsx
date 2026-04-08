'use client'
import { useState, useEffect } from 'react'
import { Sparkles, Copy, Check, RefreshCw, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Result { sms: string; email_subject: string; email_body: string; whatsapp: string }

const INDUSTRIES = ['Dental Clinic','Med Spa','Law Firm','Real Estate','Online Coaching','Solar Company','HVAC','Other']
const GOALS = ['Follow-up','Reactivate Dead Lead','Reschedule Missed Appointment','Payment Reminder','Post-Service Review Request']
const TONES = ['Professional','Warm and Friendly','Urgent','Casual']

const fs = { background: '#1F2937', border: '1px solid #374151', color: '#F9FAFB' }

export default function GeneratePage() {
  const [form, setForm] = useState({
    firstName: '', businessType: 'Dental Clinic', serviceInterest: '',
    lastInteraction: '', daysSinceContact: 7, goal: 'Follow-up',
    tone: 'Warm and Friendly', businessName: '', bookingLink: '',
  })
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => { document.title = 'AI Generator — Revivo' }, [])

  const set = (k: string, v: string | number) => setForm(p => ({ ...p, [k]: v }))

  const generate = async () => {
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const res = await fetch('/api/generate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.status === 429) {
        const retryAfter = res.headers.get('Retry-After')
        const wait = retryAfter ? `Wait ${retryAfter} seconds.` : 'Please wait a moment.'
        setError(`Too many requests. ${wait}`)
        return
      }

      if (!res.ok) {
        setError('Generation failed. Please check your API key in Settings.')
        return
      }

      const data = await res.json() as Record<string, unknown>

      // Validate response has expected shape before casting
      if (typeof data.sms !== 'string' || typeof data.email_subject !== 'string' || typeof data.email_body !== 'string' || typeof data.whatsapp !== 'string') {
        setError('Unexpected response from AI. Please try again.')
        return
      }

      setResult({
        sms:           data.sms,
        email_subject: data.email_subject,
        email_body:    data.email_body,
        whatsapp:      data.whatsapp,
      })
    } catch {
      setError('Network error. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const copy = (t: string, key: string) => {
    navigator.clipboard.writeText(t).then(() => {
      setCopied(key)
      toast.success('Copied!')
      setTimeout(() => setCopied(null), 2000)
    }).catch(() => toast.error('Copy failed'))
  }

  const smsLen = result?.sms.length ?? 0

  return (
    <div className="p-8 max-w-screen-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#F9FAFB' }}>AI Message Generator</h1>
        <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Generate personalised, human-sounding recovery messages with Claude AI</p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* LEFT — form */}
        <div className="rounded-xl p-6 space-y-4" style={{ background: '#111827', border: '1px solid #374151' }}>
          <h2 className="font-semibold text-xs mb-2 tracking-widest" style={{ color: '#6B7280' }}>CONTACT DETAILS</h2>

          {[
            { label: 'Contact First Name', key: 'firstName', ph: 'Sarah' },
            { label: 'Service Interested In', key: 'serviceInterest', ph: 'Teeth Whitening' },
            { label: 'Business Name', key: 'businessName', ph: 'Miami Smile Dental' },
            { label: 'Booking Link', key: 'bookingLink', ph: 'https://cal.com/your-clinic' },
          ].map(f => (
            <div key={f.key} className="space-y-1.5">
              <Label style={{ color: '#9CA3AF', fontSize: 12 }}>{f.label}</Label>
              <Input
                value={(form as Record<string, string | number>)[f.key] as string}
                onChange={e => set(f.key, e.target.value)}
                placeholder={f.ph}
                style={fs}
                maxLength={200}
              />
            </div>
          ))}

          <div className="space-y-1.5">
            <Label style={{ color: '#9CA3AF', fontSize: 12 }}>Days Since Last Contact</Label>
            <Input
              type="number"
              value={form.daysSinceContact}
              onChange={e => set('daysSinceContact', Math.max(0, Math.min(3650, Number(e.target.value))))}
              min={0}
              max={3650}
              style={fs}
            />
          </div>

          {[
            { label: 'Business Type', key: 'businessType', opts: INDUSTRIES },
            { label: 'Message Goal', key: 'goal', opts: GOALS },
            { label: 'Tone', key: 'tone', opts: TONES },
          ].map(f => (
            <div key={f.key} className="space-y-1.5">
              <Label style={{ color: '#9CA3AF', fontSize: 12 }}>{f.label}</Label>
              <select
                value={(form as Record<string, string | number>)[f.key] as string}
                onChange={e => set(f.key, e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={fs}
              >
                {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}

          <div className="space-y-1.5">
            <Label style={{ color: '#9CA3AF', fontSize: 12 }}>Last Interaction Summary</Label>
            <Textarea
              value={form.lastInteraction}
              onChange={e => set('lastInteraction', e.target.value)}
              placeholder="e.g. She enquired about whitening 6 weeks ago, came in for a consult but never booked..."
              rows={3}
              style={{ ...fs, resize: 'none' }}
              maxLength={1000}
            />
            <p className="text-xs text-right" style={{ color: '#4B5563' }}>{form.lastInteraction.length}/1000</p>
          </div>

          <Button
            onClick={generate}
            disabled={loading}
            className="w-full h-11 font-semibold"
            style={{ background: '#2563EB', color: '#fff' }}
          >
            <Sparkles size={16} className="mr-2" />
            {loading ? 'Claude is writing…' : 'Generate Messages'}
          </Button>
        </div>

        {/* RIGHT — output */}
        <div className="rounded-xl p-6" style={{ background: '#111827', border: '1px solid #374151' }}>
          <h2 className="font-semibold text-xs mb-4 tracking-widest" style={{ color: '#6B7280' }}>GENERATED MESSAGES</h2>

          {loading && (
            <div className="space-y-4">
              <Skeleton className="h-6 w-40" style={{ background: '#1F2937' }} />
              <Skeleton className="h-24 w-full" style={{ background: '#1F2937' }} />
              <Skeleton className="h-6 w-32" style={{ background: '#1F2937' }} />
              <Skeleton className="h-32 w-full" style={{ background: '#1F2937' }} />
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
                <AlertTriangle size={20} style={{ color: '#EF4444' }} />
              </div>
              <p className="text-sm text-center" style={{ color: '#EF4444' }}>{error}</p>
              <Button
                onClick={generate}
                variant="outline"
                className="mt-2"
                style={{ borderColor: '#374151', color: '#9CA3AF' }}
              >
                <RefreshCw size={13} className="mr-2" /> Try Again
              </Button>
            </div>
          )}

          {!loading && !error && result && (
            <>
              <Tabs defaultValue="sms">
                <TabsList style={{ background: '#1F2937', border: '1px solid #374151' }}>
                  <TabsTrigger value="sms">SMS</TabsTrigger>
                  <TabsTrigger value="email">Email</TabsTrigger>
                  <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
                </TabsList>

                <TabsContent value="sms" className="mt-4">
                  <div className="p-4 rounded-xl" style={{ background: '#1F2937', border: '1px solid #374151' }}>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-medium" style={{ color: smsLen > 160 ? '#EF4444' : '#2563EB' }}>
                        SMS · {smsLen}/160 chars {smsLen > 160 && '— will split into 2 messages'}
                      </span>
                      <button onClick={() => copy(result.sms, 'sms')} className="p-1.5 rounded hover:bg-white/5" aria-label="Copy SMS">
                        {copied === 'sms' ? <Check size={14} style={{ color: '#10B981' }} /> : <Copy size={14} style={{ color: '#9CA3AF' }} />}
                      </button>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: '#F9FAFB' }}>{result.sms}</p>
                  </div>
                </TabsContent>

                <TabsContent value="email" className="mt-4">
                  <div className="p-4 rounded-xl" style={{ background: '#1F2937', border: '1px solid #374151' }}>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-medium" style={{ color: '#06B6D4' }}>Email</span>
                      <button onClick={() => copy(`Subject: ${result.email_subject}\n\n${result.email_body}`, 'email')} className="p-1.5 rounded hover:bg-white/5" aria-label="Copy email">
                        {copied === 'email' ? <Check size={14} style={{ color: '#10B981' }} /> : <Copy size={14} style={{ color: '#9CA3AF' }} />}
                      </button>
                    </div>
                    <p className="text-sm font-semibold mb-3" style={{ color: '#F9FAFB' }}>Subject: {result.email_subject}</p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#D1D5DB' }}>{result.email_body}</p>
                  </div>
                </TabsContent>

                <TabsContent value="whatsapp" className="mt-4">
                  <div className="p-4 rounded-xl" style={{ background: '#1F2937', border: '1px solid #374151' }}>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-medium" style={{ color: '#10B981' }}>WhatsApp</span>
                      <button onClick={() => copy(result.whatsapp, 'whatsapp')} className="p-1.5 rounded hover:bg-white/5" aria-label="Copy WhatsApp message">
                        {copied === 'whatsapp' ? <Check size={14} style={{ color: '#10B981' }} /> : <Copy size={14} style={{ color: '#9CA3AF' }} />}
                      </button>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: '#F9FAFB' }}>{result.whatsapp}</p>
                  </div>
                </TabsContent>
              </Tabs>

              <Button
                onClick={generate}
                disabled={loading}
                variant="outline"
                className="w-full mt-4"
                style={{ borderColor: '#374151', color: '#9CA3AF' }}
              >
                <RefreshCw size={14} className="mr-2" /> Regenerate
              </Button>
            </>
          )}

          {!loading && !error && !result && (
            <div className="flex flex-col items-center justify-center h-64 gap-3" style={{ color: '#4B5563' }}>
              <Sparkles size={40} className="opacity-30" />
              <p className="text-sm">Fill in the details and hit Generate</p>
              <p className="text-xs" style={{ color: '#374151' }}>Powered by Claude AI</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
