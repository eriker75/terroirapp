import { api } from '@/config/api';
import type {
  NotificationsResponseDto,
  NotificationResponseDto,
  RegisterPushTokenRequestDto,
  PushTokenDeviceDto,
  SetPushTokenEnabledRequestDto,
  SendTestPushResponseDto,
} from '@/dtos/notifications/notifications.response.dto';

export const getNotificationsRequest = (): Promise<NotificationsResponseDto> =>
  api.get<NotificationsResponseDto>('/notifications').then((r) => r.data);

export const getNotificationByIdRequest = (id: string): Promise<NotificationResponseDto> =>
  api.get<NotificationResponseDto>(`/notifications/${id}`).then((r) => r.data);

export const markNotificationReadRequest = (id: string): Promise<NotificationResponseDto> =>
  api.patch<NotificationResponseDto>(`/notifications/${id}`, { read: true }).then((r) => r.data);

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
