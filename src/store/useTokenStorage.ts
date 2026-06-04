import * as SecureStore from 'expo-secure-store';

// Tokens de sesión guardados en el almacenamiento seguro del dispositivo
// (Keychain en iOS / Keystore en Android), nunca en AsyncStorage.
const ACCESS_TOKEN_KEY = 'terroir_access_token';
const REFRESH_TOKEN_KEY = 'terroir_refresh_token';

export const tokenStorage = {
  // ── Access token ──────────────────────────────────────────────────────────
  getAccessToken: (): Promise<string | null> =>
    SecureStore.getItemAsync(ACCESS_TOKEN_KEY),

  setAccessToken: (token: string): Promise<void> =>
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token),

  removeAccessToken: (): Promise<void> =>
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),

  // ── Refresh token ─────────────────────────────────────────────────────────
  getRefreshToken: (): Promise<string | null> =>
    SecureStore.getItemAsync(REFRESH_TOKEN_KEY),

  setRefreshToken: (token: string): Promise<void> =>
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token),

  removeRefreshToken: (): Promise<void> =>
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),

  // ── Pareja de tokens ──────────────────────────────────────────────────────
  /** Persiste el par access + refresh emitido por login/register/refresh. */
  setTokens: async (accessToken: string, refreshToken: string): Promise<void> => {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
    ]);
  },

  /** Borra ambos tokens (cierre de sesión). */
  clear: async (): Promise<void> => {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    ]);
  },
};
