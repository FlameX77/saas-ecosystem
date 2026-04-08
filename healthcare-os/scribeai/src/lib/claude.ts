import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import type { SOAPNote } from '@/types'
import { logger } from './logger'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})



const SYSTEM_PROMPT = `You are an expert medical scribe AI for private clinics in the UAE and India. Given a doctor-patient consultation transcript, generate a structured SOAP note. Respond ONLY with valid JSON, no markdown, no other text. JSON schema: { subjective: string, objective: string, assessment: string, plan: string, prescription_suggestions: string[], follow_up: string, red_flags: string[] }. subjective: patient symptoms and history in third person. objective: vitals and examination findings. assessment: primary diagnosis and differentials. plan: investigations ordered, medications prescribed, referrals. prescription_suggestions: each item as 'DrugName DoseMg - Frequency - Duration'. follow_up: recommended timeline. red_flags: any urgent warning symptoms that need immediate attention. Be concise, use proper medical terminology. If the transcript is in Arabic, keep all medical terms and drug names in English but write the SOAP note content in English.`

async function createClaudeMessageWithRetry(params: any, retries = 2, delayMs = 1000): Promise<any> {
  try {
    return await anthropic.messages.create(params)
  } catch (error: any) {
    if (retries > 0 && (error.status === 529 || error.status >= 500)) {
      logger.warn(`Claude API failed (${error.status}). Retrying in ${delayMs}ms...`)
      await new Promise(resolve => setTimeout(resolve, delayMs))
      return createClaudeMessageWithRetry(params, retries - 1, delayMs * 2)
    }
    throw error
  }
}

export async function generateSOAPNote(params: {
  transcript: string
  language: string
  chiefComplaint?: string
  patientAge?: number
  patientGender?: string
  customTemplate?: string
}): Promise<SOAPNote> {
  const userMessage = `
Consultation Transcript:
${params.transcript}

${params.chiefComplaint ? `Chief Complaint: ${params.chiefComplaint}` : ''}
${params.patientAge ? `Patient Age: ${params.patientAge}` : ''}
${params.patientGender ? `Patient Gender: ${params.patientGender}` : ''}
${params.language !== 'en' ? `Note: Transcript may contain ${params.language} language, please process accordingly.` : ''}

Generate the SOAP note JSON now.
`.trim()

  const systemPromptToUse = params.customTemplate ? 
    `${SYSTEM_PROMPT}\n\nCLINIC CUSTOM INSTRUCTIONS:\n${params.customTemplate}` : 
    SYSTEM_PROMPT

  let rawText = ''
  let usedFallback = false

  try {
    const message = await createClaudeMessageWithRetry({
      model: 'claude-3-opus-20240229', // Actually using 3 Opus or Sonnet name format
      max_tokens: 1500,
      system: systemPromptToUse,
      messages: [{ role: 'user', content: userMessage }],
    })
    rawText = message.content[0].type === 'text' ? message.content[0].text : ''
  } catch (claudeError) {
    logger.error('Claude API failed permanently. Falling back to OpenAI GPT-4o.', { error: claudeError })
    usedFallback = true
    
    // Fallback to OpenAI
    const openAiResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPromptToUse },
        { role: 'user', content: userMessage }
      ],
      response_format: { type: 'json_object' }
    })
    
    rawText = openAiResponse.choices[0].message.content || ''
  }

  try {
    return JSON.parse(rawText) as SOAPNote
  } catch {
    if (usedFallback) throw new Error('Failed to parse SOAP note JSON from fallback AI')
    
    // Retry with stricter prompt
    const retryMessage = await createClaudeMessageWithRetry({
      model: 'claude-3-opus-20240229',
      max_tokens: 1500,
      system: systemPromptToUse + ' CRITICAL: Your entire response must be ONLY the JSON object. No explanation, no markdown, no code blocks.',
      messages: [
        { role: 'user', content: userMessage },
        { role: 'assistant', content: rawText },
        { role: 'user', content: 'Your response contained non-JSON text. Return ONLY the JSON object, nothing else.' },
      ],
    })

    const retryText = retryMessage.content[0].type === 'text' ? retryMessage.content[0].text : ''
    return JSON.parse(retryText) as SOAPNote
  }
}
