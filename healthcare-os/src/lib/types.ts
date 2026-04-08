export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type UserRole = 'SUPER_ADMIN' | 'CLINIC_ADMIN' | 'DOCTOR' | 'NURSE' | 'RECEPTIONIST'

export type ConsultationStatus = 'IN_PROGRESS' | 'TRANSCRIBING' | 'NOTE_GENERATING' | 'NOTE_REVIEW' | 'COMPLETED' | 'ARCHIVED'

export type NoteStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'SIGNED'

export interface SoapNote {
  subjective: string
  objective: string
  assessment: string
  plan: string
}

export interface Prescription {
  id: string
  medication: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
  isRefill: boolean
}

export interface RedFlag {
  id: string
  symptom: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  recommendation: string
}

export interface AuditLogEntry {
  userId: string
  action: string
  resource: string
  resourceId: string
  metadata?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

export interface TranscriptionSegment {
  id: string
  speaker: 'DOCTOR' | 'PATIENT' | 'UNKNOWN'
  text: string
  startMs: number
  endMs: number
  confidence: number
}

export interface ClinicSettings {
  defaultLanguage: string
  timezone: string
  dateFormat: string
  autoDeleteAudio: boolean
  audioRetentionHours: number
  requireNoteApproval: boolean
  enableRedFlagAlerts: boolean
  enablePrescriptionValidation: boolean
}
