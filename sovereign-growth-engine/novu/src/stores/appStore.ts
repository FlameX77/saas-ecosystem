import { create } from "zustand";
import type { Organization, Profile } from "@/types";
interface AppState {
  currentOrg: Organization | null;
  currentProfile: Profile | null;
  sidebarCollapsed: boolean;
  setOrg: (org: Organization | null) => void;
  setProfile: (profile: Profile | null) => void;
  toggleSidebar: () => void;
}
export const useAppStore = create<AppState>((set) => ({
  currentOrg: null, currentProfile: null, sidebarCollapsed: false,
  setOrg: (org) => set({ currentOrg: org }),
  setProfile: (profile) => set({ currentProfile: profile }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}));
