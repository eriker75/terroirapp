import { api } from '@/config/api';

// Settings públicos de la tienda (clave/valor agrupados). Mismo shape que el
// backend `GET /settings(?group=)`. Públicos: no requieren auth.
export interface AppSetting {
  metaKey: string;
  metaValue: string;
  metaGroup: string | null;
}

// GET /api/settings(?group=) — lista de settings, opcionalmente filtrada por grupo.
export const getSettingsRequest = (group?: string): Promise<AppSetting[]> =>
  api
    .get<AppSetting[]>('/settings', { params: group ? { group } : undefined })
    .then((r) => r.data);
