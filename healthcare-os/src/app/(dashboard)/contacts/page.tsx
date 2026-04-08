'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, Upload, Download, Plus, ChevronDown, Phone, Mail, MessageCircle, MoreHorizontal, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UrgencyBadge } from '@/components/shared/UrgencyBadge'
import { createClient } from '@/lib/supabase/client'
import type { Contact } from '@/types'

const STAGE_COLORS: Record<string, string> = {
  new_lead:            '#6B7280',
  contacted:           '#2563EB',
  replied:             '#8B5CF6',
  appointment_booked:  '#F59E0B',
  recovered:           '#10B981',
  lost:                '#EF4444',
}

const DEMO: Contact[] = [
  { id: '1', org_id: 'demo', first_name: 'Sarah',  last_name: 'Mitchell',  phone: '+13055551234', email: 'sarah@example.com',  service_interest: 'Teeth Whitening',   deal_value: 2400, stage: 'new_lead',           opted_out: false, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: '2', org_id: 'demo', first_name: 'Carlos', last_name: 'Rivera',    phone: '+13055555678',                              service_interest: 'Invisalign',         deal_value: 5800, stage: 'contacted',           opted_out: false, last_contacted_at: new Date(Date.now() - 2 * 86400000).toISOString(), created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: '3', org_id: 'demo', first_name: 'Amanda', last_name: 'Chen',      phone: '+13055559012', email: 'amanda@example.com', service_interest: 'Dental Implant',    deal_value: 4200, stage: 'replied',             opted_out: false, last_contacted_at: new Date(Date.now() - 86400000).toISOString(), created_at: new Date(Date.now() - 7 * 86400000).toISOString() },
  { id: '4', org_id: 'demo', first_name: 'Marcus', last_name: 'Johnson',                                                       service_interest: 'Porcelain Veneers',  deal_value: 8500, stage: 'appointment_booked',  opted_out: false, last_contacted_at: new Date(Date.now() - 3600000).toISOString(), created_at: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: '5', org_id: 'demo', first_name: 'Priya',  last_name: 'Patel',                            email: 'priya@example.com', service_interest: 'Crown',              deal_value: 1800, stage: 'recovered',           opted_out: false, last_contacted_at: new Date().toISOString(), created_at: new Date(Date.now() - 14 * 86400000).toISOString() },
  { id: '6', org_id: 'demo', first_name: 'David',  last_name: 'Kim',       phone: '+13055557890',                              service_interest: 'Whitening',           deal_value: 800,  stage: 'new_lead',            opted_out: false, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: '7', org_id: 'demo', first_name: 'Elena',  last_name: 'Rodriguez',                        email: 'elena@example.com', service_interest: 'Braces',             deal_value: 6200, stage: 'contacted',           opted_out: false, last_contacted_at: new Date(Date.now() - 4 * 86400000).toISOString(), created_at: new Date(Date.now() - 12 * 86400000).toISOString() },
  { id: '8', org_id: 'demo', first_name: 'James',  last_name: 'Wong',      phone: '+13055558901',                              service_interest: 'Root Canal',         deal_value: 1200, stage: 'lost',                opted_out: false, created_at: new Date(Date.now() - 20 * 86400000).toISOString() },
]

const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
const fmtCurrency = (n: number) => `$${n.toLocaleString()}`

