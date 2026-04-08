'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  KanbanSquare,
  MessageSquare,
  Workflow,
  Sparkles,
  Users,
  BarChart3,
  Plug,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',    href: '/dashboard',     badge: null },
  { icon: KanbanSquare,    label: 'Pipeline',     href: '/pipeline',      badge: null },
  { icon: MessageSquare,   label: 'Inbox',        href: '/inbox',         badge: '3' },
  { icon: Workflow,        label: 'Sequences',    href: '/sequences',     badge: null },
  { icon: Sparkles,        label: 'Generate',     href: '/generate',      badge: null },
  { icon: Users,           label: 'Contacts',     href: '/contacts',      badge: null },
  { icon: BarChart3,       label: 'Analytics',    href: '/analytics',     badge: null },
  { icon: Plug,            label: 'Integrations', href: '/integrations',  badge: null },
  { icon: Settings,        label: 'Settings',     href: '/settings',      badge: null },
]

const SECTION_BREAK_AFTER = '/sequences' // visual divider after this item

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 232 }}
      transition={{ type: 'spring', damping: 28, stiffness: 220 }}
      className="h-screen flex flex-col flex-shrink-0 overflow-hidden relative"
      style={{
        background: 'linear-gradient(180deg, #0c0f1a 0%, #0f1117 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Subtle vertical glow on the right edge */}
      <div
        className="absolute right-0 top-0 bottom-0 w-px pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgba(37,99,235,0.3) 40%, rgba(139,92,246,0.2) 70%, transparent 100%)',
        }}
      />

      {/* Logo row */}
      <div className="flex items-center justify-between px-3 h-16 flex-shrink-0">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              key="logo"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-2"
            >
              {/* Logo icon */}
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, rgba(37,99,235,0.9) 0%, rgba(139,92,246,0.9) 100%)',
                  boxShadow: '0 2px 12px rgba(37,99,235,0.4)',
                }}
              >
                <Zap size={14} color="#fff" strokeWidth={2.5} />
              </div>
              <span
                className="sidebar-logo"
                style={{
                  fontFamily: 'var(--font-bricolage, "Bricolage Grotesque", sans-serif)',
                  fontSize: 19,
                  fontWeight: 800,
                  letterSpacing: '-0.5px',
                }}
              >
                Revivo
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setCollapsed((c) => !c)}
          className="p-1.5 rounded-lg transition-colors flex-shrink-0"
          style={{ color: '#4B5563', marginLeft: collapsed ? 'auto' : undefined }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
            e.currentTarget.style.color = '#9CA3AF'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#4B5563'
          }}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-1 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {navItems.map(({ icon: Icon, label, href, badge }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

          return (
            <div key={href}>
              {href === SECTION_BREAK_AFTER && (
                <div
                  className="my-2 mx-1"
                  style={{ height: 1, background: 'rgba(255,255,255,0.05)' }}
                />
              )}
              <Link
                href={href}
                title={collapsed ? label : undefined}
                className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all duration-150 relative group"
                style={
                  active
                    ? {
                        background:
                          'linear-gradient(135deg, rgba(37,99,235,0.75) 0%, rgba(79,70,229,0.75) 100%)',
                        boxShadow: '0 2px 12px rgba(37,99,235,0.25), inset 0 1px 0 rgba(255,255,255,0.08)',
                        color: '#fff',
                      }
                    : { color: '#6B7280' }
                }
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                    e.currentTarget.style.color = '#D1D5DB'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#6B7280'
                  }
                }}
              >
                {/* Active left indicator */}
                {active && (
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r"
                    style={{
                      background: 'linear-gradient(180deg, #60A5FA, #A78BFA)',
                      boxShadow: '0 0 8px rgba(96,165,250,0.6)',
                    }}
                  />
                )}

                <span className="relative flex-shrink-0">
                  <Icon
                    size={17}
                    style={{
                      color: active ? '#fff' : 'inherit',
                      filter: active ? 'drop-shadow(0 0 6px rgba(255,255,255,0.4))' : 'none',
                    }}
                  />
                  {/* Unread badge dot */}
                  {badge && !active && (
                    <span
                      className="absolute -top-1 -right-1 flex items-center justify-center rounded-full"
                      style={{
                        background: '#EF4444',
                        width: 14,
                        height: 14,
                        fontSize: 9,
                        fontWeight: 700,
                        color: '#fff',
                      }}
                    >
                      {badge}
                    </span>
                  )}
                </span>

                {!collapsed && (
                  <span
                    className="text-sm font-medium truncate"
                    style={{ color: active ? '#fff' : 'inherit' }}
                  >
                    {label}
                  </span>
                )}
              </Link>
            </div>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div
        className="p-2 flex-shrink-0 space-y-1"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <button
          onClick={handleLogout}
          title={collapsed ? 'Sign out' : undefined}
          className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl w-full transition-all duration-150"
          style={{ color: '#6B7280' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.08)'
            e.currentTarget.style.color = '#EF4444'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#6B7280'
          }}
        >
          <LogOut size={17} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
        </button>
      </div>
    </motion.aside>
  )
}
