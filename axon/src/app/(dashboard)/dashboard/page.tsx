'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatNumber, getScoreClass, getStatusClass, getAgentColor } from '@/lib/utils'
import { StatCardSkeleton, CardSkeleton } from '@/components/ui/LoadingSkeleton'
import {
  Users,
  Mail,
  MessageSquare,
  Calendar,
  TrendingUp,
  Flame,
  ArrowUpRight,
  Zap,
  Brain,
  Ghost,
  Crosshair,
  Radio,
  Shield,
} from 'lucide-react'
import type { Contact, Campaign, DashboardStats, PipelineCounts } from '@/lib/types'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [pipeline, setPipeline] = useState<PipelineCounts | null>(null)
  const [hotLeads, setHotLeads] = useState<Contact[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [contactsRes, messagesRes, meetingsRes, pipelineRes, hotRes, campaignsRes] = await Promise.all([
      supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('messages').select('id, status', { count: 'exact' }).eq('user_id', user.id).eq('status', 'sent'),
      supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('user_id', user.id).not('meeting_at', 'is', null),
      supabase.from('contacts').select('pipeline_stage').eq('user_id', user.id),
      supabase.from('contacts').select('*').eq('user_id', user.id).gte('score', 75).order('score', { ascending: false }).limit(8),
      supabase.from('campaigns').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(6),
    ])

    const totalLeads = contactsRes.count || 0
    const emailsSent = messagesRes.count || 0
    const meetingsBooked = meetingsRes.count || 0

    const { count: repliedCount } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .not('replied_at', 'is', null)

    const replyRate = emailsSent > 0 ? Math.round(((repliedCount || 0) / emailsSent) * 100) : 0

    setStats({ totalLeads, emailsSent, replyRate, meetingsBooked })

    const stages = pipelineRes.data || []
    const pCounts: PipelineCounts = { queued: 0, emailed: 0, replied: 0, meeting: 0 }
    stages.forEach((s: { pipeline_stage: string }) => {
      const stage = s.pipeline_stage?.toLowerCase() as keyof PipelineCounts
      if (stage in pCounts) pCounts[stage]++
    })
    setPipeline(pCounts)

    setHotLeads((hotRes.data as Contact[]) || [])
    setCampaigns((campaignsRes.data as Campaign[]) || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  // Separate stable effect — realtime channel subscribes once, calls latest fetchData via closure
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, () => fetchData())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Command Center</h1>
          <p className="text-text-secondary text-sm mt-1">Loading your AI operating system...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <StatCardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    )
  }

  const statCards = [
    {
      label: 'Leads Found Today',
      value: formatNumber(stats?.totalLeads || 0),
      icon: Users,
      color: '#22D3EE',
      agentLabel: 'CORTEX',
      change: '+12%',
    },
    {
      label: 'Emails Sent',
      value: formatNumber(stats?.emailsSent || 0),
      icon: Mail,
      color: '#6366F1',
      agentLabel: 'SPECTER',
      change: '+8%',
    },
    {
      label: 'Reply Rate',
      value: `${stats?.replyRate || 0}%`,
      icon: MessageSquare,
      color: '#A855F7',
      agentLabel: 'STRIKER',
      change: '+3%',
    },
    {
      label: 'Meetings Booked',
      value: formatNumber(stats?.meetingsBooked || 0),
      icon: Calendar,
      color: '#22C55E',
      agentLabel: 'SENTINEL',
      change: '+5',
    },
  ]

  const funnelStages = pipeline
    ? [
        { label: 'Queued', count: pipeline.queued, color: '#9CA3AF' },
        { label: 'Emailed', count: pipeline.emailed, color: '#F59E0B' },
        { label: 'Replied', count: pipeline.replied, color: '#22C55E' },
        { label: 'Meeting', count: pipeline.meeting, color: '#6366F1' },
      ]
    : []
  const maxFunnel = Math.max(...funnelStages.map(s => s.count), 1)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary" style={{ letterSpacing: '-0.5px' }}>Command Center</h1>
          <p className="text-text-secondary text-sm mt-1">Real-time overview of your AI agents</p>
        </div>
        {/* Agent Quick Status */}
        <div className="hidden md:flex items-center gap-3">
          {[
            { icon: Brain, color: '#22D3EE', name: 'Cortex' },
            { icon: Ghost, color: '#6366F1', name: 'Specter' },
            { icon: Crosshair, color: '#A855F7', name: 'Striker' },
            { icon: Radio, color: '#14B8A6', name: 'Pulse' },
            { icon: Shield, color: '#22C55E', name: 'Sentinel' },
          ].map(agent => (
            <div
              key={agent.name}
              className="w-8 h-8 rounded-lg flex items-center justify-center relative group cursor-default"
              style={{ backgroundColor: `${agent.color}10` }}
              title={`${agent.name} — Active`}
            >
              <agent.icon size={14} style={{ color: agent.color }} />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-axon-green border border-bg-secondary" />
            </div>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="glass-card p-5 relative overflow-hidden group cursor-default"
          >
            {/* Radial background glow */}
            <div
              className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
              style={{ backgroundColor: card.color }}
            />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${card.color}12` }}
                >
                  <card.icon size={20} style={{ color: card.color }} />
                </div>
                <span className="flex items-center gap-1 text-xs font-semibold text-axon-green">
                  <TrendingUp size={12} />
                  {card.change}
                </span>
              </div>
              <p className="text-3xl font-bold text-text-primary" style={{ letterSpacing: '-1px' }}>{card.value}</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-text-secondary">{card.label}</p>
                <span className="text-[9px] font-bold tracking-wider" style={{ color: card.color }}>{card.agentLabel}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Funnel */}
        <div className="glass-card p-6">
          <h2 className="text-base font-semibold text-text-primary mb-6 flex items-center gap-2">
            <TrendingUp size={16} className="text-axon-indigo" />
            Pipeline Funnel
          </h2>
          <div className="space-y-5">
            {funnelStages.map((stage) => (
              <div key={stage.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">{stage.label}</span>
                  <span className="text-sm font-bold text-text-primary">{stage.count}</span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${Math.max((stage.count / maxFunnel) * 100, 3)}%`,
                      backgroundColor: stage.color,
                      boxShadow: `0 0 12px ${stage.color}40`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hot Leads */}
        <div className="glass-card p-6">
          <h2 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Flame size={16} className="text-axon-red" />
            Hot Leads
            <span className="ml-auto text-[10px] text-text-secondary font-normal tracking-wider">SCORE ≥ 75</span>
          </h2>
          {hotLeads.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-2xl bg-axon-cyan/10 flex items-center justify-center mx-auto mb-3">
                <Brain size={24} className="text-axon-cyan" />
              </div>
              <p className="text-sm text-text-secondary">No hot leads yet.</p>
              <p className="text-xs text-text-secondary/60 mt-1">Run Cortex to discover leads!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {hotLeads.slice(0, 6).map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold border"
                      style={{
                        backgroundColor: `${getAgentColor('cortex')}08`,
                        borderColor: `${getAgentColor('cortex')}15`,
                        color: getAgentColor('cortex'),
                      }}
                    >
                      {lead.first_name?.[0]}{lead.last_name?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {lead.first_name} {lead.last_name}
                      </p>
                      <p className="text-[11px] text-text-secondary">{lead.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${getScoreClass(lead.score)}`}>
                      {lead.score}
                    </span>
                    <span className={`text-[10px] px-2 py-1 rounded-lg capitalize ${getStatusClass(lead.status)}`}>
                      {lead.status}
                    </span>
                    <ArrowUpRight size={14} className="text-text-secondary/30 group-hover:text-axon-indigo transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Active Campaigns */}
      <div>
        <h2 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Zap size={16} className="text-axon-indigo" />
          Active Campaigns
        </h2>
        {campaigns.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-axon-indigo/10 flex items-center justify-center mx-auto mb-3">
              <Zap size={24} className="text-axon-indigo" />
            </div>
            <p className="text-sm text-text-secondary">No campaigns yet.</p>
            <p className="text-xs text-text-secondary/60 mt-1">Create your first campaign to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {campaigns.map((campaign) => {
              const replyRate = campaign.emails_sent > 0
                ? Math.round((campaign.replies_received / campaign.emails_sent) * 100)
                : 0
              return (
                <div key={campaign.id} className="glass-card p-5 hover:border-axon-indigo/20 transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-text-primary text-sm truncate">{campaign.name}</h3>
                    <span className={`text-[10px] px-2.5 py-1 rounded-lg font-medium ${
                      campaign.status === 'active' ? 'bg-axon-green/12 text-axon-green'
                      : campaign.status === 'paused' ? 'bg-axon-yellow/12 text-axon-yellow'
                      : 'bg-white/8 text-text-secondary'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center mb-4">
                    {[
                      { label: 'Leads', value: campaign.leads_found, color: '#22D3EE' },
                      { label: 'Sent', value: campaign.emails_sent, color: '#6366F1' },
                      { label: 'Replies', value: campaign.replies_received, color: '#22C55E' },
                      { label: 'Meetings', value: campaign.meetings_booked, color: '#A855F7' },
                    ].map(stat => (
                      <div key={stat.label}>
                        <p className="text-base font-bold text-text-primary">{stat.value}</p>
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
      </div>
    </div>
  )
}
