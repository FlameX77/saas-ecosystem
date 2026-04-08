import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser, verifyClinicOwnership } from '@/lib/auth-helpers'
import { success, error as apiError } from '@/lib/api-response'
import type { Consultation, Doctor, Clinic } from '@/types'
import { z } from 'zod'

const whatsappSchema = z.object({
  consultationId: z.string().uuid('Invalid consultation format'),
  phoneNumber: z.string().min(7, 'Invalid phone number'),
})

export async function POST(request: NextRequest) {
  try {
    const { clinicId } = await getAuthenticatedUser(request)

    const body = await request.json()
    const parsed = whatsappSchema.safeParse(body)

    if (!parsed.success) {
      return apiError('Validation failed: ' + parsed.error.issues.map(i => i.message).join(', '), 400)
    }

    const { consultationId, phoneNumber } = parsed.data
    const cleanPhone = phoneNumber.replace(/\D/g, '')
    
    // Verify ownership
    await verifyClinicOwnership(consultationId, 'consultations', clinicId)

    // Fetch consultation
    const supabase = createServiceClient()
    const { data: consultation, error: cErr } = await supabase
      .from('consultations')
      .select('*, doctors(full_name), clinics(name)')
      .eq('id', consultationId)
      .eq('clinic_id', clinicId)
      .single()

    if (cErr || !consultation) {
      return apiError('Consultation not found', 404)
    }

    const soap = (consultation as Consultation & { doctors: Doctor; clinics: Clinic }).soap_note
    if (!soap) {
      return apiError('No SOAP note found for this consultation', 400)
    }

    const doctorName = (consultation as { doctors?: { full_name?: string } }).doctors?.full_name || 'Your Doctor'
    const clinicName = (consultation as { clinics?: { name?: string } }).clinics?.name || 'Your Clinic'
    const date = new Date(consultation.created_at).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    })

    const message = `*ScribeAI — Consultation Summary*
Date: ${date}
Doctor: ${doctorName}
Clinic: ${clinicName}

*Assessment:* ${soap.assessment}

*Plan:* ${soap.plan}

*Follow-up:* ${soap.follow_up || 'As directed by your doctor'}

_This is an automated summary. Contact the clinic for questions._`

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_WHATSAPP_FROM

    if (!accountSid || !authToken || !fromNumber) {
      return apiError('WhatsApp delivery is not configured', 503)
    }

    const twilio = (await import('twilio')).default
    const client = twilio(accountSid, authToken)

    await client.messages.create({
      from: fromNumber,
      to: `whatsapp:+${cleanPhone}`,
      body: message,
    })

    return success({ sent: true })
  } catch (err) {
    console.error('WhatsApp send error:', err)
    const message = err instanceof Error ? err.message : 'Failed to send WhatsApp message'
    return apiError(message, err instanceof Error && message === 'Unauthorized' ? 401 : 500)
  }
}
