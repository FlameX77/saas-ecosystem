'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChartSkeleton, StatCardSkeleton } from '@/components/ui/LoadingSkeleton'
import { formatNumber, getCountryEmoji } from '@/lib/utils'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  DollarSign, Globe, Target, Calendar, TrendingUp,
} from 'lucide-react'
import type { Campaign } from '@/lib/types'

const DATE_RANGES = [
  { label: '7D', value: 7 },
  { label: '30D', value: 30 },
  { label: '90D', value: 90 },
]

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (!active || !payload) return null
  return (
    <div className="glass-card p-3 text-xs border border-border-axon/50" style={{ background: 'var(--bg-primary)' }}>
      <p className="text-text-primary font-medium mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: p.color }} />
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const [range, setRange] = useState(30)
  const [loading, setLoading] = useState(true)
  const [timeSeries, setTimeSeries] = useState<{ date: string; leads: number; meetings: number }[]>([])
  const [countryData, setCountryData] = useState<{ country: string; replyRate: number }[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [highlights, setHighlights] = useState({ pipelineValue: 0, bestCountry: '', avgReplyRate: 0 })
  const supabase = createClient()

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const since = new Date()
    since.setDate(since.getDate() - range)
    const sinceStr = since.toISOString()

    const { data: contacts } = await supabase
      .from('contacts').select('created_at, meeting_at')
      .eq('user_id', user.id).gte('created_at', sinceStr)

    const dayMap: Record<string, { leads: number; meetings: number }> = {}
    ;(contacts || []).forEach((c: { created_at: string; meeting_at: string | null }) => {
      const day = new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      if (!dayMap[day]) dayMap[day] = { leads: 0, meetings: 0 }
      dayMap[day].leads++
      if (c.meeting_at) dayMap[day].meetings++
    })
    setTimeSeries(Object.entries(dayMap).map(([date, v]) => ({ date, ...v })))

    const { data: allContacts } = await supabase
      .from('contacts').select('country, status')
      .eq('user_id', user.id)
      .limit(10000)

    const countryMap: Record<string, { total: number; replied: number }> = {}
    ;(allContacts || []).forEach((c: { country: string; status: string }) => {
      if (!c.country) return
      if (!countryMap[c.country]) countryMap[c.country] = { total: 0, replied: 0 }
      countryMap[c.country].total++
      if (c.status === 'replied' || c.status === 'meeting') countryMap[c.country].replied++
    })
    const cData = Object.entries(countryMap)
      .map(([country, v]) => ({ country, replyRate: v.total > 0 ? Math.round((v.replied / v.total) * 100) : 0 }))
      .sort((a, b) => b.replyRate - a.replyRate).slice(0, 8)
    setCountryData(cData)

    const { data: camps } = await supabase
      .from('campaigns').select('*')
      .eq('user_id', user.id).order('created_at', { ascending: false })
    setCampaigns((camps as Campaign[]) || [])

    const meetingsCount = (contacts || []).filter((c: { meeting_at: string | null }) => c.meeting_at).length
    const bestC = cData.length > 0 ? cData[0].country : 'N/A'
    const totalReplied = (allContacts || []).filter((c: { status: string }) => c.status === 'replied' || c.status === 'meeting').length
    const totalContacts = (allContacts || []).length
    const avgReply = totalContacts > 0 ? Math.round((totalReplied / totalContacts) * 100) : 0

    setHighlights({ pipelineValue: meetingsCount * 2500, bestCountry: bestC, avgReplyRate: avgReply })
    setLoading(false)
  }, [range])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAnalytics() 
  }, [fetchAnalytics])



  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <StatCardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton /><ChartSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header + Date Range */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary" style={{ letterSpacing: '-0.5px' }}>Analytics</h1>
          <p className="text-text-secondary text-sm mt-1">Performance metrics and insights</p>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-border-axon/50">
          {DATE_RANGES.map((d) => (
            <button
              key={d.value}
              onClick={() => setRange(d.value)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                range === d.value
                  ? 'bg-axon-indigo text-white shadow-lg'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              style={range === d.value ? { boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)' } : {}}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-children">
        {[
          { label: 'Pipeline Value', value: `$${formatNumber(highlights.pipelineValue)}`, icon: DollarSign, color: '#22C55E', desc: 'Est. deal value' },
          { label: 'Best Performing Country', value: `${getCountryEmoji(highlights.bestCountry)} ${highlights.bestCountry}`, icon: Globe, color: '#22D3EE', desc: 'Highest reply rate' },
          { label: 'Avg Reply Rate', value: `${highlights.avgReplyRate}%`, icon: Target, color: '#A855F7', desc: 'Across all campaigns' },
        ].map((card) => (
          <div key={card.label} className="glass-card p-5 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ backgroundColor: card.color }} />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${card.color}12` }}>
                  <card.icon size={18} style={{ color: card.color }} />
                </div>
                <div>
                  <span className="text-xs text-text-secondary">{card.label}</span>
                  <p className="text-[10px] text-text-secondary/50">{card.desc}</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-text-primary" style={{ letterSpacing: '-1px' }}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads vs Meetings */}
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-text-primary mb-6 flex items-center gap-2">
            <Calendar size={14} className="text-axon-indigo" />
            Leads vs Meetings Over Time
          </h2>
          {timeSeries.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-text-secondary/50 text-sm">No data for this period</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={timeSeries}>
                <defs>
                  <linearGradient id="leadG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="meetG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(31,41,55,0.5)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="leads" stroke="#6366F1" fill="url(#leadG)" strokeWidth={2} name="Leads" />
                <Area type="monotone" dataKey="meetings" stroke="#22C55E" fill="url(#meetG)" strokeWidth={2} name="Meetings" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Reply Rate by Country */}
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-text-primary mb-6 flex items-center gap-2">
            <Globe size={14} className="text-axon-cyan" />
            Reply Rate by Country
          </h2>
          {countryData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-text-secondary/50 text-sm">No country data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={countryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(31,41,55,0.5)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <YAxis type="category" dataKey="country" tick={{ fontSize: 10, fill: '#E5E7EB' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="replyRate" fill="#22D3EE" name="Reply %" radius={[0, 6, 6, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Campaign Comparison Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-border-axon/50 flex items-center gap-2">
          <TrendingUp size={14} className="text-axon-indigo" />
          <h2 className="text-sm font-semibold text-text-primary">Campaign Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-axon/50">
                {['Campaign', 'Status', 'Leads', 'Sent', 'Replies', 'Meetings', 'Reply Rate'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] font-bold text-text-secondary uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-text-secondary/50 text-sm">No campaigns to analyze</td></tr>
              ) : (
                campaigns.map((c) => {
                  const rr = c.emails_sent > 0 ? Math.round((c.replies_received / c.emails_sent) * 100) : 0
                  return (
                    <tr key={c.id} className="border-b border-border-axon/30 hover:bg-white/[0.015] transition-colors">
                      <td className="px-5 py-3 text-sm font-medium text-text-primary">{c.name}</td>
                      <td className="px-5 py-3">
                        <span className={`text-[10px] font-medium px-2 py-1 rounded-lg ${
                          c.status === 'active' ? 'bg-axon-green/12 text-axon-green' : 'bg-white/8 text-text-secondary'
                        }`}>{c.status}</span>
                      </td>
                      <td className="px-5 py-3 text-sm text-text-primary">{c.leads_found}</td>
                      <td className="px-5 py-3 text-sm text-text-primary">{c.emails_sent}</td>
                      <td className="px-5 py-3 text-sm text-text-primary">{c.replies_received}</td>
                      <td className="px-5 py-3 text-sm text-text-primary">{c.meetings_booked}</td>
                      <td className="px-5 py-3">
                        <span className={`text-sm font-bold ${rr >= 20 ? 'text-axon-green' : rr >= 10 ? 'text-axon-yellow' : 'text-text-secondary'}`}>
                          {rr}%
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
