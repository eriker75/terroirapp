import * as SecureStore from 'expo-secure-store';

const KEYS = {
  ACCESS_TOKEN: 'terroir:access_token',
  REFRESH_TOKEN: 'terroir:refresh_token',
} as const;

export const tokenStorage = {
  getAccessToken: (): Promise<string | null> =>
    SecureStore.getItemAsync(KEYS.ACCESS_TOKEN),

  setAccessToken: (token: string): Promise<void> =>
    SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, token),

  removeAccessToken: (): Promise<void> =>
    SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN),

  getRefreshToken: (): Promise<string | null> =>
    SecureStore.getItemAsync(KEYS.REFRESH_TOKEN),

  setRefreshToken: (token: string): Promise<void> =>
    SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, token),

  removeRefreshToken: (): Promise<void> =>
    SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN),

  clearAll: async (): Promise<void> => {
    await SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN);
  },
};
