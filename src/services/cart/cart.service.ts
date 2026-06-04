import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import {
  getCartRequest,
  replaceCartRequest,
  clearCartRequest,
} from '@/requests/cart/cart.requests';
import { useProfileStore } from '@/store/useProfileStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore, type CartItem } from '@/store/useCartStore';
import { QUERY_KEYS } from '@/config/queryKeys';

/**
 * Trae el carrito del servidor y lo fusiona con el local (invitado). El store
 * local sigue siendo la fuente de verdad de la UI; esta query lo mantiene en
 * sync al autenticarse.
 *
 * En el login persiste además la unión fusionada de vuelta al servidor, para que
 * lo agregado como invitado no se pierda (el merge solo no lo escribiría si el
 * carrito del servidor estaba vacío). Regla de merge: mismo producto → gana la
 * mayor cantidad. Corre una vez por sesión (staleTime Infinity) para no
 * "resucitar" un ítem recién eliminado antes de que el sync con debounce llegue.
 */
export function useCartQuery() {
  const userId = useProfileStore((s) => s.user?.id);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();

  return useQuery<CartItem[], AxiosError>({
    queryKey: QUERY_KEYS.CART.USER(userId ?? ''),
    queryFn: async () => {
      const remote = await getCartRequest(userId!);
      useCartStore.getState().mergeServerCart(remote);
      const merged = useCartStore.getState().items;
      const persisted = await replaceCartRequest(userId!, merged);
      queryClient.setQueryData(QUERY_KEYS.CART.USER(userId!), persisted);
      return persisted;
    },
    enabled: isAuthenticated && !!userId,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}

/** Empuja el carrito local al backend (reemplazo idempotente). */
export function useSyncCartMutation() {
  const queryClient = useQueryClient();
  const userId = useProfileStore((s) => s.user?.id ?? '');

  return useMutation<CartItem[], AxiosError, CartItem[]>({
    mutationFn: (items) => replaceCartRequest(userId, items),
    onSuccess: (data) => queryClient.setQueryData(QUERY_KEYS.CART.USER(userId), data),
  });
}

export function useClearServerCartMutation() {
  const queryClient = useQueryClient();
  const userId = useProfileStore((s) => s.user?.id ?? '');

  return useMutation<void, AxiosError, void>({
    mutationFn: () => clearCartRequest(userId),
    onSuccess: () => queryClient.setQueryData(QUERY_KEYS.CART.USER(userId), []),
  });
}
