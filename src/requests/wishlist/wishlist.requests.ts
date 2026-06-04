import { api } from '@/config/api';
import { mapApiProductsToCards, type BackendProduct } from '@/lib/product-mapper';
import type { Product } from '@/data/products';

// La wishlist persistente en BD existe para usuarios autenticados. Devolvemos un
// "snapshot" con los ids (para el store de Zustand) y los productos completos
// (mapeados desde la BD) para renderizar las ProductCard sin datos estáticos.

interface BackendWishlistItem {
  id: string;
  productId: string;
  product: BackendProduct;
}

interface BackendWishlist {
  id: string;
  userId: string;
  items: BackendWishlistItem[];
}

export interface WishlistSnapshot {
  ids: string[];
  products: Product[];
}

function mapWishlist(w: BackendWishlist): WishlistSnapshot {
  const items = w.items ?? [];
  return {
    ids: items.map((i) => i.productId),
    products: mapApiProductsToCards(items.map((i) => i.product)),
  };
}

const base = (userId: string) => `/wishlist/user/${userId}`;

export const getWishlistRequest = (userId: string): Promise<WishlistSnapshot> =>
  api.get<BackendWishlist>(base(userId)).then((r) => mapWishlist(r.data));

export const addWishlistItemRequest = (
  userId: string,
  productId: string,
): Promise<WishlistSnapshot> =>
  api.post<BackendWishlist>(`${base(userId)}/items`, { productId }).then((r) => mapWishlist(r.data));

export const removeWishlistItemRequest = (
  userId: string,
  productId: string,
): Promise<WishlistSnapshot> =>
  api.delete<BackendWishlist>(`${base(userId)}/items/${productId}`).then((r) => mapWishlist(r.data));

export const replaceWishlistRequest = (
  userId: string,
  productIds: string[],
): Promise<WishlistSnapshot> =>
  api
    .patch<BackendWishlist>(`${base(userId)}/items`, { productIds })
    .then((r) => mapWishlist(r.data));
