import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const patientSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(7).max(20),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'UNKNOWN']).optional(),
  allergies: z.string().optional(),
  chronicConditions: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  address: z.string().optional(),
  nationalId: z.string().optional(),
  insuranceProvider: z.string().optional(),
  insuranceNumber: z.string().optional(),
})

export const consultationSchema = z.object({
  patientId: z.string().min(1),
  language: z.enum(['EN', 'HI', 'AR', 'UR']),
  templateId: z.string().optional(),
  chiefComplaint: z.string().optional(),
})

export const noteSchema = z.object({
  subjective: z.string().min(1),
  objective: z.string().min(1),
  assessment: z.string().min(1),
  plan: z.string().min(1),
  prescriptions: z.array(z.object({
    medication: z.string().min(1),
    dosage: z.string().min(1),
    frequency: z.string().min(1),
    duration: z.string().min(1),
    instructions: z.string().optional(),
    isRefill: z.boolean().default(false),
  })).optional(),
  redFlags: z.array(z.object({
    symptom: z.string(),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    recommendation: z.string(),
  })).optional(),
})

export const templateSchema = z.object({
  name: z.string().min(1).max(100),
  specialty: z.string().min(1),
  language: z.enum(['EN', 'HI', 'AR', 'UR']),
  subjectivePrompt: z.string().min(1),
  objectivePrompt: z.string().min(1),
  assessmentPrompt: z.string().min(1),
  planPrompt: z.string().min(1),
  isDefault: z.boolean().default(false),
})

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export const settingsSchema = z.object({
  clinicName: z.string().min(1).max(100),
  timezone: z.string().default('Asia/Dubai'),
  defaultLanguage: z.enum(['EN', 'HI', 'AR', 'UR']).default('EN'),
  autoDeleteAudio: z.boolean().default(true),
  audioRetentionHours: z.number().int().min(1).max(720).default(24),
  requireNoteApproval: z.boolean().default(true),
  enableRedFlagAlerts: z.boolean().default(true),
  enablePrescriptionValidation: z.boolean().default(true),
})

export type LoginInput = z.infer<typeof loginSchema>
export type PatientInput = z.infer<typeof patientSchema>
export type ConsultationInput = z.infer<typeof consultationSchema>
export type NoteInput = z.infer<typeof noteSchema>
export type TemplateInput = z.infer<typeof templateSchema>
