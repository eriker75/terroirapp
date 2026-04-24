import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile } from '@/types/auth.types';

interface ProfileState {
  user: UserProfile | null;

  setUser: (user: UserProfile) => void;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      user: null,

      setUser: (user) => set({ user }),

      clearProfile: () => set({ user: null }),
    }),
    {
      name: 'terroir:profile',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
