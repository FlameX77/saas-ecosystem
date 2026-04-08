'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, Bell, User, Search } from 'lucide-react'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Command Center',
  '/leads': 'Leads Manager',
  '/campaigns': 'Campaigns',
  '/analytics': 'Analytics',
  '/content': 'Content Hub',
  '/settings': 'Settings',
}

export default function Topbar() {
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const pageTitle = pageTitles[pathname || ''] || 'Dashboard'

  useEffect(() => {
    // Initial load
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (authUser) {
        setUser({
          email: authUser.email,
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0],
        })
      }
    })

    // Keep in sync: session expiry, sign-out from another tab, token refresh
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser({
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
        })
      } else {
        setUser(null)
        if (event === 'SIGNED_OUT') router.push('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSignOut = async () => {
    setUser(null)
    setShowMenu(false)
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header
      className="h-16 border-b border-border-axon/50 flex items-center justify-between px-6"
      style={{ background: 'var(--bg-secondary)' }}
    >
      {/* Left — Page title + Live */}
      <div className="flex items-center gap-4">
        <h1 className="text-base font-semibold text-text-primary">{pageTitle}</h1>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-axon-green/8 border border-axon-green/15">
          <div className="w-1.5 h-1.5 rounded-full bg-axon-green live-pulse" />
          <span className="text-[10px] font-bold text-axon-green tracking-wider">SYSTEMS ACTIVE</span>
        </div>
      </div>

      {/* Center — Search */}
      <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-border-axon/40 w-72 cursor-pointer hover:border-axon-indigo/20 transition-colors group">
        <Search size={14} className="text-text-secondary/50" />
        <span className="text-sm text-text-secondary/50 flex-1">Search anything...</span>
        <kbd className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-text-secondary/50">⌘K</kbd>
      </div>

      {/* Right — Notifications + Profile */}
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-white/[0.03] transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-axon-indigo glow-ring" />
        </button>

        <div className="w-px h-6 bg-border-axon/50" />

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-white/[0.03] transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-axon-indigo/20 to-axon-purple/20 flex items-center justify-center border border-axon-indigo/20">
              <User size={14} className="text-axon-indigo" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-text-primary leading-tight">{user?.name || 'User'}</p>
              <p className="text-[10px] text-text-secondary">{user?.email || ''}</p>
            </div>
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div
                className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-border-axon/50 py-1 z-50 shadow-2xl slide-in-right"
                style={{ background: 'var(--bg-panel)' }}
              >
                <div className="px-4 py-3 border-b border-border-axon/50">
                  <p className="text-sm font-medium text-text-primary">{user?.name}</p>
                  <p className="text-xs text-text-secondary truncate">{user?.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-axon-red hover:bg-axon-red/5 transition-colors"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
