import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';

type SessionState = {
  session: Session | null;
  user: User | null;
  role: 'customer' | 'runner' | 'admin' | null;
  isGuest: boolean;
  setSession: (session: Session | null) => void;
  setRole: (role: 'customer' | 'runner' | 'admin' | null) => void;
  setGuest: (isGuest: boolean) => void;
  clear: () => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  session: null,
  user: null,
  role: null,
  isGuest: false,
  setSession: (session) => set({ session, user: session?.user ?? null }),
  setRole: (role) => set({ role }),
  setGuest: (isGuest) => set({ isGuest }),
  clear: () => set({ session: null, user: null, role: null, isGuest: false }),
}));
