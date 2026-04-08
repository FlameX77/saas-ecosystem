/**
 * In-memory rate limiter using a sliding window algorithm.
 * Works per-IP, per-route. Resets automatically via TTL.
 * For production at scale, swap the Map for an Upstash Redis store.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes to avoid memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt < now) store.delete(key)
    }
  }, 5 * 60 * 1000)
}

interface RateLimitOptions {
  /** Number of requests allowed per window */
  limit: number
  /** Window duration in milliseconds */
  windowMs: number
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetAt: number
}

export function rateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    // New window
    const newEntry: RateLimitEntry = { count: 1, resetAt: now + options.windowMs }
    store.set(key, newEntry)
    return { success: true, limit: options.limit, remaining: options.limit - 1, resetAt: newEntry.resetAt }
  }

  if (entry.count >= options.limit) {
    return { success: false, limit: options.limit, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { success: true, limit: options.limit, remaining: options.limit - entry.count, resetAt: entry.resetAt }
}

/**
 * Extract a stable identifier from a Next.js request for rate limiting.
 * Priority: CF-Connecting-IP > X-Forwarded-For > X-Real-IP > fallback
 */
export function getClientIp(req: Request): string {
  const headers = req instanceof Request ? req.headers : (req as { headers: Headers }).headers
  return (
    headers.get('cf-connecting-ip') ||
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    headers.get('x-real-ip') ||
    'unknown'
  )
}

/** Pre-configured limits for each surface */
export const LIMITS = {
  /** AI generation — expensive, limit strictly */
  generate: { limit: 10, windowMs: 60 * 1000 },          // 10 req/min
  /** Auth — prevent brute-force */
  auth: { limit: 5, windowMs: 15 * 60 * 1000 },           // 5 req/15 min
  /** General API — generous for normal use */
  api: { limit: 100, windowMs: 60 * 1000 },               // 100 req/min
  /** Webhooks — external services retry, allow more */
  webhook: { limit: 200, windowMs: 60 * 1000 },           // 200 req/min
} as const
