'use client'
import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { useCountUp } from '@/hooks/useCountUp'

interface KPICardProps {
  title: string
  value: number
  prefix?: string
  suffix?: string
  trend?: number
  trendLabel?: string
  color: string
  icon: LucideIcon
}

export function KPICard({
  title,
  value,
  prefix = '',
  suffix = '',
  trend,
  trendLabel,
  color,
  icon: Icon,
}: KPICardProps) {
  const animated = useCountUp(value)
  const positive = (trend ?? 0) >= 0

  return (
    <div
      className="rv-card-lift rounded-2xl p-5 relative overflow-hidden kpi-top-line"
      style={
        {
          '--kc': color,
          background:
            'linear-gradient(145deg, rgba(27,31,39,0.97) 0%, rgba(15,17,23,0.97) 100%)',
          border: `1px solid ${color}28`,
          boxShadow: `0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)`,
        } as React.CSSProperties
      }
    >
      {/* Top-right ambient glow */}
      <div
        className="absolute -top-10 -right-10 w-28 h-28 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
        }}
      />

      {/* Colored bottom-left shimmer line */}
      <div
        className="absolute bottom-0 left-0 w-full h-px pointer-events-none"
        style={{
          background: `linear-gradient(90deg, ${color}40 0%, transparent 60%)`,
        }}
      />

      {/* Icon badge */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
        style={{
          background: `linear-gradient(135deg, ${color}22 0%, ${color}0d 100%)`,
          border: `1px solid ${color}35`,
          boxShadow: `0 0 16px ${color}18`,
        }}
      >
        <Icon size={17} style={{ color }} />
      </div>

      <p className="section-label mb-2">{title}</p>

      <p
        className="tabular"
        style={{
          fontFamily: 'var(--rv-font-display)',
          fontSize: 36,
          fontWeight: 800,
          color,
          lineHeight: 1,
          letterSpacing: '-1.5px',
          textShadow: `0 0 28px ${color}55`,
        }}
      >
        {prefix}
        {animated.toLocaleString()}
        {suffix}
      </p>

      {trend !== undefined && (
        <div className="flex items-center gap-2 mt-3.5">
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{
              background: positive
                ? 'rgba(16,185,129,0.1)'
                : 'rgba(239,68,68,0.1)',
              border: `1px solid ${positive ? 'rgba(16,185,129,0.22)' : 'rgba(239,68,68,0.22)'}`,
            }}
          >
            {positive ? (
              <TrendingUp size={11} style={{ color: '#10B981' }} />
            ) : (
              <TrendingDown size={11} style={{ color: '#EF4444' }} />
            )}
            <span
              className="text-xs font-bold"
              style={{ color: positive ? '#10B981' : '#EF4444' }}
            >
              {positive ? '+' : ''}
              {trend}%
            </span>
          </div>
          {trendLabel && (
            <span className="text-xs" style={{ color: 'var(--rv-text-3)' }}>
              {trendLabel}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
