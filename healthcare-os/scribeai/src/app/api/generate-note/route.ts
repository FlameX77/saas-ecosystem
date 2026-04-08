import { NextRequest } from 'next/server'
import { generateSOAPNote } from '@/lib/claude'
import { createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser, verifyClinicOwnership } from '@/lib/auth-helpers'
import { success, error as apiError } from '@/lib/api-response'
import { generateNoteRateLimit } from '@/lib/rate-limit'
import { z } from 'zod'
import { logAction } from '@/lib/audit'

const generateNoteSchema = z.object({
  transcript: z.string().min(1, 'Transcript is required').max(50000, 'Transcript is too long'),
  language: z.string().optional().default('en'),
  chiefComplaint: z.string().optional(),
  patientAge: z.number().int().min(0).max(150).optional(),
  patientGender: z.string().optional(),
  consultationId: z.string().uuid('Invalid consultation format'),
})

export async function POST(request: NextRequest) {
  try {
    // Auth + ownership check
    const { clinicId } = await getAuthenticatedUser(request)

    // Rate Limit check
    const { success: rateLimitSuccess } = await generateNoteRateLimit.limit(clinicId)
    if (!rateLimitSuccess) {
      return apiError('Rate limit exceeded. Try again later.', 429)
    }

    const body = await request.json()
    const parsed = generateNoteSchema.safeParse(body)
    
    if (!parsed.success) {
      return apiError('Validation failed: ' + parsed.error.issues.map(i => i.message).join(', '), 400)
    }

    const { transcript, language, chiefComplaint, patientAge, patientGender, consultationId } = parsed.data

    // Verify consultation belongs to this clinic
    await verifyClinicOwnership(consultationId, 'consultations', clinicId)

    // Fetch Clinic Settings (Custom Template)
    const serviceClient = createServiceClient()
    const { data: clinicSettings } = await serviceClient
      .from('clinics')
      .select('soap_template')
      .eq('id', clinicId)
      .single()

    // Generate SOAP note via Claude (or fallback to OpenAI)
    const soapNote = await generateSOAPNote({
      transcript,
      language,
      chiefComplaint,
      patientAge,
      patientGender,
      customTemplate: clinicSettings?.soap_template,
    })

    // Update consultation in DB
    const { error: updateError } = await serviceClient
      .from('consultations')
      .update({
        soap_note: soapNote,
        status: 'completed',
      })
      .eq('id', consultationId)

    if (updateError) {
      console.error('DB update error:', updateError)
    }

    // Webhook Dispatch Layer
    const { data: activeWebhooks } = await serviceClient
      .from('webhooks')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('is_active', true)
      .contains('event_types', ['note.generated'])

    if (activeWebhooks && activeWebhooks.length > 0) {
      for (const webhook of activeWebhooks) {
        try {
          const payload = {
            event: 'note.generated',
            data: { consultationId, clinicId, soapNote },
            timestamp: new Date().toISOString()
          }
          
          const response = await fetch(webhook.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-webhook-secret': webhook.secret
            },
            body: JSON.stringify(payload)
          })

          await serviceClient.from('webhook_deliveries').insert({
            webhook_id: webhook.id,
            event_type: 'note.generated',
            payload,
            status_code: response.status,
            success: response.ok
          })
        } catch (webhookErr) {
          console.error(`Webhook delivery failed for ${webhook.url}`, webhookErr)
          await serviceClient.from('webhook_deliveries').insert({
            webhook_id: webhook.id,
            event_type: 'note.generated',
            payload: { error: webhookErr instanceof Error ? webhookErr.message : 'Unknown error' },
            status_code: 500,
            success: false
          })
        }
      }
    }

    await logAction('Note_Generated', { consultation_id: consultationId }, { clinic_id: clinicId })

    return success(soapNote)
  } catch (err) {
    console.error('SOAP generation error:', err)
    const message = err instanceof Error ? err.message : 'Failed to generate SOAP note'
    return apiError(message, err instanceof Error && message === 'Unauthorized' ? 401 : 500)
  }
}
