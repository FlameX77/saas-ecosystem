import { NextResponse } from 'next/server';
import { createServer } from '@/lib/supabase/server';
import { getMemory, updateMemory } from '@/lib/memory/contactMemory';

export async function POST(req: Request) {
  try {
    const supabase = await createServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { context, tone = 'professional', contactId } = await req.json();
    if (!context) return NextResponse.json({ error: 'Context required' }, { status: 400 });

    let systemPromptLine = `You are a helpful assistant writing a ${tone} message for a customer to recover revenue or book an appointment. Keep it concise. Do not use placeholders like [Name].`;
    
    // Add memory context if contactId is provided
    if (contactId) {
      const memory = await getMemory(supabase, contactId);
      if (memory) {
        systemPromptLine += ` Their past context: Service Interest was ${memory.service_interest || 'unknown'}. They were last contacted on ${memory.last_visit || 'unknown'}. Past notes: ${memory.past_responses || 'none'}. Use this to sound highly personalized and reference their context naturally.`;
      }
    }

    const apiKey = process.env.AI_API_KEY;
    if (!apiKey) {
      // Mock response taking memory into account roughly
      return NextResponse.json({ 
        suggestion: `[Mock AI Response - ${tone}] Based on your context: "${context}", we would love to help you resolve this. Let us know when you're available.`
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPromptLine },
          { role: 'user', content: context }
        ],
        max_tokens: 150
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const generatedMessage = data.choices[0].message.content.trim();

    // Update memory to reflect that we generated a message
    if (contactId) {
      await updateMemory(supabase, contactId, {
        past_responses: `Generated outbound message: ${generatedMessage}`
      });
    }

    return NextResponse.json({ suggestion: generatedMessage });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
