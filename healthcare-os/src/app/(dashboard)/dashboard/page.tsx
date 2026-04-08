import type { Metadata } from 'next'
import { DollarSign, Users, Calendar, TrendingUp, MessageSquare, Percent, Sparkles, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import { KPICard } from '@/components/dashboard/KPICard'
import { RevenueKPICard } from '@/components/dashboard/RevenueKPICard'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'

export const metadata: Metadata = { title: 'Dashboard — Revivo' }

export default function DashboardPage() {
  const today = format(new Date(), 'EEEE, MMMM d, yyyy')

  return (
    <div className="p-6 md:p-8 max-w-screen-xl">

      {/* ── Header ── */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1
            style={{
              fontFamily: 'var(--rv-font-display)',
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: '-0.6px',
              lineHeight: 1.2,
              color: '#E8ECF3',
            }}
          >
            Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--rv-text-3)' }}>
            {today}
          </p>
        </div>

        {/* AI Status badge */}
        <div
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl"
          style={{
            background: 'rgba(139,92,246,0.1)',
            border: '1px solid rgba(139,92,246,0.22)',
          }}
        >
          <span className="relative flex h-2 w-2">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
              style={{ background: '#A78BFA', animationDuration: '1.8s' }}
            />
            <span
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ background: '#A78BFA' }}
            />
          </span>
          <span className="text-xs font-semibold" style={{ color: '#A78BFA' }}>
            AI Active
          </span>
        </div>
      </div>

      {/* ── AI Insight Banner ── */}
      <div
        className="rounded-2xl px-5 py-4 mb-6 flex items-center gap-4 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(139,92,246,0.08) 100%)',
          border: '1px solid rgba(139,92,246,0.18)',
        }}
      >
        {/* Glow */}
        <div
          className="absolute -right-10 -top-10 w-40 h-40 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
          }}
        />
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(37,99,235,0.8) 0%, rgba(139,92,246,0.8) 100%)',
            boxShadow: '0 0 16px rgba(139,92,246,0.3)',
          }}
        >
          <Sparkles size={16} color="#fff" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: '#C4B5FD' }}>
            AI Insight · Today
          </p>
          <p className="text-sm mt-0.5" style={{ color: '#9CA3AF' }}>
            8 patients haven&apos;t responded in 72h — Revivo recommends sending a follow-up sequence now for maximum recovery odds.
          </p>
        </div>
        <button
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0 transition-all duration-150 hover:opacity-80"
          style={{
            background: 'linear-gradient(135deg, rgba(37,99,235,0.7) 0%, rgba(79,70,229,0.7) 100%)',
            color: '#fff',
            border: '1px solid rgba(96,165,250,0.2)',
          }}
        >
          Run Now
          <ArrowRight size={12} />
        </button>
      </div>

      {/* ── Revenue Hero ── */}
      <div className="mb-5">
        <RevenueKPICard />
      </div>

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <KPICard
          title="Leads Recovered"
          value={23}
          trend={12}
          trendLabel="vs last month"
          color="#2563EB"
          icon={Users}
        />
        <KPICard
          title="Appointments Booked"
          value={41}
          trend={8}
          trendLabel="vs last month"
          color="#06B6D4"
          icon={Calendar}
        />
        <KPICard
          title="No-Show Recovery Rate"
          value={67}
          suffix="%"
          trend={5}
          trendLabel="vs last month"
          color="#F59E0B"
          icon={TrendingUp}
        />
        <KPICard
          title="Messages Sent Today"
          value={148}
          color="#8B5CF6"
          icon={MessageSquare}
        />
        <KPICard
          title="Reply Rate (14-day)"
          value={24}
          suffix="%"
          trend={3}
          trendLabel="vs prev period"
          color="#10B981"
          icon={Percent}
        />
      </div>

      {/* ── Chart + Activity ── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-3 xl:col-span-2">
          <RevenueChart />
        </div>
        <div className="col-span-3 xl:col-span-1">
          <ActivityFeed />
        </div>
      </div>
    </div>
  )
}
