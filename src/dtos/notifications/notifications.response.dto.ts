import type { Notification } from '@/types/notification.types';

export type NotificationResponseDto = Notification;
export type NotificationsResponseDto = Notification[];

// ── Tokens push (Expo) ────────────────────────────────────────────────────────

export interface RegisterPushTokenRequestDto {
  // Token completo de Expo: "ExponentPushToken[...]" (NO el valor interno).
  token: string;
  platform?: 'ios' | 'android' | 'web';
  deviceName?: string;
  enabled?: boolean;
}

// Dispositivo registrado (lo que devuelve GET /notifications/tokens).
export interface PushTokenDeviceDto {
  id: string;
  platform: string | null;
  deviceName: string | null;
  enabled: boolean;
  lastUsedAt: string;
  createdAt: string;
}

export interface SetPushTokenEnabledRequestDto {
  token: string;
  enabled: boolean;
}

// Resultado de POST /notifications/test.
export interface SendTestPushResponseDto {
  devices: number;
  sent: number;
  invalidTokens: string[];
  skippedTokens: string[];
}
