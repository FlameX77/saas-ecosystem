import { OpenAI } from 'openai';
import { z } from 'zod';

const LeadSchema = z.object({
  companyName: z.string(),
  industry: z.string(),
  potentialPainPoints: z.array(z.string()),
  estimatedSize: z.string(),
  contactRoles: z.array(z.string()),
  relevanceScore: z.number().min(0).max(100),
});

type Lead = z.infer<typeof LeadSchema>;

export class B2BDiscoveryPipeline {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async discoverLeads(icp: string, region: string): Promise<Lead[]> {
    console.log(`🔍 Starting Sovereign Discovery for ICP: ${icp} in ${region}...`);
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are the Sovereign Growth Engine, an elite B2B lead generation agent. Your goal is to identify high-value target companies based on specific criteria.'
        },
        {
          role: 'user',
          content: `Generate a list of 5 high-potential B2B leads that fit this ICP: ${icp}. Region: ${region}. Provide data in JSON format matching the schema.`
        }
      ],
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    if (!content) return [];

    const data = JSON.parse(content);
    // Note: Assuming the LLM returns an object with a 'leads' array
    return z.array(LeadSchema).parse(data.leads);
  }
}
