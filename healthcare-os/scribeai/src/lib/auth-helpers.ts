import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function getAuthenticatedUser(request?: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    throw new Error('Unauthorized')
  }

  const { data: doctor, error: doctorError } = await supabase
    .from('doctors')
    .select('clinic_id, role')
    .eq('id', user.id)
    .single()

  if (doctorError || !doctor) {
    throw new Error('Doctor profile not found')
  }

  return { user, doctor, clinicId: doctor.clinic_id }
}

export async function verifyClinicOwnership(id: string, table: 'consultations' | 'patients', clinicId: string) {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from(table)
    .select('id')
    .eq('id', id)
    .eq('clinic_id', clinicId)
    .single()

  if (error || !data) {
    throw new Error(`${table} record not found or access denied`)
  }

  return true
}
