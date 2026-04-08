'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Zap, Loader2, Eye, EyeOff, Mail, Lock, User, Building } from 'lucide-react'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name || !email || !password) return toast.error('Please fill all required fields')
    if (password.length < 8) return toast.error('Password must be at least 8 characters')
    if (!/[A-Z]/.test(password)) return toast.error('Password must contain an uppercase letter')
    if (!/[0-9]/.test(password)) return toast.error('Password must contain a number')
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      })
      if (error) throw error
      if (data.user) {
        await supabase.from('users').insert({
          id: data.user.id, email, name, company,
        })
      }
      toast.success('Account created! Welcome to AXON.')
      router.push('/dashboard')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <div className="absolute top-1/4 right-1/3 w-[600px] h-[600px] rounded-full blur-[200px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.06), transparent)' }} />
      <div className="absolute bottom-1/3 left-1/4 w-[400px] h-[400px] rounded-full blur-[200px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.05), transparent)' }} />

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
            <h1 className="text-2xl font-bold text-text-primary" style={{ letterSpacing: '-0.5px' }}>Start your free trial</h1>
            <p className="text-sm text-text-secondary mt-1">Deploy your AI agents in under 10 minutes.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-text-secondary mb-1.5 block tracking-wider uppercase">Name *</label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary/40" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-3 py-3 rounded-xl bg-white/[0.03] border border-border-axon/50 text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-axon-indigo/40"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-text-secondary mb-1.5 block tracking-wider uppercase">Company</label>
                <div className="relative">
                  <Building size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary/40" />
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Inc"
                    className="w-full pl-10 pr-3 py-3 rounded-xl bg-white/[0.03] border border-border-axon/50 text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-axon-indigo/40"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary mb-1.5 block tracking-wider uppercase">Business Email *</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@acme.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border border-border-axon/50 text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-axon-indigo/40"
                  autoComplete="email"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary mb-1.5 block tracking-wider uppercase">Password *</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary/40" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8+ chars, 1 uppercase, 1 number"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/[0.03] border border-border-axon/50 text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-axon-indigo/40"
                  autoComplete="new-password"
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
              {loading ? 'Creating account...' : 'Deploy Your AI Agents →'}
            </button>
          </form>

          <p className="text-[10px] text-text-secondary/50 mt-4 text-center leading-relaxed">
            14-day free trial. No credit card required. Cancel anytime.
          </p>
        </div>

        <p className="text-center text-sm text-text-secondary mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-axon-indigo font-medium hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
