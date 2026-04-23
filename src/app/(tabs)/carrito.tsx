import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageSourcePropType,
  TextInput,
} from 'react-native';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/src/constants/colors';

const PROMO_CODES: Record<string, number> = {
  WELCOME: 5.0,
  TERROIR10: 3.0,
  CAFE20: 4.0,
};

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: ImageSourcePropType;
  description: string;
}

const initialCart: CartItem[] = [
  {
    id: '1',
    name: 'Espresso Intenso Colombiano',
    price: 5.75,
    quantity: 2,
    image: require('../../../assets/images/products/espresso-terroir.jpg'),
    description: 'Tueste oscuro',
  },
  {
    id: '2',
    name: 'Cappuccino Artesanal',
    price: 6.50,
    quantity: 1,
    image: require('../../../assets/images/cappuccino.jpg'),
    description: 'Tradición italiana',
  },
  {
    id: '3',
    name: 'Cold Brew Premium',
    price: 4.99,
    quantity: 1,
    image: require('../../../assets/images/cold-brew.jpg'),
    description: 'Refrescante',
  },
];

export default function CartScreen() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>(initialCart);
  const [promoInput, setPromoInput] = useState('');
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [promoError, setPromoError] = useState(false);

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    } else {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i)));
    }
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (PROMO_CODES[code]) {
      setAppliedCode(code);
      setPromoError(false);
    } else {
      setAppliedCode(null);
      setPromoError(true);
    }
  };

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discountAmount = appliedCode ? PROMO_CODES[appliedCode] : 0;
  const discount = -discountAmount;
  const tax = items.length > 0 ? subtotal * 0.1 : 0;
  const shipping = items.length > 0 ? 3.0 : 0;
  const total = subtotal + discount + tax + shipping;

  return (
    <View style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Carrito</Text>
        {items.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{items.reduce((s, i) => s + i.quantity, 0)}</Text>
          </View>
        )}
      </View>

      {items.length === 0 ? (
        /* Empty State */
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
            {items.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                {/* Image */}
                <View style={styles.itemImage}>
                  <Image source={item.image} style={styles.itemImg} resizeMode="cover" />
                </View>

                {/* Info */}
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.itemDescription}>{item.description}</Text>
                  <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
                </View>

                {/* Actions */}
                <View style={styles.itemActions}>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => removeItem(item.id)}>
                    <Trash2 size={16} color={COLORS.red} />
                  </TouchableOpacity>
                  <View style={styles.qtyControl}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateQty(item.id, item.quantity - 1)}
                    >
                      <Minus size={12} color={COLORS.darkBrown} />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateQty(item.id, item.quantity + 1)}
                    >
                      <Plus size={12} color={COLORS.darkBrown} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}

            {/* Promo code */}
            <View style={styles.promoSection}>
              <Text style={styles.promoLabel}>Código promocional</Text>
              <View style={styles.promoRow}>
                <TextInput
                  style={styles.promoInput}
                  value={promoInput}
                  onChangeText={(t) => { setPromoInput(t); setPromoError(false); }}
                  placeholder="Ej. WELCOME"
                  placeholderTextColor={COLORS.muted}
                  autoCapitalize="characters"
                  returnKeyType="done"
                  onSubmitEditing={applyPromo}
                />
                <TouchableOpacity style={styles.promoApplyBtn} onPress={applyPromo}>
                  <Text style={styles.promoApplyText}>Aplicar</Text>
                </TouchableOpacity>
              </View>
              {appliedCode && (
                <View style={styles.promoApplied}>
                  <Text style={styles.promoAppliedText}>
                    ✓ Descuento {appliedCode} aplicado (-${PROMO_CODES[appliedCode].toFixed(2)})
                  </Text>
                </View>
              )}
              {promoError && (
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
              <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
            </View>
            {appliedCode && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Descuento ({appliedCode})</Text>
                <Text style={[styles.summaryValue, { color: COLORS.green }]}>-${discountAmount.toFixed(2)}</Text>
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
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.lightBeige },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
  itemPrice: { fontSize: 15, fontWeight: '700', color: COLORS.accent, marginTop: 6 },
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
  promoPlaceholder: { fontSize: 13, color: COLORS.muted },
  promoApplyBtn: {
    backgroundColor: COLORS.darkBrown,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
  },
  promoApplyText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  promoApplied: {
    backgroundColor: '#F0FDF4',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  promoAppliedText: { color: COLORS.green, fontSize: 12, fontWeight: '500' },
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
