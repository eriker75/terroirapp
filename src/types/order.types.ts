import type { Product } from '@/types/product.types';

export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Order {
  id: string;
  userId: string;
  couponId?: string;
  discount: number;
  total: number;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
}
