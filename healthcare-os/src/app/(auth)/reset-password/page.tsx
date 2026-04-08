'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  // Supabase sends the token in the URL hash — the client picks it up automatically
  useEffect(() => {
    const error = searchParams.get('error_description')
    if (error) toast.error(error)
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    if (password !== confirm) { toast.error('Passwords do not match'); return }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) { toast.error(error.message); return }
      setDone(true)
      toast.success('Password updated successfully!')
      setTimeout(() => router.push('/dashboard'), 2000)
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card style={{ background: '#111827', border: '1px solid #374151' }} className="rounded-2xl shadow-2xl">
      <CardHeader className="text-center pb-2 pt-8">
        <p style={{ fontFamily: 'var(--font-bricolage, "Bricolage Grotesque", sans-serif)', fontSize: 32, fontWeight: 700, color: '#2563EB' }}>Revivo</p>
        <p style={{ color: '#9CA3AF', fontSize: 14, marginTop: 4 }}>Set your new password</p>
      </CardHeader>
      <CardContent className="pb-8">
        {done ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <CheckCircle size={40} style={{ color: '#10B981' }} />
            <p className="text-sm text-center" style={{ color: '#9CA3AF' }}>Password updated! Redirecting to dashboard…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <Label style={{ color: '#9CA3AF', fontSize: 13 }}>New Password</Label>
              <div className="relative">
                <Input
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  style={{ background: '#1F2937', border: '1px solid #374151', color: '#F9FAFB', paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#6B7280' }}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label style={{ color: '#9CA3AF', fontSize: 13 }}>Confirm Password</Label>
              <Input
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                type="password"
                placeholder="Repeat password"
                required
                autoComplete="new-password"
                style={{ background: '#1F2937', border: '1px solid #374151', color: '#F9FAFB' }}
              />
              {confirm && password !== confirm && (
                <p className="text-xs" style={{ color: '#EF4444' }}>Passwords do not match</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full h-11 mt-1 font-semibold"
              disabled={loading}
              style={{ background: '#2563EB', color: '#fff' }}
            >
              {loading ? <><Loader2 size={15} className="animate-spin mr-2" />Updating…</> : 'Update Password'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
