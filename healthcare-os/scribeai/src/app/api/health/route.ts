import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

export async function GET() {
  const start = performance.now()
  const latencies: Record<string, number> = {}
  
  try {
    // 1. Check Supabase
    const dbStart = performance.now()
    const supabase = createServiceClient()
    const { error: dbError } = await supabase.from('clinics').select('id').limit(1)
    if (dbError) throw dbError
    latencies.supabase = Math.round(performance.now() - dbStart)

    // 2. Check Anthropic
    // Anthropic SDK doesn't have a direct ping, so we check if apiKey is set and assume it's reachable or make a very cheap call (not recommended for health checks). 
    // We'll just verify the key exists for the health check to avoid rate limits and costs.
    const anthropicStart = performance.now()
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('Anthropic API key missing')
    }
    latencies.anthropic = Math.round(performance.now() - anthropicStart)

    const total = Math.round(performance.now() - start)

    return NextResponse.json({
      status: 'ok',
      latency_ms: {
        ...latencies,
        total
      }
    }, { status: 200 })
  } catch (error) {
    const total = Math.round(performance.now() - start)
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      latency_ms: {
        ...latencies,
        total
      }
    }, { status: 503 })
  }
}
