'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

const schema = z.object({
  fullName: z.string().min(2, 'Full name required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/\d/, 'Password must contain at least 1 number'),
})
type FormData = z.infer<typeof schema>

export default function JoinPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const supabase = createClient()
  
  const [invite, setInvite] = useState<{ id: string, email: string, clinic_id: string, role: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

  useEffect(() => {
    async function checkToken() {
      if (!token) {
        setServerError('No invitation token found')
        setLoading(false)
        return
      }

      const { data, error } = await supabase.from('invitations').select('*').eq('token', token).eq('status', 'pending').single()
      if (error || !data) {
        setServerError('Invalid or expired invitation token')
      } else {
        setInvite(data)
      }
      setLoading(false)
    }
    checkToken()
  }, [token, supabase])

  const onSubmit = async (data: FormData) => {
    setServerError('')
    if (!invite) return

    try {
      // Create user
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: invite.email,
        password: data.password,
      })
      if (authErr) throw authErr

      const userId = authData.user?.id
      if (!userId) throw new Error('Signup failed')

      // Insert doctor record
      const { error: doctorErr } = await supabase.from('doctors').insert({
        id: userId,
        clinic_id: invite.clinic_id,
        full_name: data.fullName,
        email: invite.email,
        role: invite.role,
      })
      if (doctorErr) throw doctorErr

      // Mark invite accepted
      await supabase.from('invitations').update({ status: 'accepted' }).eq('id', invite.id)

      router.push('/dashboard')
    } catch (err: any) {
      setServerError(err.message || 'Signup failed')
    }
  }

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white"><Loader2 className="animate-spin w-8 h-8 text-blue-500" /></div>

  if (serverError && !invite) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-red-400 mb-2">Invalid Invitation</h2>
        <p className="text-slate-400 text-sm">{serverError}</p>
        <button onClick={() => router.push('/login')} className="mt-6 px-6 py-2 bg-blue-600 rounded-xl text-white">Go to Login</button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-2">Join ScribeAI</h2>
        <p className="text-slate-400 text-sm mb-6">Create your account for {invite!.email}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
            <input
              {...register('fullName')}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
            <input
              type="password"
              {...register('password')}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>

          {serverError && <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/30">{serverError}</div>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Join Clinic'}
          </button>
        </form>
      </div>
    </div>
  )
}
