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
import { ArrowLeft, CreditCard, Plus, X, Trash2, Check } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/src/constants/colors';

interface Card {
  id: number;
  brand: 'Visa' | 'Mastercard' | 'Amex';
  last4: string;
  holder: string;
  expires: string;
  default: boolean;
}

const initialCards: Card[] = [
  { id: 1, brand: 'Visa', last4: '4242', holder: 'Ronald Richards', expires: '08/26', default: true },
  { id: 2, brand: 'Mastercard', last4: '5555', holder: 'Ronald Richards', expires: '03/25', default: false },
];

const BRAND_COLORS: Record<string, string> = {
  Visa: '#1A1F71',
  Mastercard: '#EB001B',
  Amex: '#007BC1',
};

const BRAND_EMOJI: Record<string, string> = {
  Visa: '💳',
  Mastercard: '💳',
  Amex: '💳',
};

interface Props {
  showBackButton?: boolean;
  onBack?: () => void;
}

export default function TarjetasPage({ showBackButton = false, onBack }: Props) {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ number: '', holder: '', expires: '', cvv: '' });

  const handleDelete = (id: number) => {
    Alert.alert('Eliminar tarjeta', '¿Eliminar esta tarjeta de pago?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => setCards((prev) => prev.filter((c) => c.id !== id)),
      },
    ]);
  };

  const setDefault = (id: number) => {
    setCards((prev) => prev.map((c) => ({ ...c, default: c.id === id })));
  };

  const handleAddCard = () => {
    if (form.number.length < 16 || !form.holder || !form.expires) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }
    const newId = Math.max(...cards.map((c) => c.id), 0) + 1;
    setCards((prev) => [
      ...prev,
      {
        id: newId,
        brand: 'Visa',
        last4: form.number.slice(-4),
        holder: form.holder,
        expires: form.expires,
        default: prev.length === 0,
      },
    ]);
    setModalOpen(false);
    setForm({ number: '', holder: '', expires: '', cvv: '' });
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
        <Text style={styles.headerTitle}>Mis Tarjetas</Text>
        <TouchableOpacity onPress={() => setModalOpen(true)}>
          <Plus size={24} color={COLORS.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {cards.map((card) => (
          <View key={card.id} style={styles.cardOuter}>
            {/* Visual card */}
            <View style={[styles.cardVisual, { backgroundColor: BRAND_COLORS[card.brand] }]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardBrand}>{card.brand}</Text>
                {card.default && (
                  <View style={styles.defaultPill}>
                    <Text style={styles.defaultPillText}>Predeterminada</Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardNumber}>**** **** **** {card.last4}</Text>
              <View style={styles.cardBottom}>
                <View>
                  <Text style={styles.cardMeta}>Titular</Text>
                  <Text style={styles.cardMetaValue}>{card.holder}</Text>
                </View>
                <View>
                  <Text style={styles.cardMeta}>Vence</Text>
                  <Text style={styles.cardMetaValue}>{card.expires}</Text>
                </View>
                <Text style={styles.cardChip}>⬛</Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.cardActions}>
              {!card.default && (
                <TouchableOpacity
                  style={styles.setDefaultBtn}
                  onPress={() => setDefault(card.id)}
                >
                  <Check size={14} color={COLORS.brown} />
                  <Text style={styles.setDefaultText}>Predeterminada</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(card.id)}
              >
                <Trash2 size={14} color={COLORS.red} />
                <Text style={styles.deleteBtnText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Add card button */}
        <TouchableOpacity style={styles.addMoreBtn} onPress={() => setModalOpen(true)}>
          <Plus size={20} color={COLORS.accent} />
          <Text style={styles.addMoreText}>Agregar nueva tarjeta</Text>
        </TouchableOpacity>

        {/* Security note */}
        <View style={styles.securityNote}>
          <Text style={styles.securityNoteText}>
            🔒 Tus datos de pago están cifrados y protegidos con SSL
          </Text>
        </View>
      </ScrollView>

      {/* Add card modal */}
      <Modal visible={modalOpen} transparent animationType="slide">
        <Pressable style={styles.overlay} onPress={() => setModalOpen(false)} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Nueva tarjeta</Text>
              <TouchableOpacity onPress={() => setModalOpen(false)}>
                <X size={22} color={COLORS.darkBrown} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Número de tarjeta</Text>
              <TextInput
                style={styles.formInput}
                value={form.number}
                onChangeText={(v) => setForm((f) => ({ ...f, number: v.replace(/\D/g, '') }))}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor={COLORS.darkBrown + '60'}
                keyboardType="number-pad"
                maxLength={16}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nombre del titular</Text>
              <TextInput
                style={styles.formInput}
                value={form.holder}
                onChangeText={(v) => setForm((f) => ({ ...f, holder: v }))}
                placeholder="Como aparece en la tarjeta"
                placeholderTextColor={COLORS.darkBrown + '60'}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.formLabel}>Vencimiento</Text>
                <TextInput
                  style={styles.formInput}
                  value={form.expires}
                  onChangeText={(v) => setForm((f) => ({ ...f, expires: v }))}
                  placeholder="MM/AA"
                  placeholderTextColor={COLORS.darkBrown + '60'}
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.formLabel}>CVV</Text>
                <TextInput
                  style={styles.formInput}
                  value={form.cvv}
                  onChangeText={(v) => setForm((f) => ({ ...f, cvv: v }))}
                  placeholder="***"
                  placeholderTextColor={COLORS.darkBrown + '60'}
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleAddCard}>
              <CreditCard size={18} color={COLORS.darkBrown} />
              <Text style={styles.saveBtnText}>Agregar tarjeta</Text>
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
  content: { padding: 16, gap: 14, paddingBottom: 32 },
  cardOuter: { gap: 0, borderRadius: 16, overflow: 'hidden' },
  cardVisual: {
    padding: 20,
    borderRadius: 16,
    gap: 14,
    minHeight: 160,
    justifyContent: 'space-between',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardBrand: { color: COLORS.white, fontSize: 18, fontWeight: '700', letterSpacing: 1 },
  defaultPill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  defaultPillText: { color: COLORS.white, fontSize: 11, fontWeight: '600' },
  cardNumber: {
    color: COLORS.white,
    fontSize: 18,
    letterSpacing: 3,
    fontFamily: 'monospace',
  },
  cardBottom: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  cardMeta: { color: 'rgba(255,255,255,0.7)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  cardMetaValue: { color: COLORS.white, fontSize: 13, fontWeight: '600', marginTop: 2 },
  cardChip: { fontSize: 24 },
  cardActions: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: COLORS.border,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  setDefaultBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  setDefaultText: { fontSize: 13, color: COLORS.brown, fontWeight: '500' },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  deleteBtnText: { fontSize: 13, color: COLORS.red, fontWeight: '500' },
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
  securityNote: {
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  securityNoteText: { fontSize: 12, color: '#166534', textAlign: 'center', lineHeight: 18 },
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
  formRow: { flexDirection: 'row', gap: 12 },
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
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 4,
  },
  saveBtnText: { color: COLORS.darkBrown, fontSize: 16, fontWeight: '700' },
});
