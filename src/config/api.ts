import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { API_URL } from '@/config/baseUrl';
import { tokenStorage } from '@/store/useTokenStorage';
import { signOut } from '@/store/signOut';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Cliente "desnudo" sin interceptores, usado solo para renovar tokens. Evita la
 * recursión que se daría si el propio refresh disparara el interceptor de 401.
 */
const refreshClient = axios.create({
  baseURL: API_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// Rutas de auth que NUNCA deben intentar refrescar (un 401 aquí es definitivo:
// credenciales malas, refresh token expirado, etc.).
const NO_REFRESH_PATHS = ['/users/login', '/users/register', '/users/refresh'];

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

/**
 * Single-flight: si varias requests reciben 401 a la vez, todas comparten una
 * única promesa de refresh en lugar de disparar N renovaciones simultáneas
 * (lo que invalidaría tokens entre sí por la rotación del backend).
 */
let refreshPromise: Promise<string | null> | null = null;

/**
 * Renueva el par de tokens con el refresh token guardado. Devuelve el nuevo
 * access token, o null si no hay refresh token o el backend lo rechaza.
 */
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await tokenStorage.getRefreshToken();
  if (!refreshToken) return null;

  try {
    const { data } = await refreshClient.post<{
      accessToken: string;
      refreshToken: string;
    }>('/users/refresh', { refreshToken });
    await tokenStorage.setTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

function getRefresh(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

// ── Request: adjunta el access token ──────────────────────────────────────────
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await tokenStorage.getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response: refresca el access token en un 401 y reintenta una sola vez ──────
api.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;

    const isAuthPath =
      !!original?.url && NO_REFRESH_PATHS.some((p) => original.url!.includes(p));

    if (status === 401 && original && !original._retry && !isAuthPath) {
      original._retry = true;

      const newToken = await getRefresh();
      if (newToken) {
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }

      // El refresh falló (o no había refresh token): sesión terminada.
      await signOut();
    }

    return Promise.reject(error);
  },
);
