export function getFallbackMessage(contactName: string, businessName: string) {
  return {
    sms: `Hi ${contactName}, this is ${businessName}. We wanted to follow up with you. Would you like to book an appointment?`,
    email_subject: `Following up, ${contactName}`,
    email_body: `<p>Hi ${contactName},</p><p>Hope you are doing well. We wanted to check in and see if you would like to schedule a time with us.</p><p>Best,<br/>${businessName}</p>`,
    whatsapp: `Hi ${contactName}! This is ${businessName}. Just checking in — would you like to book a time with us?`,
    fallback: true as const,
  };
}
