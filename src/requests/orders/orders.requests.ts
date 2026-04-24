import { api } from '@/config/api';
import type { CreateOrderRequestDto } from '@/dtos/orders/orders.request.dto';
import type { OrderResponseDto, OrdersResponseDto } from '@/dtos/orders/orders.response.dto';

export const getOrderByIdRequest = (id: string): Promise<OrderResponseDto> =>
  api.get<OrderResponseDto>(`/orders/${id}`).then((r) => r.data);

export const createOrderRequest = (dto: CreateOrderRequestDto): Promise<OrderResponseDto> =>
  api.post<OrderResponseDto>('/orders', dto).then((r) => r.data);
