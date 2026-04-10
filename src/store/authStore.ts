import { create } from 'zustand';

export type UserRole = 'admin' | 'contractor' | 'labour' | null;

interface AuthState {
  role: UserRole;
  isLoggedIn: boolean;
  setRole: (role: UserRole) => void;
  login: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  role: null,
  isLoggedIn: false,
  setRole: (role) => set({ role }),
  login: () => set({ isLoggedIn: true }),
  logout: () => set({ isLoggedIn: false, role: null }),
}));
