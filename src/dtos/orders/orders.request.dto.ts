// Payload del checkout público (`POST /api/checkout`). El cliente envía
// identidad/envío + { productId, quantity } (+ datos de pago opcionales). El
// servidor calcula precios y total y crea el pedido en estado PENDING.
export interface CreateCheckoutItemDto {
  productId: string;
  quantity: number;
}

export interface CreateCheckoutRequestDto {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  addressLabel?: string;
  latitude?: number;
  longitude?: number;
  paymentMethod: 'pago_movil' | 'efectivo' | 'puntos' | 'yummy';
  // Pago móvil
  bankCode?: string;
  paymentReference?: string;
  payerIdDocument?: string;
  payerName?: string;
  payerPhone?: string;
  couponId?: string;
  notes?: string;
  items: CreateCheckoutItemDto[];
}
