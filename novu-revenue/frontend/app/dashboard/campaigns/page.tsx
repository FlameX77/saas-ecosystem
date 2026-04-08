'use client'
import { useState } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Zap, Send, Users, AlertCircle } from 'lucide-react'

const CAMPAIGNS = [
  {
    id: 'cart_abandoned',
    name: 'Cart Abandonment Recovery',
    description: 'Re-engage customers who left items in their cart without purchasing.',
    icon: '🛒',
    channel: 'Email + SMS',
    steps: 3,
    avgROI: '15–25x',
  },
  {
    id: 'payment_failed',
    name: 'Failed Payment Recovery',
    description: 'Recover revenue from failed payment attempts with timely outreach.',
    icon: '💳',
    channel: 'Email + SMS',
    steps: 2,
    avgROI: '40–60x',
  },
  {
    id: 'subscription_expired',
    name: 'Subscription Renewal',
    description: 'Win back lapsed subscribers with personalized renewal offers.',
    icon: '🔄',
    channel: 'Email',
    steps: 2,
    avgROI: '10–20x',
  },
]

export default function CampaignsPage() {
  const [running, setRunning] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, { leadsProcessed: number; jobsCreated: number }>>({})

  async function runCampaign(type: string) {
    setRunning(type)
    try {
      const res = await api.events.bulk(type, { source: 'campaign', triggeredAt: new Date().toISOString() })
      setResults(r => ({ ...r, [type]: { leadsProcessed: res.leadsProcessed, jobsCreated: res.jobsCreated } }))
      toast.success(`Campaign launched! ${res.leadsProcessed} leads targeted, ${res.jobsCreated} jobs queued.`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Campaign failed')
    } finally {
      setRunning(null)
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Zap size={22} className="text-amber-400" /> Campaigns
        </h1>
        <p className="text-slate-400 text-sm mt-1">Trigger bulk recovery campaigns for all your leads</p>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm text-amber-300">
        <AlertCircle size={16} className="mt-0.5 shrink-0" />
        <p>Campaigns trigger AI-powered messages to <strong>all leads</strong>. Workers process jobs every 60 seconds with built-in delay sequences.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {CAMPAIGNS.map(c => {
          const result = results[c.id]
          const isRunning = running === c.id
          return (
            <Card key={c.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{c.icon}</span>
                  <Badge variant="outline" className="text-xs border-green-500/30 text-green-400 bg-green-500/10">
                    ROI {c.avgROI}
                  </Badge>
                </div>
                <CardTitle className="text-white text-base mt-2">{c.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-400">{c.description}</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 bg-slate-800 rounded-full text-slate-400 flex items-center gap-1">
                    <Send size={10} /> {c.channel}
                  </span>
                  <span className="px-2 py-1 bg-slate-800 rounded-full text-slate-400">
                    {c.steps} steps
                  </span>
                </div>
                {result && (
                  <div className="p-2.5 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-green-400 flex items-center gap-2">
                    <Users size={12} />
                    Last run: {result.leadsProcessed} leads · {result.jobsCreated} jobs
                  </div>
                )}
                <Button
                  onClick={() => runCampaign(c.id)}
                  disabled={!!running}
                  className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white"
                  size="sm"
                >
                  <Zap size={14} className="mr-1.5" />
                  {isRunning ? 'Launching...' : 'Launch Campaign'}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
