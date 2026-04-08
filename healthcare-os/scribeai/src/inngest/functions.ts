import { inngest } from './client'
import { createServiceClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import { generateSOAPNote } from '@/lib/claude'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

const LANGUAGE_MAP: Record<string, string> = {
  en: 'en',
  hi: 'hi',
  ar: 'ar',
  ur: 'ur',
}

export const transcribeConsultation = inngest.createFunction(
  { id: 'transcribe-consultation', triggers: [{ event: 'consultation.created' }] },
  async ({ event, step }: any) => {
    const { consultationId, clinicId, language } = event.data

    const transcript = await step.run('call-whisper', async () => {
      const supabase = createServiceClient()
      
      // 1. Get audio from storage
      const filePath = `${clinicId}/${consultationId}.webm`
      const { data, error } = await supabase.storage.from('recordings').download(filePath)
      
      if (error || !data) {
        throw new Error('Failed to download audio recording')
      }
      
      const file = new File([data], 'recording.webm', { type: 'audio/webm' })
      
      // 2. Transcribe
      const transcription = await openai.audio.transcriptions.create({
        model: 'whisper-1',
        file,
        language: LANGUAGE_MAP[language] || 'en',
      })
      
      return transcription.text
    })

    await step.run('update-db-and-trigger-note', async () => {
      const supabase = createServiceClient()
      const { error } = await supabase
        .from('consultations')
        .update({
          transcript,
          status: 'transcribed',
        })
        .eq('id', consultationId)
        .eq('clinic_id', clinicId)

      if (error) throw error

      // Trigger the next background job
      await inngest.send({
        name: 'consultation.transcribed',
        data: {
          consultationId,
          clinicId,
          transcript,
          language,
          chiefComplaint: event.data.chiefComplaint,
          patientAge: event.data.patientAge,
          patientGender: event.data.patientGender,
        }
      })
    })

    return { success: true, transcript }
  }
)

export const generateSOAPNoteJob = inngest.createFunction(
  { id: 'generate-soap-note', triggers: [{ event: 'consultation.transcribed' }] },
  async ({ event, step }: any) => {
    const { consultationId, clinicId, transcript, language, chiefComplaint, patientAge, patientGender } = event.data

    const soapNote = await step.run('call-claude', async () => {
      return await generateSOAPNote({
        transcript,
        language,
        chiefComplaint,
        patientAge,
        patientGender,
      })
    })

    await step.run('update-db-with-note', async () => {
      const supabase = createServiceClient()
      const { error } = await supabase
        .from('consultations')
        .update({
          soap_note: soapNote,
          status: 'completed',
        })
        .eq('id', consultationId)
        .eq('clinic_id', clinicId)
        
      if (error) throw error
    })

    // HELPDOC MERGER: Index note into Knowledge Base
    await step.run('index-into-knowledge-base', async () => {
      const supabase = createServiceClient()
      
      // Get embedding from OpenAI for the summary
      const summaryText = `Patient Consultation Summary: \nSubjective: ${soapNote.subjective}\nAssessment: ${soapNote.assessment}\nPlan: ${soapNote.plan}`
      
      const { data: embeddingData } = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: summaryText,
      })
      
      const embedding = embeddingData[0].embedding

      const { error } = await supabase.from('knowledge_base').insert({
        clinic_id: clinicId,
        title: `Consultation Note: ${new Date().toLocaleDateString()}`,
        content: summaryText,
        metadata: { consultation_id: consultationId, type: 'note' },
        embedding,
        source_type: 'note',
        source_id: consultationId
      })

      if (error) console.error('Knowledge Base indexing failed:', error)
    })

    return { success: true, soapNote }
  }
)
