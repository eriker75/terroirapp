import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tokenStorage } from '@/store/useTokenStorage';
import type { LoginCredentials, RegisterPayload } from '@/types/auth.types';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  /** true cuando el store termina de rehidratarse desde AsyncStorage */
  isHydrated: boolean;
  error: string | null;

  login: (credentials: LoginCredentials) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  /** Usado internamente y por el interceptor de refresh en api.ts */
  setTokens: (accessToken: string, refreshToken?: string) => Promise<void>;
  clearError: () => void;
  _setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,
      error: null,

      _setHydrated: () => set({ isHydrated: true }),

      clearError: () => set({ error: null }),

      setTokens: async (accessToken, refreshToken) => {
        await tokenStorage.setAccessToken(accessToken);
        if (refreshToken) await tokenStorage.setRefreshToken(refreshToken);
      },

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const { api } = await import('@/config/api');
          const { data } = await api.post('/auth/login', credentials);

          await get().setTokens(
            data.tokens.accessToken,
            data.tokens.refreshToken,
          );

          const { useProfileStore } = await import('@/store/useProfileStore');
          useProfileStore.getState().setUser(data.user);

          set({ isAuthenticated: true, isLoading: false });
        } catch (err: any) {
          const message =
            err.response?.data?.message ?? 'Error al iniciar sesión';
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      register: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const { api } = await import('@/config/api');
          const { data } = await api.post('/auth/register', payload);

          await get().setTokens(
            data.tokens.accessToken,
            data.tokens.refreshToken,
          );

          const { useProfileStore } = await import('@/store/useProfileStore');
          useProfileStore.getState().setUser(data.user);

          set({ isAuthenticated: true, isLoading: false });
        } catch (err: any) {
          const message =
            err.response?.data?.message ?? 'Error al registrarse';
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      logout: async () => {
        try {
          const { api } = await import('@/config/api');
          await api.post('/auth/logout').catch(() => {});
        } finally {
          await tokenStorage.clearAll();

          const { useProfileStore } = await import('@/store/useProfileStore');
          useProfileStore.getState().clearProfile();

          set({ isAuthenticated: false, error: null });
        }
      },
    }),
    {
      name: 'terroir:auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        state?._setHydrated();
      },
    },
  ),
);
