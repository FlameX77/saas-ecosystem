export interface Organization {
  id: string
  name: string
  industry?: string
  timezone: string
  plan_tier: string
  stripe_customer_id?: string
  avg_deal_value: number
  booking_link?: string
  business_phone?: string
  logo_url?: string
  business_hours_start: number
  business_hours_end: number
  onboarding_completed: boolean
  created_at: string
}

export interface Profile {
  id: string
  org_id?: string
  full_name?: string
  role: string
  onboarding_completed: boolean
  created_at: string
}

export type ContactStage = 'new_lead' | 'contacted' | 'replied' | 'appointment_booked' | 'recovered' | 'lost'

export interface Contact {
  id: string
  org_id: string
  first_name: string
  last_name?: string
  phone?: string
  email?: string
  service_interest?: string
  deal_value?: number
  stage: ContactStage
  source?: string
  opted_out: boolean
  last_contacted_at?: string
  notes?: string
  created_at: string
}

export type MessageChannel = 'sms' | 'email' | 'whatsapp'
export type MessageDirection = 'inbound' | 'outbound'

export interface Conversation {
  id: string
  org_id: string
  contact_id: string
  channel: MessageChannel
  direction: MessageDirection
  body?: string
  subject?: string
  sent_at: string
  read_at?: string
  delivery_status: string
  ai_generated: boolean
}

export interface Sequence {
  id: string
  org_id: string
  name: string
  industry_template?: string
  status: 'active' | 'paused' | 'archived'
  stop_on_reply: boolean
  stop_on_booked: boolean
  created_at: string
}

export interface SequenceStep {
  id: string
  sequence_id: string
  step_number: number
  delay_days: number
  channel: MessageChannel
  message_template?: string
  subject_template?: string
  ab_variant: 'a' | 'b'
}

export interface Enrollment {
  id: string
  org_id: string
  contact_id: string
  sequence_id: string
  started_at: string
  current_step: number
  next_send_at?: string
  status: 'active' | 'paused' | 'completed' | 'exited'
  exit_reason?: string
}

export interface Appointment {
  id: string
  org_id: string
  contact_id: string
  scheduled_at?: string
  completed_at?: string
  no_show: boolean
  recovery_triggered: boolean
  external_id?: string
}

export interface RecoveredRevenue {
  id: string
  org_id: string
  contact_id?: string
  amount: number
  recovery_type: 'appointment' | 'lead' | 'invoice' | 'reactivation'
  recovered_at: string
}
