'use client'
import { DollarSign, TrendingUp, Users, Zap } from 'lucide-react'
import { useCountUp } from '@/hooks/useCountUp'

export function RevenueKPICard() {
  const animated = useCountUp(34500, 1500)

  return (
    <div
      className="rounded-2xl relative overflow-hidden"
      style={{
        background:
          'linear-gradient(145deg, #040d18 0%, #071828 20%, #0a2d23 55%, #062016 100%)',
        border: '1px solid rgba(16,185,129,0.18)',
        boxShadow:
          '0 24px 72px rgba(0,0,0,0.55), 0 0 0 1px rgba(16,185,129,0.06), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      {/* Animated background grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(16,185,129,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16,185,129,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Top accent line — blue → emerald */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(37,99,235,0.6) 25%, rgba(16,185,129,0.8) 50%, rgba(37,99,235,0.6) 75%, transparent 100%)',
        }}
      />

      {/* Orb — top right */}
      <div
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(16,185,129,0.14) 0%, rgba(37,99,235,0.06) 45%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      />

      {/* Orb — bottom left */}
      <div
        className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)',
          filter: 'blur(28px)',
        }}
      />

      <div className="relative p-6 md:p-8">
        <div className="flex items-start justify-between gap-8">
          {/* ── Left: Main Metric ── */}
          <div className="flex-1 min-w-0">
            {/* Header row */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="p-2.5 rounded-xl relative flex-shrink-0"
                style={{
                  background: 'rgba(16,185,129,0.14)',
                  border: '1px solid rgba(16,185,129,0.28)',
                  boxShadow: '0 0 24px rgba(16,185,129,0.2)',
                }}
              >
                <DollarSign size={20} style={{ color: '#34D399' }} />
                <span
                  className="absolute inset-0 rounded-xl animate-ping"
                  style={{
                    background: 'rgba(16,185,129,0.3)',
                    animationDuration: '2.5s',
                    opacity: 0.25,
                  }}
                />
              </div>
              <div>
                <p
                  className="text-xs font-bold uppercase"
                  style={{ color: '#6EE7B7', letterSpacing: '0.1em' }}
                >
                  Revenue Recovered
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(110,231,183,0.45)' }}>
                  This month · AI-powered outreach
                </p>
              </div>
            </div>

            {/* Big number */}
            <p
              className="gradient-text-green-anim tabular"
              style={{
                fontFamily: 'var(--rv-font-display)',
                fontSize: 'clamp(44px, 6vw, 64px)',
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: '-3px',
                textShadow: '0 0 56px rgba(52,211,153,0.35)',
              }}
            >
              ${animated.toLocaleString()}
            </p>

            {/* Badges row */}
            <div className="flex items-center flex-wrap gap-2.5 mt-5">
              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                style={{
                  background: 'rgba(16,185,129,0.1)',
                  border: '1px solid rgba(16,185,129,0.22)',
                }}
              >
                <TrendingUp size={12} style={{ color: '#10B981' }} />
                <span className="text-xs font-bold" style={{ color: '#34D399' }}>
                  +18% vs last month
                </span>
              </div>
              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                style={{
                  background: 'rgba(37,99,235,0.1)',
                  border: '1px solid rgba(37,99,235,0.22)',
                }}
              >
                <Users size={12} style={{ color: '#60A5FA' }} />
                <span className="text-xs font-bold" style={{ color: '#60A5FA' }}>
                  23 patients recovered
                </span>
              </div>
              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                style={{
                  background: 'rgba(139,92,246,0.1)',
                  border: '1px solid rgba(139,92,246,0.22)',
                }}
              >
                <Zap size={12} style={{ color: '#A78BFA' }} />
                <span className="text-xs font-bold" style={{ color: '#A78BFA' }}>
                  AI-driven
                </span>
              </div>
            </div>
          </div>

          {/* ── Right: Secondary Stats ── */}
          <div className="hidden lg:flex flex-col gap-5 flex-shrink-0">
            {/* Avg per patient */}
            <div
              className="rounded-xl px-5 py-4 text-right"
              style={{
                background: 'rgba(16,185,129,0.06)',
                border: '1px solid rgba(16,185,129,0.12)',
                minWidth: 140,
              }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-wide mb-1"
                style={{ color: 'rgba(110,231,183,0.5)' }}
              >
                Avg. per patient
              </p>
              <p
                style={{
                  fontFamily: 'var(--rv-font-display)',
                  fontSize: 30,
                  fontWeight: 800,
                  color: '#6EE7B7',
                  letterSpacing: '-0.5px',
                  lineHeight: 1,
                }}
              >
                $1,500
              </p>
            </div>

            {/* Recovery rate with bar */}
            <div
              className="rounded-xl px-5 py-4"
              style={{
                background: 'rgba(16,185,129,0.06)',
                border: '1px solid rgba(16,185,129,0.12)',
                minWidth: 140,
              }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-wide mb-1"
                style={{ color: 'rgba(110,231,183,0.5)' }}
              >
                Recovery rate
              </p>
              <p
                style={{
                  fontFamily: 'var(--rv-font-display)',
                  fontSize: 30,
                  fontWeight: 800,
                  color: '#6EE7B7',
                  letterSpacing: '-0.5px',
                  lineHeight: 1,
                  marginBottom: 8,
                }}
              >
                67%
              </p>
              <div className="rv-stat-bar">
                <div
                  className="rv-stat-bar-fill"
                  style={{
                    width: '67%',
                    background: 'linear-gradient(90deg, #10B981, #34D399, #6EE7B7)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
