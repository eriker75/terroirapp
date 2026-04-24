import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import {
  getNotificationsRequest,
  getNotificationByIdRequest,
  markNotificationReadRequest,
} from '@/requests/notifications/notifications.requests';
import { QUERY_KEYS } from '@/config/queryKeys';
import type { NotificationsResponseDto, NotificationResponseDto } from '@/dtos/notifications/notifications.response.dto';

export function useNotificationsQuery() {
  return useQuery<NotificationsResponseDto, AxiosError>({
    queryKey: QUERY_KEYS.NOTIFICATIONS.LIST(),
    queryFn: getNotificationsRequest,
  });
}

export function useNotificationQuery(id: string) {
  return useQuery<NotificationResponseDto, AxiosError>({
    queryKey: QUERY_KEYS.NOTIFICATIONS.DETAIL(id),
    queryFn: () => getNotificationByIdRequest(id),
    enabled: !!id,
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation<NotificationResponseDto, AxiosError, string>({
    mutationFn: markNotificationReadRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS.LIST() }),
  });
}
