import Constants from 'expo-constants';

const DEFAULT_DEV_PORT = '3000';
const PROD_BACKEND_URL = 'https://terroirapp.com';

/**
 * Resuelve el host del backend:
 * - EXPO_PUBLIC_BACKEND_URL si está definido (override total, p.ej. staging).
 * - En dev: http://<IP-de-Metro>:<EXPO_PUBLIC_DEV_BACKEND_PORT|3000>.
 * - En release: https://terroirapp.com.
 */
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

/** Host base del backend, sin el prefijo de la API. */
export const BACKEND_URL = resolveBaseUrl();

// En dev, deja constancia del host resuelto. En un dispositivo físico por USB
// `hostUri` suele ser `localhost`, por lo que el backend queda en
// http://localhost:3000 y requiere `adb reverse tcp:3000 tcp:3000` (igual que
// Metro hace con el 8081). Ver `npm run adb:reverse`.
if (__DEV__) {
  console.log(`[api] backend → ${BACKEND_URL}/api`);
}

/**
 * URL base de la API REST. El backend NestJS monta todas las rutas bajo el
 * prefijo global `api` (ver backend/src/main.ts → setGlobalPrefix('api')), así
 * que todas las requests cuelgan de aquí (p.ej. `/users/login` → `/api/users/login`).
 */
export const API_URL = `${BACKEND_URL}/api`;
