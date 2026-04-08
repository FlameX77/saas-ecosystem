export interface Organization {
  id: string;
  name: string;
  industry: string | null;
  timezone: string;
  plan_tier: string;
  stripe_customer_id: string | null;
  avg_deal_value: number;
  booking_link: string | null;
  business_phone: string | null;
  logo_url: string | null;
  business_hours_start: number;
  business_hours_end: number;
  onboarding_completed: boolean;
  created_at: string;
}
export interface Profile {
  id: string;
  org_id: string | null;
  full_name: string | null;
  role: string;
  onboarding_completed: boolean;
  notification_prefs: Record<string, unknown>;
  created_at: string;
}
export interface Contact {
  id: string;
  org_id: string;
  first_name: string;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  service_interest: string | null;
  deal_value: number | null;
  stage: "new_lead" | "contacted" | "replied" | "appointment_booked" | "recovered" | "lost";
  source: string | null;
  opted_out: boolean;
  last_contacted_at: string | null;
  notes: string | null;
  created_at: string;
}
export interface Conversation {
  id: string;
  org_id: string;
  contact_id: string;
  channel: "sms" | "email" | "whatsapp";
  direction: "inbound" | "outbound";
  body: string | null;
  subject: string | null;
  sent_at: string;
  read_at: string | null;
  delivery_status: string;
  ai_generated: boolean;
}
export interface Sequence {
  id: string;
  org_id: string;
  name: string;
  industry_template: string | null;
  status: "active" | "paused" | "archived";
  stop_on_reply: boolean;
  stop_on_booked: boolean;
  created_at: string;
}
export interface SequenceStep {
  id: string;
  sequence_id: string;
  step_number: number;
  delay_days: number;
  channel: "sms" | "email" | "whatsapp";
  message_template: string | null;
  subject_template: string | null;
  ab_variant: string;
}
export interface Enrollment {
  id: string;
  org_id: string;
  contact_id: string;
  sequence_id: string;
  started_at: string;
  current_step: number;
  next_send_at: string | null;
  status: "active" | "paused" | "completed" | "exited";
  exit_reason: string | null;
}
export interface Appointment {
  id: string;
  org_id: string;
  contact_id: string;
  scheduled_at: string | null;
  completed_at: string | null;
  no_show: boolean;
  recovery_triggered: boolean;
  external_id: string | null;
}
export interface RecoveredRevenue {
  id: string;
  org_id: string;
  contact_id: string | null;
  amount: number;
  recovery_type: "appointment" | "lead" | "invoice" | "reactivation";
  recovered_at: string;
}
export interface Invoice {
  id: string;
  org_id: string;
  contact_id: string | null;
  amount: number | null;
  due_date: string | null;
  paid_at: string | null;
  external_id: string | null;
  recovery_triggered: boolean;
}
export interface SuppressionEntry {
  id: string;
  org_id: string;
  phone: string | null;
  email: string | null;
  reason: string | null;
  created_at: string;
}
export interface Integration {
  id: string;
  org_id: string;
  provider: string;
  config: Record<string, unknown> | null;
  status: string;
  last_sync_at: string | null;
  created_at: string;
}
