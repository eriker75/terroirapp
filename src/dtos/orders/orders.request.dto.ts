import type { OrderStatus } from '@/types/order.types';

export interface CreateOrderItemDto {
  productId: string;
  quantity: number;
  price: number;
}

export interface CreateOrderRequestDto {
  userId: string;
  total: number;
  items: CreateOrderItemDto[];
  couponId?: string;
  discount?: number;
  status?: OrderStatus;
}
