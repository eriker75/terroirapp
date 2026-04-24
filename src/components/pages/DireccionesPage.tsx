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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ArrowLeft, MapPin, Phone, Edit2, Plus, X, Trash2, Check } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/colors';

interface Address {
  id: number;
  type: string;
  address: string;
  phone: string;
  default: boolean;
}

const initialAddresses: Address[] = [
  {
    id: 1,
    type: 'Casa',
    address: '4140 Parker Rd., Allentown, NM 31134',
    phone: '(316) 555-0116',
    default: true,
  },
  {
    id: 2,
    type: 'Oficina',
    address: '2464 Royal Ln., Mesa, AZ 45463',
    phone: '(505) 555-0125',
    default: false,
  },
];

interface Props {
  showBackButton?: boolean;
  onBack?: () => void;
}

export default function DireccionesPage({ showBackButton = false, onBack }: Props) {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ type: '', address: '', phone: '' });

  const openAdd = () => {
    setEditingId(null);
    setForm({ type: '', address: '', phone: '' });
    setModalOpen(true);
  };

  const openEdit = (addr: Address) => {
    setEditingId(addr.id);
    setForm({ type: addr.type, address: addr.address, phone: addr.phone });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.type || !form.address) {
      Alert.alert('Error', 'El tipo y la direcciÃ³n son obligatorios');
      return;
    }
    if (editingId !== null) {
      setAddresses((prev) =>
        prev.map((a) => (a.id === editingId ? { ...a, ...form } : a))
      );
    } else {
      const newId = Math.max(...addresses.map((a) => a.id), 0) + 1;
      setAddresses((prev) => [
        ...prev,
        { id: newId, ...form, default: prev.length === 0 },
      ]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: number) => {
    Alert.alert('Eliminar direcciÃ³n', 'Â¿EstÃ¡s seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => setAddresses((prev) => prev.filter((a) => a.id !== id)),
      },
    ]);
  };

  const setDefault = (id: number) => {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, default: a.id === id }))
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
        {addresses.length === 0 ? (
          <View style={styles.emptyState}>
            <MapPin size={48} color={COLORS.border} />
            <Text style={styles.emptyTitle}>Sin direcciones</Text>
            <Text style={styles.emptySubtitle}>Agrega una direcciÃ³n para agilizar tus pedidos</Text>
            <TouchableOpacity style={styles.addEmptyBtn} onPress={openAdd}>
              <Text style={styles.addEmptyBtnText}>+ Agregar direcciÃ³n</Text>
            </TouchableOpacity>
          </View>
        ) : (
          addresses.map((addr) => (
            <View key={addr.id} style={[styles.card, addr.default && styles.cardDefault]}>
              {/* Top row */}
              <View style={styles.cardTop}>
                <View style={styles.typePill}>
                  <MapPin size={14} color={COLORS.accent} />
                  <Text style={styles.typeText}>{addr.type}</Text>
                  {addr.default && (
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
              <Text style={styles.addressText}>{addr.address}</Text>

              {/* Phone */}
              <View style={styles.phoneRow}>
                <Phone size={14} color={COLORS.muted} />
                <Text style={styles.phoneText}>{addr.phone}</Text>
              </View>

              {/* Set default */}
              {!addr.default && (
                <TouchableOpacity style={styles.setDefaultBtn} onPress={() => setDefault(addr.id)}>
                  <Check size={14} color={COLORS.brown} />
                  <Text style={styles.setDefaultText}>Establecer como predeterminada</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}

        {/* FAB-style bottom add */}
        {addresses.length > 0 && (
          <TouchableOpacity style={styles.addMoreBtn} onPress={openAdd}>
            <Plus size={16} color={COLORS.accent} />
            <Text style={styles.addMoreText}>Agregar nueva direcciÃ³n</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={modalOpen} transparent animationType="slide">
        <Pressable style={styles.overlay} onPress={() => setModalOpen(false)} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {editingId !== null ? 'Editar direcciÃ³n' : 'Nueva direcciÃ³n'}
              </Text>
              <TouchableOpacity onPress={() => setModalOpen(false)}>
                <X size={22} color={COLORS.darkBrown} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tipo (Casa, Oficina, etc.)</Text>
              <TextInput
                style={styles.formInput}
                value={form.type}
                onChangeText={(v) => setForm((f) => ({ ...f, type: v }))}
                placeholder="Casa"
                placeholderTextColor={COLORS.darkBrown + '60'}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>DirecciÃ³n completa</Text>
              <TextInput
                style={[styles.formInput, styles.formInputMulti]}
                value={form.address}
                onChangeText={(v) => setForm((f) => ({ ...f, address: v }))}
                placeholder="Calle, nÃºmero, ciudad, estado..."
                placeholderTextColor={COLORS.darkBrown + '60'}
                multiline
                numberOfLines={2}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>TelÃ©fono de contacto</Text>
              <TextInput
                style={styles.formInput}
                value={form.phone}
                onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))}
                placeholder="(000) 000-0000"
                placeholderTextColor={COLORS.darkBrown + '60'}
                keyboardType="phone-pad"
              />
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>
                {editingId !== null ? 'Guardar cambios' : 'Agregar direcciÃ³n'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
    borderRadius: 10,
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
  typePill: { flexDirection: 'row', alignItems: 'center', gap: 6 },
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
    borderRadius: 12,
    paddingVertical: 14,
  },
  addMoreText: { color: COLORS.accent, fontSize: 14, fontWeight: '600' },
  // Modal
  overlay: { flex: 1, backgroundColor: '#00000050' },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    gap: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: COLORS.darkBrown },
  formGroup: { gap: 6 },
  formLabel: { fontSize: 13, fontWeight: '600', color: COLORS.darkBrown },
  formInput: {
    backgroundColor: COLORS.lightBeige,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.darkBrown,
  },
  formInputMulti: { minHeight: 64, textAlignVertical: 'top' },
  saveBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnText: { color: COLORS.darkBrown, fontSize: 16, fontWeight: '700' },
});
