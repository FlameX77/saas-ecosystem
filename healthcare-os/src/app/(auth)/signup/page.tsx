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
import { Eye, EyeOff, Check, X } from 'lucide-react'

function PasswordRule({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      {met
        ? <Check size={11} style={{ color: '#10B981' }} />
        : <X size={11} style={{ color: '#6B7280' }} />
      }
      <span style={{ color: met ? '#10B981' : '#6B7280' }}>{label}</span>
    </div>
  )
}

function getPasswordStrength(pw: string) {
  return {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    number: /\d/.test(pw),
  }
}

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [loading, setLoading] = useState(false)

  const rules = getPasswordStrength(password)
  const isPasswordValid = Object.values(rules).every(Boolean)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName.trim()) { toast.error('Please enter your full name'); return }
    if (!businessName.trim()) { toast.error('Please enter your business name'); return }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { toast.error('Please enter a valid email address'); return }
    if (!isPasswordValid) { toast.error('Please meet all password requirements'); return }

    setLoading(true)

    try {
      const supabase = createClient()

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { full_name: fullName.trim() },
        },
      })

      if (authError || !authData.user) {
        toast.error(authError?.message ?? 'Signup failed. Please try again.')
        setLoading(false)
        return
      }

      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({ name: businessName.trim() })
        .select('id')
        .single()

      if (orgError || !org) {
        toast.error('Failed to create your workspace. Please try again.')
        setLoading(false)
        return
      }

      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        org_id: org.id,
        full_name: fullName.trim(),
        role: 'owner',
      })

      if (profileError) {
        console.error('Profile creation error:', profileError.message)
        // Non-fatal — user can still continue
      }

      router.push('/onboarding')
      router.refresh()
      // Don't reset loading — navigating away
    } catch {
      toast.error('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <Card style={{ background: '#111827', border: '1px solid #374151' }} className="rounded-2xl shadow-2xl">
      <CardHeader className="text-center pb-2 pt-8">
        <p style={{ fontFamily: 'var(--font-bricolage, "Bricolage Grotesque", sans-serif)', fontSize: 32, fontWeight: 700, color: '#2563EB' }}>Revivo</p>
        <p style={{ color: '#9CA3AF', fontSize: 14, marginTop: 4 }}>Start recovering lost revenue today</p>
      </CardHeader>
      <CardContent className="pb-8">
        <form onSubmit={handleSignup} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label style={{ color: '#9CA3AF', fontSize: 13 }}>Full Name</Label>
              <Input
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Jane Smith"
                required
                autoComplete="name"
                style={{ background: '#1F2937', border: '1px solid #374151', color: '#F9FAFB' }}
              />
            </div>
            <div className="space-y-1.5">
              <Label style={{ color: '#9CA3AF', fontSize: 13 }}>Business Name</Label>
              <Input
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                placeholder="Miami Smile Dental"
                required
                style={{ background: '#1F2937', border: '1px solid #374151', color: '#F9FAFB' }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label style={{ color: '#9CA3AF', fontSize: 13 }}>Email address</Label>
            <Input
              value={email}
              onChange={e => setEmail(e.target.value)}
              type="email"
              placeholder="jane@clinic.com"
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
                onFocus={() => setShowRules(true)}
                type={showPassword ? 'text' : 'password'}
                placeholder="8+ characters"
                required
                autoComplete="new-password"
                style={{ background: '#1F2937', border: `1px solid ${showRules && !isPasswordValid ? '#EF4444' : showRules && isPasswordValid ? '#10B981' : '#374151'}`, color: '#F9FAFB', paddingRight: 40 }}
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
            {showRules && (
              <div className="grid grid-cols-2 gap-1 pt-1">
                <PasswordRule met={rules.length} label="8+ characters" />
                <PasswordRule met={rules.upper} label="Uppercase letter" />
                <PasswordRule met={rules.lower} label="Lowercase letter" />
                <PasswordRule met={rules.number} label="Number" />
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-11 font-semibold"
            disabled={loading}
            style={{ background: '#2563EB', color: '#fff' }}
          >
            {loading ? 'Creating account…' : 'Create Free Account'}
          </Button>

          <p className="text-xs text-center" style={{ color: '#4B5563' }}>
            By signing up you agree to our Terms of Service and Privacy Policy.
          </p>

          <p className="text-center text-sm" style={{ color: '#9CA3AF' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#2563EB' }}>Sign in</Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
