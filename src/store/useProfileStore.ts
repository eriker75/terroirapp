import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile } from '@/types/auth.types';

interface ProfileState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;

  /** Llamado por useAuthStore después de login/register */
  setUser: (user: UserProfile) => void;
  /** Llamado por useAuthStore en logout */
  clearProfile: () => void;

  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  clearError: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user }),

      clearProfile: () => set({ user: null, error: null }),

      clearError: () => set({ error: null }),

      fetchProfile: async () => {
        set({ isLoading: true, error: null });
        try {
          const { api } = await import('@/config/api');
          const { data } = await api.get<UserProfile>('/users/me');
          set({ user: data, isLoading: false });
        } catch (err: any) {
          set({ isLoading: false });
          throw err;
        }
      },

      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        try {
          const { api } = await import('@/config/api');
          const { data } = await api.patch<UserProfile>('/users/me', profileData);
          set({ user: data, isLoading: false });
        } catch (err: any) {
          const message =
            err.response?.data?.message ?? 'Error al actualizar perfil';
          set({ isLoading: false, error: message });
          throw err;
        }
      },
    }),
    {
      name: 'terroir:profile',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
