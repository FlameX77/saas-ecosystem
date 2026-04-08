'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, Stethoscope, Eye, EyeOff } from 'lucide-react'

const schema = z.object({
  clinicName: z.string().min(2, 'Clinic name must be at least 2 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/\d/, 'Password must contain at least 1 number'),
})

type FormData = z.infer<typeof schema>

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [showPassword, setShowPassword] = useState(false)
  const [serverMsg, setServerMsg] = useState<{ text: string, type: 'error' | 'success'} | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setServerMsg(null)
    try {
      // 1. Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      })
      if (authError) throw authError
      if (!authData.user) throw new Error('Failed to create account')

      // 2. Create clinic
      const { data: clinic, error: clinicError } = await supabase
        .from('clinics')
        .insert({ name: data.clinicName })
        .select()
        .single()
      if (clinicError) throw clinicError

      // 3. Create doctor profile
      const { error: doctorError } = await supabase
        .from('doctors')
        .insert({
          id: authData.user.id,
          clinic_id: clinic.id,
          full_name: data.fullName,
          email: data.email,
        })
      if (doctorError) throw doctorError

      setServerMsg({ text: 'Success! Please check your email to verify your account.', type: 'success' })
    } catch (err: unknown) {
      setServerMsg({ text: err instanceof Error ? err.message : 'Something went wrong. Please try again.', type: 'error' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-500/30 mb-4">
            <Stethoscope className="w-7 h-7 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">ScribeAI</h1>
          <p className="text-slate-400 text-sm mt-1">AI-powered medical scribe</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-1">Create your account</h2>
          <p className="text-slate-400 text-sm mb-6">Start your 14-day free trial — no credit card required</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Clinic Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Clinic Name</label>
              <input
                {...register('clinicName')}
                type="text"
                placeholder="Dubai Medical Center"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
              {errors.clinicName && (
                <p className="text-red-400 text-xs mt-1">{errors.clinicName.message}</p>
              )}
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Your Full Name</label>
              <input
                {...register('fullName')}
                type="text"
                placeholder="Dr. Sarah Ahmed"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
              {errors.fullName && (
                <p className="text-red-400 text-xs mt-1">{errors.fullName.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
              <input
                {...register('email')}
                type="email"
                placeholder="doctor@clinic.com"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Server Message */}
            {serverMsg && (
              <div className={`p-3 border rounded-xl text-sm ${
                serverMsg.type === 'error' 
                ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                : 'bg-green-500/10 border-green-500/30 text-green-400'
              }`}>
                {serverMsg.text}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-500/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Start Free Trial'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-600 mt-4">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
