import { api } from '@/config/api';
import { mapApiProductToCard, type BackendProduct } from '@/lib/product-mapper';
import type { CartItem } from '@/store/useCartStore';

// El carrito persistente en BD existe para usuarios autenticados. El store local
// (AsyncStorage) es la fuente de verdad de la UI; estas requests lo sincronizan
// con el backend (traer al login, reemplazar en cada cambio, vaciar).

interface BackendCartItem {
  id: string;
  productId: string;
  quantity: number;
  product: BackendProduct;
}

interface BackendCart {
  id: string;
  userId: string;
  couponId: string | null;
  items: BackendCartItem[];
}

function mapCartItems(cart: BackendCart): CartItem[] {
  return (cart.items ?? []).map((it) => ({
    product: mapApiProductToCard(it.product),
    quantity: it.quantity,
  }));
}

/**
 * Consolida líneas por producto sumando cantidades. Evita violar el unique
 * (cartId, productId) del backend al reemplazar todos los ítems.
 */
function consolidate(items: CartItem[]): Array<{ productId: string; quantity: number }> {
  const byId = new Map<string, number>();
  for (const i of items) {
    if (i.quantity > 0) {
      byId.set(i.product.id, (byId.get(i.product.id) ?? 0) + i.quantity);
    }
  }
  return [...byId.entries()].map(([productId, quantity]) => ({ productId, quantity }));
}

const base = (userId: string) => `/cart/user/${userId}`;

export const getCartRequest = (userId: string): Promise<CartItem[]> =>
  api.get<BackendCart>(base(userId)).then((r) => mapCartItems(r.data));

export const replaceCartRequest = (userId: string, items: CartItem[]): Promise<CartItem[]> =>
  api
    .patch<BackendCart>(`${base(userId)}/items`, { items: consolidate(items) })
    .then((r) => mapCartItems(r.data));

export const clearCartRequest = (userId: string): Promise<void> =>
  api.delete(`${base(userId)}/items`).then(() => undefined);
