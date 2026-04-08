/**
 * Input sanitization helpers.
 * Strip characters that could enable prompt injection or XSS.
 */

/**
 * Sanitize a string for safe inclusion in an LLM prompt.
 * Removes prompt-injection attack patterns (role overrides, system tags, etc.)
 */
export function sanitizeForPrompt(input: string): string {
  if (!input || typeof input !== 'string') return ''

  return input
    // Cap length — no need for multi-KB fields in a prompt
    .slice(0, 500)
    // Remove LLM system-tag injection attempts
    .replace(/<\|?(system|user|assistant|im_start|im_end)\|?>/gi, '')
    // Remove common jailbreak patterns
    .replace(/ignore (previous|above|all) instructions?/gi, '')
    .replace(/you are now|pretend (you are|to be)|act as/gi, '')
    // Strip non-printable / control characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
}

/**
 * Sanitize a URL field — must start with http/https, no javascript: or data: URIs.
 */
export function sanitizeUrl(input: string): string {
  if (!input || typeof input !== 'string') return ''
  const trimmed = input.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed.slice(0, 2048)
  return ''
}

/**
 * Sanitize a plain text field — strip HTML tags and control characters.
 */
export function sanitizeText(input: string, maxLen = 200): string {
  if (!input || typeof input !== 'string') return ''
  return input
    .slice(0, maxLen)
    .replace(/<[^>]*>/g, '')                          // strip HTML tags
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // strip control chars
    .trim()
}

/** Ensure a number is within a safe range */
export function sanitizeNumber(input: unknown, min: number, max: number, fallback: number): number {
  const n = Number(input)
  if (!isFinite(n)) return fallback
  return Math.min(max, Math.max(min, Math.floor(n)))
}
