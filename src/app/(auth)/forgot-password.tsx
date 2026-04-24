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
import { ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/colors';

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
      <View style={styles.container}>
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
        <View style={styles.forgotCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.brandName}>Recuperar</Text>
            <Text style={styles.brandSubtitle}>Ingresa tu email para continuar</Text>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.introText}>
              Te enviaremos un link para crear una nueva contraseña.
            </Text>

            {error !== '' && (
              <View style={styles.errorBox}>
                <AlertCircle size={18} color={COLORS.red} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

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

            <View style={styles.divider} />
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.loginLink}>¿Recordaste tu contraseña? Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightBeige },
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
  forgotCard: {
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
    gap: 16,
  },
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
    marginTop: 4,
    width: '100%',
  },
  accentBtnText: { color: COLORS.darkBrown, fontSize: 16, fontWeight: '700' },
  btnDisabled: { opacity: 0.6 },
  divider: { borderTopWidth: 1, borderTopColor: COLORS.border, marginVertical: 4 },
  loginLink: { textAlign: 'center', fontSize: 14, color: COLORS.accent, fontWeight: '500' },
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
