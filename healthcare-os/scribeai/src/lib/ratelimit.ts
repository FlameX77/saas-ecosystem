import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = (redisUrl && redisToken) 
  ? new Redis({ url: redisUrl, token: redisToken })
  : null;

// Create a new ratelimiter, that allows 20 requests per 10 seconds
export const ratelimit = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "10 s"),
  analytics: true,
  prefix: "@upstash/ratelimit",
}) : { limit: () => Promise.resolve({ success: true }) } as any;

export const authRateLimit = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 attempts per minute for auth
  analytics: true,
  prefix: "auth_limit",
}) : { limit: () => Promise.resolve({ success: true }) } as any;
