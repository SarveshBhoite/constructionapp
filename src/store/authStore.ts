import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'admin' | 'contractor' | 'labour' | null;

interface UserProfile {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  city?: string;
  state?: string;
  profileImage?: string;
  companyName?: string;
  categoryEn?: string;
  categoryMr?: string;
  experienceYears?: number;
  about?: string;
  wages?: number;
  wageType?: string;
  isSubscribed?: boolean;
  isApproved?: boolean;
  views?: number;
  rating?: number;
  idProof?: string;
}

interface AuthState {
  role: UserRole;
  isLoggedIn: boolean;
  user: UserProfile | null;
  setAuth: (role: UserRole, user: UserProfile) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      role: null,
      isLoggedIn: false,
      user: null,
      setAuth: (role, user) => set({ role, user, isLoggedIn: true }),
      logout: () => set({ isLoggedIn: false, role: null, user: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
