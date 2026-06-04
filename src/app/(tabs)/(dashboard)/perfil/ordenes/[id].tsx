import { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { ArrowLeft, MapPin, Package, Star, Check, CreditCard } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { useOrderQuery } from '@/services/orders/orders.service';
import { mapOrder, ORDER_TRACKING_STEPS, ORDER_STATUS_CONFIG } from '@/lib/order-mapper';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

export default function OrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError } = useOrderQuery(id ?? '');
  const order = useMemo(() => (data ? mapOrder(data) : null), [data]);

  const goBack = () => router.navigate('/(tabs)/(dashboard)/perfil/ordenes' as any);

  if (isLoading) {
    return (
      <View style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack}><ArrowLeft size={24} color={COLORS.darkBrown} /></TouchableOpacity>
          <Text style={styles.headerTitle}>Detalles del Pedido</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.notFound}><ActivityIndicator size="large" color={COLORS.accent} /></View>
      </View>
    );
  }

  if (isError || !order) {
    return (
      <View style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack}><ArrowLeft size={24} color={COLORS.darkBrown} /></TouchableOpacity>
          <Text style={styles.headerTitle}>Pedido no encontrado</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.notFound}><Text style={styles.notFoundText}>No se encontró el pedido</Text></View>
      </View>
    );
  }

  const cfg = order.statusConfig;
  const isCancelled = order.status === 'CANCELLED';

  return (
    <View style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack}><ArrowLeft size={24} color={COLORS.darkBrown} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Detalles del Pedido</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Status card */}
        <View style={[styles.statusCard, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
          <Text style={styles.statusEmoji}>{cfg.emoji}</Text>
          <View style={styles.statusInfo}>
            <Text style={styles.orderId}>{order.shortId}</Text>
            <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
            <Text style={[styles.statusBadgeText, { color: cfg.text }]}>{cfg.label}</Text>
          </View>
        </View>

        {/* Seguimiento */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Package size={16} color={COLORS.brown} />
            <Text style={styles.cardTitle}>Seguimiento</Text>
          </View>
          {isCancelled ? (
            <View style={styles.cancelledNote}>
              <Text style={styles.cancelledText}>Este pedido fue cancelado. Si tienes preguntas, contáctanos.</Text>
            </View>
          ) : (
            <View style={styles.timeline}>
              {ORDER_TRACKING_STEPS.map((step, i) => {
                const done = ORDER_STATUS_CONFIG[step.status].step <= cfg.step;
                const last = i === ORDER_TRACKING_STEPS.length - 1;
                return (
                  <View key={step.status} style={styles.vStep}>
                    <View style={styles.vStepLeft}>
                      <View style={[styles.vDot, done && styles.vDotDone]}>
                        {done && <Check size={11} color={COLORS.white} />}
                      </View>
                      {!last && <View style={[styles.vLine, done && styles.vLineDone]} />}
                    </View>
                    <Text style={[styles.vLabel, done && styles.vLabelDone]}>{step.label}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Productos ordenados</Text>
          {order.items.map((item, index) => (
            <View key={item.id} style={[styles.itemRow, index < order.items.length - 1 && styles.itemBorder]}>
              <View style={styles.itemImageBox}>
                <Image source={item.image} style={styles.itemImg} resizeMode="cover" />
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.itemQty}>Cantidad: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>${item.lineTotal.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Resumen de pago */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Resumen de pago</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${order.subtotal.toFixed(2)}</Text>
          </View>
          {order.discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Descuento</Text>
              <Text style={[styles.summaryValue, { color: COLORS.green }]}>-${order.discount.toFixed(2)}</Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.summaryRowBorder]}>
            <Text style={styles.summaryLabel}>Envío</Text>
            <Text style={styles.summaryValue}>{order.shipping === 0 ? 'Gratis' : `+$${order.shipping.toFixed(2)}`}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${order.total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Pago */}
        {order.payment && (
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <CreditCard size={16} color={COLORS.brown} />
              <Text style={styles.cardTitle}>Pago</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Método</Text>
              <Text style={styles.summaryValue}>{order.payment.methodLabel}</Text>
            </View>
            {order.payment.reference && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Referencia</Text>
                <Text style={styles.summaryValue}>{order.payment.reference}</Text>
              </View>
            )}
            {order.payment.amountVes != null && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Monto Bs</Text>
                <Text style={styles.summaryValue}>Bs {order.payment.amountVes.toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Estado del pago</Text>
              <Text style={styles.summaryValue}>{order.payment.status}</Text>
            </View>
          </View>
        )}

        {/* Dirección */}
        {order.address && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Dirección de entrega</Text>
            <View style={styles.addressRow}>
              <MapPin size={18} color={COLORS.accent} />
              <View style={{ flex: 1 }}>
                <Text style={styles.addressName}>{order.address.recipientName} · {order.address.label}</Text>
                <Text style={styles.addressText}>{order.address.line}</Text>
                {!!order.address.phone && <Text style={styles.addressPhone}>{order.address.phone}</Text>}
              </View>
            </View>
          </View>
        )}

        {/* Puntos */}
        {order.pointsEarned > 0 && (
          <View style={styles.pointsEarnedCard}>
            <Star size={20} color={COLORS.accent} fill={COLORS.accent} />
            <View style={styles.pointsInfo}>
              <Text style={styles.pointsEarnedTitle}>Puntos ganados</Text>
              <Text style={styles.pointsEarnedText}>+{order.pointsEarned} pts con esta compra</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.lightBeige },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.darkBrown },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontSize: 16, color: COLORS.muted },
  content: { padding: 16, gap: 14, paddingBottom: 32 },
  statusCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 14, borderWidth: 1 },
  statusEmoji: { fontSize: 28 },
  statusInfo: { flex: 1 },
  orderId: { fontSize: 18, fontWeight: '700', color: COLORS.darkBrown },
  orderDate: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  statusBadge: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusBadgeText: { fontSize: 12, fontWeight: '700' },
  card: { backgroundColor: COLORS.white, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, padding: 16, gap: 12 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 12, fontWeight: '700', color: COLORS.darkBrown + '70', textTransform: 'uppercase', letterSpacing: 0.5 },
  // Timeline vertical
  timeline: { gap: 0 },
  vStep: { flexDirection: 'row', gap: 12 },
  vStepLeft: { alignItems: 'center', width: 22 },
  vDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  vDotDone: { backgroundColor: COLORS.accent },
  vLine: { width: 2, flex: 1, minHeight: 22, backgroundColor: COLORS.border, marginVertical: 2 },
  vLineDone: { backgroundColor: COLORS.accent },
  vLabel: { fontSize: 14, color: COLORS.muted, paddingTop: 1, paddingBottom: 14, fontWeight: '500' },
  vLabelDone: { color: COLORS.darkBrown, fontWeight: '700' },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 12 },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  itemImageBox: { width: 52, height: 52, borderRadius: 10, backgroundColor: COLORS.lightBeige, overflow: 'hidden' },
  itemImg: { width: '100%', height: '100%' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '600', color: COLORS.darkBrown },
  itemQty: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: '700', color: COLORS.accent },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: 10, marginBottom: 2 },
  summaryLabel: { fontSize: 14, color: COLORS.muted },
  summaryValue: { fontSize: 14, color: COLORS.darkBrown, fontWeight: '500' },
  totalLabel: { fontSize: 17, fontWeight: '700', color: COLORS.darkBrown },
  totalValue: { fontSize: 20, fontWeight: '700', color: COLORS.accent },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  addressName: { fontSize: 14, fontWeight: '600', color: COLORS.darkBrown },
  addressText: { fontSize: 14, color: COLORS.darkBrown, lineHeight: 20, marginTop: 2 },
  addressPhone: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  cancelledNote: { backgroundColor: COLORS.redLight, borderWidth: 1, borderColor: COLORS.redBorder, borderRadius: 10, padding: 14 },
  cancelledText: { fontSize: 13, color: '#991B1B', lineHeight: 18, textAlign: 'center' },
  pointsEarnedCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FEF9C3', borderWidth: 1, borderColor: '#FDE68A', borderRadius: 12, padding: 14,
  },
  pointsInfo: { flex: 1 },
  pointsEarnedTitle: { fontSize: 13, fontWeight: '700', color: '#854D0E', textTransform: 'uppercase' },
  pointsEarnedText: { fontSize: 15, fontWeight: '600', color: '#854D0E', marginTop: 2 },
});
