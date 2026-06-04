import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import {
  getUserSettingsRequest,
  upsertUserSettingsRequest,
  type UserSetting,
  type UpsertUserSettingItem,
} from '@/requests/user-settings/user-settings.requests';
import { useProfileStore } from '@/store/useProfileStore';
import { useAuthStore } from '@/store/useAuthStore';
import { QUERY_KEYS } from '@/config/queryKeys';

// Settings de notificaciones: mismo group key, distintas keys.
export const NOTIFICATIONS_GROUP = 'notifications';
export const NOTIF_KEYS = {
  push: 'notif_push',
  email: 'notif_email',
} as const;

export function useNotificationSettingsQuery() {
  const userId = useProfileStore((s) => s.user?.id);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery<UserSetting[], AxiosError>({
    queryKey: QUERY_KEYS.USER_SETTINGS.GROUP(userId ?? '', NOTIFICATIONS_GROUP),
    queryFn: () => getUserSettingsRequest(userId!, NOTIFICATIONS_GROUP),
    enabled: isAuthenticated && !!userId,
  });
}

export function useUpsertNotificationSettingsMutation() {
  const queryClient = useQueryClient();
  const userId = useProfileStore((s) => s.user?.id ?? '');

  return useMutation<UserSetting[], AxiosError, UpsertUserSettingItem[]>({
    mutationFn: (settings) => upsertUserSettingsRequest(userId, settings),
    onSuccess: (all) => {
      // El endpoint devuelve todos los settings; cacheamos solo los del grupo.
      queryClient.setQueryData(
        QUERY_KEYS.USER_SETTINGS.GROUP(userId, NOTIFICATIONS_GROUP),
        all.filter((s) => s.metaGroup === NOTIFICATIONS_GROUP),
      );
    },
  });
}
