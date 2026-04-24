import { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ArrowLeft, MapPin, CreditCard, ChevronRight, Check, X } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { COLORS } from '@/constants/colors';
import HeaderLayout from '@/components/layouts/HeaderLayout';
import { useCartStore } from '@/store/useCartStore';

interface CheckoutProps {
  subtotal?: number;
  discount?: number;
  tax?: number;
  shipping?: number;
}

export default function CheckoutScreen() {
  const router = useRouter();
  const [selectedAddress, setSelectedAddress] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('pago_movil');
  const [paymentRef, setPaymentRef] = useState('');
  
  const clearCart = useCartStore((s) => s.clearCart);

  useFocusEffect(
    useCallback(() => {
      // Si entra a esta pantalla o vuelve a ella (hace focus) y el carrito está vacío,
      // lo enviamos de vuelta al carrito.
      const items = useCartStore.getState().items;
      if (items.length === 0) {
        router.replace('/(tabs)/(home)/carrito' as any);
      }
    }, [])
  );

  const [addresses, setAddresses] = useState([
    { id: 0, label: 'Casa', address: '4140 Parker Rd., Allentown, NM 31134' },
    { id: 1, label: 'Trabajo', address: '2464 Royal Ln., Mesa, AZ 45463' },
  ]);
  
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newAddress, setNewAddress] = useState('');

  // In a real app these would come from route params / store
  const subtotal = 23.23;
  const discount = -5.0;
  const shipping = 5.0; // Updated to exactly 5
  const total = subtotal + discount + shipping;

  const handleAddAddress = () => {
    if (newLabel.trim() && newAddress.trim()) {
      const newId = addresses.length ? Math.max(...addresses.map(a => a.id)) + 1 : 0;
      setAddresses([...addresses, { id: newId, label: newLabel.trim(), address: newAddress.trim() }]);
      setSelectedAddress(newId);
      setShowAddressModal(false);
      setNewLabel('');
      setNewAddress('');
    } else {
      Alert.alert('Error', 'Por favor llena la etiqueta y la dirección.');
    }
  };

  const handlePlaceOrder = () => {
    setPlacing(true);
    setTimeout(() => {
      // Navegamos directo a la orden
      router.navigate('/(tabs)/(dashboard)/perfil/ordenes/999' as any);
      
      // Limpiamos el carrito medio segundo después para no disparar 
      // la redirección al carrito mientras navegamos
      setTimeout(() => {
        clearCart();
        setPlacing(false);
      }, 500);
    }, 1500);
  };

  return (
    <HeaderLayout>
      <View style={styles.safeArea}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <ArrowLeft size={24} color={COLORS.darkBrown} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 32 }} />
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
          <TouchableOpacity style={styles.addNewBtn} onPress={() => setShowAddressModal(true)}>
            <Text style={styles.addNewText}>+ Agregar nueva dirección</Text>
          </TouchableOpacity>
        </View>

        {/* Payment method */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CreditCard size={16} color={COLORS.accent} />
            <Text style={styles.sectionTitle}>Métodos de pago</Text>
          </View>
          
          <TouchableOpacity 
            style={[
              styles.optionCard, 
              selectedPayment === 'pago_movil' && styles.optionCardSelected, 
              selectedPayment === 'pago_movil' && { flexDirection: 'column', alignItems: 'stretch' }
            ]}
            onPress={() => setSelectedPayment('pago_movil')}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: selectedPayment === 'pago_movil' ? 12 : 0 }}>
              <View style={styles.optionLeft}>
                <Text style={styles.optionLabel}>Pago Móvil</Text>
                <Text style={styles.optionSub}>Recomendado. Rápido y sin comisiones ocultas.</Text>
              </View>
              <View style={[styles.radioOuter, selectedPayment === 'pago_movil' && styles.radioOuterSelected]}>
                {selectedPayment === 'pago_movil' && <View style={styles.radioInner} />}
              </View>
            </View>
            
            {selectedPayment === 'pago_movil' && (
              <>
                <View style={styles.paymentInfoBox}>
                  <View style={styles.paymentInfoRow}>
                    <Text style={styles.paymentInfoLabel}>Banco:</Text>
                    <Text style={styles.paymentInfoValue}>0102 - Banco de Venezuela</Text>
                  </View>
                  <View style={styles.paymentInfoRow}>
                    <Text style={styles.paymentInfoLabel}>Teléfono:</Text>
                    <Text style={styles.paymentInfoValue}>0412 123 4567</Text>
                  </View>
                  <View style={styles.paymentInfoRow}>
                    <Text style={styles.paymentInfoLabel}>Documento:</Text>
                    <Text style={styles.paymentInfoValue}>J-12345678-9</Text>
                  </View>
                  <View style={styles.paymentInfoRow}>
                    <Text style={styles.paymentInfoLabel}>Monto a pagar:</Text>
                    <Text style={styles.paymentInfoValue}>Bs {(total * 6.96).toFixed(2)}</Text>
                  </View>
                </View>

                <View style={{ marginTop: 12 }}>
                  <Text style={styles.inputLabel}>Referencia de pago</Text>
                  <TextInput
                    style={styles.paymentInput}
                    placeholder="Últimos 6 dígitos. Ej. 123456"
                    placeholderTextColor={COLORS.muted}
                    keyboardType="numeric"
                    value={paymentRef}
                    onChangeText={setPaymentRef}
                  />
                </View>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.optionCard, selectedPayment === 'efectivo' && styles.optionCardSelected]}
            onPress={() => setSelectedPayment('efectivo')}
            activeOpacity={0.8}
          >
            <View style={styles.optionLeft}>
              <Text style={styles.optionLabel}>Efectivo (USD)</Text>
              <Text style={styles.optionSub}>Paga al momento de recibir tu pedido.</Text>
            </View>
            <View style={[styles.radioOuter, selectedPayment === 'efectivo' && styles.radioOuterSelected]}>
              {selectedPayment === 'efectivo' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.optionCard, selectedPayment === 'puntos' && styles.optionCardSelected]}
            onPress={() => setSelectedPayment('puntos')}
            activeOpacity={0.8}
          >
            <View style={styles.optionLeft}>
              <Text style={styles.optionLabel}>Mis Puntos</Text>
              <Text style={styles.optionSub}>Paga usando tu saldo. Tienes 1200 puntos disponibles.</Text>
            </View>
            <View style={[styles.radioOuter, selectedPayment === 'puntos' && styles.radioOuterSelected]}>
              {selectedPayment === 'puntos' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        </View>

        {/* Order summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen del pedido</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                {selectedPayment === 'puntos' ? `${(subtotal * 10).toFixed(0)} pts` : selectedPayment === 'efectivo' ? `$${subtotal.toFixed(2)}` : `$${subtotal.toFixed(2)} | Bs ${(subtotal * 6.96).toFixed(2)}`}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Descuento</Text>
              <Text style={[styles.summaryValue, { color: COLORS.green }]}>
                {selectedPayment === 'puntos' ? `-${(Math.abs(discount) * 10).toFixed(0)} pts` : selectedPayment === 'efectivo' ? `-$${Math.abs(discount).toFixed(2)}` : `-$${Math.abs(discount).toFixed(2)} | Bs -${(Math.abs(discount) * 6.96).toFixed(2)}`}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryRowBorder]}>
              <Text style={styles.summaryLabel}>Envío</Text>
              <Text style={styles.summaryValue}>
                {selectedPayment === 'puntos' ? `+${(shipping * 10).toFixed(0)} pts` : selectedPayment === 'efectivo' ? `+$${shipping.toFixed(2)}` : `+$${shipping.toFixed(2)} | Bs ${(shipping * 6.96).toFixed(2)}`}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {selectedPayment === 'puntos' ? `${(total * 10).toFixed(0)} pts` : selectedPayment === 'efectivo' ? `$${total.toFixed(2)}` : `$${total.toFixed(2)} | Bs ${(total * 6.96).toFixed(2)}`}
              </Text>
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
            <Text style={styles.placeBtnText}>Verificando...</Text>
          ) : (
            <>
              <Check size={18} color={COLORS.darkBrown} />
              <Text style={styles.placeBtnText}>
                Confirmar pedido · {selectedPayment === 'puntos' ? `${(total * 10).toFixed(0)} pts` : `$${total.toFixed(2)}`}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Address Modal */}
      <Modal visible={showAddressModal} transparent animationType="slide">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nueva Dirección</Text>
              <TouchableOpacity onPress={() => setShowAddressModal(false)}>
                <X size={24} color={COLORS.darkBrown} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Etiqueta (ej. Casa, Oficina)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ej. Oficina"
                value={newLabel}
                onChangeText={setNewLabel}
              />
              
              <Text style={styles.modalLabel}>Dirección Completa</Text>
              <TextInput
                style={[styles.modalInput, { height: 80 }]}
                placeholder="Ej. Av. Principal, Edificio X..."
                value={newAddress}
                onChangeText={setNewAddress}
                multiline
                textAlignVertical="top"
              />
              
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleAddAddress}>
                <Text style={styles.modalSaveBtnText}>Guardar Dirección</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      </View>
    </HeaderLayout>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.lightBeige },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: COLORS.darkBrown },
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
  paymentInfoBox: {
    backgroundColor: COLORS.lightBeige,
    borderRadius: 8,
    padding: 12,
    gap: 6,
  },
  paymentInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentInfoLabel: { fontSize: 13, color: COLORS.muted },
  paymentInfoValue: { fontSize: 13, fontWeight: '600', color: COLORS.darkBrown },
  inputLabel: { fontSize: 13, fontWeight: '600', color: COLORS.darkBrown, marginBottom: 6 },
  paymentInput: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: COLORS.darkBrown,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000080',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.lightBeige,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.darkBrown },
  modalBody: { gap: 12 },
  modalLabel: { fontSize: 14, fontWeight: '600', color: COLORS.darkBrown, marginBottom: -6 },
  modalInput: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: COLORS.darkBrown,
  },
  modalSaveBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  modalSaveBtnText: { color: COLORS.darkBrown, fontSize: 16, fontWeight: '700' },
});
