'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Clinic, Doctor } from '@/types'

const PLAN_LIMITS: Record<string, number> = {
  trial: 50,
  starter: 200,
  growth: 1000,
  clinic: Infinity,
}

interface ClinicContextValue {
  clinic: Clinic | null
  doctor: Doctor | null
  isLoading: boolean
  isTrialExpired: boolean
  canAddMoreConsultations: boolean
  refresh: () => void
}

const ClinicContext = createContext<ClinicContextValue>({
  clinic: null,
  doctor: null,
  isLoading: true,
  isTrialExpired: false,
  canAddMoreConsultations: true,
  refresh: () => {},
})

export function ClinicProvider({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setIsLoading(false); return }

    const { data: doctorData } = await supabase
      .from('doctors').select('*').eq('id', user.id).single()
    if (!doctorData) { setIsLoading(false); return }
    setDoctor(doctorData)

    const { data: clinicData } = await supabase
      .from('clinics').select('*').eq('id', doctorData.clinic_id).single()
    setClinic(clinicData)
    setIsLoading(false)
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const isTrialExpired = clinic?.subscription_tier === 'trial'
    ? new Date(clinic.trial_ends_at) < new Date()
    : false

  const limit = PLAN_LIMITS[clinic?.subscription_tier || 'trial'] || 50
  const canAddMoreConsultations = !isTrialExpired && (clinic?.consultation_count || 0) < limit

  return (
    <ClinicContext.Provider value={{ clinic, doctor, isLoading, isTrialExpired, canAddMoreConsultations, refresh: load }}>
      {children}
    </ClinicContext.Provider>
  )
}

export function useClinic() {
  return useContext(ClinicContext)
}
