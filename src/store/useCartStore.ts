import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '@/data/products';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

function computeCartState(items: CartItem[]) {
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = items.reduce((acc, item) => {
    const hasDiscount = !!item.product.discount && item.product.discount > 0;
    const finalPrice = hasDiscount
      ? item.product.price * (1 - item.product.discount! / 100)
      : item.product.price;
    return acc + finalPrice * item.quantity;
  }, 0);
  return { items, cartCount, cartTotal };
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      cartCount: 0,
      cartTotal: 0,

      addToCart: (product, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id);
          const newItems = existing
            ? state.items.map((i) =>
                i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
              )
            : [...state.items, { product, quantity }];
          return computeCartState(newItems);
        }),

      removeFromCart: (productId) =>
        set((state) => computeCartState(state.items.filter((i) => i.product.id !== productId))),

      updateQuantity: (productId, quantity) =>
        set((state) => {
          if (quantity <= 0)
            return computeCartState(state.items.filter((i) => i.product.id !== productId));
          return computeCartState(
            state.items.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
          );
        }),

      clearCart: () => set({ items: [], cartCount: 0, cartTotal: 0 }),
    }),
    {
      name: 'terroir-cart',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
