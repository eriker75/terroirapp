import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, ShoppingBag } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/src/constants/colors';

type OrderStatus = 'Entregado' | 'En camino' | 'Procesando' | 'Cancelado';

interface Order {
  id: string;
  orderId: string;
  date: string;
  status: OrderStatus;
  total: string;
  items: number;
  emoji: string;
}

const orders: Order[] = [
  { id: '1', orderId: '#576404', date: '20 Mar 2024', status: 'Entregado', total: '$89.00', items: 3, emoji: '☕' },
  { id: '2', orderId: '#741235', date: '19 Mar 2024', status: 'En camino', total: '$45.50', items: 2, emoji: '📦' },
  { id: '3', orderId: '#545455', date: '15 Mar 2024', status: 'Procesando', total: '$32.75', items: 1, emoji: '🔄' },
  { id: '4', orderId: '#312890', date: '8 Mar 2024', status: 'Cancelado', total: '$120.00', items: 4, emoji: '❌' },
  { id: '5', orderId: '#198743', date: '1 Mar 2024', status: 'Entregado', total: '$27.25', items: 1, emoji: '☕' },
];

const statusConfig: Record<OrderStatus, { bg: string; text: string; border: string }> = {
  Entregado: { bg: '#F0FDF4', text: '#166534', border: '#BBF7D0' },
  'En camino': { bg: '#FEF9C3', text: '#854D0E', border: '#FDE68A' },
  Procesando: { bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE' },
  Cancelado: { bg: COLORS.redLight, text: '#991B1B', border: COLORS.redBorder },
};

export default function OrdersScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Órdenes</Text>
      </View>

      {/* Summary strip */}
      <View style={styles.summaryStrip}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>5</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
        <View style={styles.stripDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>2</Text>
          <Text style={styles.summaryLabel}>Entregados</Text>
        </View>
        <View style={styles.stripDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>1</Text>
          <Text style={styles.summaryLabel}>En camino</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            <ShoppingBag size={56} color={COLORS.border} />
            <Text style={styles.emptyTitle}>Sin órdenes aún</Text>
            <Text style={styles.emptySubtitle}>Tus pedidos aparecerán aquí</Text>
            <TouchableOpacity
              style={styles.shopBtn}
              onPress={() => router.push('/(tabs)/productos')}
            >
              <Text style={styles.shopBtnText}>Explorar productos</Text>
            </TouchableOpacity>
          </View>
        ) : (
          orders.map((order) => {
            const cfg = statusConfig[order.status];
            return (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                activeOpacity={0.8}
                onPress={() => router.push(`/ordenes/${order.id}` as any)}
              >
                {/* Top row */}
                <View style={styles.orderTop}>
                  <View style={styles.orderIdRow}>
                    <Text style={styles.orderId}>{order.orderId}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
                      <Text style={[styles.statusText, { color: cfg.text }]}>{order.status}</Text>
                    </View>
                  </View>
                  <ChevronRight size={18} color={COLORS.darkBrown + '60'} />
                </View>

                <View style={styles.cardDivider} />

                {/* Details */}
                <View style={styles.orderDetails}>
                  <View style={styles.emojiCircle}>
                    <Text style={styles.orderEmoji}>{order.emoji}</Text>
                  </View>
                  <View style={styles.orderMeta}>
                    <Text style={styles.orderDate}>{order.date}</Text>
                    <Text style={styles.orderItems}>{order.items} producto(s)</Text>
                  </View>
                  <Text style={styles.orderTotal}>{order.total}</Text>
                </View>

                {/* Actions */}
                {(order.status === 'En camino' || order.status === 'Procesando') && (
                  <View style={styles.orderActions}>
                    <TouchableOpacity style={styles.trackBtn}>
                      <Text style={styles.trackBtnText}>Rastrear pedido</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {order.status === 'Entregado' && (
                  <View style={styles.orderActions}>
                    <TouchableOpacity style={styles.reorderBtn}>
                      <Text style={styles.reorderBtnText}>Volver a pedir</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.reviewBtn}>
                      <Text style={styles.reviewBtnText}>Calificar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.lightBeige },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: COLORS.darkBrown },
  summaryStrip: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 12,
  },
  summaryItem: { flex: 1, alignItems: 'center', gap: 2 },
  summaryValue: { fontSize: 20, fontWeight: '700', color: COLORS.accent },
  summaryLabel: { fontSize: 11, color: COLORS.muted },
  stripDivider: { width: 1, backgroundColor: COLORS.border, marginVertical: 4 },
  listContent: { padding: 16, gap: 12, paddingBottom: 24 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.darkBrown },
  emptySubtitle: { fontSize: 14, color: COLORS.muted },
  shopBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  shopBtnText: { color: COLORS.darkBrown, fontSize: 14, fontWeight: '600' },
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  orderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  orderIdRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  orderId: { fontSize: 16, fontWeight: '700', color: COLORS.darkBrown },
  statusBadge: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  statusText: { fontSize: 12, fontWeight: '600' },
  cardDivider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 14 },
  orderDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  emojiCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.lightBeige,
    alignItems: 'center', justifyContent: 'center',
  },
  orderEmoji: { fontSize: 22 },
  orderMeta: { flex: 1, gap: 2 },
  orderDate: { fontSize: 13, color: COLORS.muted },
  orderItems: { fontSize: 12, color: COLORS.darkBrown + '80' },
  orderTotal: { fontSize: 18, fontWeight: '700', color: COLORS.accent },
  orderActions: { flexDirection: 'row', gap: 8, paddingHorizontal: 14, paddingBottom: 12 },
  trackBtn: {
    flex: 1, backgroundColor: COLORS.accent,
    paddingVertical: 9, borderRadius: 8, alignItems: 'center',
  },
  trackBtnText: { color: COLORS.darkBrown, fontSize: 13, fontWeight: '600' },
  reorderBtn: {
    flex: 1, backgroundColor: COLORS.accent,
    paddingVertical: 9, borderRadius: 8, alignItems: 'center',
  },
  reorderBtnText: { color: COLORS.darkBrown, fontSize: 13, fontWeight: '600' },
  reviewBtn: {
    flex: 1, borderWidth: 1, borderColor: COLORS.border,
    paddingVertical: 9, borderRadius: 8, alignItems: 'center',
  },
  reviewBtnText: { color: COLORS.darkBrown, fontSize: 13, fontWeight: '500' },
});
