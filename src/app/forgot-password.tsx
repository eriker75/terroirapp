import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/src/constants/colors';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!email) {
      setError('Por favor ingresa un email válido');
      return;
    }
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitted(true);
    } catch {
      setError('Error al procesar tu solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <ArrowLeft size={24} color={COLORS.darkBrown} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Email enviado</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <CheckCircle2 size={48} color={COLORS.accent} />
          </View>
          <Text style={styles.successTitle}>Revisa tu correo</Text>
          <Text style={styles.successSubtitle}>
            Hemos enviado instrucciones para recuperar tu contraseña a:
          </Text>
          <View style={styles.emailBox}>
            <Text style={styles.emailText}>{email}</Text>
          </View>
          <Text style={styles.successHint}>
            Revisa tu carpeta de spam e incluye el link para crear una nueva contraseña.
          </Text>
          <TouchableOpacity
            style={styles.accentBtn}
            onPress={() => { setSubmitted(false); setEmail(''); }}
          >
            <Text style={styles.accentBtnText}>Ingresar otro email</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.outlineBtnText}>Volver a iniciar sesión</Text>
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={COLORS.darkBrown} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Recuperar contraseña</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.body}>
          {/* Intro */}
          <View style={styles.introSection}>
            <Text style={styles.introTitle}>¿Olvidaste tu contraseña?</Text>
            <Text style={styles.introSubtitle}>
              Ingresa tu email y te enviaremos un link para crear una nueva contraseña.
            </Text>
          </View>

          {/* Error */}
          {error !== '' && (
            <View style={styles.errorBox}>
              <AlertCircle size={18} color={COLORS.red} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Field */}
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
            <Text style={styles.fieldHint}>Usa el email asociado a tu cuenta Terroir</Text>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.accentBtn, isLoading && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.darkBrown} />
            ) : (
              <Text style={styles.accentBtnText}>Enviar instrucciones</Text>
            )}
          </TouchableOpacity>

          {/* Tips */}
          <View style={styles.tipsBox}>
            <Text style={styles.tipsTitle}>Consejos:</Text>
            <Text style={styles.tipItem}>• Revisa tu carpeta de spam</Text>
            <Text style={styles.tipItem}>• El link es válido por 24 horas</Text>
            <Text style={styles.tipItem}>• Si no solicitaste esto, ignora el email</Text>
          </View>

          <View style={styles.divider} />
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.loginLink}>¿Recordaste tu contraseña? Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.darkBrown },
  body: { flex: 1, padding: 20, gap: 16 },
  introSection: { gap: 6 },
  introTitle: { fontSize: 20, fontWeight: '700', color: COLORS.darkBrown },
  introSubtitle: { fontSize: 14, color: COLORS.muted, lineHeight: 20 },
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
  fieldHint: { fontSize: 12, color: COLORS.muted },
  accentBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  accentBtnText: { color: COLORS.darkBrown, fontSize: 16, fontWeight: '700' },
  btnDisabled: { opacity: 0.6 },
  tipsBox: {
    backgroundColor: COLORS.accent + '1A',
    borderWidth: 1,
    borderColor: COLORS.accent + '33',
    borderRadius: 10,
    padding: 14,
    gap: 4,
  },
  tipsTitle: { fontSize: 12, fontWeight: '700', color: COLORS.darkBrown, marginBottom: 2 },
  tipItem: { fontSize: 12, color: COLORS.darkBrown + 'AA' },
  divider: { borderTopWidth: 1, borderTopColor: COLORS.border },
  loginLink: { textAlign: 'center', fontSize: 14, color: COLORS.accent, fontWeight: '500' },
  // Success
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
  emailBox: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    width: '100%',
  },
  emailText: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkBrown,
    textAlign: 'center',
  },
  successHint: { fontSize: 13, color: COLORS.muted, textAlign: 'center', lineHeight: 20 },
  outlineBtn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  outlineBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.darkBrown },
});
