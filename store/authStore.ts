import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  role: 'patient' | 'admin' | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  isAuthenticated: false,
  
  setUser: (user) => set({ 
    user, 
    role: user?.role || null,
    isAuthenticated: !!user 
  }),
  
  clearUser: () => set({ 
    user: null, 
    role: null,
    isAuthenticated: false 
  }),
}));
