import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/src/constants/colors';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = async () => {
    setError('');
    if (!name || !email || !password || !confirm) {
      setError('Por favor completa todos los campos');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setSuccess(true);
    } catch {
      setError('Error al crear la cuenta. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <CheckCircle2 size={48} color={COLORS.accent} />
          </View>
          <Text style={styles.successTitle}>¡Cuenta creada!</Text>
          <Text style={styles.successSubtitle}>
            Bienvenido a Terroir, {name.split(' ')[0]}. Tu cuenta está lista.
          </Text>
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.submitBtnText}>Comenzar a explorar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.darkBrown} />
        </TouchableOpacity>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.registerCard}>
            {/* Dark Header part of the card */}
            <View style={styles.cardHeader}>
              <Text style={styles.brandName}>Crear cuenta</Text>
              <Text style={styles.brandSubtitle}>Únete a la comunidad Terroir</Text>
            </View>

            {/* Form part of the card */}
            <View style={styles.cardBody}>
              {error !== '' && (
                <View style={styles.errorBox}>
                  <AlertCircle size={18} color={COLORS.red} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Nombre completo</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Juan Pérez"
                  placeholderTextColor={COLORS.darkBrown + '60'}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Correo electrónico</Text>
                <TextInput
                  style={styles.input}
                  placeholder="tu@email.com"
                  placeholderTextColor={COLORS.darkBrown + '60'}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Contraseña</Text>
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
                    {showPassword ? (
                      <EyeOff size={20} color={COLORS.darkBrown + '80'} />
                    ) : (
                      <Eye size={20} color={COLORS.darkBrown + '80'} />
                    )}
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
                    {showConfirm ? (
                      <EyeOff size={20} color={COLORS.darkBrown + '80'} />
                    ) : (
                      <Eye size={20} color={COLORS.darkBrown + '80'} />
                    )}
                  </TouchableOpacity>
                </View>
                {confirm !== '' && confirm !== password && (
                  <Text style={styles.fieldError}>Las contraseñas no coinciden</Text>
                )}
              </View>

              {/* Terms */}
              <Text style={styles.terms}>
                Al registrarte aceptas nuestros{' '}
                <Text style={styles.termsLink}>Términos de Servicio</Text>
                {' '}y{' '}
                <Text style={styles.termsLink}>Política de Privacidad</Text>
              </Text>

              <TouchableOpacity
                style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={COLORS.darkBrown} />
                ) : (
                  <Text style={styles.submitBtnText}>Crear cuenta</Text>
                )}
              </TouchableOpacity>

              <View style={styles.divider} />
              <View style={styles.loginRow}>
                <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
                <TouchableOpacity onPress={() => router.push('/login')}>
                  <Text style={styles.loginLink}>Inicia sesión</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.lightBeige },
  backBtn: {
    padding: 20,
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
  },
  content: { flex: 1 },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  registerCard: {
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
  brandName: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  brandSubtitle: {
    color: COLORS.white + 'CC',
    fontSize: 14,
    textAlign: 'center',
  },
  cardBody: {
    padding: 20,
    gap: 14,
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
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 13,
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
    borderRadius: 10,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 14,
    color: COLORS.darkBrown,
  },
  eyeBtn: { paddingHorizontal: 14 },
  fieldError: { fontSize: 12, color: COLORS.red },
  terms: { fontSize: 12, color: COLORS.darkBrown + '80', lineHeight: 18 },
  termsLink: { color: COLORS.accent, fontWeight: '600' },
  submitBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: COLORS.darkBrown, fontSize: 16, fontWeight: '700' },
  divider: { borderTopWidth: 1, borderTopColor: COLORS.border, marginVertical: 4 },
  loginRow: { flexDirection: 'row', justifyContent: 'center' },
  loginText: { fontSize: 14, color: COLORS.darkBrown + '99' },
  loginLink: { fontSize: 14, color: COLORS.accent, fontWeight: '600' },
  // Success state
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.accent + '1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: { fontSize: 26, fontWeight: '700', color: COLORS.darkBrown },
  successSubtitle: { fontSize: 15, color: COLORS.muted, textAlign: 'center', lineHeight: 22 },
});
