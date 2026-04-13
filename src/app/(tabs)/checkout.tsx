import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, CreditCard, ChevronRight, Check } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/src/constants/colors';

interface CheckoutProps {
  subtotal?: number;
  discount?: number;
  tax?: number;
  shipping?: number;
}

export default function CheckoutScreen() {
  const router = useRouter();
  const [selectedAddress, setSelectedAddress] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState(0);
  const [placing, setPlacing] = useState(false);

  // In a real app these would come from route params / store
  const subtotal = 23.23;
  const discount = -5.0;
  const tax = subtotal * 0.1;
  const shipping = 3.0;
  const total = subtotal + discount + tax + shipping;

  const addresses = [
    { id: 0, label: 'Casa', address: '4140 Parker Rd., Allentown, NM 31134' },
    { id: 1, label: 'Trabajo', address: '2464 Royal Ln., Mesa, AZ 45463' },
  ];

  const payments = [
    { id: 0, label: 'Visa •••• 4242', sub: 'Vence 12/26' },
    { id: 1, label: 'Mastercard •••• 8881', sub: 'Vence 08/25' },
  ];

  const handlePlaceOrder = () => {
    setPlacing(true);
    setTimeout(() => {
      setPlacing(false);
      Alert.alert(
        '¡Pedido realizado!',
        'Tu pedido fue confirmado. Te notificaremos cuando esté en camino.',
        [{ text: 'Ver mis órdenes', onPress: () => router.push('/ordenes' as any) }]
      );
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.darkBrown} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Delivery address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={16} color={COLORS.accent} />
            <Text style={styles.sectionTitle}>Dirección de entrega</Text>
          </View>
          {addresses.map((addr) => (
            <TouchableOpacity
              key={addr.id}
              style={[styles.optionCard, selectedAddress === addr.id && styles.optionCardSelected]}
              onPress={() => setSelectedAddress(addr.id)}
              activeOpacity={0.8}
            >
              <View style={styles.optionLeft}>
                <Text style={styles.optionLabel}>{addr.label}</Text>
                <Text style={styles.optionSub}>{addr.address}</Text>
              </View>
              <View style={[styles.radioOuter, selectedAddress === addr.id && styles.radioOuterSelected]}>
                {selectedAddress === addr.id && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.addNewBtn}>
            <Text style={styles.addNewText}>+ Agregar nueva dirección</Text>
          </TouchableOpacity>
        </View>

        {/* Payment method */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CreditCard size={16} color={COLORS.accent} />
            <Text style={styles.sectionTitle}>Método de pago</Text>
          </View>
          {payments.map((pay) => (
            <TouchableOpacity
              key={pay.id}
              style={[styles.optionCard, selectedPayment === pay.id && styles.optionCardSelected]}
              onPress={() => setSelectedPayment(pay.id)}
              activeOpacity={0.8}
            >
              <View style={styles.optionLeft}>
                <Text style={styles.optionLabel}>{pay.label}</Text>
                <Text style={styles.optionSub}>{pay.sub}</Text>
              </View>
              <View style={[styles.radioOuter, selectedPayment === pay.id && styles.radioOuterSelected]}>
                {selectedPayment === pay.id && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.addNewBtn}>
            <Text style={styles.addNewText}>+ Agregar tarjeta</Text>
          </TouchableOpacity>
        </View>

        {/* Order summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen del pedido</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Descuento (WELCOME)</Text>
              <Text style={[styles.summaryValue, { color: COLORS.green }]}>${discount.toFixed(2)}</Text>
            </View>
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
          </View>
        </View>
      </ScrollView>

      {/* Place order */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.placeBtn, placing && styles.placeBtnLoading]}
          onPress={handlePlaceOrder}
          disabled={placing}
          activeOpacity={0.85}
        >
          {placing ? (
            <Text style={styles.placeBtnText}>Confirmando...</Text>
          ) : (
            <>
              <Check size={18} color={COLORS.darkBrown} />
              <Text style={styles.placeBtnText}>Confirmar pedido · ${total.toFixed(2)}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.darkBrown },
  content: { padding: 16, gap: 20, paddingBottom: 24 },
  section: { gap: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.darkBrown },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  optionCardSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accent + '10',
  },
  optionLeft: { flex: 1, gap: 3 },
  optionLabel: { fontSize: 14, fontWeight: '600', color: COLORS.darkBrown },
  optionSub: { fontSize: 12, color: COLORS.muted },
  radioOuter: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioOuterSelected: { borderColor: COLORS.accent },
  radioInner: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: COLORS.accent,
  },
  addNewBtn: { paddingHorizontal: 4 },
  addNewText: { fontSize: 13, color: COLORS.accent, fontWeight: '500' },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 10,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryRowBorder: {
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
    paddingBottom: 10, marginBottom: 2,
  },
  summaryLabel: { fontSize: 14, color: COLORS.muted },
  summaryValue: { fontSize: 14, color: COLORS.darkBrown, fontWeight: '500' },
  totalLabel: { fontSize: 17, fontWeight: '700', color: COLORS.darkBrown },
  totalValue: { fontSize: 20, fontWeight: '700', color: COLORS.accent },
  footer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: 16,
    paddingBottom: 20,
  },
  placeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.accent,
    paddingVertical: 15,
    borderRadius: 14,
  },
  placeBtnLoading: { opacity: 0.7 },
  placeBtnText: { color: COLORS.darkBrown, fontSize: 16, fontWeight: '700' },
});
