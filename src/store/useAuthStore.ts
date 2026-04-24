import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  isAuthenticated: boolean;
  isHydrated: boolean;

  setAuthenticated: (value: boolean) => void;
  reset: () => void;
  _setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      isHydrated: false,

      setAuthenticated: (value) => set({ isAuthenticated: value }),
      reset: () => set({ isAuthenticated: false }),
      _setHydrated: () => set({ isHydrated: true }),
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
