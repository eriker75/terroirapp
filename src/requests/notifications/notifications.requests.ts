import { api } from '@/config/api';
import type {
  InboxResponseDto,
  UnreadCountResponseDto,
  RegisterPushTokenRequestDto,
  PushTokenDeviceDto,
  SetPushTokenEnabledRequestDto,
  SendTestPushResponseDto,
} from '@/dtos/notifications/notifications.response.dto';

// ── Buzón del usuario ─────────────────────────────────────────────────────────
// OJO con las rutas: /notifications (a secas) es el CRUD de campañas del ADMIN.
// El buzón del usuario autenticado vive bajo /notifications/me.

export const getMyNotificationsRequest = (
  { limit = 50, offset = 0 }: { limit?: number; offset?: number } = {},
): Promise<InboxResponseDto> =>
  api
    .get<InboxResponseDto>(`/notifications/me?limit=${limit}&offset=${offset}`)
    .then((r) => r.data);

export const getUnreadCountRequest = (): Promise<UnreadCountResponseDto> =>
  api.get<UnreadCountResponseDto>('/notifications/me/unread-count').then((r) => r.data);

export const markNotificationReadRequest = (recipientId: string): Promise<unknown> =>
  api.patch(`/notifications/me/${recipientId}/read`, {}).then((r) => r.data);

export const markAllNotificationsReadRequest = (): Promise<unknown> =>
  api.post('/notifications/me/read-all', {}).then((r) => r.data);

// ── Tokens push (Expo) ────────────────────────────────────────────────────────
// El backend deriva el usuario del bearer token; aquí solo enviamos el token del
// dispositivo. Ver backend/src/notifications (POST/GET/PATCH/DELETE /notifications/tokens).

export const registerPushTokenRequest = (
  body: RegisterPushTokenRequestDto,
): Promise<unknown> =>
  api.post('/notifications/tokens', body).then((r) => r.data);

export const getPushTokensRequest = (): Promise<PushTokenDeviceDto[]> =>
  api.get<PushTokenDeviceDto[]>('/notifications/tokens').then((r) => r.data);

export const setPushTokenEnabledRequest = (
  body: SetPushTokenEnabledRequestDto,
): Promise<unknown> =>
  api.patch('/notifications/tokens', body).then((r) => r.data);

export const unregisterPushTokenRequest = (token: string): Promise<unknown> =>
  api.delete('/notifications/tokens', { data: { token } }).then((r) => r.data);

export const sendTestPushRequest = (
  body: { title?: string; body?: string } = {},
): Promise<SendTestPushResponseDto> =>
  api.post<SendTestPushResponseDto>('/notifications/test', body).then((r) => r.data);
