import { View, Text, StyleSheet, Image, TouchableOpacity, ImageBackground, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/colors';
import AppleLogo from '@/assets/svg/AppleLogo.svg';
import * as Device from 'expo-device';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require('@/assets/images/hero-coffee.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.imageOverlay} />

      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.contentContainer}>
          <View style={styles.cardContainer}>
            <BlurView intensity={70} tint="light" style={styles.card}>
              <Text style={styles.welcomeTitle}>Bienvenido a</Text>
              <Image
                source={require('@/assets/images/logo/terroir-dark-coffee-text.png')}
                style={styles.logo}
                resizeMode="contain"
              />

              <Text style={styles.welcomeText}>
                Descubre nuestra selección de café de especialidad y vive una experiencia única.
              </Text>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.push('/login')}
                activeOpacity={0.4}
              >
                <Text style={styles.primaryButtonText}>Iniciar sesión</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => router.push('/registro')}
                activeOpacity={0.4}
              >
                <Text style={styles.secondaryButtonText}>Crear cuenta</Text>
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>o</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.googleButton}
                onPress={() => console.log('Google login')}
                activeOpacity={0.4}
              >
                <Image
                  source={require('@/assets/images/GoogleLoginBtnImg.png')}
                  style={styles.googleIcon}
                  resizeMode="contain"
                />
                <Text style={styles.googleButtonText}>Continuar con Google</Text>
              </TouchableOpacity>

              {(Platform.OS === 'ios' || Device.brand === 'Apple') && (
                <TouchableOpacity
                  style={[styles.googleButton, { marginTop: 12 }]}
                  onPress={() => console.log('Apple login')}
                  activeOpacity={0.4}
                >
                  <AppleLogo width={20} height={20} />
                  <Text style={styles.googleButtonText}>Continuar con Apple</Text>
                </TouchableOpacity>
              )}
            </BlurView>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(54, 30, 28, 0.45)',
  },
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  cardContainer: {
    borderRadius: 32,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 32,
    padding: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    alignItems: 'center',
    overflow: 'hidden',
  },
  welcomeTitle: {
    fontFamily: 'BodoniModa-ExtraBold',
    fontSize: 35,
    lineHeight: 30,
    letterSpacing: -0.7,
    color: COLORS.darkBrown,
    textAlign: 'center',
    marginBottom: 4,
  },
  logo: {
    width: 200,
    height: 60,
    marginBottom: 16,
  },
  welcomeText: {
    fontFamily: 'JosefinSans-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.darkBrown,
    textAlign: 'center',
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: 'rgba(161, 82, 58, 0.9)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(161, 82, 58, 0.9)',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  primaryButtonText: {
    fontFamily: 'JosefinSans-SemiBold',
    fontSize: 16,
    letterSpacing: -0.3,
    color: COLORS.white,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(54, 30, 28, 0.9)',
    width: '100%',
  },
  secondaryButtonText: {
    fontFamily: 'JosefinSans-SemiBold',
    fontSize: 16,
    letterSpacing: -0.3,
    color: COLORS.darkBrown,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 18
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(54, 30, 28, 0.3)'
  },
  dividerText: {
    marginHorizontal: 12,
    fontFamily: 'JosefinSans-SemiBold',
    fontSize: 14,
    color: COLORS.darkBrown
  },
  googleButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  googleButtonText: {
    fontFamily: 'JosefinSans-SemiBold',
    fontSize: 16,
    letterSpacing: -0.3,
    color: COLORS.darkBrown,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
