import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Pressable,
  Alert,
  Platform,
  Keyboard,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { ArrowLeft, MapPin, Phone, Edit2, Plus, X, Trash2, Check } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import type { AxiosError } from 'axios';
import { COLORS } from '@/constants/colors';
import { MapPicker, LocationResult } from '@/components/blocs/MapPicker';
import {
  useAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} from '@/services/addresses/addresses.service';
import { useProfileStore } from '@/store/useProfileStore';
import type { Address } from '@/types/address.types';
import type { ApiError } from '@/types/api.types';

interface Props {
  showBackButton?: boolean;
  onBack?: () => void;
}

type AddressForm = {
  label: string;
  line1: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  latitude?: number;
  longitude?: number;
};

const EMPTY_FORM: AddressForm = { label: '', line1: '', city: '', state: '', zip: '', phone: '' };

function apiMessage(err: unknown, fallback: string): string {
  const data = (err as AxiosError<ApiError>)?.response?.data?.message;
  if (Array.isArray(data)) return data[0] ?? fallback;
  return data ?? fallback;
}

// Direcciones REALES del usuario autenticado (las mismas que usa el checkout):
// se listan, crean, editan y borran contra el backend (/addresses).
export default function DireccionesPage({ showBackButton = false, onBack }: Props) {
  const router = useRouter();
  const user = useProfileStore((s) => s.user);

  const { data: addresses = [], isLoading } = useAddressesQuery();
  const { mutate: createAddress, isPending: creating } = useCreateAddressMutation();
  const { mutate: updateAddress, isPending: updating } = useUpdateAddressMutation();
  const { mutate: deleteAddress } = useDeleteAddressMutation();
  const saving = creating || updating;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressForm>(EMPTY_FORM);

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, phone: user?.phone ?? '' });
    setModalOpen(true);
  };

  const openEdit = (addr: Address) => {
    setEditingId(addr.id);
    setForm({
      label: addr.label ?? '',
      line1: addr.line1,
      city: addr.city,
      state: addr.state,
      zip: addr.zip === '0000' ? '' : addr.zip,
      phone: addr.phone,
      latitude: addr.latitude ?? undefined,
      longitude: addr.longitude ?? undefined,
    });
    setModalOpen(true);
  };

  const handleLocationSelect = (loc: LocationResult) => {
    setForm((f) => ({
      ...f,
      line1: loc.displayName,
      latitude: loc.latitude,
      longitude: loc.longitude,
    }));
  };

  const handleSave = () => {
    if (!user || saving) return;
    if (!form.label.trim() || !form.line1.trim() || !form.city.trim() || !form.state.trim()) {
      Alert.alert('Faltan datos', 'Completa etiqueta, dirección, ciudad y estado.');
      return;
    }

    const common = {
      label: form.label.trim(),
      line1: form.line1.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      zip: form.zip.trim() || '0000',
      phone: form.phone.trim() || user.phone || '',
      latitude: form.latitude,
      longitude: form.longitude,
    };
    const onError = (err: unknown) =>
      Alert.alert('Error', apiMessage(err, 'No se pudo guardar la dirección.'));
    const onSuccess = () => setModalOpen(false);

    if (editingId !== null) {
      updateAddress({ id: editingId, dto: common }, { onSuccess, onError });
    } else {
      createAddress(
        {
          userId: user.id,
          recipientName: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Cliente',
          country: 'Venezuela',
          // La primera dirección queda como predeterminada automáticamente.
          isDefault: addresses.length === 0,
          ...common,
        },
        { onSuccess, onError },
      );
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Eliminar dirección', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () =>
          deleteAddress(id, {
            onError: (err) => Alert.alert('Error', apiMessage(err, 'No se pudo eliminar.')),
          }),
      },
    ]);
  };

  // El backend desmarca las demás al poner isDefault=true (una sola llamada).
  const setDefault = (id: string) => {
    updateAddress(
      { id, dto: { isDefault: true } },
      { onError: (err) => Alert.alert('Error', apiMessage(err, 'No se pudo actualizar.')) },
    );
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        {showBackButton ? (
          <TouchableOpacity onPress={handleBack}>
            <ArrowLeft size={24} color={COLORS.darkBrown} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
        <Text style={styles.headerTitle}>Mis Direcciones</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Plus size={22} color={COLORS.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {isLoading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={COLORS.accent} />
          </View>
        ) : addresses.length === 0 ? (
          <View style={styles.emptyState}>
            <MapPin size={48} color={COLORS.border} />
            <Text style={styles.emptyTitle}>Sin direcciones</Text>
            <Text style={styles.emptySubtitle}>Agrega una dirección para agilizar tus pedidos</Text>
            <TouchableOpacity style={styles.addEmptyBtn} onPress={openAdd}>
              <Text style={styles.addEmptyBtnText}>+ Agregar dirección</Text>
            </TouchableOpacity>
          </View>
        ) : (
          addresses.map((addr) => (
            <View key={addr.id} style={[styles.card, addr.isDefault && styles.cardDefault]}>
              {/* Top row */}
              <View style={styles.cardTop}>
                <View style={styles.typePill}>
                  <MapPin size={14} color={COLORS.accent} />
                  <Text style={styles.typeText}>{addr.label || 'Dirección'}</Text>
                  {addr.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Predeterminada</Text>
                    </View>
                  )}
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(addr)}>
                    <Edit2 size={16} color={COLORS.brown} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(addr.id)}>
                    <Trash2 size={16} color={COLORS.red} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Address */}
              <Text style={styles.addressText}>
                {addr.line1}
                {addr.city ? `, ${addr.city}` : ''}
                {addr.state ? `, ${addr.state}` : ''}
              </Text>

              {/* Phone */}
              {!!addr.phone && (
                <View style={styles.phoneRow}>
                  <Phone size={14} color={COLORS.muted} />
                  <Text style={styles.phoneText}>{addr.phone}</Text>
                </View>
              )}

              {/* Set default */}
              {!addr.isDefault && (
                <TouchableOpacity style={styles.setDefaultBtn} onPress={() => setDefault(addr.id)}>
                  <Check size={14} color={COLORS.brown} />
                  <Text style={styles.setDefaultText}>Establecer como predeterminada</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}

        {/* FAB-style bottom add */}
        {!isLoading && addresses.length > 0 && (
          <TouchableOpacity style={styles.addMoreBtn} onPress={openAdd}>
            <Plus size={16} color={COLORS.accent} />
            <Text style={styles.addMoreText}>Agregar nueva dirección</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={modalOpen} transparent animationType="slide" onRequestClose={() => setModalOpen(false)}>
        <View style={styles.sheetWrapper}>
          <Pressable style={styles.overlay} onPress={() => { Keyboard.dismiss(); setModalOpen(false); }} />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {editingId !== null ? 'Editar dirección' : 'Nueva dirección'}
              </Text>
              <TouchableOpacity onPress={() => setModalOpen(false)}>
                <X size={22} color={COLORS.darkBrown} />
              </TouchableOpacity>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sheetContent}
            >
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Etiqueta (Casa, Oficina, etc.)</Text>
                <TextInput
                  style={styles.formInput}
                  value={form.label}
                  onChangeText={(v) => setForm((f) => ({ ...f, label: v }))}
                  placeholder="Casa"
                  placeholderTextColor={COLORS.darkBrown + '60'}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Ubicación en el mapa</Text>
                <MapPicker
                  countryCode="ve"
                  initialAddress={form.line1}
                  initialLatitude={form.latitude}
                  initialLongitude={form.longitude}
                  onLocationSelect={handleLocationSelect}
                  height={260}
                />
                {form.latitude !== undefined && form.longitude !== undefined && (
                  <Text style={styles.coordsHint}>
                    Lat: {form.latitude.toFixed(5)} · Lng: {form.longitude.toFixed(5)}
                  </Text>
                )}
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Ciudad</Text>
                  <TextInput
                    style={styles.formInput}
                    value={form.city}
                    onChangeText={(v) => setForm((f) => ({ ...f, city: v }))}
                    placeholder="Caracas"
                    placeholderTextColor={COLORS.darkBrown + '60'}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Estado</Text>
                  <TextInput
                    style={styles.formInput}
                    value={form.state}
                    onChangeText={(v) => setForm((f) => ({ ...f, state: v }))}
                    placeholder="Distrito Capital"
                    placeholderTextColor={COLORS.darkBrown + '60'}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Código postal (opcional)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={form.zip}
                    onChangeText={(v) => setForm((f) => ({ ...f, zip: v }))}
                    placeholder="1010"
                    placeholderTextColor={COLORS.darkBrown + '60'}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Teléfono de contacto</Text>
                  <TextInput
                    style={styles.formInput}
                    value={form.phone}
                    onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))}
                    placeholder="(000) 000-0000"
                    placeholderTextColor={COLORS.darkBrown + '60'}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={COLORS.darkBrown} />
                ) : (
                  <Text style={styles.saveBtnText}>
                    {editingId !== null ? 'Guardar cambios' : 'Agregar dirección'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
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
  addBtn: { padding: 4 },
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  emptyState: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.darkBrown },
  emptySubtitle: { fontSize: 14, color: COLORS.muted, textAlign: 'center' },
  addEmptyBtn: {
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 4,
  },
  addEmptyBtnText: { color: COLORS.accent, fontSize: 14, fontWeight: '600' },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 8,
  },
  cardDefault: { borderColor: COLORS.accent, borderWidth: 1.5 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  typePill: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  typeText: { fontSize: 15, fontWeight: '700', color: COLORS.darkBrown },
  defaultBadge: {
    backgroundColor: COLORS.accent + '20',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  defaultBadgeText: { fontSize: 11, color: COLORS.brown, fontWeight: '600' },
  cardActions: { flexDirection: 'row', gap: 6 },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressText: { fontSize: 14, color: COLORS.darkBrown, lineHeight: 20 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  phoneText: { fontSize: 13, color: COLORS.muted },
  setDefaultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
    marginTop: 2,
  },
  setDefaultText: { fontSize: 13, color: COLORS.brown, fontWeight: '500' },
  addMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.accent,
    borderRadius: 30,
    paddingVertical: 14,
  },
  addMoreText: { color: COLORS.accent, fontSize: 14, fontWeight: '600' },
  // Modal
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#00000050' },
  sheetWrapper: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    height: Dimensions.get('window').height * 0.85,
  },
  sheetContent: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 40,
    gap: 14,
  },
  coordsHint: { fontSize: 11, color: COLORS.muted, marginTop: 4, marginLeft: 4 },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 14,
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: COLORS.darkBrown },
  formGroup: { gap: 6 },
  formRow: { flexDirection: 'row', gap: 12 },
  formLabel: { fontSize: 13, fontWeight: '600', color: COLORS.darkBrown },
  formInput: {
    backgroundColor: COLORS.lightBeige,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.darkBrown,
  },
  saveBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: { color: COLORS.darkBrown, fontSize: 16, fontWeight: '700' },
});
