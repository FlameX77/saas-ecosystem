'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import EmptyState from '@/components/ui/EmptyState'
import { CardSkeleton } from '@/components/ui/LoadingSkeleton'
import toast from 'react-hot-toast'
import {
  Plus, X, Play, Pause, Trash2, Loader2, Megaphone,
  Users, Mail, MessageSquare, Calendar, Zap,
} from 'lucide-react'
import type { Campaign } from '@/lib/types'

const INDUSTRIES = ['SaaS', 'Agency', 'Consulting', 'Recruiting', 'Real Estate', 'Finance', 'eCommerce', 'Healthcare']
const COUNTRIES = ['US', 'UK', 'Australia', 'Canada', 'India', 'Germany', 'Singapore', 'France']

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    name: '',
    target_industries: [] as string[],
    target_countries: [] as string[],
    target_job_titles: '',
    daily_limit: 50,
    min_score: 60,
  })
  const supabase = createClient()

  const fetchCampaigns = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)
    const { data } = await supabase
      .from('campaigns').select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setCampaigns((data as Campaign[]) || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchCampaigns() }, [fetchCampaigns])

  const toggleSelection = (list: string[], item: string, setter: (val: string[]) => void) => {
    setter(list.includes(item) ? list.filter(i => i !== item) : [...list, item])
  }

  const handleCreate = async () => {
    if (!form.name.trim()) return toast.error('Campaign name is required')
    setCreating(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const jobTitles = form.target_job_titles.split(',').map(t => t.trim()).filter(Boolean)
      const { error } = await supabase.from('campaigns').insert({
        user_id: user.id, name: form.name,
        target_industries: form.target_industries,
        target_job_titles: jobTitles,
        target_countries: form.target_countries,
        daily_limit: form.daily_limit, min_score: form.min_score,
        status: 'active', leads_found: 0, emails_sent: 0,
        replies_received: 0, meetings_booked: 0,
      })
      if (error) throw error
      await fetch('/api/agent/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent: 'cortex', userId: user.id,
          payload: { industries: form.target_industries, jobTitles, countries: form.target_countries, maxLeads: form.daily_limit },
        }),
      })
      toast.success('🚀 Campaign launched! Cortex is finding leads.')
      setShowModal(false)
      setForm({ name: '', target_industries: [], target_countries: [], target_job_titles: '', daily_limit: 50, min_score: 60 })
      fetchCampaigns()
    } catch {
      toast.error('Failed to create campaign')
    } finally {
      setCreating(false)
    }
  }

  const updateCampaignStatus = async (id: string, status: string) => {
    if (!userId) return
    const { error } = await supabase.from('campaigns').update({ status }).eq('id', id).eq('user_id', userId)
    if (error) return toast.error('Failed to update campaign')
    toast.success(`Campaign ${status === 'paused' ? 'paused' : 'resumed'}`)
    fetchCampaigns()
  }

  const deleteCampaign = async (id: string) => {
    if (!confirm('Delete this campaign? This cannot be undone.')) return
    if (!userId) return
    const { error } = await supabase.from('campaigns').delete().eq('id', id).eq('user_id', userId)
    if (error) return toast.error('Failed to delete campaign')
    toast.success('Campaign deleted')
    fetchCampaigns()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary" style={{ letterSpacing: '-0.5px' }}>Campaigns</h1>
          <p className="text-text-secondary text-sm mt-1">Manage your outreach campaigns</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
          style={{
            background: 'linear-gradient(135deg, #6366F1, #A855F7)',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.2)',
          }}
        >
          <Plus size={16} />
          New Campaign
        </button>
      </div>

      {/* Campaign Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon={<Megaphone size={28} className="text-axon-indigo" />}
          title="No campaigns yet"
          description="Create your first campaign to start finding leads and sending outreach."
          action={{ label: 'Create Campaign', onClick: () => setShowModal(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
          {campaigns.map((campaign) => {
            const replyRate = campaign.emails_sent > 0
              ? Math.round((campaign.replies_received / campaign.emails_sent) * 100) : 0
            return (
              <div key={campaign.id} className="glass-card p-6 hover:border-axon-indigo/20 transition-all duration-300 group">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-base font-semibold text-text-primary">{campaign.name}</h3>
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg mt-1 inline-block ${
                      campaign.status === 'active' ? 'bg-axon-green/12 text-axon-green'
                      : campaign.status === 'paused' ? 'bg-axon-yellow/12 text-axon-yellow'
                      : 'bg-white/8 text-text-secondary'
                    }`}>
                      {campaign.status?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateCampaignStatus(campaign.id, campaign.status === 'active' ? 'paused' : 'active')}
                      className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/[0.03] transition-colors"
                      title={campaign.status === 'active' ? 'Pause' : 'Resume'}
                    >
                      {campaign.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                    <button
                      onClick={() => deleteCampaign(campaign.id)}
                      className="p-2 rounded-lg text-text-secondary hover:text-axon-red hover:bg-axon-red/8 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-5">
                  {[
                    { icon: Users, label: 'Leads', value: campaign.leads_found, color: '#22D3EE' },
                    { icon: Mail, label: 'Sent', value: campaign.emails_sent, color: '#6366F1' },
                    { icon: MessageSquare, label: 'Replies', value: campaign.replies_received, color: '#22C55E' },
                    { icon: Calendar, label: 'Meetings', value: campaign.meetings_booked, color: '#A855F7' },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <stat.icon size={14} style={{ color: stat.color }} className="mx-auto mb-1" />
                      <p className="text-lg font-bold text-text-primary">{stat.value}</p>
                      <p className="text-[10px] text-text-secondary">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <div className="flex items-center justify-between text-[10px] mb-1.5">
                    <span className="text-text-secondary">Reply Rate</span>
                    <span className="text-axon-green font-semibold">{replyRate}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-axon-indigo to-axon-green transition-all duration-700"
                      style={{ width: `${Math.min(replyRate, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* New Campaign Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div
            className="relative w-full max-w-lg rounded-2xl border border-border-axon/50 p-6 space-y-5 max-h-[90vh] overflow-y-auto slide-in-right"
            style={{ background: 'var(--bg-primary)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-text-primary">New Campaign</h2>
                <p className="text-xs text-text-secondary mt-1">Configure your outreach parameters</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-white/[0.03]">
                <X size={16} />
              </button>
            </div>

            {/* Name */}
            <div>
              <label className="text-xs font-semibold text-text-secondary mb-1.5 block tracking-wider uppercase">Campaign Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., SaaS Founders Q1"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-border-axon/50 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-axon-indigo/40"
              />
            </div>

            {/* Industries */}
            <div>
              <label className="text-xs font-semibold text-text-secondary mb-2 block tracking-wider uppercase">Target Industries</label>
              <div className="flex flex-wrap gap-2">
                {INDUSTRIES.map((ind) => (
                  <button
                    key={ind}
                    onClick={() => toggleSelection(form.target_industries, ind, (v) => setForm({ ...form, target_industries: v }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      form.target_industries.includes(ind)
                        ? 'bg-axon-indigo/12 text-axon-indigo border-axon-indigo/25'
                        : 'text-text-secondary border-border-axon/40 hover:border-axon-indigo/20'
                    }`}
                  >
                    {ind}
                  </button>
                ))}
              </div>
            </div>

            {/* Countries */}
            <div>
              <label className="text-xs font-semibold text-text-secondary mb-2 block tracking-wider uppercase">Target Countries</label>
              <div className="flex flex-wrap gap-2">
                {COUNTRIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => toggleSelection(form.target_countries, c, (v) => setForm({ ...form, target_countries: v }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      form.target_countries.includes(c)
                        ? 'bg-axon-indigo/12 text-axon-indigo border-axon-indigo/25'
                        : 'text-text-secondary border-border-axon/40 hover:border-axon-indigo/20'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Job Titles */}
            <div>
              <label className="text-xs font-semibold text-text-secondary mb-1.5 block tracking-wider uppercase">Job Titles (comma-separated)</label>
              <input
                type="text"
                value={form.target_job_titles}
                onChange={(e) => setForm({ ...form, target_job_titles: e.target.value })}
                placeholder="CEO, CTO, VP Sales, Head of Marketing"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-border-axon/50 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-axon-indigo/40"
              />
            </div>

            {/* Daily Limit */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-text-secondary tracking-wider uppercase">Daily Email Limit</label>
                <span className="text-sm font-bold text-axon-indigo">{form.daily_limit}</span>
              </div>
              <input
                type="range" min={10} max={100}
                value={form.daily_limit}
                onChange={(e) => setForm({ ...form, daily_limit: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex items-center justify-between text-[10px] text-text-secondary/50 mt-1">
                <span>10</span><span>100</span>
              </div>
            </div>

            {/* Min Score */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-text-secondary tracking-wider uppercase">Min Lead Score</label>
                <span className="text-sm font-bold text-axon-indigo">{form.min_score}</span>
              </div>
              <input
                type="range" min={40} max={90}
                value={form.min_score}
                onChange={(e) => setForm({ ...form, min_score: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex items-center justify-between text-[10px] text-text-secondary/50 mt-1">
                <span>40</span><span>90</span>
              </div>
            </div>

            <button
              onClick={handleCreate}
              disabled={creating}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white font-semibold transition-all disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #6366F1, #A855F7)',
                boxShadow: '0 0 20px rgba(99, 102, 241, 0.2)',
              }}
            >
              {creating ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
              {creating ? 'Launching...' : 'Launch Campaign'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
