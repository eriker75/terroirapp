import { api } from '@/config/api';
import type { CreateCheckoutRequestDto } from '@/dtos/orders/orders.request.dto';
import type { BackendOrder } from '@/types/order.types';

// Checkout: el servidor calcula precios y total a partir de { productId, quantity },
// registra al comprador como customer (lo crea por email si no existe) y crea la
// orden en estado PENDING. Devuelve la orden (con `auth` solo si el comprador era
// invitado sin contraseña — en la app el usuario ya viene autenticado).
export const createCheckoutRequest = (dto: CreateCheckoutRequestDto): Promise<BackendOrder> =>
  api.post<BackendOrder>('/checkout', dto).then((r) => r.data);

// Pedidos del cliente autenticado (más recientes primero).
export const getMyOrdersRequest = (): Promise<BackendOrder[]> =>
  api.get<BackendOrder[]>('/orders/me').then((r) => r.data);

// Un pedido por id (la pertenencia la valida el backend).
export const getOrderByIdRequest = (id: string): Promise<BackendOrder> =>
  api.get<BackendOrder>(`/orders/${id}`).then((r) => r.data);
