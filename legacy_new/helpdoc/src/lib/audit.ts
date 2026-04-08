import prisma from './prisma'
import { AuditLogEntry } from './types'

export async function audit(
  clinicId: string,
  entry: AuditLogEntry
) {
  try {
    await prisma.auditLog.create({
      data: {
        clinicId,
        userId: entry.userId,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId,
        metadata: entry.metadata as any,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
      },
    })
  } catch (error) {
    // If audit fails, log standard error but don't crash the main process
    console.error('CRITICAL: Audit logging failed:', error)
  }
}

// Audit types
export const AUDIT_ACTIONS = {
  CREATE_PATIENT: 'CREATE_PATIENT',
  VIEW_PATIENT: 'VIEW_PATIENT',
  UPDATE_PATIENT: 'UPDATE_PATIENT',
  DELETE_PATIENT: 'DELETE_PATIENT',
  CREATE_CONSULTATION: 'CREATE_CONSULTATION',
  VIEW_CONSULTATION: 'VIEW_CONSULTATION',
  GENERATE_NOTE: 'GENERATE_NOTE',
  APPROVE_NOTE: 'APPROVE_NOTE',
  DOWNLOAD_NOTE: 'DOWNLOAD_NOTE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  CHANGE_SETTINGS: 'CHANGE_SETTINGS'
} as const
