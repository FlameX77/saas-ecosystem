/**
 * UAE DHA Compliance Checker
 * Validates outbound messages against UAE healthcare communication guidelines.
 * Auto-fixes non-compliant messages before they are sent.
 */

const BUSINESS_NAME = process.env.NEXT_PUBLIC_CLINIC_NAME ?? 'Our Clinic';

interface ComplianceResult {
  compliant: boolean;
  issues: string[];
  fixedMessage: string;
}

const FORBIDDEN_PATTERNS = [
  /guaranteed?\s*(result|outcome|cure|treatment)/gi,
  /100%\s*(success|effective|safe)/gi,
  /no\s*(side.?effects?|risk)/gi,
  /certified\s*(miracle|revolutionary)/gi,
];

export function checkCompliance(message: string): ComplianceResult {
  const issues: string[] = [];
  let fixedMessage = message;

  // Rule 1: Must not contain medical guarantees
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(message)) {
      issues.push('Message contains prohibited guaranteed outcome claims');
      fixedMessage = fixedMessage.replace(pattern, 'highly effective');
    }
  }

  // Rule 2: SMS must include opt-out
  if (!message.includes('Reply STOP') && !message.includes('opt out')) {
    issues.push('SMS message missing opt-out instruction');
    fixedMessage = fixedMessage.trimEnd() + ' Reply STOP to opt out.';
  }

  // Rule 3: Must identify the business
  const hasBusinessName = message.toLowerCase().includes(BUSINESS_NAME.toLowerCase())
    || message.toLowerCase().includes('clinic')
    || message.toLowerCase().includes('our team');
  if (!hasBusinessName) {
    issues.push('Message does not identify the sending business');
    fixedMessage = `${BUSINESS_NAME}: ` + fixedMessage;
  }

  return {
    compliant: issues.length === 0,
    issues,
    fixedMessage,
  };
}

export async function logComplianceCheck(
  supabase: any,
  message: string,
  result: ComplianceResult,
  contactId?: string
) {
  await supabase.from('compliance_logs').insert({
    original_message: message,
    fixed_message: result.fixedMessage,
    issues: result.issues,
    compliant: result.compliant,
    contact_id: contactId ?? null,
  }).then(({ error }: { error: any }) => {
    if (error) console.error('Compliance log error:', error.message);
  });
}
