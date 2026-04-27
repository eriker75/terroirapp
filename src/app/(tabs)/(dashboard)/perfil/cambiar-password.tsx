import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/colors';

interface PasswordFieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
}

function PasswordField({ label, value, onChangeText, placeholder }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.fieldGroup}>
      <View style={styles.labelRow}>
        <Lock size={14} color={COLORS.muted} />
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder ?? '••••••••'}
          placeholderTextColor={COLORS.darkBrown + '50'}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity onPress={() => setVisible((v) => !v)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          {visible
            ? <EyeOff size={18} color={COLORS.muted} />
            : <Eye size={18} color={COLORS.muted} />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [current, setCurrent]   = useState('');
  const [next, setNext]         = useState('');
  const [confirm, setConfirm]   = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    if (!current.trim()) {
      Alert.alert('Error', 'Ingresa tu contraseña actual.');
      return;
    }
    if (next.length < 8) {
      Alert.alert('Error', 'La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (next !== confirm) {
      Alert.alert('Error', 'Las contraseñas nuevas no coinciden.');
      return;
    }

    setIsSaving(true);
    // TODO: conectar con el servicio de autenticación real
    await new Promise((r) => setTimeout(r, 900));
    setIsSaving(false);

    Alert.alert('¡Listo!', 'Tu contraseña fue actualizada correctamente.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <View style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.darkBrown} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cambiar contraseña</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.hint}>
          Elige una contraseña segura con al menos 8 caracteres que no hayas usado antes.
        </Text>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Seguridad</Text>

          <PasswordField
            label="Contraseña actual"
            value={current}
            onChangeText={setCurrent}
            placeholder="Tu contraseña actual"
          />
          <PasswordField
            label="Nueva contraseña"
            value={next}
            onChangeText={setNext}
            placeholder="Mínimo 8 caracteres"
          />
          <PasswordField
            label="Repetir nueva contraseña"
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Repite la nueva contraseña"
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, isSaving && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={isSaving}
          activeOpacity={0.85}
        >
          <Text style={styles.submitBtnText}>
            {isSaving ? 'Actualizando...' : 'Actualizar contraseña'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.darkBrown },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  hint: {
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 20,
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
    gap: 2,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.darkBrown + '70',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  fieldGroup: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 14,
    marginBottom: 14,
    gap: 6,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { fontSize: 12, color: COLORS.muted, fontWeight: '500' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 4,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.darkBrown,
    paddingVertical: 4,
  },
  submitBtn: {
    backgroundColor: COLORS.darkBrown,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
});
