export function sanitizeInput(input: string): string {
  return input.replace(/[<>]/g, "").replace(/javascript:/gi, "").replace(/on\w+=/gi, "").trim();
}
export function sanitizePhone(phone: string): string { return phone.replace(/[^\d+]/g, ""); }
export function stripPromptInjection(input: string): string {
  return input
    .replace(/\b(ignore|disregard|forget|override)\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?|guidelines?)\b/gi, "")
    .replace(/\b(system|assistant)\s*[:=]/gi, "")
    .replace(/\b(you are|act as|pretend to be|roleplay as)\b/gi, "")
    .replace(/```[\s\S]*?```/g, "")
    .trim();
}
