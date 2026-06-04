import type { ImageSourcePropType } from 'react-native';
import { COLORS } from '@/constants/colors';
import { resolveProductImageSource } from '@/lib/product-mapper';
import type { BackendOrder, OrderStatus } from '@/types/order.types';

// ── Configuración de estados (UI en español, espejo del flujo del backend) ────
export interface OrderStatusConfig {
  label: string;
  bg: string;
  text: string;
  border: string;
  emoji: string;
  /** Índice en la línea de tiempo PENDING→PREPARING→SENDING→COMPLETED. -1 si cancelado. */
  step: number;
}

export const ORDER_STATUS_CONFIG: Record<OrderStatus, OrderStatusConfig> = {
  PENDING:    { label: 'Por procesar', bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE', emoji: '⏳', step: 0 },
  PREPARING:  { label: 'Preparando',   bg: '#FEF9C3', text: '#854D0E', border: '#FDE68A', emoji: '📦', step: 1 },
  SENDING:    { label: 'En camino',    bg: '#FEF9C3', text: '#854D0E', border: '#FDE68A', emoji: '🚚', step: 2 },
  COMPLETED:  { label: 'Entregado',    bg: '#F0FDF4', text: '#166534', border: '#BBF7D0', emoji: '✅', step: 3 },
  CANCELLED:  { label: 'Cancelado',    bg: COLORS.redLight, text: '#991B1B', border: COLORS.redBorder, emoji: '❌', step: -1 },
};

/** Pasos de la línea de tiempo de seguimiento (excluye CANCELLED). */
export const ORDER_TRACKING_STEPS: { status: OrderStatus; label: string }[] = [
  { status: 'PENDING', label: 'Recibido' },
  { status: 'PREPARING', label: 'Preparando' },
  { status: 'SENDING', label: 'En camino' },
  { status: 'COMPLETED', label: 'Entregado' },
];

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  pago_movil: 'Pago Móvil',
  efectivo: 'Efectivo (USD)',
  puntos: 'Puntos',
  yummy: 'Yummy',
};

export function paymentMethodLabel(method?: string | null): string {
  if (!method) return '—';
  return PAYMENT_METHOD_LABELS[method] ?? method;
}

// ── Vista de UI de una orden ──────────────────────────────────────────────────
export interface OrderItemView {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  image: ImageSourcePropType;
}

export interface OrderView {
  id: string;
  /** Identificador corto para mostrar (#ABCDEF). */
  shortId: string;
  createdAt: string;
  status: OrderStatus;
  statusConfig: OrderStatusConfig;
  itemCount: number;
  items: OrderItemView[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  pointsEarned: number;
  address: {
    label: string;
    recipientName: string;
    phone: string;
    line: string;
  } | null;
  payment: {
    method: string;
    methodLabel: string;
    status: string;
    reference: string | null;
    bank: string | null;
    amountVes: number | null;
    bcvRate: number | null;
  } | null;
}

const num = (v: string | number | null | undefined): number => {
  const n = typeof v === 'string' ? parseFloat(v) : (v ?? 0);
  return Number.isFinite(n) ? n : 0;
};

/** Convierte la orden del backend a una vista lista para renderizar. */
export function mapOrder(o: BackendOrder): OrderView {
  const items: OrderItemView[] = (o.items ?? []).map((it) => {
    const unitPrice = num(it.price);
    return {
      id: it.id,
      productId: it.productId,
      name: it.product?.name ?? 'Producto',
      quantity: it.quantity,
      unitPrice,
      lineTotal: unitPrice * it.quantity,
      image: resolveProductImageSource(it.product?.mainImage, it.product?.images),
    };
  });

  const total = num(o.total);
  const discount = num(o.discount);
  const shipping = num(o.shipping);
  const subtotal = total - shipping + discount; // total = subtotal − discount + shipping

  const addr = o.shippingAddress;
  const address = addr
    ? {
        label: addr.label ?? 'Dirección',
        recipientName: addr.recipientName,
        phone: addr.phone,
        line: [addr.line1, addr.line2, addr.city, addr.state, addr.country]
          .filter(Boolean)
          .join(', '),
      }
    : null;

  const payment = o.payment
    ? {
        method: o.payment.method,
        methodLabel: paymentMethodLabel(o.payment.method),
        status: o.payment.status,
        reference: o.payment.reference,
        bank: o.payment.bank,
        amountVes: o.payment.amountVes != null ? num(o.payment.amountVes) : null,
        bcvRate: o.payment.bcvRate != null ? num(o.payment.bcvRate) : null,
      }
    : null;

  return {
    id: o.id,
    shortId: `#${o.id.slice(-6).toUpperCase()}`,
    createdAt: o.createdAt,
    status: o.status,
    statusConfig: ORDER_STATUS_CONFIG[o.status] ?? ORDER_STATUS_CONFIG.PENDING,
    itemCount: items.reduce((acc, i) => acc + i.quantity, 0),
    items,
    subtotal,
    discount,
    shipping,
    total,
    pointsEarned: o.pointsEarned ?? 0,
    address,
    payment,
  };
}

export function mapOrders(orders: BackendOrder[]): OrderView[] {
  return orders.map(mapOrder);
}
