import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/auth-helpers'
import { success, error as apiError } from '@/lib/api-response'
import { z } from 'zod'
import { ratelimit } from '@/lib/ratelimit'
import { logAction } from '@/lib/audit'

const sanitize = (str: string) => str.replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const dynamic = 'force-dynamic'

const patientSchema = z.object({
  full_name: z.string().min(1, 'Name is required').max(200),
  age: z.number().int().min(0).max(130).optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  phone: z.string().max(30).optional(),
  notes: z.string().max(2000).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { clinicId } = await getAuthenticatedUser(request)
    const supabase = await createClient()

    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')

    let query = supabase.from('patients').select('*').eq('clinic_id', clinicId)

    if (q) {
      query = query.ilike('full_name', `%${q}%`).limit(8)
    } else {
      query = query.limit(50)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    await logAction('View_Patients', { query: q || 'all', count: data.length }, { clinic_id: clinicId })
    return success(data)
  } catch (err) {
    return apiError(err instanceof Error ? err.message : 'Unknown error', 500)
  }
}


export async function POST(request: NextRequest) {
  try {
    const { clinicId, user } = await getAuthenticatedUser(request)

    // Rate limit per clinic
    const { success: limitOk } = await ratelimit.limit(`patients_${clinicId}`)
    if (!limitOk) {
      return apiError('Rate limit exceeded. Please wait a moment.', 429)
    }

    const body = await request.json()
    const parsed = patientSchema.safeParse(body)

    if (!parsed.success) {
      return apiError('Validation failed: ' + parsed.error.issues.map(i => i.message).join(', '), 400)
    }

    const { full_name, age, gender, phone, notes } = parsed.data
    const supabase = await createClient()

    const { data, error } = await supabase.from('patients').insert({
      full_name: sanitize(full_name),
      age,
      gender,
      phone: phone ? phone.replace(/[^\d+\-\s()]/g, '') : undefined,
      notes: notes ? sanitize(notes) : undefined,
      clinic_id: clinicId,
    }).select().single()

    if (error) return apiError(error.message, 400)
    
    await logAction('Create_Patient', { patient_id: data.id }, { clinic_id: clinicId, doctor_id: user.id })
    return success(data)
  } catch (err) {
    return apiError(err instanceof Error ? err.message : 'Unknown error', 500)
  }
}
