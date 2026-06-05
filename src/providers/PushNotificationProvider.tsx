import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Platform } from 'react-native';

import {
  registerPushTokenRequest,
  setPushTokenEnabledRequest,
  sendTestPushRequest,
} from '@/requests/notifications/notifications.requests';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationsStore } from '@/store/useNotificationsStore';
import type { Notification as AppNotification } from '@/types/notification.types';

// Inspirado en el PushNotificationProvider del proyecto Nowful, adaptado a Terroir:
//   · registra el token COMPLETO de Expo ("ExponentPushToken[...]") en NUESTRO
//     backend NestJS (lo valida con Expo.isExpoPushToken — no extraemos el valor
//     interno como hacía Nowful),
//   · vuelca las push entrantes al store de notificaciones (pantalla de la app),
//   · re-registra automáticamente al iniciar sesión y limpia al cerrarla.

interface PushNotificationContextValue {
  expoPushToken: string | null;
  permissionStatus: Notifications.PermissionStatus | null;
  isRegistering: boolean;
  // Pide permisos (si hace falta), obtiene el token y lo registra en el backend.
  enableNotifications: () => Promise<boolean>;
  // Silencia este dispositivo en el backend sin borrar el token.
  disableNotifications: () => Promise<void>;
  // Envío de prueba a los propios dispositivos (POST /notifications/test).
  sendTestPush: (opts?: { title?: string; body?: string }) => Promise<void>;
}

const PushNotificationContext = createContext<
  PushNotificationContextValue | undefined
>(undefined);

// Muestra la notificación aunque la app esté en primer plano.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'General',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#E96141',
  });
}

function resolveProjectId(): string | undefined {
  return (
    Constants?.expoConfig?.extra?.eas?.projectId ??
    (Constants as unknown as { easConfig?: { projectId?: string } })?.easConfig
      ?.projectId
  );
}

// Mapea una notificación de Expo a la forma del store (pantalla de la app).
function toStoreNotification(
  n: Notifications.Notification,
): AppNotification {
  const content = n.request.content;
  const now = new Date().toISOString();
  return {
    id: n.request.identifier || `push-${Date.now()}`,
    title: content.title ?? 'Notificación',
    body: content.body ?? '',
    read: false,
    createdAt: now,
    updatedAt: now,
  };
}

export const PushNotificationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuthStore();
  const addNotification = useNotificationsStore((s) => s.addNotification);

  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] =
    useState<Notifications.PermissionStatus | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const tokenRef = useRef<string | null>(null);

  // ── Obtención del token de Expo (permisos + getExpoPushTokenAsync) ──────────
  const fetchExpoToken = useCallback(async (): Promise<string | null> => {
    await ensureAndroidChannel();

    if (!Device.isDevice) {
      // Los emuladores/simuladores no reciben push reales.
      console.log('[push] Se requiere un dispositivo físico para push');
      return null;
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    setPermissionStatus(finalStatus);
    if (finalStatus !== 'granted') {
      console.log('[push] Permiso de notificaciones no concedido');
      return null;
    }

    const projectId = resolveProjectId();
    if (!projectId) {
      console.log('[push] Falta el projectId de EAS en app.json');
      return null;
    }

    try {
      // .data ES el token completo "ExponentPushToken[...]" — se envía tal cual.
      const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
      return data;
    } catch (e) {
      console.log('[push] Error obteniendo el Expo push token:', e);
      return null;
    }
  }, []);

  // ── Registro completo: token + alta en el backend ───────────────────────────
  const enableNotifications = useCallback(async (): Promise<boolean> => {
    setIsRegistering(true);
    try {
      const token = await fetchExpoToken();
      if (!token) return false;

      setExpoPushToken(token);
      tokenRef.current = token;

      await registerPushTokenRequest({
        token,
        platform: Platform.OS as 'ios' | 'android' | 'web',
        deviceName: Device.deviceName ?? undefined,
        enabled: true,
      });
      return true;
    } catch (e) {
      console.log('[push] Error registrando el token en el backend:', e);
      return false;
    } finally {
      setIsRegistering(false);
    }
  }, [fetchExpoToken]);

  const disableNotifications = useCallback(async () => {
    const token = tokenRef.current;
    if (!token) return;
    try {
      await setPushTokenEnabledRequest({ token, enabled: false });
    } catch (e) {
      console.log('[push] Error silenciando el token:', e);
    }
  }, []);

  const sendTestPush = useCallback(
    async (opts?: { title?: string; body?: string }) => {
      await sendTestPushRequest(opts ?? {});
    },
    [],
  );

  // ── Auto-registro según el estado de sesión ─────────────────────────────────
  useEffect(() => {
    if (!isHydrated) return;
    if (isAuthenticated) {
      // Al iniciar sesión (o al abrir ya logueado), asegura el token registrado.
      void enableNotifications();
    } else {
      // Al cerrar sesión solo limpiamos el estado local: el access token ya se
      // borró, así que un DELETE daría 401. El token queda obsoleto en el backend
      // y se auto-limpia (al re-loguear se reasigna por upsert; si nadie vuelve,
      // Expo responde DeviceNotRegistered y el backend lo borra).
      tokenRef.current = null;
      setExpoPushToken(null);
    }
  }, [isAuthenticated, isHydrated, enableNotifications]);

  // ── Listeners de notificaciones ─────────────────────────────────────────────
  useEffect(() => {
    // Llegada en primer plano → al store (se ve en la pantalla de notificaciones).
    const receivedSub = Notifications.addNotificationReceivedListener(
      (notification) => {
        addNotification(toStoreNotification(notification));
      },
    );

    // Toque sobre la notificación → navega según el `data` y la registra.
    const responseSub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const notification = response.notification;
        addNotification(toStoreNotification(notification));

        const data = notification.request.content.data as
          | Record<string, unknown>
          | undefined;
        try {
          if (data?.type === 'order' && typeof data.orderId === 'string') {
            router.push(
              `/(tabs)/(dashboard)/perfil/ordenes/${data.orderId}` as never,
            );
          } else {
            router.push('/(tabs)/notificaciones' as never);
          }
        } catch {
          // Si la ruta no existe en este build, no rompemos por la navegación.
        }
      },
    );

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, [addNotification, router]);

  return (
    <PushNotificationContext.Provider
      value={{
        expoPushToken,
        permissionStatus,
        isRegistering,
        enableNotifications,
        disableNotifications,
        sendTestPush,
      }}
    >
      {children}
    </PushNotificationContext.Provider>
  );
};

export function usePushNotifications(): PushNotificationContextValue {
  const ctx = useContext(PushNotificationContext);
  if (!ctx) {
    throw new Error(
      'usePushNotifications debe usarse dentro de PushNotificationProvider',
    );
  }
  return ctx;
}
