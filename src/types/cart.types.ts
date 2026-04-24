import type { Product } from '@/types/product.types';
import type { Coupon } from '@/types/coupon.types';

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  id: string;
  userId: string;
  couponId?: string;
  coupon?: Coupon;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}
