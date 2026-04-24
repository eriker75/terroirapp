import '../../global.css';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardAvoidingView, KeyboardProvider } from 'react-native-keyboard-controller';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5 },
    mutations: { retry: 0 },
  },
});

function AuthGuard() {
  const { isAuthenticated, isHydrated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    } else if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/welcome');
    }
  }, [isAuthenticated, isHydrated, segments]);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    // ── Bodoni Moda (28pt — tamaño óptico óptimo para UI entre 18–36px) ──
    'BodoniModa-Regular':          require('../../assets/fonts/BodoniModa/BodoniModa_28pt-Regular.ttf'),
    'BodoniModa-Italic':           require('../../assets/fonts/BodoniModa/BodoniModa_28pt-Italic.ttf'),
    'BodoniModa-Medium':           require('../../assets/fonts/BodoniModa/BodoniModa_28pt-Medium.ttf'),
    'BodoniModa-MediumItalic':     require('../../assets/fonts/BodoniModa/BodoniModa_28pt-MediumItalic.ttf'),
    'BodoniModa-SemiBold':         require('../../assets/fonts/BodoniModa/BodoniModa_28pt-SemiBold.ttf'),
    'BodoniModa-SemiBoldItalic':   require('../../assets/fonts/BodoniModa/BodoniModa_28pt-SemiBoldItalic.ttf'),
    'BodoniModa-Bold':             require('../../assets/fonts/BodoniModa/BodoniModa_28pt-Bold.ttf'),
    'BodoniModa-BoldItalic':       require('../../assets/fonts/BodoniModa/BodoniModa_28pt-BoldItalic.ttf'),
    'BodoniModa-ExtraBold':        require('../../assets/fonts/BodoniModa/BodoniModa_28pt-ExtraBold.ttf'),
    'BodoniModa-ExtraBoldItalic':  require('../../assets/fonts/BodoniModa/BodoniModa_28pt-ExtraBoldItalic.ttf'),
    'BodoniModa-Black':            require('../../assets/fonts/BodoniModa/BodoniModa_28pt-Black.ttf'),
    'BodoniModa-BlackItalic':      require('../../assets/fonts/BodoniModa/BodoniModa_28pt-BlackItalic.ttf'),

    // ── Josefin Sans ──────────────────────────────────────────────────────
    'JosefinSans-Thin':            require('../../assets/fonts/JosefinSans/JosefinSans-Thin.ttf'),
    'JosefinSans-ThinItalic':      require('../../assets/fonts/JosefinSans/JosefinSans-ThinItalic.ttf'),
    'JosefinSans-ExtraLight':      require('../../assets/fonts/JosefinSans/JosefinSans-ExtraLight.ttf'),
    'JosefinSans-ExtraLightItalic':require('../../assets/fonts/JosefinSans/JosefinSans-ExtraLightItalic.ttf'),
    'JosefinSans-Light':           require('../../assets/fonts/JosefinSans/JosefinSans-Light.ttf'),
    'JosefinSans-LightItalic':     require('../../assets/fonts/JosefinSans/JosefinSans-LightItalic.ttf'),
    'JosefinSans-Regular':         require('../../assets/fonts/JosefinSans/JosefinSans-Regular.ttf'),
    'JosefinSans-Italic':          require('../../assets/fonts/JosefinSans/JosefinSans-Italic.ttf'),
    'JosefinSans-Medium':          require('../../assets/fonts/JosefinSans/JosefinSans-Medium.ttf'),
    'JosefinSans-MediumItalic':    require('../../assets/fonts/JosefinSans/JosefinSans-MediumItalic.ttf'),
    'JosefinSans-SemiBold':        require('../../assets/fonts/JosefinSans/JosefinSans-SemiBold.ttf'),
    'JosefinSans-SemiBoldItalic':  require('../../assets/fonts/JosefinSans/JosefinSans-SemiBoldItalic.ttf'),
    'JosefinSans-Bold':            require('../../assets/fonts/JosefinSans/JosefinSans-Bold.ttf'),
    'JosefinSans-BoldItalic':      require('../../assets/fonts/JosefinSans/JosefinSans-BoldItalic.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <KeyboardProvider>
            <StatusBar style="dark" />
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={0}
            >
              <AuthGuard />
              <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
              </Stack>
            </KeyboardAvoidingView>
          </KeyboardProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
