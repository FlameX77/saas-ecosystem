'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Zap, Loader2, Eye, EyeOff, Mail, Lock } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!email || !password) return toast.error('Please fill all fields')
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      toast.success('Welcome back to AXON!')
      router.push('/dashboard')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Ambient orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[200px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.06), transparent)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[200px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(34, 211, 238, 0.04), transparent)' }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-axon-indigo to-axon-purple flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-wider text-text-primary">AXON</span>
            <p className="text-[10px] text-text-secondary tracking-widest uppercase">AI Business Operating System</p>
          </div>
        </div>

        {/* Form */}
        <div className="glass-card p-8 glow-brand">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-text-primary" style={{ letterSpacing: '-0.5px' }}>Welcome back</h1>
            <p className="text-sm text-text-secondary mt-1">Sign in to access your command center.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-text-secondary mb-1.5 block tracking-wider uppercase">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border border-border-axon/50 text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-axon-indigo/40"
                  autoComplete="email"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary mb-1.5 block tracking-wider uppercase">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary/40" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/[0.03] border border-border-axon/50 text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-axon-indigo/40"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary/40 hover:text-text-secondary transition-colors"
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold transition-all disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #6366F1, #A855F7)',
                boxShadow: '0 0 24px rgba(99, 102, 241, 0.2)',
              }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-text-secondary mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-axon-indigo font-medium hover:underline">
            Start Free Trial
          </Link>
        </p>
      </div>
    </div>
  )
}
