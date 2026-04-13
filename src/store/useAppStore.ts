import { create } from 'zustand';

interface AppStore {
  cartCount: number;
  wishlistCount: number;
  addToCart: () => void;
  removeFromCart: () => void;
  setCartCount: (n: number) => void;
  addToWishlist: () => void;
  removeFromWishlist: () => void;
  setWishlistCount: (n: number) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  cartCount: 3, // demo initial value
  wishlistCount: 5, // demo initial value

  addToCart: () => set((s) => ({ cartCount: s.cartCount + 1 })),
  removeFromCart: () => set((s) => ({ cartCount: Math.max(0, s.cartCount - 1) })),
  setCartCount: (n) => set({ cartCount: n }),

  addToWishlist: () => set((s) => ({ wishlistCount: s.wishlistCount + 1 })),
  removeFromWishlist: () => set((s) => ({ wishlistCount: Math.max(0, s.wishlistCount - 1) })),
  setWishlistCount: (n) => set({ wishlistCount: n }),
}));
