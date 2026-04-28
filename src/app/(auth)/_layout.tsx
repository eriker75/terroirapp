import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';

export default function AuthLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.lightBeige }} edges={['top', 'bottom']}>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="welcome" />
        <Stack.Screen name="login" />
        <Stack.Screen name="registro" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="privacidad" />
        <Stack.Screen name="terminos" />
      </Stack>
    </SafeAreaView>
  );
}
