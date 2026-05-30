import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import Constants from 'expo-constants';
import { tokenStorage } from '@/store/useTokenStorage';
import { signOut } from '@/store/signOut';

const DEFAULT_DEV_PORT = '3000';
const PROD_BACKEND_URL = 'https://terroirapp.com';

function resolveBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_BACKEND_URL) {
    return process.env.EXPO_PUBLIC_BACKEND_URL;
  }

  if (__DEV__) {
    const devHost = Constants.expoConfig?.hostUri?.split(':')[0];
    const devPort = process.env.EXPO_PUBLIC_DEV_BACKEND_PORT ?? DEFAULT_DEV_PORT;
    if (devHost) return `http://${devHost}:${devPort}`;
  }

  return PROD_BACKEND_URL;
}

const BASE_URL = resolveBaseUrl();

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await tokenStorage.getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await signOut();
    }
    return Promise.reject(error);
  },
);
