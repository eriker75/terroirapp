import { useMutation, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { getOrderByIdRequest, createOrderRequest } from '@/requests/orders/orders.requests';
import { QUERY_KEYS } from '@/config/queryKeys';
import type { CreateOrderRequestDto } from '@/dtos/orders/orders.request.dto';
import type { OrderResponseDto } from '@/dtos/orders/orders.response.dto';

export function useOrderQuery(id: string) {
  return useQuery<OrderResponseDto, AxiosError>({
    queryKey: QUERY_KEYS.ORDERS.DETAIL(id),
    queryFn: () => getOrderByIdRequest(id),
    enabled: !!id,
  });
}

export function useCreateOrderMutation() {
  return useMutation<OrderResponseDto, AxiosError, CreateOrderRequestDto>({
    mutationFn: createOrderRequest,
  });
}
