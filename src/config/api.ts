import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { tokenStorage } from '@/store/useTokenStorage';
import { signOut } from '@/store/signOut';

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? 'http://localhost:3000';

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
