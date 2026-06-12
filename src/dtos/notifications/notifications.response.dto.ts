// ── Buzón del usuario (GET /notifications/me) ────────────────────────────────
// Cada entrada es un `notification_recipient`: la copia personal de una campaña
// enviada desde el admin. Es la fuente de verdad del histórico (las push en
// tiempo real son solo el aviso; el buzón vive en el servidor).

export interface InboxEntryDto {
  id: string; // id del recipient (este es el que se marca como leído)
  notificationId: string;
  title: string;
  body: string;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface InboxResponseDto {
  data: InboxEntryDto[];
  total: number;
  unread: number;
  limit: number;
  offset: number;
}

export interface UnreadCountResponseDto {
  unread: number;
}

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
