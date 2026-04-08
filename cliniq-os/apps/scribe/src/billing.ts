import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const BillingExtractionSchema = z.object({
  procedureCodes: z.array(z.object({
    code: z.string(),
    description: z.string(),
    estimatedValue: z.number()
  })),
  diagnosisCodes: z.array(z.string()),
  complexityLevel: z.enum(['low', 'medium', 'high']),
  billingTotal: z.number()
});

export type BillingExtraction = z.infer<typeof BillingExtractionSchema>;

/**
 * Extract billing codes from a clinical note using Claude 3.5 Sonnet
 */
export async function extractBillingFromNote(note: string, specialty: string): Promise<BillingExtraction> {
  console.log(`Cliniq OS: Extracting billing codes for specialty: ${specialty}...`);
  
  const prompt = `
    Analyze this ${specialty} SOAP note and extract the relevant procedure and diagnosis codes.
    Current Note: "${note}"
    
    Output a structured JSON object according to the schema: { procedureCodes: [], diagnosisCodes: [], complexityLevel: "...", billingTotal: 0.0 }
  `;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    });

    return BillingExtractionSchema.parse(JSON.parse(response.content[0].text));
  } catch (error) {
    console.error('Cliniq OS: Billing extraction failure', error);
    // Fallback to manual entry if AI extraction fails
    return { procedureCodes: [], diagnosisCodes: [], complexityLevel: 'low', billingTotal: 0.0 };
  }
}

/**
 * Generate Claim Payload for Insurance/Medicare submission
 */
export async function generateClaimPayload(extraction: BillingExtraction, patientId: string) {
    return {
        v: "1.0",
        type: "CLAIM",
        timestamp: new Date().toISOString(),
        patient: { id: patientId },
        items: extraction.procedureCodes.map(pc => ({ code: pc.code, desc: pc.description })),
        total: extraction.billingTotal,
        currency: "USD" // Should be config driven (AED/AUD/USD)
    };
}
