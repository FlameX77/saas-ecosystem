export interface GeneratedMessage { sms: string; email_subject: string; email_body: string; whatsapp: string; fallback?: boolean; }
export async function generateMessage(params: {
  contactName: string; businessType: string; serviceInterest?: string; lastInteraction?: string;
  daysSinceContact?: number; goal: string; tone: string; businessName: string; bookingLink?: string;
}): Promise<GeneratedMessage> {
  const response = await fetch("/api/generate-message", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(params) });
  if (!response.ok) throw new Error("Failed to generate message");
  return response.json();
}

// ─── Context Compression ───────────────────────────────────────────────────────

const FILLER_REPLACEMENTS: [RegExp, string][] = [
  [/in order to/gi, 'to'],
  [/due to the fact that/gi, 'because'],
  [/at this point in time|at the present time/gi, 'now'],
  [/\b(very|really|quite|literally|basically|actually|honestly|obviously|clearly)\b\s*/gi, ''],
  [/as you can see|it is worth noting|it should be noted|needless to say/gi, ''],
];

export function compressContext(text: string): { compressed: string; originalTokens: number; compressedTokens: number } {
  const originalTokens = Math.ceil(text.length / 4);
  let compressed = text;

  for (const [pattern, replacement] of FILLER_REPLACEMENTS) {
    compressed = compressed.replace(pattern, replacement);
  }
  compressed = compressed.replace(/\s{2,}/g, ' ').trim();

  const sentences = compressed.split(/(?<=[.!?])\s+/);
  const unique: string[] = [];
  for (const sentence of sentences) {
    const isDuplicate = unique.some(s => {
      const words1 = new Set(s.toLowerCase().split(/\s+/));
      const overlap = sentence.toLowerCase().split(/\s+/).filter(w => words1.has(w)).length;
      return overlap / sentence.split(/\s+/).length > 0.85;
    });
    if (!isDuplicate) unique.push(sentence);
  }
  compressed = unique.join(' ');

  const compressedTokens = Math.ceil(compressed.length / 4);
  console.log(`[Compression] ${originalTokens} → ${compressedTokens} tokens (${Math.round((1 - compressedTokens / originalTokens) * 100)}% saved)`);
  return { compressed, originalTokens, compressedTokens };
}
