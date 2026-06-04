import { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { ArrowLeft, MapPin, CreditCard, Check, X, User } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { COLORS } from '@/constants/colors';
import HeaderLayout from '@/components/layouts/HeaderLayout';
import { useCartStore } from '@/store/useCartStore';
import { useProfileStore } from '@/store/useProfileStore';
import { useAddressesQuery, useCreateAddressMutation } from '@/services/addresses/addresses.service';
import { useBcvRateQuery } from '@/services/bcv/bcv.service';
import { useCheckoutMutation } from '@/services/orders/orders.service';
import { MapPicker, LocationResult } from '@/components/blocs/MapPicker';
import type { AxiosError } from 'axios';
import type { ApiError } from '@/types/api.types';

const USD_TO_POINTS = 10;
const FALLBACK_BS_RATE = 6.96;

// Bancos venezolanos (código → nombre) para pago móvil.
const BANKS = [
  { code: '0102', name: 'Banco de Venezuela' },
  { code: '0105', name: 'Mercantil' },
  { code: '0108', name: 'BBVA Provincial' },
  { code: '0114', name: 'Bancaribe' },
  { code: '0115', name: 'Banco Exterior' },
  { code: '0134', name: 'Banesco' },
  { code: '0151', name: 'BFC Banco Fondo Común' },
  { code: '0163', name: 'Banco del Tesoro' },
  { code: '0168', name: 'Bancrecer' },
  { code: '0171', name: 'Banco Activo' },
  { code: '0172', name: 'Bancamiga' },
  { code: '0174', name: 'Banplus' },
  { code: '0175', name: 'Banco Bicentenario' },
  { code: '0191', name: 'BNC Banco Nacional de Crédito' },
];

type PaymentMethod = 'pago_movil' | 'efectivo' | 'puntos';

function formatAmount(usd: number, method: PaymentMethod, bsRate: number): string {
  const abs = Math.abs(usd);
  if (method === 'puntos') return `${(abs * USD_TO_POINTS).toFixed(0)} pts`;
  if (method === 'efectivo') return `$${abs.toFixed(2)}`;
  return `$${abs.toFixed(2)} | Bs ${(abs * bsRate).toFixed(2)}`;
}

export default function CheckoutScreen() {
  const router = useRouter();

  const cartItems = useCartStore((s) => s.items);
  const cartTotal = useCartStore((s) => s.cartTotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const user = useProfileStore((s) => s.user);

  const { data: savedAddresses = [], isLoading: addressesLoading } = useAddressesQuery();
  const { data: bcvData } = useBcvRateQuery();
  const bcvRate = bcvData?.rate ?? FALLBACK_BS_RATE;
  const { mutate: checkout, isPending: placing } = useCheckoutMutation();

  // Si el carrito está vacío al entrar/volver, regresar al carrito.
  useFocusEffect(
    useCallback(() => {
      if (useCartStore.getState().items.length === 0) {
        router.replace('/(tabs)/(home)/carrito' as any);
      }
    }, [router]),
  );

  // ── Contacto (prefijado con el perfil, editable) ──────────────────────────
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');

  // ── Dirección ─────────────────────────────────────────────────────────────
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  // Coordenadas capturadas para direcciones creadas en esta sesión (la tabla de
  // direcciones no las persiste, pero el checkout sí las acepta).
  const [coordsById, setCoordsById] = useState<Record<string, { lat: number; lng: number }>>({});

  const effectiveAddressId =
    selectedAddressId ??
    savedAddresses.find((a) => a.isDefault)?.id ??
    savedAddresses[0]?.id ??
    null;
  const selectedAddress = savedAddresses.find((a) => a.id === effectiveAddressId) ?? null;

  // ── Pago ──────────────────────────────────────────────────────────────────
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pago_movil');
  const [bankCode, setBankCode] = useState('');
  const [paymentRef, setPaymentRef] = useState('');
  const [payerIdDocument, setPayerIdDocument] = useState('');
  const [payerPhone, setPayerPhone] = useState('');
  const [bankPickerOpen, setBankPickerOpen] = useState(false);
  const selectedBank = BANKS.find((b) => b.code === bankCode);

  // ── Modal nueva dirección ─────────────────────────────────────────────────
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newLine1, setNewLine1] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newZip, setNewZip] = useState('');
  const [newLat, setNewLat] = useState<number | undefined>(undefined);
  const [newLng, setNewLng] = useState<number | undefined>(undefined);
  const { mutate: createAddress, isPending: creatingAddress } = useCreateAddressMutation();

  // ── Totales (del carrito real; el backend recalcula de forma autoritativa) ──
  const subtotal = cartTotal;
  const discount = 0;
  const shipping = 0;
  const total = subtotal - discount + shipping;

  const loyaltyPoints = user?.loyaltyPoints ?? 0;
  const totalInPoints = total * USD_TO_POINTS;

  // ── Validación ──────────────────────────────────────────────────────────
  const contactOk =
    firstName.trim() && lastName.trim() && email.trim() && phone.trim();
  const pagoMovilOk =
    paymentMethod !== 'pago_movil' ||
    (!!bankCode && paymentRef.trim().length >= 6 && !!payerIdDocument.trim() && !!payerPhone.trim());
  const puntosOk = paymentMethod !== 'puntos' || loyaltyPoints >= totalInPoints;
  const canPlaceOrder =
    !placing && !!contactOk && !!selectedAddress && pagoMovilOk && puntosOk;

  const handleNewLocationSelect = (loc: LocationResult) => {
    setNewLine1(loc.displayName);
    setNewLat(loc.latitude);
    setNewLng(loc.longitude);
  };

  const handleSaveAddress = () => {
    if (!user) return;
    if (!newLabel.trim() || !newLine1.trim() || !newCity.trim() || !newState.trim()) {
      Alert.alert('Faltan datos', 'Completa etiqueta, dirección, ciudad y estado.');
      return;
    }
    createAddress(
      {
        userId: user.id,
        label: newLabel.trim(),
        recipientName: `${firstName} ${lastName}`.trim() || 'Cliente',
        phone: phone.trim() || user.phone || '',
        line1: newLine1.trim(),
        city: newCity.trim(),
        state: newState.trim(),
        zip: newZip.trim() || '0000',
        country: 'Venezuela',
      },
      {
        onSuccess: (addr) => {
          if (newLat !== undefined && newLng !== undefined) {
            setCoordsById((prev) => ({ ...prev, [addr.id]: { lat: newLat, lng: newLng } }));
          }
          setSelectedAddressId(addr.id);
          setShowAddressModal(false);
          setNewLabel(''); setNewLine1(''); setNewCity(''); setNewState(''); setNewZip('');
          setNewLat(undefined); setNewLng(undefined);
        },
        onError: (err) => {
          Alert.alert(
            'Error',
            (err as AxiosError<ApiError>)?.response?.data?.message ?? 'No se pudo guardar la dirección.',
          );
        },
      },
    );
  };

  const handlePlaceOrder = () => {
    if (!canPlaceOrder || !selectedAddress) return;
    const coords = coordsById[selectedAddress.id];
    checkout(
      {
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        address: [selectedAddress.line1, selectedAddress.line2].filter(Boolean).join(', '),
        addressLabel: selectedAddress.label ?? undefined,
        city: selectedAddress.city,
        state: selectedAddress.state,
        zip: selectedAddress.zip,
        country: selectedAddress.country ?? 'Venezuela',
        ...(coords ? { latitude: coords.lat, longitude: coords.lng } : {}),
        paymentMethod,
        ...(paymentMethod === 'pago_movil'
          ? {
              bankCode,
              paymentReference: paymentRef.trim(),
              payerIdDocument: payerIdDocument.trim(),
              payerPhone: payerPhone.trim(),
            }
          : {}),
        items: cartItems.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
      },
      {
        onSuccess: (order) => {
          clearCart();
          router.replace(`/(tabs)/(dashboard)/perfil/ordenes/${order.id}` as any);
        },
        onError: (err) => {
          Alert.alert(
            'No se pudo procesar el pedido',
            (err as AxiosError<ApiError>)?.response?.data?.message ?? 'Inténtalo de nuevo.',
          );
        },
      },
    );
  };

  const ctaLabel = useMemo(() => {
    if (placing) return 'Procesando...';
    return `Confirmar pedido · ${formatAmount(total, paymentMethod, bcvRate)}`;
  }, [placing, total, paymentMethod, bcvRate]);

  return (
    <HeaderLayout>
      <View style={styles.safeArea}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <ArrowLeft size={24} color={COLORS.darkBrown} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Contacto */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <User size={16} color={COLORS.accent} />
              <Text style={styles.sectionTitle}>Datos de contacto</Text>
            </View>
            <View style={styles.row2}>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>Nombre</Text>
                <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="Nombre" placeholderTextColor={COLORS.muted} />
              </View>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>Apellido</Text>
                <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Apellido" placeholderTextColor={COLORS.muted} />
              </View>
            </View>
            <Text style={styles.inputLabel}>Correo</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="tu@email.com" placeholderTextColor={COLORS.muted} keyboardType="email-address" autoCapitalize="none" />
            <Text style={styles.inputLabel}>Teléfono</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+58 412 1234567" placeholderTextColor={COLORS.muted} keyboardType="phone-pad" />
          </View>

          {/* Dirección */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MapPin size={16} color={COLORS.accent} />
              <Text style={styles.sectionTitle}>Dirección de entrega</Text>
            </View>
            {addressesLoading ? (
              <ActivityIndicator color={COLORS.accent} style={{ marginVertical: 12 }} />
            ) : savedAddresses.length === 0 ? (
              <Text style={styles.emptyHint}>No tienes direcciones guardadas. Agrega una para continuar.</Text>
            ) : (
              savedAddresses.map((addr) => {
                const active = effectiveAddressId === addr.id;
                return (
                  <TouchableOpacity
                    key={addr.id}
                    style={[styles.optionCard, active && styles.optionCardSelected]}
                    onPress={() => setSelectedAddressId(addr.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.optionLeft}>
                      <Text style={styles.optionLabel}>{addr.label ?? 'Dirección'}</Text>
                      <Text style={styles.optionSub} numberOfLines={2}>
                        {[addr.line1, addr.city, addr.state].filter(Boolean).join(', ')}
                      </Text>
                    </View>
                    <View style={[styles.radioOuter, active && styles.radioOuterSelected]}>
                      {active && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
            <TouchableOpacity style={styles.addNewBtn} onPress={() => setShowAddressModal(true)}>
              <Text style={styles.addNewText}>+ Agregar nueva dirección</Text>
            </TouchableOpacity>
          </View>

          {/* Pago */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <CreditCard size={16} color={COLORS.accent} />
              <Text style={styles.sectionTitle}>Métodos de pago</Text>
            </View>

            {/* Pago Móvil */}
            <TouchableOpacity
              style={[
                styles.optionCard,
                paymentMethod === 'pago_movil' && styles.optionCardSelected,
                paymentMethod === 'pago_movil' && { flexDirection: 'column', alignItems: 'stretch' },
              ]}
              onPress={() => setPaymentMethod('pago_movil')}
              activeOpacity={0.8}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: paymentMethod === 'pago_movil' ? 12 : 0 }}>
                <View style={styles.optionLeft}>
                  <Text style={styles.optionLabel}>Pago Móvil</Text>
                  <Text style={styles.optionSub}>Recomendado. Rápido y sin comisiones ocultas.</Text>
                </View>
                <View style={[styles.radioOuter, paymentMethod === 'pago_movil' && styles.radioOuterSelected]}>
                  {paymentMethod === 'pago_movil' && <View style={styles.radioInner} />}
                </View>
              </View>

              {paymentMethod === 'pago_movil' && (
                <>
                  <View style={styles.paymentInfoBox}>
                    <View style={styles.paymentInfoRow}>
                      <Text style={styles.paymentInfoLabel}>Banco destino:</Text>
                      <Text style={styles.paymentInfoValue}>0102 - Banco de Venezuela</Text>
                    </View>
                    <View style={styles.paymentInfoRow}>
                      <Text style={styles.paymentInfoLabel}>Teléfono:</Text>
                      <Text style={styles.paymentInfoValue}>0412 123 4567</Text>
                    </View>
                    <View style={styles.paymentInfoRow}>
                      <Text style={styles.paymentInfoLabel}>RIF:</Text>
                      <Text style={styles.paymentInfoValue}>J-12345678-9</Text>
                    </View>
                    <View style={styles.paymentInfoRow}>
                      <Text style={styles.paymentInfoLabel}>Monto a pagar:</Text>
                      <Text style={styles.paymentInfoValue}>Bs {(total * bcvRate).toFixed(2)}</Text>
                    </View>
                  </View>

                  <Text style={styles.inputLabel}>Banco emisor</Text>
                  <TouchableOpacity style={styles.selectInput} onPress={() => setBankPickerOpen(true)}>
                    <Text style={[styles.selectText, !selectedBank && { color: COLORS.muted }]}>
                      {selectedBank ? `${selectedBank.code} - ${selectedBank.name}` : 'Selecciona tu banco'}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.row2}>
                    <View style={styles.col}>
                      <Text style={styles.inputLabel}>Referencia</Text>
                      <TextInput style={styles.paymentInput} placeholder="Últimos 6 dígitos" placeholderTextColor={COLORS.muted} keyboardType="numeric" value={paymentRef} onChangeText={setPaymentRef} />
                    </View>
                    <View style={styles.col}>
                      <Text style={styles.inputLabel}>Cédula / RIF</Text>
                      <TextInput style={styles.paymentInput} placeholder="V-12345678" placeholderTextColor={COLORS.muted} value={payerIdDocument} onChangeText={setPayerIdDocument} autoCapitalize="characters" />
                    </View>
                  </View>
                  <Text style={styles.inputLabel}>Teléfono del pagador</Text>
                  <TextInput style={styles.paymentInput} placeholder="0412 1234567" placeholderTextColor={COLORS.muted} keyboardType="phone-pad" value={payerPhone} onChangeText={setPayerPhone} />
                </>
              )}
            </TouchableOpacity>

            {/* Efectivo */}
            <TouchableOpacity style={[styles.optionCard, paymentMethod === 'efectivo' && styles.optionCardSelected]} onPress={() => setPaymentMethod('efectivo')} activeOpacity={0.8}>
              <View style={styles.optionLeft}>
                <Text style={styles.optionLabel}>Efectivo (USD)</Text>
                <Text style={styles.optionSub}>Paga al momento de recibir tu pedido.</Text>
              </View>
              <View style={[styles.radioOuter, paymentMethod === 'efectivo' && styles.radioOuterSelected]}>
                {paymentMethod === 'efectivo' && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>

            {/* Puntos */}
            <TouchableOpacity style={[styles.optionCard, paymentMethod === 'puntos' && styles.optionCardSelected]} onPress={() => setPaymentMethod('puntos')} activeOpacity={0.8}>
              <View style={styles.optionLeft}>
                <Text style={styles.optionLabel}>Mis Puntos</Text>
                <Text style={styles.optionSub}>
                  Tienes {loyaltyPoints} pts. Necesitas {totalInPoints.toFixed(0)} pts.
                </Text>
              </View>
              <View style={[styles.radioOuter, paymentMethod === 'puntos' && styles.radioOuterSelected]}>
                {paymentMethod === 'puntos' && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
            {paymentMethod === 'puntos' && !puntosOk && (
              <Text style={styles.errorHint}>No tienes puntos suficientes para este pedido.</Text>
            )}
          </View>

          {/* Resumen */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resumen del pedido</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal ({cartItems.length} ítem(s))</Text>
                <Text style={styles.summaryValue}>{formatAmount(subtotal, paymentMethod, bcvRate)}</Text>
              </View>
              {discount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Descuento</Text>
                  <Text style={[styles.summaryValue, { color: COLORS.green }]}>-{formatAmount(discount, paymentMethod, bcvRate)}</Text>
                </View>
              )}
              <View style={[styles.summaryRow, styles.summaryRowBorder]}>
                <Text style={styles.summaryLabel}>Envío</Text>
                <Text style={styles.summaryValue}>{shipping === 0 ? 'Gratis' : formatAmount(shipping, paymentMethod, bcvRate)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatAmount(total, paymentMethod, bcvRate)}</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Confirmar */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.placeBtn, !canPlaceOrder && styles.placeBtnLoading]}
            onPress={handlePlaceOrder}
            disabled={!canPlaceOrder}
            activeOpacity={0.85}
          >
            {placing ? (
              <ActivityIndicator color={COLORS.darkBrown} />
            ) : (
              <>
                <Check size={18} color={COLORS.darkBrown} />
                <Text style={styles.placeBtnText}>{ctaLabel}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Modal selector de banco */}
        <Modal visible={bankPickerOpen} transparent animationType="slide" onRequestClose={() => setBankPickerOpen(false)}>
          <View style={styles.modalOverlay}>
            <Pressable style={styles.modalBackdrop} onPress={() => setBankPickerOpen(false)} />
            <View style={[styles.modalContent, { height: Dimensions.get('window').height * 0.6 }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Selecciona tu banco</Text>
                <TouchableOpacity onPress={() => setBankPickerOpen(false)}><X size={24} color={COLORS.darkBrown} /></TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
                {BANKS.map((b) => (
                  <TouchableOpacity
                    key={b.code}
                    style={styles.bankRow}
                    onPress={() => { setBankCode(b.code); setBankPickerOpen(false); }}
                  >
                    <Text style={styles.bankRowText}>{b.code} - {b.name}</Text>
                    {bankCode === b.code && <Check size={18} color={COLORS.accent} />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Modal nueva dirección */}
        <Modal visible={showAddressModal} transparent animationType="slide" onRequestClose={() => setShowAddressModal(false)}>
          <View style={styles.modalOverlay}>
            <Pressable style={styles.modalBackdrop} onPress={() => setShowAddressModal(false)} />
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Nueva Dirección</Text>
                <TouchableOpacity onPress={() => setShowAddressModal(false)}><X size={24} color={COLORS.darkBrown} /></TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalBody} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} nestedScrollEnabled>
                <Text style={styles.modalLabel}>Etiqueta (ej. Casa, Oficina)</Text>
                <TextInput style={styles.modalInput} placeholder="Ej. Casa" placeholderTextColor={COLORS.muted} value={newLabel} onChangeText={setNewLabel} />

                <Text style={styles.modalLabel}>Ubicación de entrega</Text>
                <MapPicker
                  countryCode="ve"
                  initialAddress={newLine1}
                  initialLatitude={newLat}
                  initialLongitude={newLng}
                  onLocationSelect={handleNewLocationSelect}
                  height={220}
                />

                <Text style={styles.modalLabel}>Dirección (línea 1)</Text>
                <TextInput style={styles.modalInput} placeholder="Av. Principal, Edificio X" placeholderTextColor={COLORS.muted} value={newLine1} onChangeText={setNewLine1} />

                <View style={styles.row2}>
                  <View style={styles.col}>
                    <Text style={styles.modalLabel}>Ciudad</Text>
                    <TextInput style={styles.modalInput} placeholder="Caracas" placeholderTextColor={COLORS.muted} value={newCity} onChangeText={setNewCity} />
                  </View>
                  <View style={styles.col}>
                    <Text style={styles.modalLabel}>Estado</Text>
                    <TextInput style={styles.modalInput} placeholder="Distrito Capital" placeholderTextColor={COLORS.muted} value={newState} onChangeText={setNewState} />
                  </View>
                </View>

                <Text style={styles.modalLabel}>Código postal (opcional)</Text>
                <TextInput style={styles.modalInput} placeholder="1010" placeholderTextColor={COLORS.muted} keyboardType="numeric" value={newZip} onChangeText={setNewZip} />

                <TouchableOpacity style={[styles.modalSaveBtn, creatingAddress && { opacity: 0.6 }]} onPress={handleSaveAddress} disabled={creatingAddress}>
                  {creatingAddress ? <ActivityIndicator color={COLORS.darkBrown} /> : <Text style={styles.modalSaveBtnText}>Guardar Dirección</Text>}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </HeaderLayout>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.lightBeige },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: COLORS.darkBrown },
  content: { padding: 16, gap: 20, paddingBottom: 24 },
  section: { gap: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.darkBrown },
  row2: { flexDirection: 'row', gap: 10 },
  col: { flex: 1, gap: 6 },
  optionCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.white, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: 14 },
  optionCardSelected: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '10' },
  optionLeft: { flex: 1, gap: 3 },
  optionLabel: { fontSize: 14, fontWeight: '600', color: COLORS.darkBrown },
  optionSub: { fontSize: 12, color: COLORS.muted },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  radioOuterSelected: { borderColor: COLORS.accent },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.accent },
  paymentInfoBox: { backgroundColor: COLORS.lightBeige, borderRadius: 8, padding: 12, gap: 6, marginBottom: 12 },
  paymentInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  paymentInfoLabel: { fontSize: 13, color: COLORS.muted },
  paymentInfoValue: { fontSize: 13, fontWeight: '600', color: COLORS.darkBrown },
  inputLabel: { fontSize: 13, fontWeight: '600', color: COLORS.darkBrown, marginBottom: 6, marginTop: 4 },
  input: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 12, fontSize: 14, color: COLORS.darkBrown },
  paymentInput: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 10, fontSize: 14, color: COLORS.darkBrown },
  selectInput: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12 },
  selectText: { fontSize: 14, color: COLORS.darkBrown, fontWeight: '500' },
  bankRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  bankRowText: { fontSize: 15, color: COLORS.darkBrown },
  addNewBtn: { paddingHorizontal: 4, paddingVertical: 4 },
  addNewText: { fontSize: 13, color: COLORS.accent, fontWeight: '500' },
  emptyHint: { fontSize: 13, color: COLORS.muted, paddingVertical: 8 },
  errorHint: { fontSize: 12, color: COLORS.red, marginTop: 2 },
  summaryCard: { backgroundColor: COLORS.white, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: 14, gap: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: 10, marginBottom: 2 },
  summaryLabel: { fontSize: 14, color: COLORS.muted },
  summaryValue: { fontSize: 14, color: COLORS.darkBrown, fontWeight: '500' },
  totalLabel: { fontSize: 17, fontWeight: '700', color: COLORS.darkBrown },
  totalValue: { fontSize: 18, fontWeight: '700', color: COLORS.accent },
  footer: { backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border, padding: 16, paddingBottom: 20 },
  placeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.accent, paddingVertical: 15, borderRadius: 14, minHeight: 52 },
  placeBtnLoading: { opacity: 0.6 },
  placeBtnText: { color: COLORS.darkBrown, fontSize: 15, fontWeight: '700' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: '#00000080' },
  modalContent: { backgroundColor: COLORS.lightBeige, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 20, height: Dimensions.get('window').height * 0.88 },
  modalScroll: { paddingHorizontal: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.darkBrown },
  modalBody: { gap: 8, paddingBottom: 40 },
  modalLabel: { fontSize: 14, fontWeight: '600', color: COLORS.darkBrown, marginTop: 6 },
  modalInput: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 14, fontSize: 15, color: COLORS.darkBrown },
  modalSaveBtn: { backgroundColor: COLORS.accent, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 16, minHeight: 50, justifyContent: 'center' },
  modalSaveBtnText: { color: COLORS.darkBrown, fontSize: 16, fontWeight: '700' },
});
