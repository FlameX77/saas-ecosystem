'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

// Client-side rate limit: max 5 login attempts per 15 min
const attempts: number[] = []
function isRateLimited(): boolean {
  const now = Date.now()
  const window = 15 * 60 * 1000
  const recent = attempts.filter(t => now - t < window)
  attempts.length = 0
  recent.forEach(t => attempts.push(t))
  return recent.length >= 5
}

function ForgotPasswordButton({ email }: { email: string }) {
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleReset = async () => {
    if (sending || sent) return
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error('Enter your email address above first')
      return
    }
    setSending(true)
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setSent(true)
      toast.success('Reset link sent — check your email')
    } catch {
      toast.error('Something went wrong. Try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <button type="button" onClick={handleReset} disabled={sending || sent} className="text-xs flex items-center gap-1 disabled:opacity-60" style={{ color: '#6B7280' }}>
      {sending && <Loader2 size={10} className="animate-spin" />}
      {sent ? 'Reset link sent ✓' : 'Forgot password?'}
    </button>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic client-side validation
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error('Please enter a valid email address')
      return
    }
    if (password.length < 6) {
      toast.error('Password is too short')
      return
    }
    if (isRateLimited()) {
      toast.error('Too many login attempts. Please wait 15 minutes before trying again.')
      return
    }

    setLoading(true)
    attempts.push(Date.now())

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })

      if (error) {
        // Intentionally vague — don't confirm whether account exists
        toast.error('Invalid email or password')
        setLoading(false)
        return
      }

      router.push('/dashboard')
      router.refresh()
      // Don't reset loading — page is navigating away
    } catch {
      toast.error('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <Card style={{ background: '#111827', border: '1px solid #374151' }} className="rounded-2xl shadow-2xl">
      <CardHeader className="text-center pb-2 pt-8">
        <p style={{ fontFamily: 'var(--font-bricolage, "Bricolage Grotesque", sans-serif)', fontSize: 32, fontWeight: 700, color: '#2563EB' }}>Revivo</p>
        <p style={{ color: '#9CA3AF', fontSize: 14, marginTop: 4 }}>Sign in to your workspace</p>
      </CardHeader>
      <CardContent className="pb-8">
        <form onSubmit={handleLogin} className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label style={{ color: '#9CA3AF', fontSize: 13 }}>Email address</Label>
            <Input
              value={email}
              onChange={e => setEmail(e.target.value)}
              type="email"
              placeholder="you@clinic.com"
              required
              autoComplete="email"
              style={{ background: '#1F2937', border: '1px solid #374151', color: '#F9FAFB' }}
            />
          </div>
          <div className="space-y-1.5">
            <Label style={{ color: '#9CA3AF', fontSize: 13 }}>Password</Label>
            <div className="relative">
              <Input
                value={password}
                onChange={e => setPassword(e.target.value)}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                style={{ background: '#1F2937', border: '1px solid #374151', color: '#F9FAFB', paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: '#6B7280' }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <ForgotPasswordButton email={email} />
          </div>

          <Button
            type="submit"
            className="w-full h-11 mt-1 font-semibold"
            disabled={loading}
            style={{ background: '#2563EB', color: '#fff' }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>

          <p className="text-center text-sm" style={{ color: '#9CA3AF' }}>
            No account?{' '}
            <Link href="/signup" style={{ color: '#2563EB' }}>Start free trial</Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
