export interface Clinic {
  id: string
  name: string
  subscription_tier: 'trial' | 'starter' | 'pro' | 'enterprise'
  subscription_status: 'active' | 'cancelled' | 'past_due'
  trial_ends_at: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
  consultation_count: number
  created_at: string
}

export interface Doctor {
  id: string
  clinic_id: string
  full_name: string
  email: string
  role: 'doctor' | 'admin'
  created_at: string
}

export interface Patient {
  id: string
  clinic_id: string
  full_name: string
  age?: number
  gender?: 'Male' | 'Female' | 'Other'
  phone?: string
  notes?: string
  created_at: string
}

export interface SOAPNote {
  subjective: string
  objective: string
  assessment: string
  plan: string
  prescription_suggestions: string[]
  follow_up: string
  red_flags: string[]
}

export interface Consultation {
  id: string
  clinic_id: string
  doctor_id: string
  patient_id?: string
  audio_url?: string
  transcript?: string
  soap_note?: SOAPNote
  language: string
  duration_seconds?: number
  chief_complaint?: string
  status: 'pending' | 'transcribed' | 'completed' | 'transcription_failed' | 'failed'
  created_at: string
}

export type RecorderState = 'idle' | 'requesting-permission' | 'recording' | 'processing' | 'error'
export type Language = 'en' | 'hi' | 'ar' | 'ur'
