import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import {
  getWishlistRequest,
  addWishlistItemRequest,
  removeWishlistItemRequest,
  replaceWishlistRequest,
  type WishlistSnapshot,
} from '@/requests/wishlist/wishlist.requests';
import { useProfileStore } from '@/store/useProfileStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { QUERY_KEYS } from '@/config/queryKeys';

function setStoreIds(ids: string[]) {
  useWishlistStore.setState({ wishlistIds: ids, wishlistCount: ids.length });
}

/**
 * Trae la wishlist del servidor y la fusiona con la local (invitado): la unión
 * de ids. Si el local aportó ids nuevos, persiste la unión en BD para no perder
 * lo agregado antes de autenticarse. Sincroniza el store y devuelve el snapshot
 * (ids + productos completos) para renderizar las ProductCard. Corre una vez por
 * sesión (no resucita ids borrados en cada focus).
 */
export function useWishlistQuery() {
  const userId = useProfileStore((s) => s.user?.id);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery<WishlistSnapshot, AxiosError>({
    queryKey: QUERY_KEYS.WISHLIST.USER(userId ?? ''),
    queryFn: async () => {
      const local = useWishlistStore.getState().wishlistIds;
      const remote = await getWishlistRequest(userId!);
      const union = Array.from(new Set([...remote.ids, ...local]));

      let snapshot = remote;
      if (union.length !== remote.ids.length) {
        snapshot = await replaceWishlistRequest(userId!, union);
      }
      setStoreIds(snapshot.ids);
      return snapshot;
    },
    enabled: isAuthenticated && !!userId,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}

export function useAddWishlistItemMutation() {
  const queryClient = useQueryClient();
  const userId = useProfileStore((s) => s.user?.id ?? '');

  return useMutation<WishlistSnapshot, AxiosError, string>({
    mutationFn: (productId) => addWishlistItemRequest(userId, productId),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.WISHLIST.USER(userId), data);
      setStoreIds(data.ids);
    },
  });
}

export function useRemoveWishlistItemMutation() {
  const queryClient = useQueryClient();
  const userId = useProfileStore((s) => s.user?.id ?? '');

  return useMutation<WishlistSnapshot, AxiosError, string>({
    mutationFn: (productId) => removeWishlistItemRequest(userId, productId),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.WISHLIST.USER(userId), data);
      setStoreIds(data.ids);
    },
  });
}

export function useReplaceWishlistMutation() {
  const queryClient = useQueryClient();
  const userId = useProfileStore((s) => s.user?.id ?? '');

  return useMutation<WishlistSnapshot, AxiosError, string[]>({
    mutationFn: (ids) => replaceWishlistRequest(userId, ids),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.WISHLIST.USER(userId), data);
      setStoreIds(data.ids);
    },
  });
}
