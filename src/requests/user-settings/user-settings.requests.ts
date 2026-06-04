import { api } from '@/config/api';

export interface UserSetting {
  metaKey: string;
  metaValue: string;
  metaGroup: string | null;
}

export interface UpsertUserSettingItem {
  metaKey: string;
  metaValue: string;
  metaGroup?: string;
}

// GET /api/users/:id/settings(?group=) — settings del propio usuario.
export const getUserSettingsRequest = (userId: string, group?: string): Promise<UserSetting[]> =>
  api
    .get<UserSetting[]>(`/users/${userId}/settings`, { params: group ? { group } : undefined })
    .then((r) => r.data);

// PATCH /api/users/:id/settings — upsert por metaKey. Devuelve todos los settings.
export const upsertUserSettingsRequest = (
  userId: string,
  settings: UpsertUserSettingItem[],
): Promise<UserSetting[]> =>
  api.patch<UserSetting[]>(`/users/${userId}/settings`, { settings }).then((r) => r.data);
