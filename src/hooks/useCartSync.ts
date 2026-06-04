import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useCartQuery, useSyncCartMutation } from '@/services/cart/cart.service';

const SYNC_DEBOUNCE_MS = 600;

/**
 * Mantiene el carrito del backend en sync con el store local:
 * - Al montar (autenticado), `useCartQuery` trae el carrito del servidor, lo
 *   fusiona con el local y persiste la unión.
 * - En cada cambio del store, empuja el carrito al backend con debounce. Se
 *   activa solo tras el merge inicial (cartQuery.isSuccess) para no pisar el
 *   carrito del servidor con el local vacío previo al merge. El push es
 *   idempotente (reemplazo total).
 *
 * Pensado para montarse una sola vez (layout de tabs).
 */
export function useCartSync() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const items = useCartStore((s) => s.items);

  const cartQuery = useCartQuery();
  const syncMutation = useSyncCartMutation();

  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    if (!isAuthenticated || !cartQuery.isSuccess) return;
    const t = setTimeout(() => {
      syncMutation.mutate(itemsRef.current);
    }, SYNC_DEBOUNCE_MS);
    return () => clearTimeout(t);
    // syncMutation es estable; depende de los ítems y de que el merge haya corrido.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, isAuthenticated, cartQuery.isSuccess]);
}
