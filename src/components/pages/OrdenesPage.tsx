import { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronRight, ShoppingBag } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { useCartStore } from '@/store/useCartStore';
import { useMyOrdersQuery } from '@/services/orders/orders.service';
import { mapOrders, type OrderView } from '@/lib/order-mapper';
import type { Product } from '@/data/products';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface Props {
  showBackButton?: boolean;
  onBack?: () => void;
  useSafeArea?: boolean;
}

export default function OrdenesPage({ showBackButton = false, onBack, useSafeArea = true }: Props) {
  const router = useRouter();
  const addToCart = useCartStore((s) => s.addToCart);

  const { data, isLoading, isError, refetch } = useMyOrdersQuery();
  const orders = useMemo(() => mapOrders(data ?? []), [data]);

  const delivered = orders.filter((o) => o.status === 'COMPLETED').length;
  const inTransit = orders.filter((o) => o.status === 'SENDING' || o.status === 'PREPARING').length;

  const handleReorder = (order: OrderView) => {
    order.items.forEach((it) => {
      const product: Product = {
        id: it.productId,
        name: it.name,
        description: '',
        longDescription: '',
        price: it.unitPrice,
        category: 'coffee',
        rating: 0,
        reviewCount: 0,
        inStock: true,
        stock: 99,
        image: it.image,
      };
      addToCart(product, it.quantity);
    });
    router.push('/(tabs)/carrito' as any);
  };

  const handleBack = () => {
    if (onBack) onBack();
    else router.back();
  };

  const Content = (
    <>
      {/* Header */}
      <View style={styles.header}>
        {showBackButton ? (
          <TouchableOpacity onPress={handleBack}>
            <ArrowLeft size={24} color={COLORS.darkBrown} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
        <Text style={styles.headerTitle}>Mis Pedidos</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Summary strip */}
      <View style={styles.summaryStrip}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{orders.length}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
        <View style={styles.stripDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{delivered}</Text>
          <Text style={styles.summaryLabel}>Entregados</Text>
        </View>
        <View style={styles.stripDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{inTransit}</Text>
          <Text style={styles.summaryLabel}>En curso</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      ) : isError ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No pudimos cargar tus pedidos</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => refetch()}>
            <Text style={styles.shopBtnText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyState}>
          <ShoppingBag size={56} color={COLORS.border} />
          <Text style={styles.emptyTitle}>Sin pedidos aún</Text>
          <Text style={styles.emptySubtitle}>Tus pedidos aparecerán aquí</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/(tabs)/productos' as any)}>
            <Text style={styles.shopBtnText}>Explorar productos</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
          {orders.map((order) => {
            const cfg = order.statusConfig;
            return (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                activeOpacity={0.8}
                onPress={() => router.push(`/perfil/ordenes/${order.id}` as any)}
              >
                <View style={styles.orderTop}>
                  <View style={styles.orderIdRow}>
                    <Text style={styles.orderId}>{order.shortId}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
                      <Text style={[styles.statusText, { color: cfg.text }]}>{cfg.label}</Text>
                    </View>
                  </View>
                  <ChevronRight size={18} color={COLORS.darkBrown + '60'} />
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.orderDetails}>
                  <View style={styles.emojiCircle}>
                    <Text style={styles.orderEmoji}>{cfg.emoji}</Text>
                  </View>
                  <View style={styles.orderMeta}>
                    <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
                    <Text style={styles.orderItems}>{order.itemCount} producto(s)</Text>
                  </View>
                  <Text style={styles.orderTotal}>${order.total.toFixed(2)}</Text>
                </View>

                {(order.status === 'SENDING' || order.status === 'PREPARING' || order.status === 'PENDING') && (
                  <View style={styles.orderActions}>
                    <TouchableOpacity style={styles.trackBtn} onPress={() => router.push(`/perfil/ordenes/${order.id}` as any)}>
                      <Text style={styles.trackBtnText}>Rastrear pedido</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {order.status === 'COMPLETED' && (
                  <View style={styles.orderActions}>
                    <TouchableOpacity style={styles.reorderBtn} onPress={() => handleReorder(order)}>
                      <Text style={styles.reorderBtnText}>Volver a pedir</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </>
  );

  if (useSafeArea) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {Content}
      </SafeAreaView>
    );
  }

  return <View style={styles.safeArea}>{Content}</View>;
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
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.darkBrown },
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
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.darkBrown },
  emptySubtitle: { fontSize: 14, color: COLORS.muted },
  shopBtn: { backgroundColor: COLORS.accent, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10, marginTop: 4 },
  shopBtnText: { color: COLORS.darkBrown, fontSize: 14, fontWeight: '600' },
  orderCard: { backgroundColor: COLORS.white, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  orderTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12 },
  orderIdRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  orderId: { fontSize: 16, fontWeight: '700', color: COLORS.darkBrown },
  statusBadge: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  statusText: { fontSize: 12, fontWeight: '600' },
  cardDivider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 14 },
  orderDetails: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  emojiCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.lightBeige, alignItems: 'center', justifyContent: 'center' },
  orderEmoji: { fontSize: 22 },
  orderMeta: { flex: 1, gap: 2 },
  orderDate: { fontSize: 13, color: COLORS.muted },
  orderItems: { fontSize: 12, color: COLORS.darkBrown + '80' },
  orderTotal: { fontSize: 18, fontWeight: '700', color: COLORS.accent },
  orderActions: { flexDirection: 'row', gap: 8, paddingHorizontal: 14, paddingBottom: 12 },
  trackBtn: { flex: 1, backgroundColor: COLORS.accent, paddingVertical: 9, borderRadius: 8, alignItems: 'center' },
  trackBtnText: { color: COLORS.darkBrown, fontSize: 13, fontWeight: '600' },
  reorderBtn: { flex: 1, backgroundColor: COLORS.accent, paddingVertical: 9, borderRadius: 8, alignItems: 'center' },
  reorderBtnText: { color: COLORS.darkBrown, fontSize: 13, fontWeight: '600' },
});
