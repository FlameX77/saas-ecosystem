'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { clearToken } from '@/lib/auth'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, GitBranch, Zap, LogOut, TrendingUp
} from 'lucide-react'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/leads', label: 'Leads', icon: Users },
  { href: '/dashboard/workflows', label: 'Workflows', icon: GitBranch },
  { href: '/dashboard/campaigns', label: 'Campaigns', icon: Zap },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  function logout() {
    clearToken()
    router.push('/login')
  }

  return (
    <aside className="w-64 min-h-screen bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            R
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">Novu</p>
            <p className="text-xs text-slate-500">Revenue Recovery</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                active
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50">
          <TrendingUp size={14} className="text-green-400" />
          <span className="text-xs text-slate-400">AI Engine Active</span>
          <span className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
