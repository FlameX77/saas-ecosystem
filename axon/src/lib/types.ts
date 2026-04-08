export interface User {
  id: string
  email: string
  name: string
  company: string
  website: string
  plan: string
  status: string
  created_at: string
}

export interface Contact {
  id: string
  user_id: string
  apollo_id: string | null
  first_name: string
  last_name: string
  email: string
  title: string
  company: string
  industry: string
  country: string
  linkedin_url: string | null
  score: number
  priority: string
  score_reason: string | null
  email_verified: boolean
  status: string
  reply_category: string | null
  pipeline_stage: string
  meeting_at: string | null
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  contact_id: string
  user_id: string
  subject: string
  body: string
  followup_1: string | null
  followup_2: string | null
  type: string
  status: string
  sent_at: string | null
  opened_at: string | null
  replied_at: string | null
  created_at: string
}

export interface Campaign {
  id: string
  user_id: string
  name: string
  target_industries: string[] | string
  target_job_titles: string[] | string
  target_countries: string[] | string
  daily_limit: number
  min_score: number
  status: string
  leads_found: number
  emails_sent: number
  replies_received: number
  meetings_booked: number
  created_at: string
}

export interface AnalyticsEvent {
  id: string
  user_id: string
  event: string
  contact_id: string | null
  campaign_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface ContentDraft {
  id: string
  user_id: string
  week: string
  linkedin_post: string
  twitter_thread: string
  newsletter_intro: string
  suggested_time: string | null
  status: string
  created_at: string
}

export interface SentinelLog {
  id: string
  api_status: Record<string, unknown>
  has_issues: boolean
  alert_sent: boolean
  severity: string
  message: string
  checked_at: string
}

export type AgentName = 'cortex' | 'specter' | 'striker' | 'pulse' | 'sentinel'

export interface AgentTriggerPayload {
  agent: AgentName
  userId: string
  payload: Record<string, unknown>
}

export interface DashboardStats {
  totalLeads: number
  emailsSent: number
  replyRate: number
  meetingsBooked: number
}

export interface PipelineCounts {
  queued: number
  emailed: number
  replied: number
  meeting: number
}
