import { useQuery } from '@tanstack/react-query';
import { getSettingsRequest, type AppSetting } from '@/requests/settings/settings.requests';

/**
 * Lee un grupo de settings públicos de la tienda (p. ej. 'CONTACT', 'GENERAL') y
 * los expone como un mapa con `get(key, fallback)`. Cambian poco → staleTime alto.
 * Mientras carga, `get` devuelve el fallback, así la UI nunca queda vacía.
 */
export function useStoreSettings(group: string) {
  const { data, isLoading } = useQuery<AppSetting[]>({
    queryKey: ['settings', group],
    queryFn: () => getSettingsRequest(group),
    staleTime: 5 * 60 * 1000,
  });

  const map: Record<string, string> = {};
  for (const s of data ?? []) map[s.metaKey] = s.metaValue;

  const get = (key: string, fallback = '') =>
    map[key] !== undefined && map[key] !== '' ? map[key] : fallback;

  return { get, isLoading };
}
