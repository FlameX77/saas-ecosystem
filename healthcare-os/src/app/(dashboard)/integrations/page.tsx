'use client'
import { useState, useEffect } from 'react'
import { Check, ExternalLink, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Integration {
  id: string
  name: string
  description: string
  logo: string
  connected: boolean
  category: string
  fields: { key: string; label: string; placeholder: string; type?: string }[]
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'Send and receive SMS messages. Power your text outreach with Twilio\'s global carrier network.',
    logo: '📱',
    connected: false,
    category: 'Messaging',
    fields: [
      { key: 'account_sid', label: 'Account SID', placeholder: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
      { key: 'auth_token', label: 'Auth Token', placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', type: 'password' },
      { key: 'phone_number', label: 'Twilio Phone Number', placeholder: '+1 (555) 000-0000' },
    ],
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Deliver email campaigns at scale. Transactional and marketing emails with deliverability you can trust.',
    logo: '✉️',
    connected: false,
    category: 'Email',
    fields: [
      { key: 'api_key', label: 'API Key', placeholder: 'SG.xxxxxxxxxxxxxxxx', type: 'password' },
      { key: 'from_email', label: 'From Email', placeholder: 'hello@yourpractice.com' },
      { key: 'from_name', label: 'From Name', placeholder: 'Dr. Smith\'s Dental' },
    ],
  },
  {
    id: 'cal',
    name: 'Cal.com',
    description: 'Embed booking links directly in your messages. Let patients self-schedule with zero friction.',
    logo: '📅',
    connected: true,
    category: 'Scheduling',
    fields: [
      { key: 'api_key', label: 'Cal.com API Key', placeholder: 'cal_live_xxxxxxxx', type: 'password' },
      { key: 'event_type_id', label: 'Default Event Type ID', placeholder: '123456' },
    ],
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Track recovered revenue and process payments. Automatically log deals when patients pay.',
    logo: '💳',
    connected: false,
    category: 'Payments',
    fields: [
      { key: 'secret_key', label: 'Secret Key', placeholder: 'sk_live_xxxxxxxxxxxxxxxx', type: 'password' },
      { key: 'webhook_secret', label: 'Webhook Secret', placeholder: 'whsec_xxxxxxxxxxxxxxxx', type: 'password' },
    ],
  },
  {
    id: 'google',
    name: 'Google Calendar',
    description: 'Sync appointments directly to Google Calendar. Auto-create events when a contact books.',
    logo: '🗓️',
    connected: false,
    category: 'Scheduling',
    fields: [
      { key: 'client_id', label: 'OAuth Client ID', placeholder: 'xxxxxxxx.apps.googleusercontent.com' },
      { key: 'client_secret', label: 'OAuth Client Secret', placeholder: 'GOCSPX-xxxxxxxxxxxxxxxx', type: 'password' },
    ],
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    description: 'Reach leads on WhatsApp via the official Business API. High open rates, low friction.',
    logo: '💬',
    connected: false,
    category: 'Messaging',
    fields: [
      { key: 'phone_number_id', label: 'Phone Number ID', placeholder: '1234567890123456' },
      { key: 'access_token', label: 'Access Token', placeholder: 'EAAxxxxxxxxxxxxxxxx', type: 'password' },
    ],
  },
]

const CATEGORIES = ['All', 'Messaging', 'Email', 'Scheduling', 'Payments']
const fs = { background: '#1F2937', border: '1px solid #374151', color: '#F9FAFB' }

export default function IntegrationsPage() {
  useEffect(() => { document.title = 'Integrations — Revivo' }, [])
  const [integrations, setIntegrations] = useState(INTEGRATIONS)
  const [filter, setFilter] = useState('All')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [values, setValues] = useState<Record<string, Record<string, string>>>({})

  const filtered = integrations.filter(i => filter === 'All' || i.category === filter)

  const connect = (id: string) => {
    setIntegrations(prev => prev.map(i => i.id === id ? { ...i, connected: true } : i))
    setExpanded(null)
    toast.success('Integration connected successfully!')
  }

  const disconnect = (id: string) => {
    setIntegrations(prev => prev.map(i => i.id === id ? { ...i, connected: false } : i))
    toast.success('Integration disconnected')
  }

  const setField = (intId: string, key: string, val: string) => {
    setValues(prev => ({ ...prev, [intId]: { ...prev[intId], [key]: val } }))
  }

  return (
    <div className="p-8 max-w-screen-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#F9FAFB' }}>Integrations</h1>
        <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Connect your tools to supercharge your revenue recovery workflow</p>
      </div>

      {/* Stats */}
      <div className="flex gap-6 mb-6 p-4 rounded-xl" style={{ background: '#111827', border: '1px solid #374151' }}>
        <div>
          <p className="text-xs" style={{ color: '#6B7280' }}>Connected</p>
          <p className="text-2xl font-bold" style={{ color: '#10B981', fontFamily: 'var(--font-bricolage, "Bricolage Grotesque", sans-serif)' }}>
            {integrations.filter(i => i.connected).length}
          </p>
        </div>
        <div className="w-px" style={{ background: '#374151' }} />
        <div>
          <p className="text-xs" style={{ color: '#6B7280' }}>Available</p>
          <p className="text-2xl font-bold" style={{ color: '#F9FAFB', fontFamily: 'var(--font-bricolage, "Bricolage Grotesque", sans-serif)' }}>{integrations.length}</p>
        </div>
        <div className="ml-auto flex items-center">
          <AlertCircle size={14} className="mr-2" style={{ color: '#F59E0B' }} />
          <p className="text-xs" style={{ color: '#9CA3AF' }}>Connect Twilio and SendGrid to start sending messages</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5">
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{ background: filter === c ? '#2563EB' : '#1F2937', color: filter === c ? '#fff' : '#6B7280', border: `1px solid ${filter === c ? '#2563EB' : '#374151'}` }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Integration cards */}
      <div className="grid grid-cols-2 gap-4">
        {filtered.map(intg => (
          <div key={intg.id} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${intg.connected ? '#10B98133' : '#374151'}`, background: '#111827' }}>
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl" style={{ background: '#1F2937' }}>
                    {intg.logo}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm" style={{ color: '#F9FAFB' }}>{intg.name}</h3>
                      {intg.connected && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs" style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>
                          <Check size={10} /> Connected
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{intg.category}</p>
                  </div>
                </div>
                {intg.connected ? (
                  <button onClick={() => disconnect(intg.id)} className="text-xs px-3 py-1.5 rounded-lg" style={{ border: '1px solid #374151', color: '#6B7280' }}>
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={() => setExpanded(expanded === intg.id ? null : intg.id)}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium"
                    style={{ background: '#2563EB', color: '#fff' }}
                  >
                    Connect
                  </button>
                )}
              </div>
              <p className="text-xs leading-relaxed" style={{ color: '#9CA3AF' }}>{intg.description}</p>
            </div>

            {/* Expanded form */}
            {expanded === intg.id && (
              <div className="px-5 pb-5 space-y-3" style={{ borderTop: '1px solid #1F2937' }}>
                <p className="text-xs font-medium pt-4" style={{ color: '#6B7280' }}>ENTER YOUR CREDENTIALS</p>
                {intg.fields.map(f => (
                  <div key={f.key} className="space-y-1">
                    <Label style={{ color: '#9CA3AF', fontSize: 11 }}>{f.label}</Label>
                    <Input
                      type={f.type || 'text'}
                      placeholder={f.placeholder}
                      value={values[intg.id]?.[f.key] || ''}
                      onChange={e => setField(intg.id, f.key, e.target.value)}
                      style={fs}
                      className="h-8 text-xs"
                    />
                  </div>
                ))}
                <div className="flex gap-2 pt-1">
                  <Button onClick={() => connect(intg.id)} className="h-8 text-xs font-medium" style={{ background: '#2563EB', color: '#fff' }}>
                    Save & Connect
                  </Button>
                  <Button variant="outline" onClick={() => setExpanded(null)} className="h-8 text-xs" style={{ borderColor: '#374151', color: '#9CA3AF' }}>
                    Cancel
                  </Button>
                  <a href="#" className="ml-auto flex items-center gap-1 text-xs" style={{ color: '#6B7280' }}>
                    <ExternalLink size={11} /> Docs
                  </a>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
