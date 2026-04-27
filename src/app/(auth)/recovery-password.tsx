import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Eye, EyeOff, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/colors';

export default function RecoveryPasswordScreen() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async () => {
    setError('');
    if (!code || !password || !confirm) {
      setError('Por favor completa todos los campos');
      return;
    }
    if (code.length < 6) {
      setError('El código debe tener 6 dígitos');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitted(true);
    } catch {
      setError('Error al restablecer la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <ArrowLeft size={24} color={COLORS.darkBrown} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contraseña actualizada</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <CheckCircle2 size={48} color={COLORS.accent} />
          </View>
          <Text style={styles.successTitle}>¡Todo listo!</Text>
          <Text style={styles.successSubtitle}>
            Tu contraseña ha sido restablecida correctamente.
          </Text>
          
          <TouchableOpacity
            style={styles.accentBtn}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.accentBtnText}>Ir a Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <ArrowLeft size={24} color={COLORS.darkBrown} />
      </TouchableOpacity>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.recoveryCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.brandName}>Restablecer</Text>
            <Text style={styles.brandSubtitle}>Crea una nueva contraseña</Text>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.introText}>
              Ingresa el código de 6 dígitos que enviamos a tu correo y tu nueva contraseña.
            </Text>

            {error !== '' && (
              <View style={styles.errorBox}>
                <AlertCircle size={18} color={COLORS.red} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Código de recuperación</Text>
              <TextInput
                style={styles.input}
                placeholder="123456"
                placeholderTextColor={COLORS.darkBrown + '60'}
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nueva contraseña</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={COLORS.darkBrown + '60'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword((v) => !v)}>
                  {showPassword ? <EyeOff size={20} color={COLORS.darkBrown + '80'} /> : <Eye size={20} color={COLORS.darkBrown + '80'} />}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirmar contraseña</Text>
              <View style={[styles.passwordRow, confirm && confirm !== password && styles.inputError]}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Repite la contraseña"
                  placeholderTextColor={COLORS.darkBrown + '60'}
                  value={confirm}
                  onChangeText={setConfirm}
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowConfirm((v) => !v)}>
                  {showConfirm ? <EyeOff size={20} color={COLORS.darkBrown + '80'} /> : <Eye size={20} color={COLORS.darkBrown + '80'} />}
                </TouchableOpacity>
              </View>
              {confirm !== '' && confirm !== password && (
                <Text style={styles.fieldError}>Las contraseñas no coinciden</Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.accentBtn, isLoading && styles.btnDisabled]}
              onPress={handleReset}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.darkBrown} />
              ) : (
                <Text style={styles.accentBtnText}>Guardar contraseña</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider} />
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.loginLink}>Volver a iniciar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightBeige },
  backBtn: { padding: 20, position: 'absolute', top: 0, left: 0, zIndex: 10 },
  content: { flex: 1 },
  contentContainer: { flexGrow: 1, justifyContent: 'center', padding: 20, paddingBottom: 40 },
  recoveryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    width: '100%',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHeader: {
    backgroundColor: COLORS.darkBrown,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  brandName: { color: COLORS.white, fontSize: 28, fontWeight: '700', marginBottom: 4 },
  brandSubtitle: { color: COLORS.white + 'CC', fontSize: 14, textAlign: 'center' },
  cardBody: { padding: 20, gap: 16 },
  introText: {
    fontSize: 14,
    color: COLORS.muted,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 4,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: COLORS.redLight,
    borderWidth: 1,
    borderColor: COLORS.redBorder,
    borderRadius: 10,
    padding: 14,
  },
  errorText: { flex: 1, fontSize: 13, color: '#991B1B' },
  fieldGroup: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.darkBrown },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.darkBrown,
  },
  inputError: { borderColor: COLORS.red },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 30,
    paddingHorizontal: 6,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.darkBrown,
  },
  eyeBtn: { paddingHorizontal: 14 },
  fieldError: { fontSize: 12, color: COLORS.red },
  accentBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 4,
    width: '100%',
  },
  accentBtnText: { color: COLORS.darkBrown, fontSize: 16, fontWeight: '700' },
  btnDisabled: { opacity: 0.6 },
  divider: { borderTopWidth: 1, borderTopColor: COLORS.border, marginVertical: 4 },
  loginLink: { textAlign: 'center', fontSize: 14, color: COLORS.accent, fontWeight: '600' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.darkBrown },
  successContainer: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    gap: 14,
    justifyContent: 'center',
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.accent + '1A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  successTitle: { fontSize: 24, fontWeight: '700', color: COLORS.darkBrown },
  successSubtitle: { fontSize: 14, color: COLORS.muted, textAlign: 'center' },
});
