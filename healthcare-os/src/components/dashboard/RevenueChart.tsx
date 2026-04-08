'use client'
import { useState, useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

function genData(days: number) {
  const base = [4200, 3800, 5100, 4700, 6200, 5800, 7400, 6900, 8100, 7600, 9200, 8800, 10100, 9500]
  return Array.from({ length: days }, (_, i) => ({
    date: new Date(Date.now() - (days - i - 1) * 86400000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    amount: Math.floor(base[i % base.length] + Math.random() * 2000 - 1000),
  }))
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: 'rgba(15,17,23,0.92)',
        border: '1px solid rgba(37,99,235,0.3)',
        borderRadius: 10,
        padding: '10px 14px',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(37,99,235,0.1)',
      }}
    >
      <p style={{ color: '#6B7280', fontSize: 11, marginBottom: 4, fontWeight: 500 }}>{label}</p>
      <p
        style={{
          fontFamily: 'var(--rv-font-display)',
          color: '#60A5FA',
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: '-0.5px',
        }}
      >
        ${payload[0].value.toLocaleString()}
      </p>
    </div>
  )
}

const RANGES = ['7D', '30D', '90D', 'YTD'] as const

export function RevenueChart() {
  const [range, setRange] = useState('30D')
  const days = ({ '7D': 7, '30D': 30, '90D': 90, YTD: 180 } as Record<string, number>)[range] ?? 30
  const data = useMemo(() => genData(days), [days])

  const total = useMemo(() => data.reduce((s, d) => s + d.amount, 0), [data])
  const avg = Math.round(total / data.length)

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, rgba(15,17,23,0.98) 0%, rgba(17,24,39,0.98) 100%)',
        border: '1px solid rgba(37,99,235,0.15)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)',
      }}
    >
      {/* Top accent line */}
      <div
        className="h-px w-full"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(37,99,235,0.7) 40%, rgba(139,92,246,0.7) 70%, transparent 100%)',
        }}
      />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3
              style={{
                fontFamily: 'var(--rv-font-display)',
                fontSize: 16,
                fontWeight: 700,
                color: '#E8ECF3',
                letterSpacing: '-0.3px',
              }}
            >
              Revenue Recovered
            </h3>
            <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
              AI-driven patient recovery over time
            </p>
          </div>

          {/* Range tabs */}
          <div
            className="flex items-center gap-0.5 rounded-lg p-0.5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200"
                style={
                  range === r
                    ? {
                        background: 'linear-gradient(135deg, rgba(37,99,235,0.8) 0%, rgba(79,70,229,0.8) 100%)',
                        color: '#fff',
                        boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
                      }
                    : { color: '#6B7280' }
                }
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Summary stats strip */}
        <div className="flex items-center gap-5 mb-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <p className="text-xs" style={{ color: '#6B7280' }}>
              Total ({range})
            </p>
            <p
              style={{
                fontFamily: 'var(--rv-font-display)',
                fontSize: 20,
                fontWeight: 700,
                color: '#60A5FA',
                letterSpacing: '-0.5px',
                lineHeight: 1.2,
              }}
            >
              ${total.toLocaleString()}
            </p>
          </div>
          <div
            className="w-px h-8 self-center"
            style={{ background: 'rgba(255,255,255,0.07)' }}
          />
          <div>
            <p className="text-xs" style={{ color: '#6B7280' }}>
              Daily avg
            </p>
            <p
              style={{
                fontFamily: 'var(--rv-font-display)',
                fontSize: 20,
                fontWeight: 700,
                color: '#A78BFA',
                letterSpacing: '-0.5px',
                lineHeight: 1.2,
              }}
            >
              ${avg.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={210}>
          <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="blueVioletGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563EB" stopOpacity={0.35} />
                <stop offset="50%" stopColor="#7C3AED" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="60%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
              <filter id="lineGlow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              horizontal={true}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              stroke="transparent"
              tick={{ fontSize: 11, fill: '#4B5563' }}
              tickLine={false}
              interval={Math.floor(days / 6)}
            />
            <YAxis
              stroke="transparent"
              tick={{ fontSize: 11, fill: '#4B5563' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              width={38}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(96,165,250,0.2)', strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="url(#strokeGrad)"
              strokeWidth={2.5}
              fill="url(#blueVioletGrad)"
              filter="url(#lineGlow)"
              dot={false}
              activeDot={{
                r: 5,
                fill: '#60A5FA',
                stroke: '#fff',
                strokeWidth: 2,
                style: { filter: 'drop-shadow(0 0 6px #3B82F6)' },
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
