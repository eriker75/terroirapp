import type { Product } from '@/types/product.types';

export interface WishlistItem {
  id: string;
  wishlistId: string;
  productId: string;
  product: Product;
}

export interface Wishlist {
  id: string;
  userId: string;
  items: WishlistItem[];
  createdAt: string;
  updatedAt: string;
}
