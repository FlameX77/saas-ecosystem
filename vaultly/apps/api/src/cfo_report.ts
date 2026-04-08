import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const CFOReportSchema = z.object({
  executiveSummary: z.string(),
  totalSpend: z.number(),
  savingsIdentified: z.number(),
  topWasteCategories: z.array(z.string()),
  priorityActions: z.array(z.object({
    tool: z.string(),
    action: z.string(),
    potentialSaving: z.number(),
    complexity: z.enum(['low', 'medium', 'high'])
  })),
  benchmarkInsight: z.string()
});

export type CFOReport = z.infer<typeof CFOReportSchema>;

/**
 * Generate a CFO monthly narrative based on SaaS spend data
 */
export async function generateCFOReport(spendData: any, benchmarkData: any): Promise<CFOReport> {
  console.log('Vaultly: Generating monthly CFO Intelligence report...');
  
  const prompt = `
    You are a high-level FinOps consultant for a mid-market CFO. 
    Analyze this SaaS spend data: ${JSON.stringify(spendData)}
    Compare against benchmarks: ${JSON.stringify(benchmarkData)}
    
    Identify:
    - Where total spend is drifting from budget.
    - Top 3 tools with lowest usage vs cost.
    - Precise negotiation points for the top 3 upcoming renewals.
    
    Output a structured JSON executive report.
  `;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 1500,
      system: "You are the Vaultly AI CFO Advisor.",
      messages: [{ role: 'user', content: prompt }]
    });

    return CFOReportSchema.parse(JSON.parse(response.content[0].text));
  } catch (error) {
    console.error('Vaultly: CFO Report generation failure', error);
    throw new Error('Intelligence engine failed to generate report.');
  }
}
