import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null | undefined;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initially undefined while checking auth state
  user: undefined,
  setUser: (user) => set({ user }),
}));