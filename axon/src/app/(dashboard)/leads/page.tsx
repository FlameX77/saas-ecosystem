'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getScoreClass, getStatusClass, getCountryEmoji, formatDate, downloadCSV, getAgentColor } from '@/lib/utils'
import { TableRowSkeleton } from '@/components/ui/LoadingSkeleton'
import EmptyState from '@/components/ui/EmptyState'
import toast from 'react-hot-toast'
import {
  Search, Filter, Download, Brain, X, ExternalLink,
  Mail, ChevronLeft, ChevronRight, Loader2, Flame,
  Linkedin,
} from 'lucide-react'
import type { Contact, Message } from '@/lib/types'

const FILTERS = ['All', 'Hot', 'Warm', 'Replied', 'Meeting', 'Emailed', 'Queued']
const PER_PAGE = 50

export default function LeadsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [triggeringCortex, setTriggeringCortex] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Contact | null>(null)
  const [leadMessages, setLeadMessages] = useState<Message[]>([])
  const supabase = createClient()

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let query = supabase
      .from('contacts')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('score', { ascending: false })

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,company.ilike.%${search}%,email.ilike.%${search}%`)
    }

    if (filter !== 'All') {
      const filterMap: Record<string, string> = {
        Hot: 'hot', Warm: 'warm', Replied: 'replied',
        Meeting: 'meeting', Emailed: 'emailed', Queued: 'queued',
      }
      const val = filterMap[filter]
      if (val) query = query.eq('status', val)
    }

    const from = page * PER_PAGE
    query = query.range(from, from + PER_PAGE - 1)

    const { data, count } = await query
    setContacts((data as Contact[]) || [])
    setTotal(count || 0)
    setLoading(false)
  }, [page, search, filter])

  useEffect(() => { fetchLeads() }, [fetchLeads])
  useEffect(() => { setPage(0) }, [search, filter])

  const handleTriggerCortex = async () => {
    setTriggeringCortex(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const res = await fetch('/api/agent/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent: 'cortex', userId: user.id,
          payload: { industries: [], jobTitles: [], countries: [], maxLeads: 50 },
        }),
      })
      if (!res.ok) throw new Error('Failed to trigger Cortex')
      toast.success('🧠 Cortex is now searching for leads!')
      setTimeout(fetchLeads, 5000)
    } catch {
      toast.error('Failed to trigger Cortex agent')
    } finally {
      setTriggeringCortex(false)
    }
  }

  const handleExport = () => {
    if (contacts.length === 0) return toast.error('No leads to export')
    const exportData = contacts.map(c => ({
      Name: `${c.first_name} ${c.last_name}`, Email: c.email, Company: c.company,
      Title: c.title, Industry: c.industry, Country: c.country,
      Score: c.score, Status: c.status,
    }))
    downloadCSV(exportData, 'axon-leads')
    toast.success('Leads exported to CSV!')
  }

  const openLeadDetail = async (lead: Contact) => {
    setSelectedLead(lead)
    const { data } = await supabase
      .from('messages').select('*')
      .eq('contact_id', lead.id)
      .order('created_at', { ascending: false })
    setLeadMessages((data as Message[]) || [])
  }

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary" style={{ letterSpacing: '-0.5px' }}>Leads Manager</h1>
          <p className="text-text-secondary text-sm mt-1">{total.toLocaleString()} contacts in your pipeline</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-axon/50 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/[0.03] transition-colors"
          >
            <Download size={14} />
            Export CSV
          </button>
          <button
            onClick={handleTriggerCortex}
            disabled={triggeringCortex}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #22D3EE, #6366F1)',
              color: 'white',
              boxShadow: '0 0 20px rgba(34, 211, 238, 0.2)',
            }}
          >
            {triggeringCortex ? <Loader2 size={14} className="animate-spin" /> : <Brain size={14} />}
            Run Cortex Now
          </button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary/50" />
          <input
            type="text"
            placeholder="Search by name, company, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-border-axon/50 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-axon-indigo/40 transition-colors"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter size={12} className="text-text-secondary/50 mr-1" />
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                filter === f
                  ? 'bg-axon-indigo/12 text-axon-indigo border border-axon-indigo/25'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.03] border border-transparent'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-axon/50">
                {['Contact', 'Company', 'Title', 'Industry', 'Country', 'Score', 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] font-bold text-text-secondary uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-2">
                    <EmptyState
                      title="No leads found"
                      description="Run Cortex to discover new leads, or adjust your search filters."
                      action={{ label: 'Run Cortex', onClick: handleTriggerCortex }}
                    />
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => (
                  <tr
                    key={contact.id}
                    onClick={() => openLeadDetail(contact)}
                    className="border-b border-border-axon/30 hover:bg-white/[0.015] cursor-pointer transition-colors group"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0 border"
                          style={{
                            backgroundColor: `${getAgentColor('cortex')}06`,
                            borderColor: `${getAgentColor('cortex')}12`,
                            color: getAgentColor('cortex'),
                          }}
                        >
                          {contact.first_name?.[0]}{contact.last_name?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">{contact.first_name} {contact.last_name}</p>
                          <p className="text-[11px] text-text-secondary">{contact.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-text-primary">{contact.company}</td>
                    <td className="px-5 py-3.5 text-xs text-text-secondary">{contact.title}</td>
                    <td className="px-5 py-3.5 text-xs text-text-secondary">{contact.industry}</td>
                    <td className="px-5 py-3.5 text-sm">
                      <span>{getCountryEmoji(contact.country)} {contact.country}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${getScoreClass(contact.score)}`}>
                        {contact.score}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-medium px-2.5 py-1 rounded-lg capitalize ${getStatusClass(contact.status)}`}>
                        {contact.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border-axon/50">
            <p className="text-[11px] text-text-secondary">
              Showing {page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/[0.03] disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-[11px] text-text-secondary px-2">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/[0.03] disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lead Detail Sidebar */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedLead(null)} />
          <div
            className="relative w-full max-w-md h-full overflow-y-auto border-l border-border-axon/50 slide-in-right"
            style={{ background: 'var(--bg-primary)' }}
          >
            <div className="sticky top-0 flex items-center justify-between p-5 border-b border-border-axon/50 backdrop-blur-xl z-10" style={{ background: 'rgba(11, 15, 20, 0.9)' }}>
              <h2 className="text-base font-semibold text-text-primary">Lead Details</h2>
              <button onClick={() => setSelectedLead(null)} className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-white/[0.03]">
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-6">
              {/* Contact Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold border"
                    style={{
                      backgroundColor: `${getAgentColor('cortex')}08`,
                      borderColor: `${getAgentColor('cortex')}15`,
                      color: getAgentColor('cortex'),
                    }}
                  >
                    {selectedLead.first_name?.[0]}{selectedLead.last_name?.[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">{selectedLead.first_name} {selectedLead.last_name}</h3>
                    <p className="text-sm text-text-secondary">{selectedLead.title}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="glass-card p-3">
                    <p className="text-[10px] text-text-secondary mb-1 font-medium tracking-wider uppercase">Score</p>
                    <span className={`text-xl font-bold px-2 py-0.5 rounded-lg ${getScoreClass(selectedLead.score)}`}>
                      {selectedLead.score}
                    </span>
                  </div>
                  <div className="glass-card p-3">
                    <p className="text-[10px] text-text-secondary mb-1 font-medium tracking-wider uppercase">Status</p>
                    <span className={`text-sm font-semibold px-2 py-0.5 rounded-lg capitalize ${getStatusClass(selectedLead.status)}`}>
                      {selectedLead.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail size={13} className="text-text-secondary/50 flex-shrink-0" />
                    <span className="text-sm text-text-primary">{selectedLead.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-text-secondary w-16">Company</span>
                    <span className="text-sm text-text-primary">{selectedLead.company}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-text-secondary w-16">Industry</span>
                    <span className="text-sm text-text-primary">{selectedLead.industry}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-text-secondary w-16">Country</span>
                    <span className="text-sm text-text-primary">{getCountryEmoji(selectedLead.country)} {selectedLead.country}</span>
                  </div>
                </div>

                {selectedLead.linkedin_url && (
                  <a
                    href={selectedLead.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0A66C2]/8 border border-[#0A66C2]/15 text-[#0A66C2] text-sm font-medium hover:bg-[#0A66C2]/12 transition-colors w-full justify-center"
                  >
                    <Linkedin size={14} />
                    View LinkedIn Profile
                  </a>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      const { error } = await supabase
                        .from('contacts').update({ status: 'hot' }).eq('id', selectedLead.id)
                      if (error) return toast.error('Failed to update status')
                      setSelectedLead({ ...selectedLead, status: 'hot' })
                      setContacts(prev => prev.map(c => c.id === selectedLead.id ? { ...c, status: 'hot' } : c))
                      toast.success('Lead marked as hot!')
                    }}
                    disabled={selectedLead.status === 'hot'}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-axon-red/8 border border-axon-red/15 text-axon-red text-xs font-semibold hover:bg-axon-red/12 transition-colors disabled:opacity-40"
                  >
                    <Flame size={12} className="inline mr-1" />
                    {selectedLead.status === 'hot' ? 'Already Hot' : 'Mark as Hot'}
                  </button>
                </div>

                {selectedLead.score_reason && (
                  <div className="glass-card p-4">
                    <p className="text-[10px] font-bold text-text-secondary mb-2 uppercase tracking-widest">AI SCORE REASON</p>
                    <p className="text-sm text-text-primary leading-relaxed">{selectedLead.score_reason}</p>
                  </div>
                )}
              </div>

              {/* Email History */}
              <div>
                <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3">EMAIL HISTORY</h3>
                {leadMessages.length === 0 ? (
                  <p className="text-sm text-text-secondary/60">No emails sent yet.</p>
                ) : (
                  <div className="space-y-3">
                    {leadMessages.map((msg) => (
                      <div key={msg.id} className="glass-card p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-text-primary truncate">{msg.subject}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-lg ${
                            msg.replied_at ? 'bg-axon-green/12 text-axon-green' : 'bg-white/8 text-text-secondary'
                          }`}>
                            {msg.replied_at ? 'Replied' : msg.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-secondary line-clamp-3">{msg.body}</p>
                        {msg.sent_at && (
                          <p className="text-[10px] text-text-secondary/50">Sent: {formatDate(msg.sent_at)}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
