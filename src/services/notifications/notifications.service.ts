import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import {
  getMyNotificationsRequest,
  getUnreadCountRequest,
  markNotificationReadRequest,
  markAllNotificationsReadRequest,
} from '@/requests/notifications/notifications.requests';
import { QUERY_KEYS } from '@/config/queryKeys';
import { useAuthStore } from '@/store/useAuthStore';
import type {
  InboxResponseDto,
  UnreadCountResponseDto,
} from '@/dtos/notifications/notifications.response.dto';

/**
 * Buzón de notificaciones del usuario (GET /notifications/me).
 * Fuente de verdad: el SERVIDOR (tabla notification_recipients) — las push en
 * tiempo real son solo el aviso. Solo consulta con sesión iniciada.
 */
export function useMyNotificationsQuery() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery<InboxResponseDto, AxiosError>({
    queryKey: QUERY_KEYS.NOTIFICATIONS.LIST(),
    queryFn: () => getMyNotificationsRequest({ limit: 50 }),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}

/** Nº de no leídas (badge del header). */
export function useUnreadCountQuery() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery<UnreadCountResponseDto, AxiosError>({
    queryKey: QUERY_KEYS.NOTIFICATIONS.UNREAD(),
    queryFn: getUnreadCountRequest,
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}

function useInvalidateInbox() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS.LIST() });
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS.UNREAD() });
  };
}

export function useMarkNotificationReadMutation() {
  const invalidate = useInvalidateInbox();
  return useMutation<unknown, AxiosError, string>({
    mutationFn: markNotificationReadRequest, // recipientId
    onSuccess: invalidate,
  });
}

export function useMarkAllNotificationsReadMutation() {
  const invalidate = useInvalidateInbox();
  return useMutation<unknown, AxiosError, void>({
    mutationFn: () => markAllNotificationsReadRequest(),
    onSuccess: invalidate,
  });
}
