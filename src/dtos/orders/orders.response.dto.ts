import type { Order } from '@/types/order.types';
import type { PaginatedResponse } from '@/types/api.types';

export type OrderResponseDto = Order;
export type OrdersResponseDto = PaginatedResponse<Order>;
