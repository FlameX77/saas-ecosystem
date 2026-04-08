import { create } from 'zustand'
import type { Organization, Profile, Contact } from '@/types'

interface AppState {
  currentOrg: Organization | null
  currentProfile: Profile | null
  selectedContact: Contact | null
  inboxFilter: 'all' | 'unread' | 'sms' | 'email' | 'whatsapp'
  setOrg: (org: Organization | null) => void
  setProfile: (profile: Profile | null) => void
  setSelectedContact: (contact: Contact | null) => void
  setInboxFilter: (filter: AppState['inboxFilter']) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentOrg: null,
  currentProfile: null,
  selectedContact: null,
  inboxFilter: 'all',
  setOrg: (org) => set({ currentOrg: org }),
  setProfile: (profile) => set({ currentProfile: profile }),
  setSelectedContact: (contact) => set({ selectedContact: contact }),
  setInboxFilter: (filter) => set({ inboxFilter: filter }),
}))
