'use client'
import { useEffect, useState, useCallback } from 'react'
import { api, DashboardSummary, TimelinePoint } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { DollarSign, MessageSquare, Users, Zap, RefreshCw } from 'lucide-react'

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [timeline, setTimeline] = useState<TimelinePoint[]>([])
  const [loading, setLoading] = useState(true)
  const [triggering, setTriggering] = useState(false)

  const load = useCallback(async () => {
    try {
      const [s, t] = await Promise.all([api.dashboard.summary(), api.dashboard.timeline(7)])
      setSummary(s)
      setTimeline(t.timeline)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function triggerBulk() {
    setTriggering(true)
    try {
      const res = await api.events.bulk('cart_abandoned', { source: 'dashboard' })
      toast.success(`Triggered for ${res.leadsProcessed} leads — ${res.jobsCreated} jobs created`)
      await load()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Bulk trigger failed')
    } finally {
      setTriggering(false)
    }
  }

  const stats = summary ? [
    {
      label: 'Recovered Revenue',
      value: formatCurrency(summary.recoveredRevenue),
      icon: DollarSign,
      color: 'text-green-400',
      bg: 'bg-green-500/10 border-green-500/20',
      sub: `${summary.messagesSent} msgs × 10% × ${formatCurrency(summary.avgDealValue)}`,
    },
    {
      label: 'Messages Sent',
      value: summary.messagesSent.toLocaleString(),
      icon: MessageSquare,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
      sub: `Email: ${summary.channelBreakdown.email || 0} · SMS: ${summary.channelBreakdown.sms || 0}`,
    },
    {
      label: 'Leads Contacted',
      value: summary.leadsContacted.toLocaleString(),
      icon: Users,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10 border-violet-500/20',
      sub: 'Total in system',
    },
    {
      label: 'Jobs Active',
      value: (summary.jobBreakdown.pending || 0).toLocaleString(),
      icon: Zap,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      sub: `Completed: ${summary.jobBreakdown.completed || 0} · Failed: ${summary.jobBreakdown.failed || 0}`,
    },
  ] : []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-64">
        <div className="text-slate-400 animate-pulse">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {summary?.clientName || 'Dashboard'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">AI Revenue Recovery Overview</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={load}
            className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <RefreshCw size={14} className="mr-1.5" /> Refresh
          </Button>
          <Button
            size="sm"
            onClick={triggerBulk}
            disabled={triggering}
            className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white"
          >
            <Zap size={14} className="mr-1.5" />
            {triggering ? 'Triggering...' : 'Bulk Campaign'}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className={`bg-slate-900 border ${s.bg} shadow-lg`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">{s.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{s.sub}</p>
                </div>
                <div className={`p-2 rounded-lg ${s.bg}`}>
                  <s.icon size={20} className={s.color} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Timeline Chart */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-base font-semibold flex items-center gap-2">
            Messages — Last 7 Days
            <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">
              {timeline.reduce((a, b) => a + b.total, 0)} total
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {timeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={timeline} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="emailGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="smsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }}
                  labelStyle={{ color: '#94a3b8' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="email" stroke="#3b82f6" fill="url(#emailGrad)" strokeWidth={2} name="Email" />
                <Area type="monotone" dataKey="sms" stroke="#8b5cf6" fill="url(#smsGrad)" strokeWidth={2} name="SMS" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
              No messages yet. Trigger a campaign to see data.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
