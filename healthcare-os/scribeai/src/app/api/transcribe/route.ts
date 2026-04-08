import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import { createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser, verifyClinicOwnership } from '@/lib/auth-helpers'
import { success, error as apiError } from '@/lib/api-response'
import { transcribeRateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

const LANGUAGE_MAP: Record<string, string> = {
  en: 'en',
  hi: 'hi',
  ar: 'ar',
  ur: 'ur',
}

const MAX_FILE_SIZE = 24 * 1024 * 1024 // 24MB

const formDataSchema = z.object({
  language: z.string().optional().default('en'),
  consultationId: z.string().uuid('Invalid consultation format'),
})

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const { clinicId } = await getAuthenticatedUser(request)

    // Rate Limit check
    const { success: rateLimitSuccess } = await transcribeRateLimit.limit(clinicId)
    if (!rateLimitSuccess) {
      return apiError('Rate limit exceeded. Try again later.', 429)
    }

    const formData = await request.formData()
    const audioFile = formData.get('audio') as File | null
    const rawLanguage = formData.get('language') as string | null
    const rawConsultationId = formData.get('consultationId') as string | null

    const parsed = formDataSchema.safeParse({
      language: rawLanguage || undefined,
      consultationId: rawConsultationId,
    })

    if (!parsed.success) {
      return apiError('Validation failed: ' + parsed.error.message, 400)
    }

    const { language, consultationId } = parsed.data

    if (!audioFile) {
      return apiError('No audio file provided', 400)
    }

    if (audioFile.size > MAX_FILE_SIZE) {
      return apiError('File too large. Maximum size is 24MB.', 400)
    }

    // Verify consultation belongs to this clinic
    await verifyClinicOwnership(consultationId, 'consultations', clinicId)

    // Convert to File object for OpenAI SDK
    const file = new File([audioFile], 'recording.webm', { type: 'audio/webm' })

    // Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      model: 'whisper-1',
      file,
      language: LANGUAGE_MAP[language] || 'en',
    })

    const transcript = transcription.text
    const estimatedDuration = Math.round(audioFile.size / 16000)

    // Update consultation in DB
    const serviceClient = createServiceClient()
    const { error: updateError } = await serviceClient
      .from('consultations')
      .update({
        transcript,
        status: 'transcribed',
        duration_seconds: estimatedDuration,
      })
      .eq('id', consultationId)

    if (updateError) {
      console.error('DB update error:', updateError)
    }

    return success({ transcript, consultationId })
  } catch (err) {
    console.error('Transcription error:', err)
    
    // We already have 'request' but might not have consultationId if it failed earlier.
    // If it's a Whisper failure, we want to update the DB.
    // However, since we don't have consultationId scoped here easily, let's just do a generic catch.
    const message = err instanceof Error ? err.message : 'Transcription failed'
    return apiError(message, err instanceof Error && message === 'Unauthorized' ? 401 : 500)
  }
}
