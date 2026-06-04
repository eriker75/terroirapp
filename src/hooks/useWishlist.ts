import { useCallback } from 'react';
import { useWishlistStore } from '@/store/useWishlistStore';
import {
  useWishlistQuery,
  useAddWishlistItemMutation,
  useRemoveWishlistItemMutation,
  useReplaceWishlistMutation,
} from '@/services/wishlist/wishlist.service';
import type { Product } from '@/data/products';

const EMPTY_PRODUCTS: Product[] = [];

/**
 * Wishlist con integración al backend. El store local da respuesta instantánea
 * (y persiste como invitado); cada toggle sincroniza con el servidor vía las
 * mutaciones (que actualizan el store y la cache con el snapshot devuelto).
 * `wishlistProducts` son los productos completos mapeados desde la BD, listos
 * para renderizar las ProductCard (página de favoritos).
 */
export function useWishlist() {
  const wishlistIds = useWishlistStore((s) => s.wishlistIds);
  const wishlistCount = useWishlistStore((s) => s.wishlistCount);
  const toggleLocal = useWishlistStore((s) => s.toggleWishlist);
  const clearLocal = useWishlistStore((s) => s.clearWishlist);

  const wishlistQuery = useWishlistQuery();
  const wishlistProducts = wishlistQuery.data?.products ?? EMPTY_PRODUCTS;
  const addMutation = useAddWishlistItemMutation();
  const removeMutation = useRemoveWishlistItemMutation();
  const replaceMutation = useReplaceWishlistMutation();

  const isInWishlist = useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds],
  );

  const toggleWishlist = useCallback(
    (productId: string) => {
      const exists = useWishlistStore.getState().wishlistIds.includes(productId);
      toggleLocal(productId); // optimista
      if (exists) removeMutation.mutate(productId);
      else addMutation.mutate(productId);
    },
    [toggleLocal, addMutation, removeMutation],
  );

  const clearWishlist = useCallback(() => {
    clearLocal();
    replaceMutation.mutate([]);
  }, [clearLocal, replaceMutation]);

  return {
    wishlistIds,
    wishlistCount,
    wishlistProducts,
    isWishlistLoading: wishlistQuery.isLoading,
    isInWishlist,
    toggleWishlist,
    clearWishlist,
  };
}
