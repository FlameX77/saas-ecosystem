'use client'
import { useState, useEffect, useRef } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { MessageSquare, Mail, MessageCircle, Send, Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface Message { dir: 'in' | 'out'; body: string; time: string; ai: boolean }
interface Convo { id: string; name: string; lastMsg: string; channel: 'sms' | 'email' | 'whatsapp'; unread: boolean; time: string; messages: Message[] }

const DEMO_CONVOS: Convo[] = [
  { id: '1', name: 'Sarah Mitchell', lastMsg: "Yes, I'm still interested in the whitening!", channel: 'sms', unread: true, time: new Date(Date.now() - 120000).toISOString(), messages: [
    { dir: 'out', body: "Hi Sarah! Thanks for your interest in Teeth Whitening at Miami Smile. We have a few spots this week — want to book? 😊", time: new Date(Date.now() - 86400000).toISOString(), ai: true },
    { dir: 'in', body: "Yes, I'm still interested in the whitening!", time: new Date(Date.now() - 120000).toISOString(), ai: false },
  ]},
  { id: '2', name: 'Carlos Rivera', lastMsg: "Can we reschedule for next Tuesday?", channel: 'email', unread: true, time: new Date(Date.now() - 3600000).toISOString(), messages: [
    { dir: 'out', body: "Hey Carlos — just checking in about the Invisalign consultation. We missed you last Tuesday — still interested in getting started?", time: new Date(Date.now() - 7200000).toISOString(), ai: true },
    { dir: 'in', body: "Can we reschedule for next Tuesday?", time: new Date(Date.now() - 3600000).toISOString(), ai: false },
  ]},
  { id: '3', name: 'Amanda Chen', lastMsg: "The implant consultation sounds great.", channel: 'whatsapp', unread: false, time: new Date(Date.now() - 7200000).toISOString(), messages: [
    { dir: 'out', body: "Hi Amanda! Following up on your interest in dental implants. Our specialist has a few slots next week. Want me to reserve one?", time: new Date(Date.now() - 10800000).toISOString(), ai: true },
    { dir: 'in', body: "The implant consultation sounds great.", time: new Date(Date.now() - 7200000).toISOString(), ai: false },
  ]},
]

const chIcon: Record<string, React.ReactNode> = {
  sms:      <MessageSquare size={14} style={{ color: '#2563EB' }} />,
  email:    <Mail          size={14} style={{ color: '#06B6D4' }} />,
  whatsapp: <MessageCircle size={14} style={{ color: '#10B981' }} />,
}

const SMS_LIMIT = 160
const SMS_WARN = 140

export default function InboxPage() {
  const [convos, setConvos] = useState<Convo[]>(DEMO_CONVOS)
  const [selected, setSelected] = useState<string | null>('1')

  useEffect(() => { document.title = 'Inbox — Revivo' }, [])
  const [body, setBody] = useState('')
  const [channel, setChannel] = useState<'sms'|'email'|'whatsapp'>('sms')
  const [sending, setSending] = useState(false)
  const [isDemo, setIsDemo] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  const convo = convos.find(c => c.id === selected)

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [convo?.messages.length])

  // Try to load real conversations
  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
        if (!profile) return

        const { data: rawConvos } = await supabase
          .from('conversations')
          .select('contact_id, body, channel, direction, created_at, contacts(first_name, last_name)')
          .eq('org_id', profile.org_id)
          .order('created_at', { ascending: false })
          .limit(50)

        if (rawConvos && rawConvos.length > 0) {
          setIsDemo(false)
          // Group by contact
          const grouped: Record<string, Convo> = {}
          for (const row of rawConvos) {
            const contactId = row.contact_id as string
            type ContactRow = { first_name: string; last_name?: string }
            const contactRaw = row.contacts
            const contact: ContactRow | null = (contactRaw && typeof contactRaw === 'object' && !Array.isArray(contactRaw))
              ? contactRaw as ContactRow
              : null
            if (!grouped[contactId]) {
              grouped[contactId] = {
                id: contactId,
                name: contact ? `${contact.first_name} ${contact.last_name ?? ''}`.trim() : 'Unknown',
                lastMsg: row.body as string,
                channel: row.channel as 'sms'|'email'|'whatsapp',
                unread: row.direction === 'inbound',
                time: row.created_at as string,
                messages: [],
              }
            }
            grouped[contactId].messages.unshift({
              dir: row.direction === 'inbound' ? 'in' : 'out',
              body: row.body as string,
              time: row.created_at as string,
              ai: row.direction === 'outbound',
            })
          }
          const list = Object.values(grouped).sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
          setConvos(list)
          setSelected(list[0]?.id ?? null)
        }
      } catch {
        // Keep demo data on error
      }
    }
    void load()
  }, [])

  const handleSend = async () => {
    if (!body.trim() || !convo) return
    if (channel === 'sms' && body.length > SMS_LIMIT * 2) {
      toast.error('Message too long for SMS')
      return
    }

    setSending(true)

    try {
      if (!isDemo) {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
          if (profile) {
            await supabase.from('conversations').insert({
              org_id: profile.org_id,
              contact_id: convo.id,
              channel,
              direction: 'outbound',
              body: body.trim(),
            })
          }
        }
      }

      // Optimistic UI update
      const newMsg: Message = { dir: 'out', body: body.trim(), time: new Date().toISOString(), ai: false }
      setConvos(prev => prev.map(c => c.id === convo.id
        ? { ...c, messages: [...c.messages, newMsg], lastMsg: body.trim(), time: new Date().toISOString() }
        : c
      ))
      setBody('')
      toast.success('Message sent!')
    } catch {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      void handleSend()
    }
  }

  const smsOver = channel === 'sms' && body.length > SMS_WARN
  const smsSegments = channel === 'sms' ? Math.ceil(body.length / SMS_LIMIT) : 0

  return (
    <div className="flex h-screen">
      {/* Left panel — conversation list */}
      <div className="w-80 flex-shrink-0 flex flex-col" style={{ borderRight: '1px solid #374151' }}>
        <div className="p-4" style={{ borderBottom: '1px solid #374151' }}>
          <h1 className="text-lg font-bold mb-3" style={{ color: '#F9FAFB' }}>Inbox</h1>
          <input
            placeholder="Search conversations…"
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: '#1F2937', border: '1px solid #374151', color: '#F9FAFB' }}
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {convos.map(c => (
            <div
              key={c.id}
              onClick={() => setSelected(c.id)}
              className="px-4 py-3 cursor-pointer transition-colors"
              style={{ background: selected === c.id ? '#1F2937' : 'transparent', borderBottom: '1px solid #111827' }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold flex items-center gap-1.5" style={{ color: '#F9FAFB' }}>
                  {c.unread && <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ background: '#2563EB' }} />}
                  {c.name}
                </span>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {chIcon[c.channel]}
                  <span className="text-xs" style={{ color: '#6B7280' }}>{formatDistanceToNow(new Date(c.time), { addSuffix: true })}</span>
                </div>
              </div>
              <p className="text-xs truncate" style={{ color: '#9CA3AF' }}>{c.lastMsg}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — thread + composer */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {convo ? (
          <>
            {/* Thread header */}
            <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid #374151' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: '#1F2937', color: '#9CA3AF' }}>
                {convo.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: '#F9FAFB' }}>{convo.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {chIcon[convo.channel]}
                  <span className="text-xs" style={{ color: '#6B7280' }}>{convo.channel.toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {convo.messages.map((m, i) => (
                <div key={i} className={`flex ${m.dir === 'out' ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-sm px-4 py-3 rounded-2xl" style={{ background: m.dir === 'out' ? '#2563EB' : '#1F2937', color: '#F9FAFB' }}>
                    <p className="text-sm leading-relaxed">{m.body}</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <span className="text-xs" style={{ color: m.dir === 'out' ? '#93C5FD' : '#6B7280' }}>
                        {formatDistanceToNow(new Date(m.time), { addSuffix: true })}
                      </span>
                      {m.ai && <span title="AI generated"><Sparkles size={10} style={{ color: '#93C5FD' }} /></span>}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Composer */}
            <div className="p-4" style={{ borderTop: '1px solid #374151' }}>
              <div className="flex gap-2 mb-3">
                {(['sms','email','whatsapp'] as const).map(ch => (
                  <button
                    key={ch}
                    onClick={() => setChannel(ch)}
                    className="px-3 py-1 rounded text-xs font-medium transition-colors"
                    style={{ background: channel === ch ? '#2563EB' : '#1F2937', color: channel === ch ? '#fff' : '#9CA3AF' }}
                  >
                    {ch.toUpperCase()}
                  </button>
                ))}
              </div>

              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Write a message… (${channel === 'sms' ? '⌘+Enter to send' : 'Ctrl+Enter to send'})`}
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
                style={{ background: '#1F2937', border: `1px solid ${smsOver ? '#EF4444' : '#374151'}`, color: '#F9FAFB' }}
                maxLength={channel === 'sms' ? SMS_LIMIT * 3 : undefined}
              />

              {channel === 'sms' && (
                <p className="text-xs mt-1 mb-2" style={{ color: smsOver ? '#EF4444' : '#6B7280' }}>
                  {body.length}/{SMS_LIMIT}
                  {smsSegments > 1 && ` · ${smsSegments} messages`}
                </p>
              )}

              <div className="flex gap-2 mt-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors" style={{ border: '1px solid #374151', color: '#9CA3AF' }}>
                  <Sparkles size={12} /> AI Suggest
                </button>
                <button
                  onClick={() => void handleSend()}
                  disabled={sending || !body.trim()}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium ml-auto transition-colors disabled:opacity-50"
                  style={{ background: '#2563EB', color: '#fff' }}
                >
                  {sending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                  {sending ? 'Sending…' : 'Send'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center" style={{ color: '#6B7280' }}>
            <div className="text-center">
              <MessageSquare size={32} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">Select a conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
