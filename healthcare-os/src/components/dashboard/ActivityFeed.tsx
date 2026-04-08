'use client'
import { useState, useCallback } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { MessageSquare, Mail, TrendingUp, Calendar, Phone } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { useRealtime } from '@/hooks/useRealtime'

interface ActivityItem {
  id: string
  type: string
  description: string
  time: string
}

const initial: ActivityItem[] = [
  {
    id: '1',
    type: 'revenue',
    description: 'Recovered $2,400 — Sarah Mitchell (Whitening)',
    time: new Date(Date.now() - 90000).toISOString(),
  },
  {
    id: '2',
    type: 'sms',
    description: 'Carlos Rivera replied: "Can we reschedule?"',
    time: new Date(Date.now() - 420000).toISOString(),
  },
  {
    id: '3',
    type: 'booked',
    description: 'Amanda Chen booked Implant Consultation',
    time: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: '4',
    type: 'email',
    description: 'Marcus Johnson opened follow-up email',
    time: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '5',
    type: 'revenue',
    description: 'Recovered $5,800 — Priya Patel (Invisalign)',
    time: new Date(Date.now() - 7200000).toISOString(),
  },
]

const typeConfig: Record<
  string,
  { icon: React.ReactNode; color: string; bg: string; border: string; label: string }
> = {
  sms: {
    icon: <MessageSquare size={13} />,
    color: '#60A5FA',
    bg: 'rgba(37,99,235,0.12)',
    border: 'rgba(37,99,235,0.25)',
    label: 'SMS',
  },
  email: {
    icon: <Mail size={13} />,
    color: '#22D3EE',
    bg: 'rgba(6,182,212,0.12)',
    border: 'rgba(6,182,212,0.25)',
    label: 'Email',
  },
  revenue: {
    icon: <TrendingUp size={13} />,
    color: '#34D399',
    bg: 'rgba(16,185,129,0.12)',
    border: 'rgba(16,185,129,0.25)',
    label: 'Revenue',
  },
  booked: {
    icon: <Calendar size={13} />,
    color: '#FBBF24',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.25)',
    label: 'Booked',
  },
  call: {
    icon: <Phone size={13} />,
    color: '#A78BFA',
    bg: 'rgba(139,92,246,0.12)',
    border: 'rgba(139,92,246,0.25)',
    label: 'Call',
  },
}

export function ActivityFeed() {
  const [items, setItems] = useState<ActivityItem[]>(initial)

  const handleRealtime = useCallback(
    (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
      const p = payload.new as Record<string, unknown> | undefined
      if (!p || !p.id) return
      setItems((prev) =>
        [
          {
            id: String(p.id),
            type: String(p.channel ?? 'update'),
            description: `New ${String(p.direction ?? '')} ${String(p.channel ?? '')} message`,
            time: String(p.sent_at ?? new Date().toISOString()),
          },
          ...prev,
        ].slice(0, 20)
      )
    },
    []
  )

  useRealtime('conversations', null, handleRealtime)

  return (
    <div
      className="rounded-2xl overflow-hidden h-full"
      style={{
        background: 'linear-gradient(145deg, rgba(15,17,23,0.98) 0%, rgba(17,24,39,0.98) 100%)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)',
      }}
    >
      {/* Top accent line */}
      <div
        className="h-px w-full"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.6) 50%, transparent 100%)',
        }}
      />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3
            style={{
              fontFamily: 'var(--rv-font-display)',
              fontSize: 15,
              fontWeight: 700,
              color: '#E8ECF3',
              letterSpacing: '-0.2px',
            }}
          >
            Live Activity
          </h3>
          <div className="flex items-center gap-2">
            <span
              className="relative flex h-2 w-2"
            >
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                style={{ background: '#10B981' }}
              />
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ background: '#10B981' }}
              />
            </span>
            <span className="text-xs font-semibold" style={{ color: '#10B981' }}>
              Live
            </span>
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-0">
          <AnimatePresence>
            {items.map((item, idx) => {
              const cfg = typeConfig[item.type] ?? typeConfig.sms
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: -10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 0.68, 0, 1.2] }}
                  className="rv-timeline-item flex items-start gap-3 py-3"
                  style={{
                    borderBottom:
                      idx < items.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  }}
                >
                  {/* Icon badge */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background: cfg.bg,
                      border: `1px solid ${cfg.border}`,
                      color: cfg.color,
                    }}
                  >
                    {cfg.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <p
                        className="text-sm leading-snug flex-1 min-w-0"
                        style={{ color: '#D1D5DB' }}
                      >
                        {item.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span
                        className="text-xs px-1.5 py-px rounded font-medium"
                        style={{
                          background: cfg.bg,
                          color: cfg.color,
                          fontSize: 10,
                        }}
                      >
                        {cfg.label}
                      </span>
                      <span className="text-xs" style={{ color: '#4B5563' }}>
                        ·
                      </span>
                      <span className="text-xs" style={{ color: '#4B5563' }}>
                        {formatDistanceToNow(new Date(item.time), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
