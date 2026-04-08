import { NextResponse } from 'next/server';
import { SYSTEM_PROMPT } from '@/lib/systemPrompt';

export async function POST(req: Request) {
  const { messages, apiKey } = await req.json();

  if (!apiKey) return NextResponse.json({ error: 'Anthropic API key required' }, { status: 400 });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: messages.filter((m: any) => m.role !== 'system'),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
