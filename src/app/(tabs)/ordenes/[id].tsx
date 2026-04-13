import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Package, Star } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '@/src/constants/colors';

type OrderStatus = 'Entregado' | 'En camino' | 'Procesando' | 'Cancelado';

const ordersData: Record<string, {
  orderId: string;
  date: string;
  status: OrderStatus;
  items: { id: number; name: string; emoji: string; price: number; qty: number }[];
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  address: string;
  trackingCode: string;
}> = {
  '1': {
    orderId: '#576404',
    date: '20 Mar 2024 · 6:35 PM',
    status: 'Entregado',
    items: [
      { id: 1, name: 'Espresso Obsidian', emoji: '☕', price: 5.00, qty: 2 },
      { id: 2, name: 'Caramel Latte', emoji: '🥛', price: 5.25, qty: 1 },
    ],
    subtotal: 15.25, discount: -1.50, tax: 1.53, shipping: 3.00, total: 18.28,
    address: '4140 Parker Rd., Allentown, NM 31134',
    trackingCode: 'TRR-A8234-K',
  },
  '2': {
    orderId: '#741235',
    date: '19 Mar 2024 · 2:10 PM',
    status: 'En camino',
    items: [
      { id: 1, name: 'Café Kenia AA', emoji: '🌿', price: 18.00, qty: 1 },
      { id: 2, name: 'Cold Brew Etiopía', emoji: '❄️', price: 6.00, qty: 2 },
    ],
    subtotal: 30.00, discount: -3.00, tax: 2.70, shipping: 0, total: 29.70,
    address: '2464 Royal Ln., Mesa, AZ 45463',
    trackingCode: 'TRR-B5512-M',
  },
  '3': {
    orderId: '#545455',
    date: '15 Mar 2024 · 11:00 AM',
    status: 'Procesando',
    items: [
      { id: 1, name: 'Prensa Francesa', emoji: '🫖', price: 32.99, qty: 1 },
    ],
    subtotal: 32.99, discount: 0, tax: 3.30, shipping: 5.00, total: 41.29,
    address: '4140 Parker Rd., Allentown, NM 31134',
    trackingCode: 'TRR-C9901-J',
  },
  '4': {
    orderId: '#312890',
    date: '8 Mar 2024 · 9:45 AM',
    status: 'Cancelado',
    items: [
      { id: 1, name: 'Café Colombia Supremo', emoji: '🌱', price: 16.00, qty: 2 },
      { id: 2, name: 'Filtro Premium', emoji: '🔧', price: 24.99, qty: 1 },
    ],
    subtotal: 56.99, discount: -5.00, tax: 5.20, shipping: 3.00, total: 60.19,
    address: '4140 Parker Rd., Allentown, NM 31134',
    trackingCode: 'TRR-D3342-P',
  },
};

