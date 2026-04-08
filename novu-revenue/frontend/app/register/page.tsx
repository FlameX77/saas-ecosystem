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

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    email: '', password: '', clientName: '', businessType: 'ecommerce', avgDealValue: 500
  })

  const update = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }))

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.auth.register(form)
      saveToken(res.token)
      toast.success(`Welcome, ${res.client.name}!`)
      router.push('/dashboard')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
      </div>
      <Card className="w-full max-w-md bg-slate-900/80 border-slate-700/50 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-3 w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">R</div>
          <CardTitle className="text-2xl font-bold text-white">Create Account</CardTitle>
          <CardDescription className="text-slate-400">Get started with Novu</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {[
              { label: 'Business Name', key: 'clientName', type: 'text', placeholder: 'My Store' },
              { label: 'Email', key: 'email', type: 'email', placeholder: 'you@company.com' },
              { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
            ].map(f => (
              <div key={f.key} className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">{f.label}</label>
                <Input
                  type={f.type}
                  value={String(form[f.key as keyof typeof form])}
                  onChange={e => update(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  required
                  className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-500 focus:border-blue-500"
                />
              </div>
            ))}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Business Type</label>
              <select
                value={form.businessType}
                onChange={e => update('businessType', e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-md text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="ecommerce">E-commerce</option>
                <option value="saas">SaaS</option>
                <option value="services">Services</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Avg Deal Value ($)</label>
              <Input
                type="number"
                value={form.avgDealValue}
                onChange={e => update('avgDealValue', Number(e.target.value))}
                min={1}
                className="bg-slate-800/50 border-slate-600/50 text-white focus:border-blue-500"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-semibold py-2.5">
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-sm text-slate-500 w-full">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">Sign in</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
