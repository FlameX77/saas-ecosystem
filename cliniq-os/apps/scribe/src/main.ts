import Fastify from 'fastify'
import cors from '@fastify/cors'
import { OpenAI } from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'

const fastify = Fastify({ logger: true })
fastify.register(cors, { origin: '*' })

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Specialty-specific SOAP prompt templates
const SPECIALTY_TEMPLATES = {
  physio: "Focus on ROM, PSFS, and pain scores. Use clinical terminology like 'proprioception', 'lordosis', 'joint mobilization'.",
  derm: "Focus on skin lesion morphology, distribution, and history of sun exposure. Use terms like 'macule', 'papule', 'nevus'.",
  dental: "Focus on tooth numbering, gingival health, and carries detection. Include specific odontogram notes.",
  optometry: "Focus on visual acuity, intraocular pressure, and fundus examination. Use terms like 'OD', 'OS', 'OU', 'IOP'."
}

const ConsultationSchema = z.object({
  specialty: z.enum(['physio', 'derm', 'dental', 'optometry']),
  audioUrl: z.string().optional(),
  transcript: z.string().optional(),
  patientId: z.string()
})

/**
 * Generate a healthcare SOAP note using Claude 3.5 Sonnet
 */
fastify.post('/v1/scribe/generate', async (request, reply) => {
  const body = ConsultationSchema.parse(request.body)
  const transcript = body.transcript || 'Wait, no transcript provided. Simulation mode.'

  try {
    const prompt = `
      You are an expert ${body.specialty} clinician. 
      Generate a professional SOAP note (Subjective, Objective, Assessment, Plan) based on this transcript:
      "${transcript}"

      Specialty Instructions: ${SPECIALTY_TEMPLATES[body.specialty]}
      
      Format the output as a structured JSON object:
      {
        "subjective": "...",
        "objective": "...",
        "assessment": "...",
        "plan": "...",
        "diagnosis_codes": ["ICD-10-CM codes..."],
        "follow_up_recommendation": "..."
      }
    `

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 2000,
      system: "You are a specialized clinical scribe for private specialty clinics.",
      messages: [{ role: 'user', content: prompt }]
    });

    // In production, we'd pipe this through Guardrails AI for hallucination checks
    // const validationResult = await guardrails.validate(response.content[0].text, ClinicalSchema)

    return JSON.parse(response.content[0].text);
  } catch (error) {
    fastify.log.error('Cliniq OS: Scribe Generation Failure', error)
    throw new Error('Scribe failed to generate note. Check transcript quality.')
  }
})

fastify.listen({ port: 3002, host: '0.0.0.0' }).then(() => {
  console.log('Cliniq OS AI Scribe running on port 3002')
})
