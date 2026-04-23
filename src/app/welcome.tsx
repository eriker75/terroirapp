import { View, Text, StyleSheet, Image, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS } from '@/src/constants/colors';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ImageBackground 
      source={require('@/assets/images/hero-coffee.jpg')} 
      style={styles.backgroundImage} 
      resizeMode="cover"
    >
      {/* Overlay to blend the image nicely and ensure text contrast */}
      <View style={styles.imageOverlay} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.contentContainer}>
          <View style={styles.card}>
            <Text style={styles.welcomeTitle}>Bienvenido a</Text>
            <Image 
              source={require('@/assets/images/logo/terroir-dark-coffe-text.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            
            <Text style={styles.welcomeText}>
              Descubre nuestra selección de café de especialidad y vive una experiencia única.
            </Text>
            
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => router.push('/login')}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Iniciar sesión</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => router.push('/registro')}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Crear cuenta</Text>
            </TouchableOpacity>
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
    backgroundColor: 'rgba(54, 30, 28, 0.45)', // Dark brown with opacity for contrast
  },
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center', // Center content in the card
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
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
    fontSize: 15,
    color: COLORS.muted,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryButtonText: {
    color: COLORS.darkBrown,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.darkBrown,
    width: '100%',
  },
  secondaryButtonText: {
    color: COLORS.darkBrown,
    fontSize: 16,
    fontWeight: '700',
  },
});
