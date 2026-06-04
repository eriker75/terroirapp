import { useCartSync } from '@/hooks/useCartSync';
import { useWishlistQuery } from '@/services/wishlist/wishlist.service';

/**
 * Mantiene carrito y wishlist sincronizados con el backend mientras hay sesión.
 * Se monta una sola vez (layout de tabs): dispara el merge-on-login de ambos y
 * el push del carrito con debounce. La wishlist usa la misma query que el hook
 * `useWishlist` de las pantallas (React Query deduplica por key).
 */
export function useStoreSync() {
  useCartSync();
  useWishlistQuery();
}
