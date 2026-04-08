'use client'
import { useState, useEffect } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const RANGE_TABS = ['7D', '30D', '90D', 'YTD']

const revenueData = [
  { date: 'Mar 8', recovered: 2800, pipeline: 5200 },
  { date: 'Mar 9', recovered: 3200, pipeline: 6100 },
  { date: 'Mar 10', recovered: 1900, pipeline: 4800 },
  { date: 'Mar 11', recovered: 4100, pipeline: 7200 },
  { date: 'Mar 12', recovered: 3600, pipeline: 6800 },
  { date: 'Mar 13', recovered: 5200, pipeline: 9100 },
  { date: 'Mar 14', recovered: 4800, pipeline: 8400 },
]

const channelData = [
  { channel: 'SMS', sent: 148, replied: 42, recovered: 18 },
  { channel: 'Email', sent: 96, replied: 31, recovered: 12 },
  { channel: 'WhatsApp', sent: 64, replied: 28, recovered: 11 },
]

const stageData = [
  { name: 'New Lead', value: 23, color: '#6B7280' },
  { name: 'Contacted', value: 31, color: '#2563EB' },
  { name: 'Replied', value: 18, color: '#8B5CF6' },
  { name: 'Booked', value: 14, color: '#F59E0B' },
  { name: 'Recovered', value: 41, color: '#10B981' },
  { name: 'Lost', value: 9, color: '#EF4444' },
]

const replyRateData = [
  { week: 'Week 1', sms: 22, email: 18, whatsapp: 31 },
  { week: 'Week 2', sms: 28, email: 24, whatsapp: 38 },
  { week: 'Week 3', sms: 19, email: 21, whatsapp: 29 },
  { week: 'Week 4', sms: 35, email: 27, whatsapp: 44 },
]

const noShowData = [
  { month: 'Nov', rate: 34 },
  { month: 'Dec', rate: 29 },
  { month: 'Jan', rate: 41 },
  { month: 'Feb', rate: 22 },
  { month: 'Mar', rate: 18 },
]

const tooltipStyle = {
  background: '#1F2937',
  border: '1px solid #374151',
  borderRadius: 8,
  color: '#F9FAFB',
  fontSize: 12,
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-5" style={{ background: '#111827', border: '1px solid #374151' }}>
      <div className="mb-4">
        <h3 className="font-semibold text-sm" style={{ color: '#F9FAFB' }}>{title}</h3>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

export default function AnalyticsPage() {
  const [range, setRange] = useState('7D')
  useEffect(() => { document.title = 'Analytics — Revivo' }, [])

  return (
    <div className="p-8 max-w-screen-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#F9FAFB' }}>Analytics</h1>
          <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Revenue recovery performance across all channels</p>
        </div>
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: '#1F2937', border: '1px solid #374151' }}>
          {RANGE_TABS.map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
              style={{ background: range === r ? '#2563EB' : 'transparent', color: range === r ? '#fff' : '#6B7280' }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Top summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Revenue Recovered', value: '$34,500', change: '+18%', up: true },
          { label: 'Total Contacts', value: '136', change: '+23', up: true },
          { label: 'Avg Reply Rate', value: '24%', change: '+3%', up: true },
          { label: 'No-Show Recovery', value: '67%', change: '+12%', up: true },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4" style={{ background: '#111827', border: '1px solid #374151' }}>
            <p className="text-xs mb-2" style={{ color: '#6B7280' }}>{s.label}</p>
            <p className="text-2xl font-bold mb-1" style={{ color: '#F9FAFB', fontFamily: 'var(--font-bricolage, "Bricolage Grotesque", sans-serif)' }}>{s.value}</p>
            <span className="text-xs font-medium" style={{ color: s.up ? '#10B981' : '#EF4444' }}>{s.change} this period</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <ChartCard title="Revenue Recovery Over Time" subtitle="Recovered vs pipeline value ($)">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPip" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`$${Number(v).toLocaleString()}`, '']} />
              <Area type="monotone" dataKey="pipeline" stroke="#2563EB" strokeWidth={1.5} fill="url(#colorPip)" name="Pipeline" />
              <Area type="monotone" dataKey="recovered" stroke="#10B981" strokeWidth={2} fill="url(#colorRec)" name="Recovered" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Pipeline Distribution */}
        <ChartCard title="Pipeline Stage Distribution" subtitle="Contacts by stage">
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie data={stageData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {stageData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {stageData.map(s => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                    <span className="text-xs" style={{ color: '#9CA3AF' }}>{s.name}</span>
                  </div>
                  <span className="text-xs font-semibold" style={{ color: '#F9FAFB' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Channel Performance */}
        <ChartCard title="Channel Performance" subtitle="Sent vs replied vs recovered per channel">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={channelData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis dataKey="channel" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color: '#9CA3AF', fontSize: 11 }} />
              <Bar dataKey="sent" fill="#374151" radius={[3,3,0,0]} name="Sent" />
              <Bar dataKey="replied" fill="#2563EB" radius={[3,3,0,0]} name="Replied" />
              <Bar dataKey="recovered" fill="#10B981" radius={[3,3,0,0]} name="Recovered" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Reply Rate Trend */}
        <ChartCard title="Reply Rate by Channel" subtitle="Weekly reply rate % over time">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={replyRateData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis dataKey="week" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${Number(v)}%`, '']} />
              <Legend wrapperStyle={{ color: '#9CA3AF', fontSize: 11 }} />
              <Line type="monotone" dataKey="sms" stroke="#2563EB" strokeWidth={2} dot={false} name="SMS" />
              <Line type="monotone" dataKey="email" stroke="#06B6D4" strokeWidth={2} dot={false} name="Email" />
              <Line type="monotone" dataKey="whatsapp" stroke="#10B981" strokeWidth={2} dot={false} name="WhatsApp" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}
