import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/auth-helpers'
import { success, error as apiError } from '@/lib/api-response'
import { inngest } from '@/inngest/client'
import { z } from 'zod'
import { ratelimit } from '@/lib/ratelimit'
import { logAction } from '@/lib/audit'

export async function GET(request: NextRequest) {
  try {
    const { clinicId } = await getAuthenticatedUser(request)
    const supabase = await createClient()

    const { data, error } = await supabase.from('consultations')
      .select('*, patients(full_name)')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    await logAction('View_Consultations', { count: data.length }, { clinic_id: clinicId })
    return success(data)
  } catch (err) {
    return apiError(err instanceof Error ? err.message : 'Unknown error', 500)
  }
}

const postSchema = z.object({
  patientId: z.string().uuid(),
  language: z.string().default('en'),
})

export async function POST(request: NextRequest) {
  try {
    const { clinicId, user } = await getAuthenticatedUser(request)

    // Rate limit
    const { success: limitOk } = await ratelimit.limit(`consultation_${clinicId}`)
    if (!limitOk) {
      return apiError('Rate limit exceeded. Please wait a moment.', 429)
    }

    const doctorId = user.id
    const supabase = await createClient()

    // Quota check
    const { data: clinic } = await supabase.from('clinics').select('*').eq('id', clinicId).single()
    if (clinic) {
      const limit = clinic.subscription_tier === 'trial' ? 50 : clinic.subscription_tier === 'starter' ? 300 : Infinity
      if ((clinic.consultation_count || 0) >= limit) {
        return apiError('Consultation limit reached for your current plan. Please upgrade.', 403)
      }
    }

    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const patientId = formData.get('patientId') as string
    const language = (formData.get('language') as string) || 'en'
    const chiefComplaint = formData.get('chiefComplaint') as string | undefined
    const patientAge = formData.get('patientAge') ? parseInt(formData.get('patientAge') as string, 10) : undefined
    const patientGender = formData.get('patientGender') as string | undefined

    if (!audioFile || !patientId) {
      return apiError('Missing audio or patientId', 400)
    }

    // Insert DB row for consultation
    const { data: consultation, error } = await supabase.from('consultations').insert({
      clinic_id: clinicId,
      doctor_id: doctorId,
      patient_id: patientId,
      status: 'pending',
    }).select().single()

    if (error || !consultation) {
      throw error || new Error('Failed to create consultation')
    }

    // Upload audio to Storage
    // Prefix path by clinicId to isolate data
    const storagePath = `${clinicId}/${consultation.id}.webm`
    const { error: uploadError } = await supabase.storage
      .from('recordings')
      .upload(storagePath, audioFile, {
        contentType: 'audio/webm',
        upsert: true,
      })

    if (uploadError) {
      // Clean up the consultation if upload failed
      await supabase.from('consultations').delete().eq('id', consultation.id)
      throw uploadError
    }

    // Trigger Inngest transcription job
    await inngest.send({
      name: 'consultation.created',
      data: {
        consultationId: consultation.id,
        clinicId,
        language,
        chiefComplaint,
        patientAge,
        patientGender,
      }
    })

    await logAction('Create_Consultation', {
      consultation_id: consultation.id,
      patient_id: patientId,
      language
    }, { clinic_id: clinicId, doctor_id: doctorId })

    return success({ id: consultation.id })
  } catch (err) {
    console.error('Consultation creation failed:', err)
    return apiError(err instanceof Error ? err.message : 'Unknown error', 500)
  }
}
