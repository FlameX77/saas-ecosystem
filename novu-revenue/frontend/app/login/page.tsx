'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { saveToken } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('admin@demostore.com')
  const [password, setPassword] = useState('demo1234')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.auth.login(email, password)
      saveToken(res.token)
      toast.success('Welcome back!')
      router.push('/dashboard')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4">
      {/* Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md bg-slate-900/80 border-slate-700/50 backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-1 text-center pb-4">
          <div className="mx-auto mb-3 w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
            R
          </div>
          <CardTitle className="text-2xl font-bold text-white">Novu</CardTitle>
          <CardDescription className="text-slate-400">AI Revenue Recovery Engine</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Email</label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-500 focus:border-blue-500"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-semibold py-2.5 rounded-lg transition-all"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 text-center">
          <p className="text-sm text-slate-500">
            No account?{' '}
            <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Create one
            </Link>
          </p>
          <p className="text-xs text-slate-600">Demo: admin@demostore.com / demo1234</p>
        </CardFooter>
      </Card>
    </div>
  )
}
