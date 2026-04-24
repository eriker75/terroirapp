import { create } from 'zustand';

interface WishlistStore {
  wishlistIds: string[];
  wishlistCount: number;
  toggleWishlist: (productId: string) => void;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>((set) => ({
  wishlistIds: [],
  wishlistCount: 0,
  toggleWishlist: (productId) =>
    set((state) => {
      const exists = state.wishlistIds.includes(productId);
      const newIds = exists
        ? state.wishlistIds.filter((id) => id !== productId)
        : [...state.wishlistIds, productId];
      return { wishlistIds: newIds, wishlistCount: newIds.length };
    }),
  clearWishlist: () => set({ wishlistIds: [], wishlistCount: 0 }),
}));
