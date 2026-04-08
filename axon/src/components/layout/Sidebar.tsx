'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Megaphone,
  BarChart3,
  FileText,
  Settings,
  Zap,
  Activity,
  CreditCard,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Leads', href: '/leads', icon: Users },
  { label: 'Campaigns', href: '/campaigns', icon: Megaphone },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Content Hub', href: '/content', icon: FileText },
  { label: 'Billing', href: '/billing', icon: CreditCard },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="fixed left-0 top-0 h-screen z-40 w-[240px] flex flex-col border-r border-border-axon/50"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-border-axon/50">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-axon-indigo to-axon-purple flex items-center justify-center flex-shrink-0">
          <Zap size={16} className="text-white" />
        </div>
        <span className="text-base font-bold tracking-wider text-text-primary">AXON</span>
        <div className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-axon-green/10">
          <div className="w-1.5 h-1.5 rounded-full bg-axon-green live-pulse" />
          <span className="text-[9px] font-bold text-axon-green tracking-wider">LIVE</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        <p className="label-xs text-text-secondary/50 px-3 mb-3">COMMAND CENTER</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? 'text-white'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.03]'
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-axon-indigo/15 to-transparent border border-axon-indigo/20" />
              )}
              <item.icon
                size={18}
                className={`flex-shrink-0 relative z-10 transition-colors ${
                  isActive ? 'text-axon-indigo' : 'text-text-secondary group-hover:text-text-primary'
                }`}
              />
              <span className="relative z-10">{item.label}</span>
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-axon-indigo" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Agent Status */}
      <div className="px-4 pb-4">
        <div className="glass-card p-3 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={12} className="text-axon-green" />
            <span className="text-[10px] font-bold text-text-secondary tracking-wider">AGENT STATUS</span>
          </div>
          {[
            { name: 'Cortex', color: '#22D3EE' },
            { name: 'Specter', color: '#6366F1' },
            { name: 'Striker', color: '#A855F7' },
            { name: 'Pulse', color: '#14B8A6' },
            { name: 'Sentinel', color: '#22C55E' },
          ].map(agent => (
            <div key={agent.name} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full live-pulse" style={{ backgroundColor: agent.color }} />
              <span className="text-xs text-text-secondary">{agent.name}</span>
              <span className="ml-auto text-[9px] font-medium" style={{ color: agent.color }}>ACTIVE</span>
            </div>
          ))}
        </div>
      </div>

      {/* Keyboard Shortcut Hint */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-border-axon/30 text-text-secondary/50 hover:text-text-secondary hover:border-border-axon/50 transition-colors cursor-pointer">
          <span className="text-[10px] font-medium">Command Palette</span>
          <kbd className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono">⌘K</kbd>
        </div>
      </div>
    </aside>
  )
}
