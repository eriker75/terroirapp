import { api } from '@/config/api';
import type { NotificationsResponseDto, NotificationResponseDto } from '@/dtos/notifications/notifications.response.dto';

export const getNotificationsRequest = (): Promise<NotificationsResponseDto> =>
  api.get<NotificationsResponseDto>('/notifications').then((r) => r.data);

export const getNotificationByIdRequest = (id: string): Promise<NotificationResponseDto> =>
  api.get<NotificationResponseDto>(`/notifications/${id}`).then((r) => r.data);

export const markNotificationReadRequest = (id: string): Promise<NotificationResponseDto> =>
  api.patch<NotificationResponseDto>(`/notifications/${id}`, { read: true }).then((r) => r.data);
