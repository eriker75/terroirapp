import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { useLoginMutation } from '@/services';
import type { AxiosError } from 'axios';
import type { ApiError } from '@/types/api.types';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { mutate: login, isPending, isError, error } = useLoginMutation();

  const errorMessage = isError
    ? ((error as AxiosError<ApiError>)?.response?.data?.message ?? 'Error al iniciar sesión')
    : '';

  const handleLogin = () => {
    if (!email || !password) return;
    login({ email, password });
  };

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
        <View style={styles.loginCard}>
          <View style={styles.cardHeader}>
            <Image
              source={require('@/assets/images/logo/terroir-cream-coffee-text.png')}
              style={styles.brandLogo}
              resizeMode="contain"
            />
            <Text className="text-subtitulo text-center" style={{ color: COLORS.white + 'CC' }}>
              Inicia sesión en tu cuenta
            </Text>
          </View>

          <View style={styles.cardBody}>
            {isError && (
              <View style={styles.errorBox}>
                <AlertCircle size={18} color={COLORS.red} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            <View style={styles.fieldGroup}>
              <Text className="text-cta" style={{ color: COLORS.darkBrown, marginBottom: 4 }}>
                Correo electrónico
              </Text>
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
              <Text className="text-cta" style={{ color: COLORS.darkBrown, marginBottom: 4 }}>
                Contraseña
              </Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.darkBrown + '60'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={COLORS.darkBrown + '80'} />
                  ) : (
                    <Eye size={20} color={COLORS.darkBrown + '80'} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.forgotRow}
              onPress={() => router.push('/forgot-password')}
            >
              <Text className="text-cta" style={{ color: COLORS.accent }}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, isPending && styles.submitBtnDisabled]}
              onPress={handleLogin}
              disabled={isPending}
            >
              {isPending ? (
                <ActivityIndicator color={COLORS.darkBrown} />
              ) : (
                <Text className="text-cta text-center" style={{ color: COLORS.darkBrown }}>
                  Iniciar sesión
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider} />
            <View style={styles.registerRow}>
              <Text className="text-cta" style={{ color: COLORS.darkBrown + '99' }}>¿No tienes cuenta? </Text>
              <TouchableOpacity onPress={() => router.push('/registro')}>
                <Text className="text-cta" style={{ color: COLORS.accent }}>Regístrate aquí</Text>
              </TouchableOpacity>
            </View>
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
  loginCard: {
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
  brandLogo: { width: 180, height: 56, marginBottom: 4 },
  brandSubtitle: {
    fontFamily: 'BodoniModa-SemiBold',
    fontSize: 17.5,
    lineHeight: 22,
    letterSpacing: -0.35,
    color: COLORS.white + 'CC',
    textAlign: 'center',
  },
  cardBody: { padding: 20, gap: 16 },
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
  errorText: {
    fontFamily: 'JosefinSans-Light',
    flex: 1,
    fontSize: 13,
    color: '#991B1B',
  },
  fieldGroup: { gap: 6 },
  label: {
    fontFamily: 'JosefinSans-SemiBold',
    fontSize: 15,
    lineHeight: 18,
    letterSpacing: -0.3,
    color: COLORS.darkBrown,
  },
  input: {
    fontFamily: 'JosefinSans-Light',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.darkBrown,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
  },
  passwordInput: {
    fontFamily: 'JosefinSans-Light',
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.darkBrown,
  },
  eyeBtn: { paddingHorizontal: 14 },
  forgotRow: { alignItems: 'flex-end', marginTop: -6 },
  forgotText: {
    fontFamily: 'JosefinSans-SemiBold',
    fontSize: 15,
    lineHeight: 18,
    letterSpacing: -0.3,
    color: COLORS.accent,
  },
  submitBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: {
    fontFamily: 'JosefinSans-SemiBold',
    fontSize: 15,
    lineHeight: 18,
    letterSpacing: -0.3,
    color: COLORS.darkBrown,
  },
  divider: { borderTopWidth: 1, borderTopColor: COLORS.border, marginVertical: 4 },
  registerRow: { flexDirection: 'row', justifyContent: 'center' },
  registerText: {
    fontFamily: 'JosefinSans-Light',
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.darkBrown + '99',
  },
  registerLink: {
    fontFamily: 'JosefinSans-SemiBold',
    fontSize: 15,
    lineHeight: 18,
    letterSpacing: -0.3,
    color: COLORS.accent,
  },
});
