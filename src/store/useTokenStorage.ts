import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'terroir_access_token';

export const tokenStorage = {
  getAccessToken: (): Promise<string | null> =>
    SecureStore.getItemAsync(ACCESS_TOKEN_KEY),

  setAccessToken: (token: string): Promise<void> =>
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token),

  removeAccessToken: (): Promise<void> =>
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
};
