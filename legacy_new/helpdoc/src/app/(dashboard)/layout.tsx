"use client"
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IconHome, IconUsers, IconFileText, IconChartBar, IconSettings,
  IconMenu2, IconX,
} from '@tabler/icons-react'
import Avatar from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'

const navItems = [
  { href: '/dashboard', icon: IconHome, label: 'New consultation' },
  { href: '/dashboard/patients', icon: IconUsers, label: 'Patients' },
  { href: '/dashboard/notes', icon: IconFileText, label: 'Notes' },
  { href: '/dashboard/analytics', icon: IconChartBar, label: 'Analytics' },
  { href: '/dashboard/settings', icon: IconSettings, label: 'Settings' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const sidebar = (
    <div style={{
      width: 260, height: '100vh', background: 'var(--bg-1)',
      borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
      position: 'fixed', left: 0, top: 0, zIndex: 40,
    }}>
      {/* Top */}
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--teal)' }} />
          <span style={{ fontWeight: 600, fontSize: 16 }}>ScribeAI</span>
        </div>
        <p style={{ color: '#888', fontSize: 13 }}>Al Noor Medical Center</p>
        <div style={{ height: 1, background: 'var(--border)', margin: '16px 0' }} />
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0 12px' }}>
        {navItems.map(item => {
          const active = pathname === item.href
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} style={{
              position: 'relative', display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 8, textDecoration: 'none',
              color: active ? '#fff' : '#606060', marginBottom: 2,
              transition: 'color 0.15s',
            }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#a0a0a0' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#606060' }}
            >
              {active && (
                <motion.div
                  layoutId="nav-bg"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(15,173,160,0.08)', borderRadius: 8,
                    borderLeft: '2px solid var(--teal)',
                  }}
                />
              )}
              <Icon size={20} style={{ position: 'relative', zIndex: 1 }} />
              <span style={{ position: 'relative', zIndex: 1, fontSize: 14 }}>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: 16 }}>
        <Badge variant="success">Growth Plan</Badge>
        <div style={{ height: 1, background: 'var(--border)', margin: '12px 0' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name="Dr. Ahmed" size="sm" />
          <div>
            <p style={{ fontSize: 14 }}>Dr. Ahmed</p>
            <p style={{ color: '#888', fontSize: 12 }}>ahmed@clinic.ae</p>
          </div>
        </div>
      </div>
    </div>
  )

  const activeItem = navItems.find(item => item.href === pathname)
  const pageTitle = activeItem?.label || 'Dashboard'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#080808' }}>
      {/* Desktop sidebar */}
      <div className="md:block" style={{ display: 'none' }}>{sidebar}</div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                zIndex: 40,
              }}
              className="md:hidden"
            />
            <motion.div
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ zIndex: 50, position: 'fixed', left: 0, top: 0, height: '100vh' }}
              className="md:hidden"
            >
              {sidebar}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Topbar */}
      <div style={{
        height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', position: 'sticky', top: 0, zIndex: 30,
        background: 'rgba(8,8,8,0.9)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
      }} className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ background: 'none', border: 'none', color: '#888' }}
            className="md:hidden sidebar-toggle"
          >
            {mobileOpen ? <IconX size={20} /> : <IconMenu2 size={20} />}
          </button>
          <h1 style={{ fontSize: 16, fontWeight: 600, textTransform: 'capitalize' }}>{pageTitle}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span className="hidden sm:block" style={{ color: '#888', fontSize: 13 }}>March 24, 2026</span>
          <button style={{
            background: 'var(--teal)', color: '#000', fontWeight: 600,
            padding: '8px 16px', borderRadius: 8, fontSize: 13, border: 'none',
          }}>New consultation</button>
        </div>
      </div>

      {/* Main content wrapper */}
      <div className="main-content" style={{ minHeight: 'calc(100vh - 56px)', background: 'var(--bg)' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <div style={{ padding: '24px', maxWidth: 1100, margin: '0 auto' }}>
              {children}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .md\\:block { display: block !important; }
          .md\\:hidden { display: none !important; }
          .topbar, .main-content { margin-left: 260px; }
        }
        @media (max-width: 640px) {
          .hidden.sm\\:block { display: none !important; }
        }
      `}</style>
    </div>
  )
}
