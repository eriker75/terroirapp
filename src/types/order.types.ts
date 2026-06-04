// Estados reales del backend (Prisma OrderStatus).
export type OrderStatus = 'PENDING' | 'PREPARING' | 'SENDING' | 'COMPLETED' | 'CANCELLED';

// ── Shapes del backend (Order serializado por Prisma) ────────────────────────
// Los Decimal de Prisma serializan como STRING en JSON; convertir con Number()
// antes de mostrar/operar.

export interface BackendOrderUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface BackendOrderShippingAddress {
  id: string;
  label: string | null;
  recipientName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
}

export interface BackendOrderPayment {
  id: string;
  method: string;
  status: string;
  amount: string;
  currency: string;
  reference: string | null;
  payerIdDocument: string | null;
  payerName: string | null;
  payerPhone: string | null;
  bank: string | null;
  bcvRate: string | null;
  amountVes: string | null;
  confirmedAt: string | null;
}

export interface BackendOrderProduct {
  id: string;
  name: string;
  mainImage: string | null;
  price: string;
  images: string[];
}

export interface BackendOrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: string;
  product: BackendOrderProduct;
}

export interface BackendOrder {
  id: string;
  userId: string;
  user?: BackendOrderUser;
  shippingAddressId: string | null;
  shippingAddress: BackendOrderShippingAddress | null;
  couponId: string | null;
  discount: string;
  total: string;
  shipping?: string;
  notes: string | null;
  pointsEarned?: number | null;
  status: OrderStatus;
  payment: BackendOrderPayment | null;
  items: BackendOrderItem[];
  createdAt: string;
  completedAt?: string | null;
}