const STATUS_CONFIG: Record<OrderStatus, { bg: string; text: string; border: string; emoji: string }> = {
  Entregado: { bg: '#F0FDF4', text: '#166534', border: '#BBF7D0', emoji: '✅' },
  'En camino': { bg: '#FEF9C3', text: '#854D0E', border: '#FDE68A', emoji: '🚚' },
  Procesando: { bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE', emoji: '⏳' },
  Cancelado: { bg: COLORS.redLight, text: '#991B1B', border: COLORS.redBorder, emoji: '❌' },
};

export default function OrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const order = ordersData[id ?? ''];

  if (!order) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={COLORS.darkBrown} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pedido no encontrado</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>No se encontró el pedido</Text>
        </View>
      </SafeAreaView>
    );
  }

  const cfg = STATUS_CONFIG[order.status];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.darkBrown} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalles del Pedido</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Status card */}
        <View style={[styles.statusCard, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
          <Text style={styles.statusEmoji}>{cfg.emoji}</Text>
          <View style={styles.statusInfo}>
            <Text style={styles.orderId}>{order.orderId}</Text>
            <Text style={styles.orderDate}>{order.date}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
            <Text style={[styles.statusBadgeText, { color: cfg.text }]}>{order.status}</Text>
          </View>
        </View>

        {/* Tracking code */}
        {order.status !== 'Cancelado' && (
          <View style={styles.trackingCard}>
            <Package size={18} color={COLORS.brown} />
            <View style={styles.trackingInfo}>
              <Text style={styles.trackingLabel}>Código de seguimiento</Text>
              <Text style={styles.trackingCode}>{order.trackingCode}</Text>
            </View>
            {order.status === 'En camino' && (
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>En ruta</Text>
              </View>
            )}
          </View>
        )}

        {/* Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Productos ordenados</Text>
          {order.items.map((item, index) => (
            <View
              key={item.id}
              style={[styles.itemRow, index < order.items.length - 1 && styles.itemBorder]}
            >
              <View style={styles.itemImageBox}>
                <Text style={styles.itemEmoji}>{item.emoji}</Text>
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQty}>Cantidad: {item.qty}</Text>
              </View>
              <Text style={styles.itemPrice}>${(item.price * item.qty).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Payment summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Resumen de pago</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${order.subtotal.toFixed(2)}</Text>
          </View>
          {order.discount !== 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Descuento</Text>
              <Text style={[styles.summaryValue, { color: COLORS.green }]}>
                -${Math.abs(order.discount).toFixed(2)}
              </Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Impuesto</Text>
            <Text style={styles.summaryValue}>+${order.tax.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryRowBorder]}>
            <Text style={styles.summaryLabel}>Envío</Text>
            <Text style={styles.summaryValue}>
              {order.shipping === 0 ? 'Gratis' : `+$${order.shipping.toFixed(2)}`}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${order.total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Shipping address */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dirección de entrega</Text>
          <View style={styles.addressRow}>
            <MapPin size={18} color={COLORS.accent} />
            <Text style={styles.addressText}>{order.address}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          {order.status === 'En camino' && (
            <TouchableOpacity style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>Rastrear pedido</Text>
            </TouchableOpacity>
          )}
          {order.status === 'Entregado' && (
            <>
              <TouchableOpacity style={styles.primaryBtn}>
                <Star size={16} color={COLORS.darkBrown} />
                <Text style={styles.primaryBtnText}>Calificar pedido</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.outlineBtn}>
                <Text style={styles.outlineBtnText}>Volver a pedir</Text>
              </TouchableOpacity>
            </>
          )}
          {order.status === 'Cancelado' && (
            <View style={styles.cancelledNote}>
              <Text style={styles.cancelledText}>
                Este pedido fue cancelado. Si tienes preguntas, contáctanos.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.lightBeige },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.darkBrown },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontSize: 16, color: COLORS.muted },
  content: { padding: 16, gap: 14, paddingBottom: 32 },
  statusCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 16, borderRadius: 14, borderWidth: 1,
  },
  statusEmoji: { fontSize: 28 },
  statusInfo: { flex: 1 },
  orderId: { fontSize: 18, fontWeight: '700', color: COLORS.darkBrown },
  orderDate: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  statusBadge: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusBadgeText: { fontSize: 12, fontWeight: '700' },
  trackingCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.white, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border, padding: 14,
  },
  trackingInfo: { flex: 1 },
  trackingLabel: { fontSize: 11, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.4 },
  trackingCode: { fontSize: 15, fontWeight: '700', color: COLORS.darkBrown, fontFamily: 'monospace', marginTop: 2 },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.green },
  liveText: { fontSize: 12, color: COLORS.green, fontWeight: '600' },
  card: {
    backgroundColor: COLORS.white, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.border, padding: 16, gap: 12,
  },
  cardTitle: {
    fontSize: 12, fontWeight: '700', color: COLORS.darkBrown + '70',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4,
  },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 12 },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  itemImageBox: {
    width: 52, height: 52, borderRadius: 10,
    backgroundColor: COLORS.lightBeige, alignItems: 'center', justifyContent: 'center',
  },
  itemEmoji: { fontSize: 24 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '600', color: COLORS.darkBrown },
  itemQty: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: '700', color: COLORS.accent },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryRowBorder: {
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
    paddingBottom: 10, marginBottom: 2,
  },
  summaryLabel: { fontSize: 14, color: COLORS.muted },
  summaryValue: { fontSize: 14, color: COLORS.darkBrown, fontWeight: '500' },
  totalLabel: { fontSize: 17, fontWeight: '700', color: COLORS.darkBrown },
  totalValue: { fontSize: 20, fontWeight: '700', color: COLORS.accent },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  addressText: { flex: 1, fontSize: 14, color: COLORS.darkBrown, lineHeight: 20 },
  actionsContainer: { gap: 10 },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: COLORS.accent, paddingVertical: 14, borderRadius: 12,
  },
  primaryBtnText: { color: COLORS.darkBrown, fontSize: 15, fontWeight: '700' },
  outlineBtn: {
    borderWidth: 1, borderColor: COLORS.border,
    paddingVertical: 13, borderRadius: 12, alignItems: 'center',
  },
  outlineBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.darkBrown },
  cancelledNote: {
    backgroundColor: COLORS.redLight, borderWidth: 1,
    borderColor: COLORS.redBorder, borderRadius: 10, padding: 14,
  },
  cancelledText: { fontSize: 13, color: '#991B1B', lineHeight: 18, textAlign: 'center' },
});
