import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { tokenStorage } from '@/store/useTokenStorage';

// En Expo, las variables EXPO_PUBLIC_* se exponen en el bundle JS.
// Fallback a localhost para iOS sim / 10.0.2.2 para Android emulator.
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor ──────────────────────────────────────────────────────
// Adjunta el access token a cada petición autenticada.
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await tokenStorage.getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor — token refresh ─────────────────────────────────────
// Si el backend responde 401, intenta renovar el access token con el
// refresh token. Si no puede, hace logout y rechaza la promesa.
//
// La "refresh queue" garantiza que peticiones concurrentes no disparen
// múltiples llamadas de refresh al mismo tiempo.

type QueueEntry = {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
};

let isRefreshing = false;
let refreshQueue: QueueEntry[] = [];

function processQueue(error: unknown, newToken: string | null) {
  refreshQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(newToken!),
  );
  refreshQueue = [];
}

api.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Solo intentar refresh ante un 401 y si no es ya un retry
    if (error.response?.status !== 401 || original?._retry) {
      return Promise.reject(error);
    }

    // Si ya hay un refresh en vuelo, encolar la petición
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (!refreshToken) throw new Error('Sin refresh token');

      // Llamada directa con axios (sin instancia) para evitar interceptores
      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
        refreshToken,
      });

      const newToken: string = data.tokens?.accessToken ?? data.access_token;
      await tokenStorage.setAccessToken(newToken);

      const newRefresh: string | undefined =
        data.tokens?.refreshToken ?? data.refresh_token;
      if (newRefresh) await tokenStorage.setRefreshToken(newRefresh);

      processQueue(null, newToken);
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch (refreshError) {
      processQueue(refreshError, null);

      // Importación lazy para evitar dependencia circular en tiempo de carga
      const { useAuthStore } = await import('@/store/useAuthStore');
      await useAuthStore.getState().logout();

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