const PAGE_SIZE = 20

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { document.title = 'Contacts — Revivo' }, [])

  const fetchContacts = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setContacts(DEMO)
        setTotal(DEMO.length)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', user.id)
        .single()

      if (!profile) {
        setContacts(DEMO)
        setTotal(DEMO.length)
        return
      }

      let query = supabase
        .from('contacts')
        .select('*', { count: 'exact' })
        .eq('org_id', profile.org_id)
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

      if (stageFilter !== 'all') query = query.eq('stage', stageFilter)
      if (search) query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,service_interest.ilike.%${search}%`)

      const { data, count, error } = await query

      if (error) throw error
      if (data && data.length > 0) {
        setContacts(data)
        setTotal(count ?? 0)
      } else {
        // Show demo data when org has no contacts yet
        setContacts(DEMO)
        setTotal(DEMO.length)
      }
    } catch (err) {
      console.error('Contacts fetch error:', err)
      setContacts(DEMO)
      setTotal(DEMO.length)
      toast.error('Could not load contacts — showing demo data')
    } finally {
      setLoading(false)
    }
  }, [page, search, stageFilter])

  useEffect(() => { void fetchContacts() }, [fetchContacts])

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    setSelected(prev => prev.size === contacts.length ? new Set() : new Set(contacts.map(c => c.id)))
  }

  const exportCSV = () => {
    const rows = [['First Name','Last Name','Phone','Email','Service','Deal Value','Stage','Created']]
    contacts.forEach(c => rows.push([
      c.first_name, c.last_name ?? '', c.phone ?? '', c.email ?? '',
      c.service_interest ?? '', String(c.deal_value ?? 0), c.stage, fmt(c.created_at),
    ]))
    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'contacts.csv'; a.click()
    URL.revokeObjectURL(url)
    toast.success('Exported contacts.csv')
  }

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/contacts/import', { method: 'POST', body: formData })
      const data = await res.json() as { imported?: number; skipped?: number; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Import failed')
      toast.success(`Imported ${data.imported ?? 0} contacts${data.skipped ? `, ${data.skipped} skipped` : ''}`)
      void fetchContacts()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="p-8 max-w-screen-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#F9FAFB' }}>Contacts</h1>
          <p className="text-sm mt-1" style={{ color: '#6B7280' }}>{total} total leads</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ border: '1px solid #374151', color: '#9CA3AF' }}>
            <Download size={13} /> Export CSV
          </button>
          <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleImportCSV} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-60"
            style={{ border: '1px solid #374151', color: '#9CA3AF' }}
          >
            {importing ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
            {importing ? 'Importing…' : 'Import CSV'}
          </button>
          <Button className="h-8 text-xs font-medium" style={{ background: '#2563EB', color: '#fff' }}>
            <Plus size={13} className="mr-1" /> Add Contact
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6B7280' }} />
          <Input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0) }}
            placeholder="Search contacts…"
            className="pl-8 h-9 text-sm"
            style={{ background: '#1F2937', border: '1px solid #374151', color: '#F9FAFB' }}
          />
        </div>
        <div className="relative">
          <select
            value={stageFilter}
            onChange={e => { setStageFilter(e.target.value); setPage(0) }}
            className="pl-3 pr-8 py-2 rounded-lg text-sm outline-none appearance-none"
            style={{ background: '#1F2937', border: '1px solid #374151', color: '#9CA3AF' }}
          >
            <option value="all">All Stages</option>
            <option value="new_lead">New Lead</option>
            <option value="contacted">Contacted</option>
            <option value="replied">Replied</option>
            <option value="appointment_booked">Appointment Booked</option>
            <option value="recovered">Recovered</option>
            <option value="lost">Lost</option>
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#6B7280' }} />
        </div>
        {selected.size > 0 && (
          <span className="flex items-center gap-2 px-3 text-xs" style={{ color: '#9CA3AF' }}>
            {selected.size} selected
            <button className="px-2 py-1 rounded text-xs" style={{ background: '#2563EB', color: '#fff' }}>
              Enroll in Sequence
            </button>
          </span>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #374151' }}>
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-2" style={{ color: '#6B7280' }}>
            <Loader2 size={16} className="animate-spin" /> Loading contacts…
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#111827', borderBottom: '1px solid #374151' }}>
                <th className="w-10 px-4 py-3 text-left">
                  <input type="checkbox" checked={selected.size === contacts.length && contacts.length > 0} onChange={toggleAll} className="w-4 h-4 rounded" />
                </th>
                {['NAME','CONTACT','SERVICE','DEAL VALUE','STAGE','LAST CONTACT','URGENCY',''].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-xs" style={{ color: '#6B7280' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contacts.map((c, i) => (
                <tr
                  key={c.id}
                  style={{
                    background: selected.has(c.id) ? 'rgba(37,99,235,0.08)' : i % 2 === 0 ? '#0D1117' : '#111827',
                    borderBottom: '1px solid #1F2937',
                  }}
                  className="hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)} className="w-4 h-4 rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: '#1F2937', color: '#9CA3AF' }}>
                        {c.first_name[0]}{c.last_name?.[0] ?? ''}
                      </div>
                      <span className="font-medium whitespace-nowrap" style={{ color: '#F9FAFB' }}>{c.first_name} {c.last_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {c.phone && <Phone size={12} style={{ color: '#2563EB' }} />}
                      {c.email && <Mail size={12} style={{ color: '#06B6D4' }} />}
                      {!c.phone && !c.email && <MessageCircle size={12} style={{ color: '#6B7280' }} />}
                      <span className="text-xs truncate max-w-[140px]" style={{ color: '#9CA3AF' }}>{c.phone ?? c.email ?? '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#D1D5DB' }}>{c.service_interest ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium" style={{ color: '#F9FAFB', fontFamily: 'var(--font-bricolage, "Bricolage Grotesque", sans-serif)' }}>
                      {c.deal_value ? fmtCurrency(c.deal_value) : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap" style={{ background: STAGE_COLORS[c.stage] + '22', color: STAGE_COLORS[c.stage] }}>
                      {c.stage.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#6B7280' }}>
                    {c.last_contacted_at ? fmt(c.last_contacted_at) : 'Never'}
                  </td>
                  <td className="px-4 py-3">
                    <UrgencyBadge lastContactedAt={c.last_contacted_at} />
                  </td>
                  <td className="px-4 py-3">
                    <button className="p-1 rounded hover:bg-white/10" style={{ color: '#6B7280' }} aria-label="More actions">
                      <MoreHorizontal size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="px-4 py-3 flex items-center justify-between" style={{ borderTop: '1px solid #374151', background: '#111827' }}>
          <span className="text-xs" style={{ color: '#6B7280' }}>
            {loading ? '…' : `Showing ${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, total)} of ${total}`}
          </span>
          {totalPages > 1 && (
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1 rounded text-xs disabled:opacity-40"
                style={{ border: '1px solid #374151', color: '#6B7280' }}
              >
                Previous
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className="px-3 py-1 rounded text-xs"
                  style={{ background: page === i ? '#2563EB' : 'transparent', color: page === i ? '#fff' : '#6B7280', border: `1px solid ${page === i ? '#2563EB' : '#374151'}` }}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1 rounded text-xs disabled:opacity-40"
                style={{ border: '1px solid #374151', color: '#6B7280' }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
