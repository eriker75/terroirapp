import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Trash2, Minus, Plus, ShoppingBag, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/colors';
import HeaderLayout from '@/components/layouts/HeaderLayout';
import { useCartStore } from '@/store/useCartStore';

const PLACEHOLDER = require('@/assets/images/coffee-product-5.jpg');
const USD_TO_BS = 6.96;

export default function CartScreen() {
  const router = useRouter();
  const [promoInput, setPromoInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [promoError, setPromoError] = useState(false);

  const cartItems = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const clearCart = useCartStore((s) => s.clearCart);
  const cartTotal = useCartStore((s) => s.cartTotal);

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    if (code === 'WELCOME' || code === 'DESC15') {
      setAppliedCoupon({ code, amount: 15, discountType: 'PERCENTAGE' });
      setPromoInput('');
      setPromoError(false);
    } else {
      setPromoError(true);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const discountAmount = appliedCoupon ? (cartTotal * (appliedCoupon.amount / 100)) : 0;
  const tax = cartItems.length > 0 ? (cartTotal - discountAmount) * 0.1 : 0;
  const shipping = cartItems.length > 0 ? 3.0 : 0;
  const total = (cartTotal - discountAmount) + tax + shipping;

  return (
    <HeaderLayout>
      <View style={styles.safeArea}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Mi Carrito</Text>
          {cartItems.length > 0 && (
            <>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{cartItems.reduce((s, i) => s + i.quantity, 0)}</Text>
              </View>
              <View style={{ flex: 1 }} />
              <TouchableOpacity onPress={() => clearCart()} style={{ padding: 4 }}>
                <Trash2 size={20} color={COLORS.red} />
              </TouchableOpacity>
            </>
          )}
        </View>

        {cartItems.length === 0 ? (
          <View style={styles.emptyState}>
            <ShoppingBag size={64} color={COLORS.border} />
            <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
            <Text style={styles.emptySubtitle}>Agrega algunos cafés para continuar</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => router.push('/(tabs)/productos')}
            >
              <Text style={styles.emptyBtnText}>Explorar productos</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              {cartItems.map((item) => {
                const p = item.product;
                const hasDiscount = !!p.discount && p.discount > 0;
                const finalPrice = hasDiscount ? p.price * (1 - p.discount! / 100) : p.price;
                return (
                  <View key={p.id} style={styles.itemCard}>
                    <View style={styles.itemImage}>
                      <Image
                        source={p.image || PLACEHOLDER}
                        style={styles.itemImg}
                        resizeMode="cover"
                      />
                    </View>

                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName} numberOfLines={2}>{p.name}</Text>
                      <Text style={styles.itemDescription} numberOfLines={1}>{p.description}</Text>
                      
                      
                      <View style={styles.priceRow}>
                        {hasDiscount ? (
                          <>
                            <Text style={styles.originalPrice}>${p.price.toFixed(2)}</Text>
                            <Text style={styles.itemPrice}>${finalPrice.toFixed(2)}</Text>
                          </>
                        ) : (
                          <Text style={styles.itemPrice}>${p.price.toFixed(2)}</Text>
                        )}
                        <Text style={styles.priceBs}>Bs {(finalPrice * USD_TO_BS).toFixed(2)}</Text>
                      </View>
                      
                      <View style={styles.pointsBadgeRow}>
                        <View style={styles.pointsBadge}>
                          <Text style={styles.pointsText}>⭐ {Math.round(finalPrice * 10)} pts</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.itemActions}>
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => removeFromCart(p.id)}
                      >
                        <Trash2 size={16} color={COLORS.red} />
                      </TouchableOpacity>
                      <View style={styles.qtyControl}>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => updateQuantity(p.id, item.quantity - 1)}
                        >
                          <Minus size={12} color={COLORS.darkBrown} />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{item.quantity}</Text>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => updateQuantity(p.id, item.quantity + 1)}
                        >
                          <Plus size={12} color={COLORS.darkBrown} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}

              {/* Promo code */}
              <View style={styles.promoSection}>
                <Text style={styles.promoLabel}>Código promocional</Text>
                {appliedCoupon ? (
                  <View style={styles.promoApplied}>
                    <Text style={styles.promoAppliedText}>
                      ✓ Cupón {appliedCoupon.code} aplicado (
                      {appliedCoupon.discountType === 'PERCENTAGE'
                        ? `-${appliedCoupon.amount}%`
                        : `-$${appliedCoupon.amount.toFixed(2)}`}
                      )
                    </Text>
                    <TouchableOpacity
                      onPress={removeCoupon}
                    >
                      <X size={16} color={COLORS.green} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.promoRow}>
                    <TextInput
                      style={styles.promoInput}
                      value={promoInput}
                      onChangeText={(t) => {
                        setPromoInput(t);
                        setPromoError(false);
                      }}
                      placeholder="Ej. WELCOME"
                      placeholderTextColor={COLORS.muted}
                      autoCapitalize="characters"
                      returnKeyType="done"
                      onSubmitEditing={applyPromo}
                    />
                    <TouchableOpacity
                      style={styles.promoApplyBtn}
                      onPress={applyPromo}
                    >
                      <Text style={styles.promoApplyText}>Aplicar</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {promoError && !appliedCoupon && (
                  <View style={styles.promoError}>
                    <Text style={styles.promoErrorText}>Código inválido o no encontrado</Text>
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Summary Panel */}
            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>${cartTotal.toFixed(2)}</Text>
              </View>
              {appliedCoupon && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Descuento ({appliedCoupon.code})</Text>
                  <Text style={[styles.summaryValue, { color: COLORS.green }]}>
                    -${discountAmount.toFixed(2)}
                  </Text>
                </View>
              )}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Impuesto (10%)</Text>
                <Text style={styles.summaryValue}>+${tax.toFixed(2)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryRowBorder]}>
                <Text style={styles.summaryLabel}>Envío</Text>
                <Text style={styles.summaryValue}>+${shipping.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
              </View>
              <TouchableOpacity
                style={styles.checkoutBtn}
                onPress={() => router.push('/checkout' as any)}
                activeOpacity={0.85}
              >
                <Text style={styles.checkoutBtnText}>Proceder a Pago</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </HeaderLayout>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.lightBeige },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 15, color: COLORS.muted },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: COLORS.darkBrown },
  countBadge: {
    backgroundColor: COLORS.accent,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: { color: COLORS.darkBrown, fontSize: 12, fontWeight: '700' },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.darkBrown, marginTop: 8 },
  emptySubtitle: { fontSize: 14, color: COLORS.muted, textAlign: 'center' },
  emptyBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  emptyBtnText: { color: COLORS.darkBrown, fontSize: 15, fontWeight: '600' },
  scrollContent: { padding: 16, gap: 12, paddingBottom: 24 },
  itemCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
  },
  itemImage: {
    width: 76,
    height: 76,
    backgroundColor: COLORS.lightBeige,
    borderRadius: 10,
    overflow: 'hidden',
    flexShrink: 0,
  },
  itemImg: { width: '100%', height: '100%' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 13, fontWeight: '700', color: COLORS.darkBrown },
  itemDescription: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  originalPrice: { fontSize: 12, textDecorationLine: 'line-through', color: COLORS.muted },
  itemPrice: { fontSize: 15, fontWeight: '700', color: COLORS.accent },
  priceBs: { fontSize: 12, fontWeight: '500', color: COLORS.muted, marginLeft: 4 },
  pointsBadgeRow: { marginTop: 4, alignItems: 'flex-start' },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF9C3',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  pointsText: { fontSize: 10, color: '#854D0E', fontWeight: '700' },
  itemActions: { alignItems: 'flex-end', justifyContent: 'space-between' },
  deleteBtn: {
    padding: 6,
    backgroundColor: COLORS.redLight,
    borderRadius: 8,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  qtyBtn: {
    padding: 8,
    backgroundColor: COLORS.lightBeige,
  },
  qtyText: {
    paddingHorizontal: 10,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkBrown,
    minWidth: 28,
    textAlign: 'center',
  },
  promoSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 10,
  },
  promoLabel: { fontSize: 14, fontWeight: '600', color: COLORS.darkBrown },
  promoRow: { flexDirection: 'row', gap: 8 },
  promoInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  promoApplyBtn: {
    backgroundColor: COLORS.darkBrown,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
  },
  promoApplyText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  promoApplied: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  promoAppliedText: { color: COLORS.green, fontSize: 12, fontWeight: '500', flex: 1 },
  promoError: {
    backgroundColor: COLORS.redLight,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  promoErrorText: { color: COLORS.red, fontSize: 12, fontWeight: '500' },
  summary: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 20,
    gap: 8,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 8,
    marginBottom: 4,
  },
  summaryLabel: { fontSize: 14, color: COLORS.muted },
  summaryValue: { fontSize: 14, color: COLORS.darkBrown, fontWeight: '500' },
  totalLabel: { fontSize: 17, fontWeight: '700', color: COLORS.darkBrown },
  totalValue: { fontSize: 20, fontWeight: '700', color: COLORS.accent },
  checkoutBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  checkoutBtnText: { color: COLORS.darkBrown, fontSize: 16, fontWeight: '700' },
});
