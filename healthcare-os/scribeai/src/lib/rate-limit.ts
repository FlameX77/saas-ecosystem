import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Provide dummy redis if env vars are missing so the build doesn't crash
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? Redis.fromEnv()
  : new Redis({ url: 'https://dummy.upstash.io', token: 'dummy' })

// Limits for different API routes
export const transcribeRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '1 h'),
  analytics: true,
})

export const generateNoteRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(50, '1 h'),
  analytics: true,
})
