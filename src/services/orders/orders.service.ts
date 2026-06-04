import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import {
  createCheckoutRequest,
  getMyOrdersRequest,
  getOrderByIdRequest,
} from '@/requests/orders/orders.requests';
import { QUERY_KEYS } from '@/config/queryKeys';
import type { CreateCheckoutRequestDto } from '@/dtos/orders/orders.request.dto';
import type { BackendOrder } from '@/types/order.types';

// GET /api/orders/me — pedidos del cliente autenticado (más recientes primero).
export function useMyOrdersQuery() {
  return useQuery<BackendOrder[], AxiosError>({
    queryKey: QUERY_KEYS.ORDERS.ME(),
    queryFn: getMyOrdersRequest,
  });
}

// GET /api/orders/:id — la pertenencia la valida el backend.
export function useOrderQuery(id: string) {
  return useQuery<BackendOrder, AxiosError>({
    queryKey: QUERY_KEYS.ORDERS.DETAIL(id),
    queryFn: () => getOrderByIdRequest(id),
    enabled: !!id,
  });
}

// POST /api/checkout — crea la orden en BD. Invalida la lista para que aparezca
// al volver a "Mis pedidos".
export function useCheckoutMutation() {
  const queryClient = useQueryClient();

  return useMutation<BackendOrder, AxiosError, CreateCheckoutRequestDto>({
    mutationFn: createCheckoutRequest,
    onSuccess: (order) => {
      queryClient.setQueryData(QUERY_KEYS.ORDERS.DETAIL(order.id), order);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS.ME() });
    },
  });
}
