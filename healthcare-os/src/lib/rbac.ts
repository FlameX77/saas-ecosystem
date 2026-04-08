import { UserRole } from './types'

type Permission = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'EXECUTE' | 'APPROVE'

const ROLE_PERMISSIONS: Record<UserRole, Partial<Record<string, Permission[]>>> = {
  SUPER_ADMIN: {
    '*': ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXECUTE', 'APPROVE'],
  },
  CLINIC_ADMIN: {
    'PATIENT': ['CREATE', 'READ', 'UPDATE', 'DELETE'],
    'CONSULTATION': ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXECUTE'],
    'NOTE': ['CREATE', 'READ', 'UPDATE', 'DELETE', 'APPROVE'],
    'SETTINGS': ['READ', 'UPDATE'],
    'TEMPLATE': ['CREATE', 'READ', 'UPDATE', 'DELETE'],
  },
  DOCTOR: {
    'PATIENT': ['CREATE', 'READ', 'UPDATE'],
    'CONSULTATION': ['CREATE', 'READ', 'UPDATE', 'EXECUTE'],
    'NOTE': ['CREATE', 'READ', 'UPDATE', 'APPROVE'],
    'TEMPLATE': ['READ'],
  },
  NURSE: {
    'PATIENT': ['READ', 'UPDATE'],
    'CONSULTATION': ['READ'],
    'NOTE': ['READ'],
  },
  RECEPTIONIST: {
    'PATIENT': ['CREATE', 'READ', 'UPDATE'],
    'CONSULTATION': ['READ'],
  }
}

export function canUser(role: UserRole, resource: string, action: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role]
  if (!permissions) return false

  // Check wildcard matches
  if (permissions['*']?.includes(action)) return true

  // Check specific resource matches
  return permissions[resource]?.includes(action) ?? false
}
