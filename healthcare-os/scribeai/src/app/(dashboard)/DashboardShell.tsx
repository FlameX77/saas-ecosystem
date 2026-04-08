'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  IconMicrophone, IconFileSearch, IconUsers, IconSettings, 
  IconLogout, IconStethoscope, IconUser, IconChevronRight,
  IconDatabase, IconLayoutDashboard, IconActivity, IconMenu2, IconX,
  IconSparkles
} from '@tabler/icons-react'
import { createClient } from '@/lib/supabase/client'
import { useUILanguage } from '@/lib/ui-language-context'
import { useClinic } from '@/lib/clinic-context'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Avatar from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'

const NAV_ITEMS = [
  { href: '/dashboard', icon: IconLayoutDashboard, labelKey: 'newConsultation' as const },
  { href: '/dashboard/notes', icon: IconFileSearch, labelKey: 'notesHistory' as const },
  { href: '/dashboard/knowledge', icon: IconDatabase, label: 'Knowledge Base', isNew: true },
  { href: '/dashboard/patients', icon: IconUsers, labelKey: 'patients' as const },
  { href: '/dashboard/settings', icon: IconSettings, labelKey: 'settings' as const },
]

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { t, dir } = useUILanguage()
  const { doctor, clinic } = useClinic()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const currentItem = NAV_ITEMS.find(i =>
    i.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(i.href)
  )

  return (
    <div className={`flex h-screen bg-[#020617] text-slate-200 overflow-hidden font-sans selection:bg-teal-500/20 selection:text-teal-200`} dir={dir}>
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-teal-500/5 blur-[120px] rounded-full" />
      </div>

      {/* ─── Sidebar ─── */}
      <aside className="w-[280px] bg-slate-950/40 border-r border-slate-900 flex flex-col flex-shrink-0 z-40 relative backdrop-blur-xl">
        {/* Logo */}
        <div className="px-8 py-8 border-b border-slate-900/50">
          <Link href="/dashboard" className="flex items-center gap-4 group">
            <div className="w-11 h-11 rounded-2xl bg-teal-500 flex items-center justify-center relative overflow-hidden shadow-2xl shadow-teal-500/20 group-hover:scale-105 transition-transform duration-300">
               <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
               <IconStethoscope className="w-6 h-6 text-black relative z-10" />
            </div>
            <div>
              <span className="block font-black text-white text-lg tracking-tighter leading-none group-hover:text-teal-400 transition-colors">Healthcare OS</span>
              <span className="block text-[10px] font-black text-teal-600 tracking-[0.2em] uppercase mt-1">Clinical Engine</span>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 px-4">Menu Architecture</p>
          {NAV_ITEMS.map((item) => {
            const ItemIcon = item.icon
            const isActive = item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-teal-500 text-black shadow-2xl shadow-teal-500/15'
                    : 'text-slate-500 hover:text-white hover:bg-slate-900/50 hover:translate-x-1'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                  isActive
                    ? 'bg-black/10'
                    : 'bg-slate-900 group-hover:bg-teal-500/10 group-hover:text-teal-500'
                }`}>
                  <ItemIcon size={18} className={`transition-colors ${isActive ? 'text-black' : 'text-slate-500 group-hover:text-teal-500'}`} />
                </div>
                <span className="tracking-tight flex-1">{'labelKey' in item ? t(item.labelKey as any) : item.label}</span>
                {item.isNew && (
                  <Badge variant="dim" className="bg-teal-500/10 text-teal-500 border-teal-500/20 text-[9px]">Beta</Badge>
                )}
                {isActive && <IconChevronRight size={14} className="text-black opacity-40" />}
              </Link>
            )
          })}
        </nav>

        {/* User Profile Area */}
        <div className="p-4 border-t border-slate-900">
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full flex items-center gap-4 p-4 rounded-3xl bg-slate-900/40 hover:bg-slate-900/70 border border-slate-900 hover:border-slate-800 transition-all group data-[state=open]:bg-slate-900/80">
              <div className="relative">
                <Avatar fallback={doctor?.full_name || 'D'} src={doctor?.avatar_url} className="w-10 h-10 ring-2 ring-slate-800 group-hover:ring-teal-500/20 transition-all" />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-teal-500 border-2 border-slate-950 rounded-full shadow-lg shadow-teal-500/30" />
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="text-white font-black truncate leading-tight text-sm tracking-tight">{doctor?.full_name || 'Dr. Account'}</div>
                <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest truncate mt-0.5">{clinic?.name || 'Private Practice'}</div>
              </div>
              <IconMenu2 className="w-4 h-4 text-slate-700 group-hover:text-teal-500 transition-colors" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="right" sideOffset={12} className="w-[240px] bg-slate-950 border border-slate-800 p-2 rounded-3xl shadow-2xl backdrop-blur-2xl">
               <div className="px-3 py-3 mb-2 border-b border-slate-900">
                  <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Account Mode</div>
                  <div className="text-sm font-bold text-teal-500 flex items-center gap-2">
                     <IconSparkles size={14}/> Professional License
                  </div>
               </div>
               <DropdownMenuItem onClick={() => router.push('/dashboard/settings')} className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer hover:bg-slate-900 text-slate-300 font-bold outline-none group text-sm">
                 <IconSettings size={18} className="text-slate-500 group-hover:text-teal-500 transition-colors" />
                 Clinic Settings
               </DropdownMenuItem>
               <DropdownMenuSeparator className="my-2 border-slate-900" />
               <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer text-rose-500 hover:bg-rose-500/5 font-bold outline-none group text-sm">
                 <IconLogout size={18} strokeWidth={2.5} />
                 Sign out
               </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* ─── Main content Area ─── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Bar */}
        <header className="h-20 flex items-center justify-between px-8 bg-slate-950/20 border-b border-slate-950 relative z-30 flex-shrink-0">
           <div className="flex items-center gap-4">
              <div className="h-10 w-px bg-slate-900 mx-2 hidden md:block" />
              <div>
                 <h2 className="text-lg font-black text-white tracking-tighter leading-none mb-1">
                   {currentItem ? ('labelKey' in currentItem ? t(currentItem.labelKey as any) : currentItem.label) : 'Overview'}
                 </h2>
                 <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                    </span>
                    <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Protocol Sync: Ready</span>
                 </div>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <Link href="/pricing" className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-500 text-[10px] font-black uppercase tracking-widest hover:bg-teal-500/20 transition-all">
                Trial Status: 12 days left
              </Link>
           </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 overflow-y-auto px-8 py-8 bg-[#020617]/50 relative">
           {/* Noise texture overlay */}
           <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
           <div className="max-w-7xl mx-auto w-full relative z-10 h-full">
              {children}
           </div>
        </div>
      </main>
    </div>
  )
}
