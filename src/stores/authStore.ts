import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null | undefined;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initially undefined while checking auth state
  user: undefined,
  setUser: (user) => set({ user }),
  logout: () => {
    set({ user: null });
    // Force reload to clear all state
    window.location.href = '/login';
  },
}));